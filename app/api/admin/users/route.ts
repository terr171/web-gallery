import { NextRequest, NextResponse } from "next/server";
import { getUsersSchemaForAdmin } from "@/features/admin/lib/validations";
import { getUsers } from "@/features/admin/queries/admin.queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const queryParamsObject = Object.fromEntries(searchParams.entries());
    const validationResult =
      getUsersSchemaForAdmin.safeParse(queryParamsObject);

    if (!validationResult.success) {
      return NextResponse.json("Invalid query parameters", { status: 400 });
    }
    const userSearchInput = validationResult.data;
    const result = await getUsers(userSearchInput);
    if (!result.success) {
      return NextResponse.json(result.error, { status: result.code });
    }
    return NextResponse.json(result.response, { status: 200 });
  } catch {
    return NextResponse.json("Unknown Server Error Occurred", { status: 500 });
  }
}
