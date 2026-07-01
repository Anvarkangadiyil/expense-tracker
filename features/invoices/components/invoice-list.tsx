"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  Calendar,
  Building2,
  Folder,
  Eye,
  CheckCircle2,
  FileText,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  clientId?: { _id: string; name: string; company?: string };
  projectId?: { _id: string; name: string };
  issueDate: string;
  dueDate: string;
  lineItems: Array<{ description: string; quantity: number; rate: number }>;
  status: "draft" | "sent" | "paid" | "overdue";
  notes?: string;
  createdAt?: string;
}

interface ClientOption {
  _id: string;
  name: string;
}

interface InvoiceListProps {
  invoices: Invoice[];
  clients: ClientOption[];
  currencySymbol?: string;
}

export function InvoiceList({ invoices, clients, currencySymbol = "$" }: InvoiceListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "sent" | "paid" | "overdue">("all");
  const [clientFilter, setClientFilter] = useState<string>("");

  // Helper to calculate total for an invoice
  const calculateInvoiceTotal = (inv: Invoice) => {
    return inv.lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  };

  // Compute metrics (overall totals)
  const metrics = useMemo(() => {
    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalDue = 0;

    invoices.forEach((inv) => {
      const total = calculateInvoiceTotal(inv);
      totalInvoiced += total;
      if (inv.status === "paid") {
        totalPaid += total;
      } else {
        totalDue += total;
      }
    });

    return {
      totalInvoiced,
      totalPaid,
      totalDue,
    };
  }, [invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Search filter (number or client name)
      const numMatch = inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const clientNameMatch = inv.clientId?.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const companyMatch = inv.clientId?.company
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesSearch = numMatch || clientNameMatch || companyMatch;

      if (searchQuery && !matchesSearch) return false;

      // Status filter
      if (statusFilter !== "all" && inv.status !== statusFilter) return false;

      // Client filter
      if (clientFilter && inv.clientId?._id !== clientFilter) return false;

      return true;
    });
  }, [invoices, searchQuery, statusFilter, clientFilter]);

  // Helper for status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-success-bg border border-success/15 px-2 py-0.5 text-2xs font-semibold text-success uppercase">
            <CheckCircle2 className="h-3 w-3" />
            Paid
          </span>
        );
      case "sent":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-2xs font-semibold text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30 uppercase">
            <ArrowUpRight className="h-3 w-3" />
            Sent
          </span>
        );
      case "overdue":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-destructive-bg border border-destructive/15 px-2 py-0.5 text-2xs font-semibold text-destructive uppercase">
            <Clock className="h-3 w-3" />
            Overdue
          </span>
        );
      default: // draft
        return (
          <span className="inline-flex items-center gap-1 rounded bg-canvas-soft border border-hairline px-2 py-0.5 text-2xs font-semibold text-ink-muted uppercase">
            <FileText className="h-3 w-3" />
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Create Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading-2 text-ink font-bold tracking-tight">Invoices</h1>
          <p className="text-body-sm text-ink-muted">
            Create professional invoices, send shareable links, and track client payments.
          </p>
        </div>
        <Button
          onClick={() => router.push("/invoices/create")}
          className="bg-primary text-white hover:bg-primary-active self-start sm:self-auto gap-2 rounded-md h-9 px-4 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-hairline bg-surface p-5 shadow-elevation-1">
          <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
            Total Invoiced
          </div>
          <div className="mt-2 text-2xl font-bold text-ink">
            {currencySymbol}{metrics.totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="rounded-lg border border-hairline bg-surface p-5 shadow-elevation-1">
          <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
            Total Paid
          </div>
          <div className="mt-2 text-2xl font-bold text-success">
            {currencySymbol}{metrics.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="rounded-lg border border-hairline bg-surface p-5 shadow-elevation-1">
          <div className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
            Total Outstanding
          </div>
          <div className="mt-2 text-2xl font-bold text-primary">
            {currencySymbol}{metrics.totalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-hairline pb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            type="text"
            placeholder="Search by invoice number or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-surface pl-10 pr-4 py-2 text-sm placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter selection tabs */}
          <div className="flex rounded-md border border-hairline bg-surface p-0.5 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-canvas-soft text-ink font-semibold"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("draft")}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                statusFilter === "draft"
                  ? "bg-canvas-soft text-ink font-semibold"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Drafts
            </button>
            <button
              onClick={() => setStatusFilter("sent")}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                statusFilter === "sent"
                  ? "bg-canvas-soft text-ink font-semibold"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Sent
            </button>
            <button
              onClick={() => setStatusFilter("paid")}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                statusFilter === "paid"
                  ? "bg-canvas-soft text-ink font-semibold"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setStatusFilter("overdue")}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                statusFilter === "overdue"
                  ? "bg-canvas-soft text-ink font-semibold"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Overdue
            </button>
          </div>

          {/* Client Filter select */}
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="rounded-md border border-hairline bg-surface px-2.5 py-1 text-xs font-medium text-ink-secondary focus:outline-none focus:ring-1 focus:ring-primary max-w-[150px]"
          >
            <option value="">All Clients</option>
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Invoice Table */}
      {filteredInvoices.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-hairline bg-surface shadow-elevation-1">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-canvas-soft border-b border-hairline text-ink-muted font-medium text-2xs uppercase tracking-wider">
                <th className="p-3 pl-4">Invoice #</th>
                <th className="p-3">Client</th>
                <th className="p-3">Linked Project</th>
                <th className="p-3">Issue Date</th>
                <th className="p-3">Due Date</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 pr-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filteredInvoices.map((inv) => {
                const total = calculateInvoiceTotal(inv);
                return (
                  <tr key={inv._id} className="hover:bg-canvas-soft/20 transition-colors">
                    {/* Invoice Number */}
                    <td className="p-3 pl-4 font-semibold text-primary">
                      <Link href={`/invoices/${inv._id}`} className="hover:underline">
                        {inv.invoiceNumber}
                      </Link>
                    </td>

                    {/* Client */}
                    <td className="p-3">
                      <div className="font-medium text-ink-secondary">
                        {inv.clientId ? inv.clientId.name : "Unknown Client"}
                      </div>
                      {inv.clientId?.company && (
                        <div className="text-3xs text-ink-muted flex items-center gap-1 mt-0.5">
                          <Building2 className="h-3 w-3 text-ink-faint" />
                          {inv.clientId.company}
                        </div>
                      )}
                    </td>

                    {/* Linked Project */}
                    <td className="p-3 text-ink-muted">
                      {inv.projectId ? (
                        <div className="flex items-center gap-1">
                          <Folder className="h-3.5 w-3.5 text-ink-faint shrink-0" />
                          <span className="truncate max-w-[120px]">{inv.projectId.name}</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* Issue Date */}
                    <td className="p-3 text-ink-secondary whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-ink-faint" />
                        {new Date(inv.issueDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="p-3 text-ink-secondary whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-ink-faint" />
                        {new Date(inv.dueDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3 text-center whitespace-nowrap">
                      {getStatusBadge(inv.status)}
                    </td>

                    {/* Amount */}
                    <td className="p-3 text-right font-semibold text-ink">
                      {currencySymbol}{total.toFixed(2)}
                    </td>

                    {/* Actions */}
                    <td className="p-3 pr-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/invoices/${inv._id}`)}
                        className="h-8 gap-1.5 border-hairline hover:bg-canvas-soft text-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Manage</span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline bg-surface py-16 text-center">
          <FileText className="h-10 w-10 text-ink-faint mb-3" />
          <h3 className="font-semibold text-ink text-sm">No invoices found</h3>
          <p className="text-xs text-ink-muted max-w-xs mt-1">
            Create your first client invoice to bill for fixed rates or hourly logs.
          </p>
          <Button
            onClick={() => router.push("/invoices/create")}
            className="mt-4 bg-primary text-white hover:bg-primary-active gap-2 h-9 px-4 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Invoice
          </Button>
        </div>
      )}
    </div>
  );
}
