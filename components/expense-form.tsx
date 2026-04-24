"use client";

import { FormEvent, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { createExpense } from "@/lib/api";

type ExpenseFormValues = {
  amount: string;
  category: string;
  description: string;
  date: string;
};

type ExpenseFormProps = {
  categories?: string[];
  onSuccess?: () => void;
};

const DEFAULT_CATEGORIES = [
  "Food",
  "Transport",
  "Housing",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Other",
];

function getInitialValues(): ExpenseFormValues {
  return {
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  };
}

export function ExpenseForm({
  categories = DEFAULT_CATEGORIES,
  onSuccess,
}: ExpenseFormProps) {
  const [values, setValues] = useState<ExpenseFormValues>(getInitialValues);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSubmitDisabled = useMemo(() => {
    return (
      isSubmitting ||
      !values.amount.trim() ||
      !values.category.trim() ||
      !values.description.trim() ||
      !values.date.trim()
    );
  }, [isSubmitting, values]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const parsedAmount = Number(values.amount);
    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      setError("Please enter a valid non-negative amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createExpense({
        amount: parsedAmount,
        category: values.category.trim(),
        description: values.description.trim(),
        date: values.date,
        requestId: uuidv4(),
      });

      setValues(getInitialValues());
      onSuccess?.();
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Failed to create expense. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
    >
      <div className="space-y-2">
        <label htmlFor="amount" className="text-sm font-medium leading-none">
          Amount
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          required
          value={values.amount}
          onChange={(event) =>
            setValues((previous) => ({ ...previous, amount: event.target.value }))
          }
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="0.00"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="category" className="text-sm font-medium leading-none">
          Category
        </label>
        <select
          id="category"
          name="category"
          required
          value={values.category}
          onChange={(event) =>
            setValues((previous) => ({ ...previous, category: event.target.value }))
          }
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="text-sm font-medium leading-none"
        >
          Description
        </label>
        <input
          id="description"
          name="description"
          type="text"
          required
          maxLength={200}
          value={values.description}
          onChange={(event) =>
            setValues((previous) => ({
              ...previous,
              description: event.target.value,
            }))
          }
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Add a short note"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="date" className="text-sm font-medium leading-none">
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          value={values.date}
          onChange={(event) =>
            setValues((previous) => ({ ...previous, date: event.target.value }))
          }
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {error ? (
        <p className="text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitDisabled}
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        {isSubmitting ? "Saving..." : "Add Expense"}
      </button>
    </form>
  );
}
