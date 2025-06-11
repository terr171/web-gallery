"use client";
import React, { useRef, useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Loader2, Play, Save, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  deleteProject,
  updateProjectFiles,
} from "@/features/project/actions/project.actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PostTypes, ProjectVisibility } from "@/database/schema";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { ProjectData } from "@/features/project/lib/project.types";
import { useProjectState } from "@/features/project/components/project-editor/useProjectState";

interface Props {
  isOwner?: boolean;
  project: ProjectData;
}

const ProjectEditor = ({ isOwner = false, project }: Props) => {
  const { publicId } = project;

  const [isSaving, setIsSaving] = useState(false);
  const iframeRef = useRef(null);

  const router = useRouter();

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

  const runCode = () => {
    if (iframeRef.current) {
      const currentContent = srcDoc;
      setSrcDoc("");
      setTimeout(() => {
        setSrcDoc(currentContent);
      }, 50);
    }
  };
  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateProjectFiles({
      publicId,
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

  const handleVisibilityChange = (isChecked: boolean) => {
    setVisibility(
      isChecked ? ProjectVisibility.Public : ProjectVisibility.Private,
    );
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

  return (
    <>
      <div className="flex flex-col px-8 pt-8 space-y-4 h-full">
        {isOwner ? (
          <>
            <div className="flex flex-row gap-4 items-center justify-between shrink-0 w-full">
              <div className="flex gap-4 items-center flex-1 min-w-0">
                <Input
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  maxLength={100}
                  className="text-xl focus-visible:ring-0 shadow-none field-sizing-content font-bold px-2 py-1"
                />
                <Select
                  value={projectType}
                  onValueChange={(value) => setProjectType(value as PostTypes)}
                >
                  <SelectTrigger className="w-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PostTypes).map((type: PostTypes) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="visibility">
                  {visibility === ProjectVisibility.Public
                    ? "Public"
                    : "Private"}
                </Label>
                <Switch
                  id="visibility-switch"
                  checked={visibility === ProjectVisibility.Public}
                  onCheckedChange={handleVisibilityChange}
                />
              </div>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                <span className="text-sm">
                  {isSaving ? "Saving..." : "Save"}
                </span>
              </Button>
              {project.isOwner && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 size={16} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="z-200">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Project</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this project? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteProject}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-row gap-4 items-center">
              <span className="text-xl font-semibold">{project.title}</span>
              <Badge className="text-xl font-medium" variant="secondary">
                {project.type}
              </Badge>
            </div>
          </>
        )}
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
