"use client";

import { useEffect, useMemo, useState } from "react";

type Expense = {
  id: string;
  amount: number;
  category: string;
};

type CategorySummaryProps = {
  refreshKey?: number;
};

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function CategorySummary({ refreshKey = 0 }: CategorySummaryProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadExpenses() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/expenses?sort=date_desc", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          const message =
            data && typeof data === "object" && "error" in data
              ? String(data.error)
              : `Request failed with status ${response.status}`;
          throw new Error(message);
        }

        if (!isMounted) return;
        setExpenses(Array.isArray(data) ? (data as Expense[]) : []);
      } catch (loadError) {
        if (!isMounted) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load category summary."
        );
        setExpenses([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadExpenses();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const summary = useMemo(() => {
    const grouped = expenses.reduce<Record<string, number>>((acc, expense) => {
      const key = expense.category?.trim() || "Uncategorized";
      const current = acc[key] ?? 0;
      acc[key] = current + expense.amount;
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  if (isLoading) {
    return (
      <section className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-sm text-muted-foreground">Loading category summary...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Category Summary</h2>

      {summary.length === 0 ? (
        <p className="text-sm text-muted-foreground">No expenses available.</p>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 border-b pb-2 text-sm font-medium text-muted-foreground">
            <span>Category</span>
            <span className="text-right">Total</span>
          </div>
          {summary.map((item) => (
            <div
              key={item.category}
              className="grid grid-cols-2 border-b pb-2 text-sm last:border-none"
            >
              <span>{item.category}</span>
              <span className="text-right font-medium">{formatInr(item.total)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
