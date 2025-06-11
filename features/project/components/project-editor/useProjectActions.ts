import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProjectVisibility, PostTypes } from "@/database/schema";
import {
  updateProjectFiles,
  deleteProject,
} from "@/features/project/actions/project.actions";
import { ProjectData } from "@/features/project/lib/project.types";

export const useProjectActions = ({
  project,
  projectTitle,
  projectType,
  projectHtml,
  projectCss,
  projectJavascript,
  visibility,
  srcDoc,
  setSrcDoc,
}: {
  project: ProjectData;
  projectTitle: string;
  projectType: PostTypes;
  projectHtml: string;
  projectCss: string;
  projectJavascript: string;
  visibility: ProjectVisibility;
  srcDoc: string;
  setSrcDoc: (doc: string) => void;
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateProjectFiles({
      publicId: project.publicId,
      newTitle: projectTitle,
      newType: projectType,
      html: projectHtml,
      css: projectCss,
      javascript: projectJavascript,
      visibility: visibility,
    });

    if (result.success) {
      toast.success("Changes have been saved");
    } else {
      toast.error(result.error);
    }
    setIsSaving(false);
  };

  const handleDeleteProject = async () => {
    const result = await deleteProject({ publicId: project.publicId });
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success("Project deleted successfully");
      router.push(`/user/${project.user.username}`);
    }
  };

  const runCode = () => {
    const currentContent = srcDoc;
    setSrcDoc("");
    setTimeout(() => {
      setSrcDoc(currentContent);
    }, 50);
  };

  const handleVisibilityChange = (isChecked: boolean) => {
    return isChecked ? ProjectVisibility.Public : ProjectVisibility.Private;
  };

  return {
    isSaving,
    handleSave,
    handleDeleteProject,
    runCode,
    handleVisibilityChange,
  };
};
