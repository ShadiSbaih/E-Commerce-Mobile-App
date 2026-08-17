import express from "express";
import { protect } from "../middleware/auth.js";
import {
  addAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from "../controllers/AddressController.js";
import {
  objectIdParam,
  validateBody,
  addressSchema,
} from "../middleware/validate.js";

const AddressRouter = express.Router();

AddressRouter.use(protect);

AddressRouter.get("/", getAddresses);
AddressRouter.post("/", validateBody(addressSchema), addAddress);
AddressRouter.put(
  "/:id",
  objectIdParam("id"),
  validateBody(addressSchema.partial()),
  updateAddress,
);
AddressRouter.delete("/:id", objectIdParam("id"), deleteAddress);

export default AddressRouter;