import UsersTable from "@/features/admin/components/UsersTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectsTable from "@/features/admin/components/ProjectsTable";

export function AdminTable() {
  return (
    <>
      <Tabs defaultValue="users" className="max-md:px-2">
        <TabsList className="grid w-full grid-cols-2 w-[400px] max-md:w-auto">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
        <TabsContent
          value="users"
          forceMount
          className="data-[state=inactive]:hidden"
        >
          <UsersTable />
        </TabsContent>
        <TabsContent
          value="projects"
          forceMount
          className="data-[state=inactive]:hidden"
        >
          <ProjectsTable />
        </TabsContent>
      </Tabs>
    </>
  );
}
