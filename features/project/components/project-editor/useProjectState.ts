import { useEffect, useState } from "react";
import { FileTypes, PostTypes, ProjectVisibility } from "@/database/schema";
import { ProjectData } from "@/features/project/lib/project.types";
import { getFileContent } from "@/features/project/lib/utils";

export const useProjectState = (project: ProjectData) => {
  const [projectTitle, setProjectTitle] = useState("");
  const [projectType, setProjectType] = useState<PostTypes>(project.type);
  const [projectHtml, setProjectHtml] = useState("");
  const [projectCss, setProjectCss] = useState("");
  const [projectJavascript, setProjectJavascript] = useState("");
  const [srcDoc, setSrcDoc] = useState("");
  const [visibility, setVisibility] = useState<ProjectVisibility>(
    project.visibility,
  );

  useEffect(() => {
    const defaultHtml = getFileContent({
      files: project.files,
      type: FileTypes.HTML,
    });
    const defaultCss = getFileContent({
      files: project.files,
      type: FileTypes.CSS,
    });
    const defaultJs = getFileContent({
      files: project.files,
      type: FileTypes.JS,
    });
    setVisibility(project.visibility);
    setProjectTitle(project.title);
    setProjectType(project.type);
    setProjectHtml(defaultHtml);
    setProjectCss(defaultCss);
    setProjectJavascript(defaultJs);
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setSrcDoc(`
        <!DOCTYPE html>
        <html >
        <head>
          <style>${projectCss}</style>
        </head>
        <body>
           ${projectHtml}
          <script>${projectJavascript}</script>
        </body>
      </html>
      `);
    }, 300);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [projectHtml, projectCss, projectJavascript]);

  return {
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
  };
};
