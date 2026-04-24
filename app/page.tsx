"use client";

import { useState } from "react";

import { CategorySummary } from "@/components/category-summary";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseTable } from "@/components/expense-table";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <ExpenseForm onSuccess={() => setRefreshKey((previous) => previous + 1)} />
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <ExpenseTable refreshKey={refreshKey} />
          <CategorySummary refreshKey={refreshKey} />
        </div>
      </main>
    </div>
  );
}
