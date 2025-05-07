import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();
  if (session) redirect("/");
  return (
    <main className="flex min-h-screen flex-col bg-gray-100 ">{children}</main>
  );
};

export default layout;
