"use client";

import { useState } from "react";

import { ExpenseForm } from "@/components/expense-form";
import { ExpenseTable } from "@/components/expense-table";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <ExpenseForm onSuccess={() => setRefreshKey((previous) => previous + 1)} />
        <ExpenseTable refreshKey={refreshKey} />
      </main>
    </div>
  );
}
