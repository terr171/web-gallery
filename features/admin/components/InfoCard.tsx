import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Eye, MessageCircleMore, Users } from "lucide-react";

import {
  getTotalNumberOfComments,
  getTotalNumberOfProjects,
  getTotalNumberOfUsers,
  getTotalNumberOfViews,
} from "@/features/admin/queries/admin.queries";
const InfoCard = async () => {
  const [
    totalUsersResult,
    totalProjectsResult,
    totalCommentsResult,
    totalViewsResult,
  ] = await Promise.all([
    getTotalNumberOfUsers(),
    getTotalNumberOfProjects(),
    getTotalNumberOfComments(),
    getTotalNumberOfViews(),
  ]);

  const stats = {
    totalUsers: totalUsersResult.success ? totalUsersResult.response : -1,
    totalProjects: totalProjectsResult.success
      ? totalProjectsResult.response
      : -1,
    totalComments: totalCommentsResult.success
      ? totalCommentsResult.response
      : -1,
    totalViews: totalViewsResult.success ? totalViewsResult.response : -1,
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-02">
          <CardTitle className="text-2xl font-medium">
            {new Intl.NumberFormat("en-US", {
              notation: "compact",
              compactDisplay: "short",
              maximumFractionDigits: 1,
            }).format(stats.totalUsers)}
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground pt-1">
            Total registered accounts
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-02">
          <CardTitle className="text-2xl font-medium">
            {new Intl.NumberFormat("en-US", {
              notation: "compact",
              compactDisplay: "short",
              maximumFractionDigits: 1,
            }).format(stats.totalProjects)}
          </CardTitle>
          <Code className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground pt-1">
            Total created projects
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-02">
          <CardTitle className="text-2xl font-medium">
            {new Intl.NumberFormat("en-US", {
              notation: "compact",
              compactDisplay: "short",
              maximumFractionDigits: 1,
            }).format(stats.totalComments)}
          </CardTitle>
          <MessageCircleMore className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground pt-1">Total comments</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-02">
          <CardTitle className="text-2xl font-medium">
            {new Intl.NumberFormat("en-US", {
              notation: "compact",
              compactDisplay: "short",
              maximumFractionDigits: 1,
            }).format(stats.totalViews)}
          </CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground pt-1">
            Total project views
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
export default InfoCard;
