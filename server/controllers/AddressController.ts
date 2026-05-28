import type { Request, Response } from "express";
import Address from "../models/Address.js";

// get user addresses
// get /api/addresses
export const getAddresses = async (req: Request, res: Response) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({
      isDefault: -1,
      createdAt: -1,
    });
    res.json({ success: true, data: addresses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// add new address
// post /api/addresses
export const addAddress = async (req: Request, res: Response) => {
  try {
    const { type, street, city, state, zipCode, country, isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user._id,
      type,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: !!isDefault,
    });
    res.json({ success: true, data: address });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// update existing address
// put /api/addresses/:id
export const updateAddress = async (req: Request, res: Response) => {
  try {
    const { type, street, city, state, zipCode, country, isDefault } = req.body;
    let addressItem = await Address.findById(req.params.id);

    if (!addressItem) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }
    //ensure user owns the address
    if (addressItem.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    addressItem = await Address.findByIdAndUpdate(
      req.params.id,
      {
        user: req.user._id,
        type,
        street,
        city,
        state,
        zipCode,
        country,
        isDefault,
      },
      { new: true },
    );

    res.json({ success: true, data: addressItem });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// delete address
// delete /api/addresses/:id
export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }
    //ensure user owns the address
    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    
    await address.deleteOne();
    res.json({ success: true, message: "Address deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
