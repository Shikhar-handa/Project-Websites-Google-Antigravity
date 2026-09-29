import "./dashboard.css";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "./Sidebar";

export const metadata = {
  title: "Dashboard | CraveBite",
  description: "Customer dashboard and order history.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content animate-fade-in-up">
        {children}
      </main>
    </div>
  );
}
