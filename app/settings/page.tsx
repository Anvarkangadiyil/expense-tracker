import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/components/header";
import { getUserSettings } from "@/features/auth/actions";
import { SettingsForm } from "@/features/auth/components/settings-form";

export const metadata = {
  title: "Settings - Freelancer Finance",
  description: "Configure your freelancer profile and display options",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const result = await getUserSettings();
  if (!result.success || !result.data) {
    redirect("/");
  }

  const settings = result.data;

  return (
    <div className="min-h-screen bg-canvas-soft flex flex-col">
      <Header user={session.user} />
      <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-heading-2 font-bold tracking-tight text-ink">Settings</h1>
          <p className="text-body-sm text-ink-muted">
            Customize your experience and billing currency.
          </p>
        </div>

        <SettingsForm initialData={settings} />
      </main>
    </div>
  );
}
