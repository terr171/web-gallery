import { NextRequest, NextResponse } from "next/server";
import { checkUserFollow } from "@/features/user/queries/interactions.queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;

  const result = await checkUserFollow({ username });

  if (!result.success) {
    return NextResponse.json(result.error, { status: result.code });
  }

  return NextResponse.json(result.response, { status: 200 });
}
