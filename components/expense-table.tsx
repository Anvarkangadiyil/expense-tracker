"use client";

import { useEffect, useMemo, useState } from "react";
import { getExpenses } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Expense = {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string | Date;
};

type ExpenseTableProps = {
  categories?: string[];
  refreshKey?: number;
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

function formatDate(value: string | Date) {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(parsed);
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function ExpenseTable({
  categories = DEFAULT_CATEGORIES,
  refreshKey = 0,
}: ExpenseTableProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isActive = true;
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 15000);

    async function loadExpenses() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getExpenses<Expense[]>(
          {
            category: selectedCategory === "all" ? undefined : selectedCategory,
            sort: "date_desc",
          },
          {
          signal: abortController.signal,
          }
        );

        if (!isActive) return;
        setExpenses(Array.isArray(data) ? data : []);
      } catch (loadError) {
        if (!isActive) return;
        if (
          loadError instanceof Error &&
          loadError.name === "AbortError"
        ) {
          setError("Request timed out on a slow network. Please retry.");
          setExpenses([]);
          return;
        }
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Failed to load expenses. Please try again.";
        setError(message);
        setExpenses([]);
      } finally {
        clearTimeout(timeoutId);
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadExpenses();

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [selectedCategory, refreshKey, retryCount]);

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((left, right) => {
      const leftDate = new Date(left.date).getTime();
      const rightDate = new Date(right.date).getTime();
      return rightDate - leftDate;
    });
  }, [expenses]);

  const totalVisibleAmount = useMemo(() => {
    return sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [sortedExpenses]);

  return (
    <section className="space-y-4 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Expenses</h2>
        <select
          aria-label="Filter expenses by category"
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          className="flex h-10 min-w-44 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm font-medium text-foreground">
        Total: {formatAmount(totalVisibleAmount)}
      </p>

      {error ? (
        <div
          className="flex flex-col gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4"
          role="alert"
        >
          <p className="text-sm font-medium text-destructive">{error}</p>
          <button
            type="button"
            onClick={() => setRetryCount((previous) => previous + 1)}
            className="inline-flex h-9 w-fit items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Retry
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex items-center gap-3 rounded-md border p-6 text-sm text-muted-foreground">
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground"
            aria-hidden="true"
          />
          <span>Loading expenses... This may take longer on slow networks.</span>
        </div>
      ) : sortedExpenses.length === 0 ? (
        <div className="rounded-md border p-6 text-sm text-muted-foreground">
          No expenses found.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Amount</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[140px]">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="font-medium">
                  {formatAmount(expense.amount)}
                </TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>{formatDate(expense.date)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
