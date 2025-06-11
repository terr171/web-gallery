"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProjectModalContainerProps {
  children: React.ReactNode;
  onClose?: () => void;
}

const ProjectModalContainer = ({
  children,
  onClose,
}: ProjectModalContainerProps) => {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  const handleOpenChange = (openState: boolean) => {
    setOpen(openState);
    if (!openState) {
      if (onClose) {
        onClose();
      } else {
        router.back();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTitle className="sr-only">A Modal View of a Project</DialogTitle>
      <DialogContent className="max-w-5xl w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogDescription className="sr-only">
          A detailed view of the project, showing its code, a live preview, and
          a section for user comments.
        </DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  );
};
export default ProjectModalContainer;
