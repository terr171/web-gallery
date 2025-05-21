import { NextRequest, NextResponse } from "next/server";
import { getTotalNumberOfProjects } from "@/features/admin/queries/admin.queries";

export async function GET(_request: NextRequest) {
  try {
    const queryTotalProjects = await getTotalNumberOfProjects();

    if (!queryTotalProjects.success) {
      return NextResponse.json(queryTotalProjects.error, {
        status: queryTotalProjects.code,
      });
    }

    return NextResponse.json(queryTotalProjects.response, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json("An unexpected error occurred on the server.", {
      status: 500,
    });
  }
}
