"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { invoiceFormSchema, type InvoiceFormValues } from "../schemas";
import { createInvoice, updateInvoice, polishInvoiceDescriptionAction } from "../actions";
import { Button } from "@/components/ui/button";

interface ClientOption {
  _id: string;
  name: string;
  company?: string;
}

interface ProjectOption {
  _id: string;
  clientId: string;
  name: string;
  status: string;
}

interface InvoiceFormProps {
  clients: ClientOption[];
  projects: ProjectOption[];
  invoice?: {
    _id: string;
    clientId: { _id: string; name: string } | string;
    projectId?: { _id: string; name: string } | string;
    issueDate: string;
    dueDate: string;
    lineItems: Array<{ description: string; quantity: number; rate: number }>;
    status: "draft" | "sent" | "paid" | "overdue";
    notes?: string;
  };
}

export function InvoiceForm({ clients, projects, invoice }: InvoiceFormProps) {
  const router = useRouter();
  const isEditing = !!invoice;
  const [polishingIndexes, setPolishingIndexes] = useState<number[]>([]);

  const handlePolishDescription = async (index: number) => {
    const currentValue = watch(`lineItems.${index}.description`);
    if (!currentValue || currentValue.trim().length < 3) {
      toast.error("Please enter some rough notes first to polish.");
      return;
    }

    setPolishingIndexes((prev) => [...prev, index]);
    try {
      const result = await polishInvoiceDescriptionAction(currentValue);
      if (result.success && result.polished) {
        setValue(`lineItems.${index}.description`, result.polished);
        toast.success("Description polished!");
      } else {
        toast.error(result.error ?? "Failed to polish description.");
      }
    } catch (err) {
      console.error("AI description polish failed:", err);
      toast.error("Failed to polish description. You can still input manually.");
    } finally {
      setPolishingIndexes((prev) => prev.filter((i) => i !== index));
    }
  };

  // Normalize initial client/project ID strings
  const initialClientId =
    invoice && typeof invoice.clientId === "object"
      ? invoice.clientId._id
      : ((invoice?.clientId as string) ?? "");

  const initialProjectId =
    invoice && typeof invoice.projectId === "object"
      ? invoice.projectId._id
      : ((invoice?.projectId as string) ?? "");

  // Default dates
  const defaultIssueDate = invoice?.issueDate ?? new Date().toISOString().split("T")[0];
  const defaultDueDate = useMemo(() => {
    if (invoice?.dueDate) return invoice.dueDate;
    const date = new Date();
    date.setDate(date.getDate() + 30); // 30 days due date by default
    return date.toISOString().split("T")[0];
  }, [invoice]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema) as unknown as Resolver<InvoiceFormValues>,
    defaultValues: {
      clientId: initialClientId,
      projectId: initialProjectId,
      issueDate: defaultIssueDate,
      dueDate: defaultDueDate,
      lineItems: invoice?.lineItems ?? [{ description: "", quantity: 1, rate: 0 }],
      status: invoice?.status ?? "draft",
      notes: invoice?.notes ?? "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  const watchedClientId = watch("clientId");
  const watchedLineItems = watch("lineItems");

  // Reset project if client changes and the existing project is not linked to new client
  useEffect(() => {
    if (watchedClientId && !isEditing) {
      setValue("projectId", "");
    }
  }, [watchedClientId, setValue, isEditing]);

  // Filter projects based on selected client
  const filteredProjects = useMemo(() => {
    if (!watchedClientId) return [];
    return projects.filter((p) => p.clientId === watchedClientId && p.status === "active");
  }, [watchedClientId, projects]);

  // Calculate live totals
  const totals = useMemo(() => {
    if (!watchedLineItems) return { subtotal: 0, total: 0 };
    const subtotal = watchedLineItems.reduce((sum, item) => {
      const q = Number(item.quantity) || 0;
      const r = Number(item.rate) || 0;
      return sum + q * r;
    }, 0);
    return {
      subtotal,
      total: subtotal, // For MVP, no tax/discounts yet
    };
  }, [watchedLineItems]);

  const onSubmit = async (data: InvoiceFormValues) => {
    try {
      const submissionData = {
        ...data,
        projectId: data.projectId ? data.projectId : undefined,
      };

      if (isEditing && invoice) {
        const result = await updateInvoice(invoice._id, submissionData);
        if (result.success) {
          toast.success("Invoice updated successfully.");
          router.push(`/invoices/${invoice._id}`);
          router.refresh();
        } else {
          toast.error(result.error ?? "Failed to update invoice.");
        }
      } else {
        const result = await createInvoice(submissionData);
        if (result.success && result.data) {
          toast.success("Invoice created successfully.");
          router.push(`/invoices/${result.data._id}`);
          router.refresh();
        } else {
          toast.error(result.error ?? "Failed to create invoice.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Top action header */}
      <div className="flex items-center justify-between border-b border-hairline pb-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="h-8 w-8 p-0 border-hairline hover:bg-canvas-soft"
          >
            <ArrowLeft className="h-4 w-4 text-ink-secondary" />
          </Button>
          <h1 className="text-heading-2 font-bold text-ink">
            {isEditing ? "Edit Invoice" : "Create Invoice"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="h-9 border-hairline hover:bg-canvas-soft hover:text-ink text-sm font-medium"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-white hover:bg-primary-active h-9 px-4 text-sm font-medium gap-2 rounded-md"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? "Save Changes" : "Create Invoice"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left main form section */}
        <div className="md:col-span-2 space-y-6">
          {/* Metadata Card */}
          <div className="rounded-lg border border-hairline bg-surface p-5 shadow-elevation-1 space-y-4">
            <h2 className="text-sm font-semibold text-ink border-b border-hairline pb-2">
              Invoice Details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Client Selection */}
              <div className="space-y-1.5">
                <label htmlFor="clientId" className="text-xs font-semibold text-ink-secondary">
                  Client <span className="text-destructive">*</span>
                </label>
                <select
                  {...register("clientId")}
                  id="clientId"
                  disabled={isSubmitting}
                  className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50"
                >
                  <option value="">Select a Client</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name} {client.company ? `(${client.company})` : ""}
                    </option>
                  ))}
                </select>
                {errors.clientId && (
                  <p className="text-2xs font-medium text-destructive">{errors.clientId.message}</p>
                )}
              </div>

              {/* Project Selection */}
              <div className="space-y-1.5">
                <label htmlFor="projectId" className="text-xs font-semibold text-ink-secondary">
                  Project <span className="text-ink-muted text-3xs">(Optional)</span>
                </label>
                <select
                  {...register("projectId")}
                  id="projectId"
                  disabled={isSubmitting || !watchedClientId}
                  className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50"
                >
                  <option value="">
                    {!watchedClientId ? "Select Client First" : "No Project Link"}
                  </option>
                  {filteredProjects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                {errors.projectId && (
                  <p className="text-2xs font-medium text-destructive">{errors.projectId.message}</p>
                )}
              </div>

              {/* Issue Date */}
              <div className="space-y-1.5">
                <label htmlFor="issueDate" className="text-xs font-semibold text-ink-secondary">
                  Issue Date <span className="text-destructive">*</span>
                </label>
                <input
                  {...register("issueDate")}
                  id="issueDate"
                  type="date"
                  disabled={isSubmitting}
                  className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50"
                />
                {errors.issueDate && (
                  <p className="text-2xs font-medium text-destructive">{errors.issueDate.message}</p>
                )}
              </div>

              {/* Due Date */}
              <div className="space-y-1.5">
                <label htmlFor="dueDate" className="text-xs font-semibold text-ink-secondary">
                  Due Date <span className="text-destructive">*</span>
                </label>
                <input
                  {...register("dueDate")}
                  id="dueDate"
                  type="date"
                  disabled={isSubmitting}
                  className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50"
                />
                {errors.dueDate && (
                  <p className="text-2xs font-medium text-destructive">{errors.dueDate.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Section */}
          <div className="rounded-lg border border-hairline bg-surface p-5 shadow-elevation-1 space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-2">
              <h2 className="text-sm font-semibold text-ink">Line Items</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ description: "", quantity: 1, rate: 0 })}
                className="h-8 gap-1.5 border-hairline hover:bg-canvas-soft text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </Button>
            </div>

            {errors.lineItems && (
              <p className="text-2xs font-medium text-destructive">
                {errors.lineItems.message || (errors.lineItems as any).root?.message}
              </p>
            )}

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-3 items-start border border-hairline/60 bg-canvas-soft/30 p-3 rounded-md relative group"
                >
                  {/* Item Description */}
                  <div className="flex-1 space-y-1">
                    <div className="relative">
                      <input
                        {...register(`lineItems.${index}.description` as const)}
                        placeholder="Item description (e.g. rough notes: coded dashboard UI, fixed styles)"
                        disabled={isSubmitting || polishingIndexes.includes(index)}
                        className="flex h-9 w-full rounded border border-input bg-surface pl-3 pr-8 py-1.5 text-xs placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => handlePolishDescription(index)}
                        disabled={isSubmitting || polishingIndexes.includes(index)}
                        title="Polish with AI"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-faint hover:text-primary transition-colors disabled:opacity-40"
                      >
                        {polishingIndexes.includes(index) ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    {errors.lineItems?.[index]?.description && (
                      <p className="text-3xs font-medium text-destructive">
                        {errors.lineItems[index].description.message}
                      </p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="w-20 space-y-1">
                    <input
                      {...register(`lineItems.${index}.quantity` as const)}
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Qty"
                      disabled={isSubmitting}
                      className="flex h-9 w-full rounded border border-input bg-surface px-2 py-1.5 text-xs text-center placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
                    />
                    {errors.lineItems?.[index]?.quantity && (
                      <p className="text-3xs font-medium text-destructive text-center">
                        {errors.lineItems[index].quantity.message}
                      </p>
                    )}
                  </div>

                  {/* Rate */}
                  <div className="w-28 space-y-1">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-2xs text-ink-faint">$</span>
                      <input
                        {...register(`lineItems.${index}.rate` as const)}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Rate"
                        disabled={isSubmitting}
                        className="flex h-9 w-full rounded border border-input bg-surface pl-5 pr-2 py-1.5 text-xs text-right placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
                      />
                    </div>
                    {errors.lineItems?.[index]?.rate && (
                      <p className="text-3xs font-medium text-destructive text-right">
                        {errors.lineItems[index].rate.message}
                      </p>
                    )}
                  </div>

                  {/* Line Total */}
                  <div className="w-24 text-right pr-2 pt-2 text-xs font-semibold text-ink-secondary">
                    $
                    {(
                      (Number(watchedLineItems?.[index]?.quantity) || 0) *
                      (Number(watchedLineItems?.[index]?.rate) || 0)
                    ).toFixed(2)}
                  </div>

                  {/* Delete Item button */}
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="h-9 w-9 p-0 text-ink-muted hover:text-destructive hover:bg-destructive/10 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar column */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="rounded-lg border border-hairline bg-surface p-5 shadow-elevation-1 space-y-4">
            <h2 className="text-sm font-semibold text-ink border-b border-hairline pb-2">
              Summary
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-ink-muted">
                <span>Subtotal</span>
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-hairline pt-2 text-sm font-bold text-ink">
                <span>Total Due</span>
                <span>${totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Settings & Status Card */}
          <div className="rounded-lg border border-hairline bg-surface p-5 shadow-elevation-1 space-y-4">
            <h2 className="text-sm font-semibold text-ink border-b border-hairline pb-2">
              Status & Notes
            </h2>

            {/* Status */}
            <div className="space-y-1.5">
              <label htmlFor="status" className="text-xs font-semibold text-ink-secondary">
                Status
              </label>
              <select
                {...register("status")}
                id="status"
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label htmlFor="notes" className="text-xs font-semibold text-ink-secondary">
                Notes / Payment Terms
              </label>
              <textarea
                {...register("notes")}
                id="notes"
                rows={4}
                placeholder="Payment details (e.g. Bank transfer info, Net 30 terms)"
                disabled={isSubmitting}
                className="flex w-full rounded-md border border-input bg-surface px-3 py-2 text-xs placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50 resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
