import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProject } from "@/features/project/actions/project.actions";
import {
  CreateProjectInput,
  CreateProjectOutput,
  createProjectSchema,
} from "@/features/project/lib/validations";
import { PostTypes, ProjectVisibility } from "@/database/schema";

export const useCreateProject = (onClose: () => void) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreateProjectOutput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: "My Project",
      type: PostTypes.Others,
      visibility: ProjectVisibility.Public,
    },
  });

  const onSubmit = async (data: CreateProjectInput) => {
    setError(null);
    const result = await createProject(data);

    if (result.success) {
      form.reset();
      onClose();
      const { username, publicId } = result.response;
      router.push(`/user/${username}/${publicId}`);
    } else {
      setError(result.error);
    }
  };

  return {
    form,
    onSubmit,
    error,
    isSubmitting: form.formState.isSubmitting,
  };
};
