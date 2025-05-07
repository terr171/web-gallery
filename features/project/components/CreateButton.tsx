"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import CreateProjectModal from "@/features/project/components/CreateProjectModal";
import { Code } from "lucide-react";
import { cn } from "@/lib/utils";

const CreateButton = ({
  text,
  customClass,
}: {
  text?: string;
  customClass?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <CreateProjectModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(customClass, "")}
        size="lg"
      >
        {text ? (
          text
        ) : (
          <>
            <Code className="h-4 w-4" />
            Create Project
          </>
        )}
      </Button>
    </>
  );
};
export default CreateButton;
