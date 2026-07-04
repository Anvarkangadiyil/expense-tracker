import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppLayout } from "@/components/app-layout";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <AppLayout user={session.user}>
      {children}
    </AppLayout>
  );
}
