// import { Room, RoomImage } from "../db";
import { CreateRoomRequest, UpdateRoomRequest } from "../types";
import { generateImageLinkSingle } from "../aws/aws-service";
import { client } from "../db/client";

const create = async (data: CreateRoomRequest) => {
  try {
    const facilityConnections = data.facilities.map((facilityId) => ({
      facility: {
        connect: { id: facilityId.id }, // Connect each facility by its ID
      },
    }));

    const newRoom = await client.room.create({
      data: {
        ...data,
        facilities: {
          create: facilityConnections,
        },
      },
    });
    if (!newRoom) {
      throw new Error("Failed to create new room.");
    }

    return newRoom;
  } catch (error) {
    console.error("[ERROR CREATING ROOM]", error);
    throw error;
  }
};

const addImages = async (data: { roomId: number; names: string[] }) => {
  try {
    const createData = data.names.map((name) => ({
      roomId: data.roomId,
      name,
    }));
    const roomImages = await client.roomImage.createMany({
      data: createData,
    });
    return roomImages;
  } catch (error) {
    console.error("[ERROR ADDING ROOM IMAGES]", error);
    throw error;
  }
};

const get = async (currentPage = 1, pageSize = 5) => {
  try {
    const roomsCount = await client.room.count();
    const totalPages = Math.ceil(roomsCount / pageSize);
    const rooms = await client.room.findMany({
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      include: {
        facilities: {
          select: {
            facility: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    
    const formattedRooms = await Promise.all(
      rooms.map(async (room) => ({
        ...room,
        facilities: room.facilities.map((facility) => facility.facility.name),
        thumbnail: await generateImageLinkSingle(room.thumbnail),
      }))
    );
    return {
      rooms: formattedRooms,
      metadata: {
        currentPage,
        pageSize,
        totalPages,
      },
    };
  } catch (error) {
    console.error("[FAILED TO FETCH ROOMS]", error);
    throw error;
  }
};

const generateImageLinks = async (names: string[]) => {
  const response = await Promise.all(
    names.map(async (name) => {
      const imageLink = await generateImageLinkSingle(name).catch((err) => {
        console.error("Error generating image link:", err);
        return "";
      });
      return typeof imageLink !== "string" ? imageLink : undefined;
    })
  );

  return response.filter((resp) => resp !== undefined);
};

const getById = async (id: number) => {
  try {
    const room = await client.room.findUnique({
      where: { id },
      include: {
        facilities: {
          select: {
            facility: true,
          },
        },
        images: true,
      },
    });

    if (!room) {
      return false;
    }
    const images = await generateImageLinks(
      room.images.map((image) => image.name)
    );

    const nameToLink: Record<string, string> = {};

    for (const image of images) {
      if (!image) return;
      nameToLink[image.name] = image.url;
    }
    console.log("🚀 ~ getById ~ nameToLink:", nameToLink);
    const formattedRoom = {
      ...room,
      facilities: room?.facilities.map((facility) => facility.facility.name),
      facilityIds: room?.facilities.map((facility) => facility.facility.id),
      thumbnail: room?.thumbnail
        ? await generateImageLinkSingle(room?.thumbnail).catch((err) => {
            console.error("Error generating thumbnail link:", err);
            return "";
          })
        : "",
      images: room.images.map((image) => ({
        id: image.id,
        name: image.name,
        url: nameToLink[image.name],
      })),
    };
    return formattedRoom;
  } catch (error) {
    console.error("[FAILED TO FETCH ROOMS]", error);
    throw error;
  }
};

const update = async (id: number, data: Partial<UpdateRoomRequest>) => {
  try {
    const facilityConnections =
      data?.facilities &&
      data.facilities.map((facilityId) => ({
        facility: {
          connect: { id: parseInt(facilityId.id.toString()) }, // Connect each facility by its ID
        },
      }));
    // deletes all connections, then creates new connections
    const result = await client.room.update({
      where: {
        id,
      },
      data: {
        ...data,
        facilities: {
          deleteMany: {},
          create: facilityConnections,
        },
      },
      include: {
        facilities: {
          select: {
            facility: true,
          },
        },
        images: true,
      },
    });
    return result;
  } catch (error) {
    console.error("[ERROR UPDATING ROOM]", error);
    throw error;
  }
};

const addFacilities = async (data: {
  roomId: number;
  facilities: number[];
}) => {
  try {
    const createData = data.facilities.map((id) => ({
      roomId: data.roomId,
      facilityId: id,
    }));
    const result = await client.roomFacility.createMany({
      data: createData,
    });
  } catch (error) {
    console.error("[ERROR ADDING FACILITIES]");
    throw error;
  }
};

const checkfacilities = async (data: { facilities: number[] }) => {
  try {
    const facilities = await client.facility.findMany({
      where: {
        id: { in: data.facilities },
      },
    });
    console.log("🚀 ~ checkfacilities ~ facilities:", facilities);
    return facilities;
  } catch (error) {
    console.error("[ERROR FETCHING FACILITIES]");
    throw error;
  }
};

const getFacilities = async () => {
  try {
    const facilities = await client.facility.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return facilities;
  } catch (error) {
    console.error("[ERROR FETCHING FACILITIES]", error);
    throw error;
  }
};

const getImagesByImageIds = async (ids: number[]) => {
  try {
    const images = await client.roomImage.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
    return images;
  } catch (error) {
    console.error("[ERROR GETTING ROOM IMAGES]", error);
    throw error;
  }
};

const deleteByImageIds = async (ids: number[]) => {
  try {
    const response = await client.roomImage.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
    return response;
  } catch (error) {
    console.error("[ERROR DELETING IMAGES]");
    throw error;
  }
};

const deleteById = async (id: number) => {
  try {
    // delete room images
    await client.roomImage.deleteMany({
      where: {
        roomId: id,
      },
    });

    // delete  room facility
    await client.roomFacility.deleteMany({
      where: {
        roomId: id,
      },
    });
    const response = await client.room.delete({
      where: {
        id,
      },
    });
    return response;
  } catch (error) {
    console.error("[ERROR DELETING ROOM]", error);
    throw error;
  }
};
export {
  create,
  addImages,
  getFacilities,
  checkfacilities,
  get,
  getById,
  update,
  getImagesByImageIds,
  deleteByImageIds,
  deleteById,
};
