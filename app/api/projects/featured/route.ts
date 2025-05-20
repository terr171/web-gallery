import { getFeaturedProjects } from "@/features/project/queries/project.queries";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await getFeaturedProjects();

  if (!result.success) {
    return NextResponse.json(result.error, { status: result.code || 500 });
  }
  return NextResponse.json(result.response);
}
