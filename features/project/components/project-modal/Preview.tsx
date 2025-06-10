"use client";
import React, { useMemo } from "react";
import { FileData } from "../../lib/project.types";
import { FileTypes } from "@/database/schema";
import { getFileContent } from "@/features/project/lib/utils";

interface ProjectPreviewProps {
  files: FileData[];
}
const Preview = ({ files }: ProjectPreviewProps) => {
  const iframeContent = useMemo(() => {
    const html = getFileContent({ files: files, type: FileTypes.HTML });
    const css = getFileContent({ files: files, type: FileTypes.CSS });
    const js = getFileContent({ files: files, type: FileTypes.JS });
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head><style>${css}</style></head>
        <body>
          ${html}
          <script>${js}</script>
        </body>
      </html>
    `;
  }, [files]);

  return (
    <div className="border rounded-md p-1 max-h-[320px] h-full overflow-hidden">
      <div className="text-xs text-gray-500 border-b pb-1 px-2">Preview</div>
      <iframe
        srcDoc={iframeContent}
        title="Code Preview"
        className="w-full h-full"
        sandbox="allow-scripts"
      />
    </div>
  );
};
export default Preview;
