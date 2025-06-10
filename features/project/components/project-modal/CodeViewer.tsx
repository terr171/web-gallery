import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileData } from "../../lib/project.types";
import { FileTypes } from "@/database/schema";
import { getFileContent } from "@/features/project/lib/utils";

interface CodeViewerProps {
  files: FileData[];
}

const CodeViewer = ({ files }: CodeViewerProps) => {
  return (
    <Tabs defaultValue="html" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-2">
        <TabsTrigger value="html">HTML</TabsTrigger>
        <TabsTrigger value="css">CSS</TabsTrigger>
        <TabsTrigger value="js">JavaScript</TabsTrigger>
      </TabsList>

      {(["html", "css", "js"] as const).map((type) => (
        <TabsContent
          key={type}
          value={type}
          className="border rounded-md min-h-[300px] max-h-[300px] overflow-auto"
        >
          <pre className="p-4 rounded-md bg-gray-900 text-gray-100 overflow-auto h-full text-sm">
            <code>
              {getFileContent({
                files: files,
                type: type as FileTypes,
              })}
            </code>
          </pre>
        </TabsContent>
      ))}
    </Tabs>
  );
};
export default CodeViewer;
