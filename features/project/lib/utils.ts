import { FileTypes } from "@/database/schema";
import { FileData } from "./project.types";

export const getFileContent = ({
  files,
  type,
}: {
  files: FileData[];
  type: FileTypes;
}) => {
  return files.find((file) => file.type === type)?.content || "";
};
