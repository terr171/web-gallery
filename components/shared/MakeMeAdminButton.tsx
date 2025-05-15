"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { makeUserAdmin } from "@/features/admin/actions/admin.actions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

const MakeMeAdminButton = () => {
  const { data: session } = useSession();
  const [isRunning, setIsRunning] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleConfirmAdminAction = async () => {
    setIsRunning(true);
    const result = await makeUserAdmin();
    if (!result.success) {
      toast.error(result.error);
    }
    toast.success("Please sign out and log in again to apply changes");
    setIsRunning(false);
  };

  return (
    session && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="lg"
              onClick={() => setIsAlertOpen(true)}
              disabled={isRunning}
            >
              Make Me Admin
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Changes User&#39;s role from &#34;User&#34; to &#34;Admin&#34;
            </p>
          </TooltipContent>
        </Tooltip>

        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to change your role to Admin? <br />
                You will need to sign out and log in again to apply changes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isRunning}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmAdminAction}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TooltipProvider>
    )
  );
};
export default MakeMeAdminButton;
