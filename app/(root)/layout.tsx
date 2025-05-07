import Header from "@/components/layout/Header";
import React from "react";
import { Toaster } from "sonner";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Header />
      <main className="pt-16 h-screen box-border">{children}</main>
      <Toaster />
    </div>
  );
};

export default layout;
