import { prisma } from "../../config/prisma.js";

type OfferCreatePayload = {
  title: string;
  description: string;
  discountText: string;
  imageUrl?: string | undefined;
  isActive?: boolean | undefined;
  validUntil?: string | undefined;
};

type OfferUpdatePayload = {
  title?: string | undefined;
  description?: string | undefined;
  discountText?: string | undefined;
  imageUrl?: string | undefined;
  isActive?: boolean | undefined;
  validUntil?: string | undefined;
};

export const listOffers = async () =>
  prisma.offer.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

export const createOffer = async (payload: OfferCreatePayload) =>
  prisma.offer.create({
    data: {
      title: payload.title,
      description: payload.description,
      discountText: payload.discountText,
      imageUrl: payload.imageUrl ?? null,
      isActive: payload.isActive ?? true,
      ...(payload.validUntil !== undefined
        ? { validUntil: payload.validUntil ? new Date(payload.validUntil) : null }
        : {}),
    },
  });

export const updateOffer = async (offerId: string, payload: OfferUpdatePayload) => {
  const data: Record<string, unknown> = {};

  if (payload.title !== undefined) data.title = payload.title;
  if (payload.description !== undefined) data.description = payload.description;
  if (payload.discountText !== undefined) data.discountText = payload.discountText;
  if (payload.imageUrl !== undefined) data.imageUrl = payload.imageUrl;
  if (payload.isActive !== undefined) data.isActive = payload.isActive;
  if (payload.validUntil !== undefined) {
    data.validUntil = payload.validUntil ? new Date(payload.validUntil) : null;
  }

  return prisma.offer.update({
    where: { id: offerId },
    data,
  });
};

export const deleteOffer = async (offerId: string) =>
  prisma.offer.delete({
    where: { id: offerId },
  });
