import { IUser } from "./index.js";
import { Document, Types } from "mongoose";

declare global {
    namespace Express {
        interface Request {
            user: (IUser & { _id: Types.ObjectId });
            auth: () => Promise<{ userId: string | null }>;
        }
    }
}
