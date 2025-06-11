import React from "react";
import { ProjectData } from "../../lib/project.types";
import { PostTypes, ProjectVisibility } from "@/database/schema";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  isOwner: boolean;
  project: ProjectData;
  projectTitle: string;
  setProjectTitle: (title: string) => void;
  projectType: PostTypes;
  setProjectType: (type: PostTypes) => void;
  visibility: ProjectVisibility;
  onVisibilityChange: (isChecked: boolean) => void;
  onSave: () => void;
  onDeleteProject: () => void;
  isSaving: boolean;
}

const Header = ({
  isOwner,
  project,
  projectTitle,
  setProjectTitle,
  projectType,
  setProjectType,
  visibility,
  onVisibilityChange,
  onSave,
  onDeleteProject,
  isSaving,
}: HeaderProps) => {
  if (!isOwner) {
    return (
      <div className="flex flex-row gap-4 items-center">
        <span className="text-xl font-semibold">{project.title}</span>
        <Badge className="text-xl font-medium" variant="secondary">
          {project.type}
        </Badge>
      </div>
    );
  }

  return (
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
          {visibility === ProjectVisibility.Public ? "Public" : "Private"}
        </Label>
        <Switch
          id="visibility-switch"
          checked={visibility === ProjectVisibility.Public}
          onCheckedChange={onVisibilityChange}
        />
      </div>
      <Button onClick={onSave} disabled={isSaving}>
        {isSaving ? (
          <Loader2 className="animate-spin w-4 h-4 mr-2" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        <span className="text-sm">{isSaving ? "Saving..." : "Save"}</span>
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
                Are you sure you want to delete this project? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDeleteProject}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};
export default Header;
