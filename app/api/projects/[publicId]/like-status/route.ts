import { NextRequest, NextResponse } from "next/server";
import { checkProjectLike } from "@/features/user/queries/interactions.queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await params;

  const result = await checkProjectLike({ publicId });

  if (!result.success) {
    return NextResponse.json(result.error, { status: result.code });
  }

  return NextResponse.json(result.response, { status: 200 });
}
