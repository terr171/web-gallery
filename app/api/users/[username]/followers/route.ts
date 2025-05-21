import { NextRequest, NextResponse } from "next/server";
import { getFollowsSchema } from "@/features/user/lib/validations";
import { getFollowers } from "@/features/user/queries/user.queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const { searchParams } = request.nextUrl;

  const queryParamsObject = Object.fromEntries(searchParams.entries());
  const dataToValidate = {
    ...queryParamsObject,
    username: username,
  };
  const validationResult = getFollowsSchema.safeParse(dataToValidate);

  if (!validationResult.success) {
    return NextResponse.json("Invalid query parameters", { status: 400 });
  }

  const getFollowersInput = validationResult.data;
  const result = await getFollowers(getFollowersInput);

  if (!result.success) {
    return NextResponse.json(result.error, { status: result.code });
  }

  return NextResponse.json(result.response, { status: 200 });
}
