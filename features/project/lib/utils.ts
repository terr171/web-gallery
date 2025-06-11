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

export const generateIframeContent = (files: FileData[]): string => {
  const html = getFileContent({ files: files, type: FileTypes.HTML });
  const css = getFileContent({ files: files, type: FileTypes.CSS });
  const js = getFileContent({ files: files, type: FileTypes.JS });

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>body { margin: 0; } ${css}</style>
      </head>
      <body>
        ${html}
        <script>${js}</script>
      </body>
    </html>
  `;
};
