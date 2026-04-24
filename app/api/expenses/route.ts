import { NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";

const createExpenseSchema = z.object({
  amount: z.number().min(0),
  category: z.string().trim().min(1),
  description: z.string().trim().min(1),
  date: z.coerce.date(),
  requestId: z.string().trim().min(1).optional(),
});

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category")?.trim();
    const sort = searchParams.get("sort");

    const query: { category?: string } = {};
    if (category) {
      query.category = category;
    }

    const sortOptions = sort === "date_desc" ? { date: -1 as const } : undefined;
    const expenses = await Expense.find(query).sort(sortOptions).lean();

    return NextResponse.json(expenses, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createExpenseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { amount, category, description, date, requestId } = parsed.data;
    const expenseId = requestId ?? uuidv4();

    await connectDB();

    if (requestId) {
      const existingExpense = await Expense.findOne({ id: requestId }).lean();
      if (existingExpense) {
        return NextResponse.json(existingExpense, { status: 200 });
      }
    }

    const createdExpense = await Expense.create({
      id: expenseId,
      amount,
      category,
      description,
      date,
    });

    return NextResponse.json(createdExpense.toObject(), { status: 201 });
  } catch (error) {
    // Handle duplicate-key races for idempotent requests.
    if (
      error instanceof mongoose.Error &&
      "code" in error &&
      error.code === 11000
    ) {
      const duplicateKeyError = error as mongoose.Error & {
        keyValue?: Record<string, unknown>;
      };
      const duplicateId =
        typeof duplicateKeyError.keyValue?.id === "string"
          ? duplicateKeyError.keyValue.id
          : null;

      if (duplicateId) {
        const existingExpense = await Expense.findOne({ id: duplicateId }).lean();
        if (existingExpense) {
          return NextResponse.json(existingExpense, { status: 200 });
        }
      }
    }

    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}
