import { NextRequest, NextResponse } from "next/server";
import { GetProjectDataInput } from "@/features/project/lib/validations";
import { ProjectData } from "@/features/project/lib/project.types";
import { getProjectDataByPublicId } from "@/features/project/queries/project.queries";

export async function GET(
  request: NextRequest,
  { params }: { params: { publicId: string } },
) {
  const { publicId } = params;

  const searchParams = request.nextUrl.searchParams;
  const includeFiles = searchParams.get("includeFiles") === "true";
  const includeComments = searchParams.get("includeComments") === "true";

  const input: GetProjectDataInput = {
    publicId,
    includeFiles,
    includeComments,
  };

  const result: ActionResult<ProjectData> =
    await getProjectDataByPublicId(input);

  if (!result.success) {
    return NextResponse.json(result.error, { status: result.code });
  }

  return NextResponse.json(result.response, { status: 200 });
}
