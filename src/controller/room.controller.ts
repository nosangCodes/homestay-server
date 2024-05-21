import { Request, Response } from "express";
import handleAsync from "../utils/handleAsync";
// import { Facility, Room } from "@prisma/client";
import { roomService } from "../service";
import {
  s3DeleteObject,
  s3DeleteObjectMultiple,
  s3UploadMultiple,
  s3UploadSingle,
} from "../aws/aws-service";
import { CreateRoomRequest, UpdateRoomRequest } from "../types";

const create = handleAsync(
  async (req: Request<{}, {}, CreateRoomRequest>, res: Response) => {
    try {
      const files = req.files as {
        thumbnail: Express.Multer.File[];
        image?: Express.Multer.File[];
      };

      if (!files.thumbnail[0]) {
        return res.status(400).json({ message: "no file uploaded" });
      }

      const singleFileResult = await s3UploadSingle(files.thumbnail[0]);
      Object.assign(req.body, { thumbnail: singleFileResult.fileName });

      const newRoom = await roomService.create({
        ...req.body,
      });

      let multipleFileresult: {
        status: number | undefined;
        fileNames: string[];
      } | null = null;

      if (files.image && files.image?.length > 0) {
        multipleFileresult = await s3UploadMultiple(files.image);
        await roomService.addImages({
          names: multipleFileresult.fileNames,
          roomId: newRoom.id,
        });
      }

      res.json({
        message: "room created",
        data: {
          id: newRoom.id,
          title: newRoom.title,
          thumnail: newRoom.thumbnail,
          files: multipleFileresult?.fileNames,
        },
      });
    } catch (error) {
      console.log("[ERROR CREATING ROOM]", error);
      res.status(500).json({ messahe: "Internal server error" });
    }
  }
);

const update = handleAsync(
  async (
    req: Request<{ id: number }, {}, Partial<UpdateRoomRequest>>,
    res: Response
  ) => {
    try {
      const { id } = req.params;
      const { removedImages, rate } = req.body;

      Object.assign(req.body, { rate: Number(rate) });

      const roomData = await roomService.getById(id);
      if (!roomData) {
        return res.status(400).json({ message: "room not found" });
      }
      const files = req.files as {
        thumbnail?: Express.Multer.File[];
        image?: Express.Multer.File[];
      };
      if (files?.thumbnail?.[0]) {
        const singleFileResult = await s3UploadSingle(files.thumbnail[0]);
        if (singleFileResult.status === 200) {
          // delete old after uploaded
          if (typeof roomData?.thumbnail !== "string") {
            await s3DeleteObject(roomData?.thumbnail?.name);
          }
          Object.assign(req.body, { thumbnail: singleFileResult.fileName });
        }
      }

      if (files?.image && files?.image?.length > 0) {
        const multipleFileresult = await s3UploadMultiple(files.image);
        if (multipleFileresult.status === 200) {
          // add new file names
          await roomService.addImages({
            names: multipleFileresult.fileNames,
            roomId: id,
          });
        }
      }

      if (removedImages && removedImages?.length > 0) {
        const imagesToberemoved = await roomService.getImagesByImageIds(
          removedImages?.map((image) => parseInt(image.id))
        );

        if (imagesToberemoved?.length > 0) {
          const ids = imagesToberemoved.map((image) => image.id);
          const keys = imagesToberemoved.map((image) => image.name);
          const deleteFromDb = await roomService.deleteByImageIds(ids);
          const deleteFromAWSbucket = await s3DeleteObjectMultiple(keys);
        }
      }
      delete req.body.removedImages;
      const result = await roomService.update(id, req.body);
      res.json({ message: "updated room data", result });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

const get = handleAsync(
  async (
    req: Request<{}, {}, {}, { page?: string; pageSize?: string }>,
    res: Response
  ) => {
    try {
      const { page, pageSize } = req.query;
      const rooms = await roomService.get(
        parseInt(page ? page : "1"),
        parseInt(pageSize ? pageSize : "5")
      );

      res.json({ message: "rooms fetched", data: rooms });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

const getRoomById = handleAsync(
  async (req: Request<{ id: number }, {}, {}>, res: Response) => {
    try {
      const { id } = req.params;
      const room = await roomService.getById(id);
      if (!room) {
        return res.status(400).json({ message: "room not found" });
      }
      res.json({ message: "room fetched", data: room });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

const getFacilities = handleAsync(async (req: Request, res: Response) => {
  try {
    const facilities = await roomService.getFacilities();
    res.json({ message: "facilities fetched", data: facilities });
  } catch (error) {
    console.log("[ERROR FETCHING FACILITIES]", error);
    res.status(500).json({ messahe: "Internal server error" });
  }
});

const checkfacilities = handleAsync(
  async (req: Request<{}, {}, { facilities: number[] }>, res: Response) => {
    try {
      const facilities = await roomService.checkfacilities({
        facilities: req.body.facilities,
      });
      res.json(facilities);
    } catch (error) {
      console.log("[ERROR CHECKING  FACILITIES]", error);
      res.status(500).json({ messahe: "Internal server error" });
    }
  }
);

const deleteById = handleAsync(
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { id } = req.params;
      const room = await roomService.getById(parseInt(id));
      if (!room) {
        return res.status(400).json({ message: "Room not found" });
      }
      const deleteResponse = await roomService.deleteById(parseInt(id));
      // delete images from aws bucket;

      if (room.images && room.images?.length > 0) {
        await s3DeleteObjectMultiple(
          room.images.map((image) => image?.name).filter((value) => value)
        );
      }
      await s3DeleteObject(deleteResponse.thumbnail);
      res.json({ message: "room deleted successfully" });
    } catch (error) {
      console.log("[ERROR DELETING ROOM]", error);
      res.status(500).json({ messahe: "Internal server error" });
    }
  }
);

export {
  create,
  getFacilities,
  checkfacilities,
  get,
  getRoomById,
  update,
  deleteById,
};
