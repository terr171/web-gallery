"use client";
import React, { useMemo } from "react";
import { FileData } from "../../lib/project.types";
import { generateIframeContent } from "@/features/project/lib/utils";

interface ProjectPreviewProps {
  files: FileData[];
}
const Preview = ({ files }: ProjectPreviewProps) => {
  const iframeContent = useMemo(() => generateIframeContent(files), [files]);

  return (
    <div className="border rounded-md pt-1 h-[320px] lg:h-full overflow-hidden">
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
