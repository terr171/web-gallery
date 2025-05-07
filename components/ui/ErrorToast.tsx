"use client";
import { useEffect } from "react";
import { toast } from "sonner";

const ErrorToast = ({ error }: { error: string }) => {
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return null;
};
export default ErrorToast;
