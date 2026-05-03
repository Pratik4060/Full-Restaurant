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
  source: "APP_USER" as const,
});

const toAdminRow = (admin: { id: string; name: string; email: string; createdAt: Date }) => ({
  id: `admin:${admin.id}`,
  user: admin.name.replace(/\s+user$/i, ""),
  email: admin.email,
  role: UserRole.ADMIN,
  created: admin.createdAt,
  status: true,
  source: "ADMIN" as const,
});

const getAdminId = (userId: string) => (userId.startsWith("admin:") ? userId.slice("admin:".length) : null);

export const getUserCards = async () => {
  const [admin, manager, kitchen, cashier, waiter] = await Promise.all([
    prisma.admin.count(),
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

  const staffUsersWhere: Prisma.AppUserWhereInput = {
    role: {
      not: UserRole.ADMIN,
    },
  };

  const userWhere: Prisma.AppUserWhereInput = params.search
    ? {
        AND: [
          staffUsersWhere,
          {
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
          },
        ],
      }
    : staffUsersWhere;

  const adminWhere: Prisma.AdminWhereInput | undefined = params.search
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
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      isActive: true,
    },
  };

  const adminFindArgs: Prisma.AdminFindManyArgs = {
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  };

  findArgs.where = userWhere;

  if (adminWhere) {
    adminFindArgs.where = adminWhere;
  }

  const [users, admins] = await Promise.all([
    prisma.appUser.findMany(findArgs),
    prisma.admin.findMany(adminFindArgs),
  ]);

  const rows = [...users.map(toUserRow), ...admins.map(toAdminRow)].sort(
    (first, second) => new Date(second.created).getTime() - new Date(first.created).getTime()
  );
  const total = rows.length;

  return {
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
    rows: rows.slice(skip, skip + limit),
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
  const adminId = getAdminId(userId);
  if (adminId) {
    const data: {
      name?: string;
      email?: string;
      passwordHash?: string;
    } = {};

    if (payload.name !== undefined) data.name = payload.name;
    if (payload.email !== undefined) data.email = payload.email;
    if (payload.password !== undefined) {
      data.passwordHash = await bcrypt.hash(payload.password, 10);
    }

    const admin = await prisma.admin.update({
      where: {
        id: adminId,
      },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return toAdminRow(admin);
  }

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
  const adminId = getAdminId(userId);
  if (adminId) {
    const admin = await prisma.admin.findUniqueOrThrow({
      where: {
        id: adminId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return toAdminRow(admin);
  }

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
  const adminId = getAdminId(userId);
  if (adminId) {
    await prisma.admin.delete({
      where: {
        id: adminId,
      },
    });

    return { deleted: true };
  }

  await prisma.appUser.delete({
    where: {
      id: userId,
    },
  });

  return { deleted: true };
};
