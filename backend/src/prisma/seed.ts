import bcrypt from "bcryptjs";
import { PrismaClient, type DietType, type MealType, OrderStatus } from "@prisma/client";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../../../..");
const restaurantSrcRoot = path.join(repoRoot, "Restaurant app", "src");

type SourceMenuItem = {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  subCategory?: string;
  isBestseller?: boolean;
  foodType?: "Veg" | "Non Veg";
  mealType?: "Breakfast" | "Lunch" | "Dinner";
};

type SeedMenuItem = {
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  prepTimeMins: number;
  type: MealType;
  category: string;
  subCategory?: string | undefined;
  diet: DietType;
  isBestseller: boolean;
  isAvailable: boolean;
};

const normalizeText = (value: string) => value.trim().replace(/\s+/g, " ");

const assetToDataUrl = (relativeAssetPath: string) => {
  const absolutePath = path.resolve(restaurantSrcRoot, relativeAssetPath);
  const file = readFileSync(absolutePath);
  const extension = path.extname(absolutePath).toLowerCase();
  const mimeType =
    extension === ".svg"
      ? "image/svg+xml"
      : extension === ".png"
        ? "image/png"
        : extension === ".jpg" || extension === ".jpeg"
          ? "image/jpeg"
          : "application/octet-stream";

  return `data:${mimeType};base64,${file.toString("base64")}`;
};

const loadSourceItems = (relativeFilePath: string, exportName: string) => {
  const absolutePath = path.resolve(restaurantSrcRoot, relativeFilePath);
  const source = readFileSync(absolutePath, "utf8");
  const imports = new Map<string, string>();

  for (const match of source.matchAll(/^\s*import\s+(\w+)\s+from\s+["'](.+?)["'];?$/gm)) {
    const importName = match[1];
    const importPath = match[2];
    if (!importName || !importPath) continue;
    imports.set(importName, assetToDataUrl(path.join(path.dirname(relativeFilePath), importPath)));
  }

  const executable = source
    .replace(/^\s*import\s+type\s+.*$/gm, "")
    .replace(/^\s*import\s+.*$/gm, "")
    .replace(/^\s*export\s+const\s+(\w+)\s*:\s*[^=]+=\s*/gm, "const $1 = ")
    .replace(/^\s*export\s+type\s+.*$/gm, "");

  const fn = new Function(
    ...imports.keys(),
    `
      ${executable}
      return ${exportName};
    `
  );

  return fn(...imports.values()) as SourceMenuItem[];
};

const breakfastModules = [
  {
    file: "components/Breakfast/Data/coreData.ts",
    exportName: "coreItems",
    type: "BREAKFAST" as MealType,
    category: "Breakfast Specials",
    prepTimeMins: 10,
  },
  {
    file: "components/Breakfast/Data/beveragesData.ts",
    exportName: "beverageItems",
    type: "BREAKFAST" as MealType,
    category: "Beverages",
    prepTimeMins: 5,
  },
  {
    file: "components/Breakfast/Data/healthData.ts",
    exportName: "healthItems",
    type: "BREAKFAST" as MealType,
    category: "Health",
    prepTimeMins: 10,
  },
  {
    file: "components/Breakfast/Data/quickBitesData.ts",
    exportName: "quickBiteItems",
    type: "BREAKFAST" as MealType,
    category: "Quick Bites",
    prepTimeMins: 8,
  },
] as const;

const lunchModules = [
  {
    file: "components/Lunch/Data/Maincourse.ts",
    exportName: "MainCourseItems",
    type: "LUNCH" as MealType,
    category: "Main Course",
    prepTimeMins: 18,
  },
  {
    file: "components/Lunch/Data/Rice.ts",
    exportName: "RiceItems",
    type: "LUNCH" as MealType,
    category: "Rice",
    prepTimeMins: 16,
  },
  {
    file: "components/Lunch/Data/Starters.ts",
    exportName: "StarterItems",
    type: "LUNCH" as MealType,
    category: "Starters",
    prepTimeMins: 14,
  },
  {
    file: "components/Lunch/Data/Roti.ts",
    exportName: "RotiItems",
    type: "LUNCH" as MealType,
    category: "Roti",
    prepTimeMins: 8,
  },
  {
    file: "components/Lunch/Data/Appetizer.ts",
    exportName: "AppetizerItems",
    type: "LUNCH" as MealType,
    category: "Appetizer",
    prepTimeMins: 14,
  },
  {
    file: "components/Lunch/Data/Dessert.ts",
    exportName: "DessertItems",
    type: "LUNCH" as MealType,
    category: "Dessert",
    prepTimeMins: 7,
  },
] as const;

const dinnerModules = [
  {
    file: "components/Lunch/Data/Maincourse.ts",
    exportName: "MainCourseItems",
    type: "DINNER" as MealType,
    category: "Main Course",
    prepTimeMins: 18,
  },
  {
    file: "components/Lunch/Data/Rice.ts",
    exportName: "RiceItems",
    type: "DINNER" as MealType,
    category: "Rice",
    prepTimeMins: 16,
  },
  {
    file: "components/Lunch/Data/Starters.ts",
    exportName: "StarterItems",
    type: "DINNER" as MealType,
    category: "Starters",
    prepTimeMins: 14,
  },
  {
    file: "components/Lunch/Data/Roti.ts",
    exportName: "RotiItems",
    type: "DINNER" as MealType,
    category: "Roti",
    prepTimeMins: 8,
  },
  {
    file: "components/Lunch/Data/Appetizer.ts",
    exportName: "AppetizerItems",
    type: "DINNER" as MealType,
    category: "Appetizer",
    prepTimeMins: 14,
  },
  {
    file: "components/Lunch/Data/Dessert.ts",
    exportName: "DessertItems",
    type: "DINNER" as MealType,
    category: "Dessert",
    prepTimeMins: 7,
  },
] as const;

const inferDiet = (item: SourceMenuItem, category: string): DietType => {
  if (category === "Beverages") return "BEVERAGE";
  if (item.foodType === "Veg") return "VEG";
  if (item.foodType === "Non Veg") return "NON_VEG";

  const haystack = `${item.name} ${item.description} ${category}`.toLowerCase();
  if (/(chicken|mutton|fish|egg|prawn|prawns|beef|pork|lamb)/.test(haystack)) return "NON_VEG";
  return "VEG";
};

const inferPrepTime = (category: string, defaultPrepTime: number) => defaultPrepTime;

const mapSourceItem = (
  item: SourceMenuItem,
  type: MealType,
  category: string,
  prepTimeMins: number
): SeedMenuItem => {
  return {
    name: normalizeText(item.name),
    description: normalizeText(item.description),
    imageUrl: item.image,
    price: Number(item.price),
    prepTimeMins: inferPrepTime(category, prepTimeMins),
    type,
    category,
    ...(item.subCategory ? { subCategory: normalizeText(item.subCategory) } : {}),
    diet: inferDiet(item, category),
    isBestseller: Boolean(item.isBestseller),
    isAvailable: true,
  };
};

const loadSeedMenuItems = (): SeedMenuItem[] => {
  const breakfastItems = breakfastModules.flatMap((module) =>
    loadSourceItems(module.file, module.exportName).map((item) =>
      mapSourceItem(item, module.type, module.category, module.prepTimeMins)
    )
  );

  const lunchItems = lunchModules.flatMap((module) =>
    loadSourceItems(module.file, module.exportName).map((item) =>
      mapSourceItem(item, module.type, module.category, module.prepTimeMins)
    )
  );

  const dinnerItems = dinnerModules.flatMap((module) =>
    loadSourceItems(module.file, module.exportName).map((item) =>
      mapSourceItem(item, module.type, module.category, module.prepTimeMins)
    )
  );

  return [...breakfastItems, ...lunchItems, ...dinnerItems];
};

const upsertMenuItem = async (payload: SeedMenuItem) => {
  const existing = await prisma.menuItem.findFirst({
    where: {
      name: payload.name,
      category: payload.category,
      type: payload.type,
      diet: payload.diet,
      ...(payload.subCategory !== undefined ? { subCategory: payload.subCategory } : { subCategory: null }),
    },
  });

  if (existing) {
    return prisma.menuItem.update({
      where: { id: existing.id },
      data: {
        description: payload.description,
        imageUrl: payload.imageUrl,
        price: payload.price,
        prepTimeMins: payload.prepTimeMins,
        isBestseller: payload.isBestseller,
        isAvailable: payload.isAvailable,
      },
    });
  }

  return prisma.menuItem.create({
    data: {
      name: payload.name,
      description: payload.description,
      imageUrl: payload.imageUrl,
      price: payload.price,
      prepTimeMins: payload.prepTimeMins,
      type: payload.type,
      category: payload.category,
      subCategory: payload.subCategory ?? null,
      diet: payload.diet,
      isBestseller: payload.isBestseller,
      isAvailable: payload.isAvailable,
    },
  });
};

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.admin.upsert({
    where: { email: "admin@zhonix.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@zhonix.com",
      passwordHash,
    },
  });

  const seededMenuItems = loadSeedMenuItems();
  const createdMenuItems: Array<{ id: string; name: string; price: unknown }> = [];

  for (const item of seededMenuItems) {
    createdMenuItems.push(await upsertMenuItem(item));
  }

  const findSeededItem = (name: string) => {
    const item = createdMenuItems.find((menuItem) => menuItem.name === name);
    if (!item) {
      throw new Error(`Seeded menu item not found: ${name}`);
    }
    return item;
  };

  await prisma.offer.createMany({
    data: [
      {
        title: "Weekend Special",
        description: "Any 3 dishes + 2 drinks",
        discountText: "20% OFF",
        isActive: true,
      },
      {
        title: "Lunch Combo Deal",
        description: "Starter + Main Course",
        discountText: "10% OFF",
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  const customer = await prisma.customer.create({
    data: {
      name: "Rohit Shukla",
      phone: "9999999999",
    },
  });

  const paneerButterMasala = findSeededItem("Paneer Butter Masala");
  const freshOrangeJuice = findSeededItem("Fresh Orange Juice");

  await prisma.order.create({
    data: {
      orderNumber: "ORD-1001",
      customerId: customer.id,
      customerName: customer.name,
      tableNumber: "T-1",
      status: OrderStatus.PENDING,
      totalAmount: Number(paneerButterMasala.price) + Number(freshOrangeJuice.price),
      items: {
        create: [
          {
            menuItemId: paneerButterMasala.id,
            quantity: 1,
            unitPrice: Number(paneerButterMasala.price),
            totalPrice: Number(paneerButterMasala.price),
          },
          {
            menuItemId: freshOrangeJuice.id,
            quantity: 1,
            unitPrice: Number(freshOrangeJuice.price),
            totalPrice: Number(freshOrangeJuice.price),
          },
        ],
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
