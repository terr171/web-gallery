"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

interface CodeEditorProps {
  projectHtml: string;
  setProjectHtml: (html: string) => void;
  projectCss: string;
  setProjectCss: (css: string) => void;
  projectJavascript: string;
  setProjectJavascript: (js: string) => void;
}

const CodeEditor = ({
  projectHtml,
  setProjectHtml,
  projectCss,
  setProjectCss,
  projectJavascript,
  setProjectJavascript,
}: CodeEditorProps) => {
  return (
    <Tabs defaultValue="html" className="w-full h-full">
      <TabsList>
        <TabsTrigger value="html">HTML</TabsTrigger>
        <TabsTrigger value="css">CSS</TabsTrigger>
        <TabsTrigger value="js">JS</TabsTrigger>
        <TabsTrigger value="all">All</TabsTrigger>
      </TabsList>
      <TabsContent value="html" className="pr-4 grow overflow-hidden">
        <Textarea
          value={projectHtml}
          onChange={(e) => setProjectHtml(e.target.value)}
          className="w-full h-full resize-none focus-visible:ring-0 focus-visible:outline-none overflow-auto"
        />
      </TabsContent>
      <TabsContent value="css" className="pr-4 grow overflow-hidden">
        <Textarea
          value={projectCss}
          onChange={(e) => setProjectCss(e.target.value)}
          className="w-full h-full resize-none border focus-visible:ring-0 focus-visible:outline-none overflow-auto"
        />
      </TabsContent>
      <TabsContent value="js" className="pr-4 grow overflow-hidden">
        <Textarea
          value={projectJavascript}
          onChange={(e) => setProjectJavascript(e.target.value)}
          className="w-full h-full resize-none border focus-visible:ring-0 focus-visible:outline-none overflow-auto"
        />
      </TabsContent>
      <TabsContent value="all" className="pr-4 grow overflow-hidden">
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel minSize={10}>
            <Textarea
              value={projectHtml}
              onChange={(e) => setProjectHtml(e.target.value)}
              className="w-full h-full resize-none  focus-visible:ring-0 focus-visible:outline-none overflow-auto"
            />
          </ResizablePanel>
          <ResizableHandle withHandle />

          <ResizablePanel minSize={10}>
            <Textarea
              value={projectCss}
              onChange={(e) => setProjectCss(e.target.value)}
              className="w-full h-full resize-none border  focus-visible:ring-0 focus-visible:outline-none overflow-auto"
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel minSize={10}>
            <Textarea
              value={projectJavascript}
              onChange={(e) => setProjectJavascript(e.target.value)}
              className="w-full h-full resize-none border  focus-visible:ring-0 focus-visible:outline-none overflow-auto"
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </TabsContent>
    </Tabs>
  );
};
export default CodeEditor;
