import { NextRequest, NextResponse } from "next/server";
import { getProjectsSchema } from "@/features/project/lib/validations";
import { getProjects } from "@/features/project/queries/project.queries";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const queryParamsObject = Object.fromEntries(searchParams.entries());
  const validationResult = getProjectsSchema.safeParse(queryParamsObject);

  if (!validationResult.success) {
    return NextResponse.json(
      { message: "Invalid query parameters" },
      { status: 400 },
    );
  }

  const projectsInput = validationResult.data;
  const result = await getProjects(projectsInput);
  if (!result.success) {
    return NextResponse.json(result.error, { status: result.code || 500 });
  }

  return NextResponse.json(result.response, { status: 200 });
}
