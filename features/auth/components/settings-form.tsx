"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, User, Landmark, LogOut, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateUserSettings, deleteUserAccount } from "../actions";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const settingsSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  currencySymbol: z.string().trim().min(1, "Currency symbol is required").max(5, "Max 5 characters"),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  initialData: {
    name: string;
    email: string;
    currencySymbol: string;
  };
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema) as unknown as Resolver<SettingsFormValues>,
    defaultValues: {
      name: initialData.name,
      currencySymbol: initialData.currencySymbol,
    },
  });

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      const result = await updateUserSettings(data.name, data.currencySymbol);
      if (result.success) {
        toast.success(result.message ?? "Profile updated successfully.");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteUserAccount();
      if (result.success) {
        toast.success("Account deleted successfully.");
        // Log out immediately
        await signOut({ callbackUrl: "/login" });
      } else {
        toast.error(result.error ?? "Failed to delete account.");
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleQuickCurrency = (symbol: string) => {
    setValue("currencySymbol", symbol);
  };

  return (
    <div className="space-y-6">
      {/* Settings Form Card */}
      <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-hairline bg-surface p-6 shadow-elevation-1 space-y-6">
        <div className="border-b border-hairline pb-3">
          <h2 className="text-sm font-semibold text-ink flex items-center gap-1.5">
            <User className="h-4 w-4 text-ink-faint" />
            Profile Details
          </h2>
          <p className="text-3xs text-ink-muted mt-0.5">Manage your user profile and account details.</p>
        </div>

        <div className="space-y-4">
          {/* Name Field */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-semibold text-ink-secondary">
              Name <span className="text-destructive">*</span>
            </label>
            <input
              {...register("name")}
              id="name"
              type="text"
              disabled={isSubmitting}
              className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50"
            />
            {errors.name && <p className="text-2xs font-medium text-destructive">{errors.name.message}</p>}
          </div>

          {/* Email Field (Read-only) */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-ink-secondary">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={initialData.email}
              readOnly
              disabled
              className="flex h-10 w-full rounded-md border border-input bg-canvas-soft px-3 py-2 text-sm text-ink-muted cursor-not-allowed opacity-80"
              title="Email cannot be changed"
            />
          </div>
        </div>

        <div className="border-b border-hairline pb-3 pt-2">
          <h2 className="text-sm font-semibold text-ink flex items-center gap-1.5">
            <Landmark className="h-4 w-4 text-ink-faint" />
            Currency & Display
          </h2>
          <p className="text-3xs text-ink-muted mt-0.5 font-medium">Select your currency symbol for dashboard charts, expenses, and invoices.</p>
        </div>

        <div className="space-y-4">
          {/* Currency Symbol Field */}
          <div className="space-y-1.5">
            <label htmlFor="currencySymbol" className="text-xs font-semibold text-ink-secondary">
              Currency Symbol <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-2">
              <input
                {...register("currencySymbol")}
                id="currencySymbol"
                type="text"
                disabled={isSubmitting}
                className="flex h-10 w-24 rounded-md border border-input bg-surface px-3 py-2 text-sm text-center placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50"
              />
              <div className="flex gap-1.5">
                {["$", "€", "£", "₹", "¥"].map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => handleQuickCurrency(sym)}
                    className="flex h-10 w-10 items-center justify-center rounded border border-hairline bg-surface hover:bg-canvas-soft text-sm font-medium text-ink-secondary transition-colors"
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
            {errors.currencySymbol && (
              <p className="text-2xs font-medium text-destructive">{errors.currencySymbol.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-hairline pt-5 mt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-white hover:bg-primary-active h-9 px-4 text-sm font-medium gap-2 rounded-md"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </div>
      </form>

      {/* Danger Zone Card */}
      <div className="rounded-lg border border-destructive/20 bg-surface p-6 shadow-elevation-1 space-y-4">
        <div className="border-b border-hairline pb-3">
          <h2 className="text-sm font-semibold text-destructive flex items-center gap-1.5">
            <AlertTriangle className="h-4.5 w-4.5" />
            Danger Zone
          </h2>
          <p className="text-3xs text-ink-muted mt-0.5">Irreversible actions relating to your freelancer account.</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-ink-secondary">Delete Account</h3>
            <p className="text-2xs text-ink-muted mt-1 leading-normal max-w-md">
              Soft-deletes your account. All registered clients, projects, invoices, expenses, and income links will remain protected but your login credentials will be deactivated.
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            className="h-9 px-4 text-xs font-medium gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-lg border border-hairline bg-surface p-6 shadow-elevation-2 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded bg-destructive/10 text-destructive shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Confirm Account Deletion</h3>
                <p className="text-sm text-ink-muted mt-2 leading-relaxed">
                  Are you sure you want to deactivate and delete your account? This action will sign you out and prevent access to your dashboard.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-6">
              <Button
                variant="outline"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="h-9 border-hairline hover:bg-canvas-soft hover:text-ink"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={isDeleting}
                onClick={handleDeleteAccount}
                className="h-9"
              >
                {isDeleting ? "Deactivating..." : "Yes, Delete Account"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
