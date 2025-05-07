import React from "react";
import InfoCard from "@/features/admin/components/InfoCard";
import { AdminTable } from "@/features/admin/components/AdminTable";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@/database/schema";

const Page = async () => {
  const session = await auth();
  if (session?.user?.role !== UserRole.Admin) {
    redirect("/");
  }
  return (
    <div className="container mx-auto space-y-10 py-10">
      <div className="flex flex-col p-6">
        <InfoCard />
      </div>
      <AdminTable />
    </div>
  );
};
export default Page;
