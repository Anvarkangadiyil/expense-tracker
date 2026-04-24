import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

type SeedExpense = {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
};

const ALLOWED_CATEGORIES = [
  "Food",
  "Transport",
  "Housing",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Other",
] as const;

const seedExpenses: SeedExpense[] = [
  {
    id: "seed-food-001",
    amount: 500,
    category: "Food",
    description: "Groceries",
    date: new Date("2026-04-20"),
  },
  {
    id: "seed-travel-001",
    amount: 200,
    category: "Transport",
    description: "Metro card recharge",
    date: new Date("2026-04-21"),
  },
  {
    id: "seed-housing-001",
    amount: 12000,
    category: "Housing",
    description: "Monthly rent",
    date: new Date("2026-04-01"),
  },
  {
    id: "seed-utilities-001",
    amount: 1800,
    category: "Utilities",
    description: "Electricity bill",
    date: new Date("2026-04-10"),
  },
  {
    id: "seed-entertainment-001",
    amount: 900,
    category: "Entertainment",
    description: "Movie and snacks",
    date: new Date("2026-04-18"),
  },
  {
    id: "seed-health-001",
    amount: 750,
    category: "Healthcare",
    description: "Pharmacy",
    date: new Date("2026-04-22"),
  },
  {
    id: "seed-other-001",
    amount: 300,
    category: "Other",
    description: "Miscellaneous expense",
    date: new Date("2026-04-23"),
  },
];

async function seed() {
  const { connectDB } = await import("../lib/db");
  const { default: Expense } = await import("../models/Expense");

  await connectDB();

  const invalidCategoryItem = seedExpenses.find(
    (item) => !ALLOWED_CATEGORIES.includes(item.category as (typeof ALLOWED_CATEGORIES)[number])
  );
  if (invalidCategoryItem) {
    throw new Error(`Invalid seed category: ${invalidCategoryItem.category}`);
  }

  let inserted = 0;
  for (const item of seedExpenses) {
    const existing = await Expense.findOne({ id: item.id }).lean();
    if (existing) continue;

    await Expense.create({
      ...item,
      id: item.id,
    });
    inserted += 1;
  }

  console.log(`Seed complete. Inserted ${inserted} expense(s).`);
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    const message =
      error instanceof Error ? error.message : "Unknown seed error";
    console.error(`Seed failed: ${message}`);
    process.exit(1);
  });
