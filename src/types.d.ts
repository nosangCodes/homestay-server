import { Room } from "@prisma/client";

interface CreateRoomRequest extends Room {
  facilities: { id: number }[];
}
interface UpdateRoomRequest extends CreateRoomRequest {
  removedImages: { id: string }[];
}
