import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { UserRole } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

const toUserRow = (user: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  isActive: boolean;
}) => ({
  id: user.id,
  user: user.name,
  email: user.email,
  role: user.role,
  created: user.createdAt,
  status: user.isActive,
});

export const getUserCards = async () => {
  const [admin, manager, kitchen, cashier, waiter] = await Promise.all([
    prisma.appUser.count({ where: { role: UserRole.ADMIN } }),
    prisma.appUser.count({ where: { role: UserRole.MANAGER } }),
    prisma.appUser.count({ where: { role: UserRole.KITCHEN } }),
    prisma.appUser.count({ where: { role: UserRole.CASHIER } }),
    prisma.appUser.count({ where: { role: UserRole.WAITER } }),
  ]);

  return {
    cards: {
      admin,
      manager,
      kitchen,
      cashier,
      waiter,
    },
  };
};

export const getUsersTable = async (params: {
  search?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}) => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const skip = (page - 1) * limit;

  const where: Prisma.AppUserWhereInput | undefined = params.search
    ? {
        OR: [
          {
            name: {
              contains: params.search,
              mode: "insensitive" as const,
            },
          },
          {
            email: {
              contains: params.search,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : undefined;

  const findArgs: Prisma.AppUserFindManyArgs = {
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      isActive: true,
    },
  };

  const countArgs: Prisma.AppUserCountArgs = {};

  if (where) {
    findArgs.where = where;
    countArgs.where = where;
  }

  const [users, total] = await Promise.all([
    prisma.appUser.findMany(findArgs),
    prisma.appUser.count(countArgs),
  ]);

  return {
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
    rows: users.map(toUserRow),
  };
};

export const createUser = async (payload: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive?: boolean | undefined;
}) => {
  const passwordHash = await bcrypt.hash(payload.password, 10);

  const user = await prisma.appUser.create({
    data: {
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: payload.role,
      isActive: payload.isActive ?? true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      isActive: true,
    },
  });

  return toUserRow(user);
};

export const updateUser = async (
  userId: string,
  payload: {
    name?: string | undefined;
    email?: string | undefined;
    password?: string | undefined;
    role?: UserRole | undefined;
    isActive?: boolean | undefined;
  }
) => {
  const data: {
    name?: string;
    email?: string;
    role?: UserRole;
    isActive?: boolean;
    passwordHash?: string;
  } = {};

  if (payload.name !== undefined) data.name = payload.name;
  if (payload.email !== undefined) data.email = payload.email;
  if (payload.role !== undefined) data.role = payload.role;
  if (payload.isActive !== undefined) data.isActive = payload.isActive;
  if (payload.password !== undefined) {
    data.passwordHash = await bcrypt.hash(payload.password, 10);
  }

  const user = await prisma.appUser.update({
    where: {
      id: userId,
    },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      isActive: true,
    },
  });

  return toUserRow(user);
};

export const updateUserStatus = async (userId: string, isActive: boolean) => {
  const user = await prisma.appUser.update({
    where: {
      id: userId,
    },
    data: {
      isActive,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      isActive: true,
    },
  });

  return toUserRow(user);
};

export const deleteUserById = async (userId: string) => {
  await prisma.appUser.delete({
    where: {
      id: userId,
    },
  });

  return { deleted: true };
};
