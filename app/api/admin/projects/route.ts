import { NextRequest, NextResponse } from "next/server";
import { getProjectsSchemaForAdmin } from "@/features/admin/lib/validations";
import { getProjects } from "@/features/admin/queries/admin.queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const queryParamsObject = Object.fromEntries(searchParams.entries());
    const validationResult =
      getProjectsSchemaForAdmin.safeParse(queryParamsObject);

    if (!validationResult.success) {
      return NextResponse.json("Invalid query parameters", { status: 400 });
    }
    const projectSearchInput = validationResult.data;
    const result = await getProjects(projectSearchInput);
    if (!result.success) {
      return NextResponse.json(result.error, { status: result.code });
    }
    return NextResponse.json(result.response, { status: 200 });
  } catch {
    return NextResponse.json("Unknown Server Error Occurred", { status: 500 });
  }
}
