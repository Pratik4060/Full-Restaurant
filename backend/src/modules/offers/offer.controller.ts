import type { NextFunction, Request, Response } from "express";
import { validate } from "../../utils/validate.js";
import { createOfferSchema, updateOfferSchema } from "./offer.schema.js";
import {
  createOffer,
  deleteOffer,
  listOffers,
  updateOffer,
} from "./offer.service.js";
import { uploadImageBuffer } from "../../utils/uploadImage.js";

const uploadOfferImageIfPresent = async (req: Request) => {
  if (!req.file) return;

  const uploaded = await uploadImageBuffer(
    req.file.buffer,
    process.env.CLOUDINARY_OFFER_FOLDER || "restaurant-management/offers",
    `offer-${Date.now()}`,
  );

  req.body.imageUrl = uploaded.secureUrl;
};

export const getOffers = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await listOffers();
    res.json(data);
  } catch (error) {
    next(error as Error);
  }
};

export const postOffer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await uploadOfferImageIfPresent(req);
    const payload = validate(createOfferSchema, req.body);
    const data = await createOffer(payload);
    res.status(201).json(data);
  } catch (error) {
    next(error as Error);
  }
};

export const putOffer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await uploadOfferImageIfPresent(req);
    const payload = validate(updateOfferSchema, req.body);
    const data = await updateOffer(String(req.params.id), payload);
    res.json(data);
  } catch (error) {
    next(error as Error);
  }
};

export const removeOffer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deleteOffer(String(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error as Error);
  }
};
