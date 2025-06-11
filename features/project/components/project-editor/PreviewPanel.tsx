"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface PreviewPanelProps {
  srcDoc: string;
  onRunCode: () => void;
  iframeRef: React.Ref<HTMLIFrameElement>;
}

const PreviewPanel = ({ srcDoc, onRunCode, iframeRef }: PreviewPanelProps) => {
  return (
    <div className="flex flex-col h-full pl-4">
      <div className="flex items-center justify-between">
        <span className="py-2 text-lg font-bold">Preview</span>
        <Button onClick={onRunCode} variant="outline" size="sm">
          <Play className="w-3 h-3" />
          <span>Run</span>
        </Button>
      </div>

      <iframe
        ref={iframeRef}
        srcDoc={srcDoc}
        title="preview"
        className="w-full h-full bg-white rounded-sm border"
        sandbox="allow-scripts"
      />
    </div>
  );
};
export default PreviewPanel;
