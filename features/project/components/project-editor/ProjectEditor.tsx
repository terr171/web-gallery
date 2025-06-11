"use client";
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Textarea } from "@/components/ui/textarea";

import { ProjectData } from "@/features/project/lib/project.types";
import { useProjectState } from "@/features/project/components/project-editor/useProjectState";
import { useProjectActions } from "@/features/project/components/project-editor/useProjectActions";
import Header from "@/features/project/components/project-editor/Header";

interface Props {
  isOwner?: boolean;
  project: ProjectData;
}

const ProjectEditor = ({ isOwner = false, project }: Props) => {
  const iframeRef = useRef(null);

  const {
    projectTitle,
    setProjectTitle,
    projectType,
    setProjectType,
    projectHtml,
    setProjectHtml,
    projectCss,
    setProjectCss,
    projectJavascript,
    setProjectJavascript,
    srcDoc,
    setSrcDoc,
    visibility,
    setVisibility,
  } = useProjectState(project);

  const {
    isSaving,
    handleSave,
    handleDeleteProject,
    runCode,
    handleVisibilityChange,
  } = useProjectActions({
    project,
    projectTitle,
    projectType,
    projectHtml,
    projectCss,
    projectJavascript,
    visibility,
    srcDoc,
    setSrcDoc,
  });

  const onVisibilityChange = (isChecked: boolean) => {
    setVisibility(handleVisibilityChange(isChecked));
  };

  return (
    <>
      <div className="flex flex-col px-8 pt-8 space-y-4 h-full">
        <Header
          isOwner={isOwner}
          project={project}
          projectTitle={projectTitle}
          setProjectTitle={setProjectTitle}
          projectType={projectType}
          setProjectType={setProjectType}
          visibility={visibility}
          onVisibilityChange={onVisibilityChange}
          onSave={handleSave}
          onDeleteProject={handleDeleteProject}
          isSaving={isSaving}
        />

        <div className="flex grow w-full pb-4 min-h-0">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={50} minSize={15}>
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
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={15}>
              <div className="flex flex-col h-full pl-4">
                <div className="flex items-center justify-between">
                  <span className="py-2 text-lg font-bold">Preview</span>
                  <Button onClick={runCode} variant="outline" size="sm">
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
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </>
  );
};

export default ProjectEditor;
