import { NextRequest, NextResponse } from "next/server";
import { getTotalNumberOfUsers } from "@/features/admin/queries/admin.queries";

export async function GET(_request: NextRequest) {
  const queryTotalUsers = await getTotalNumberOfUsers();

  if (!queryTotalUsers.success) {
    return NextResponse.json(queryTotalUsers.error, {
      status: queryTotalUsers.code,
    });
  }

  return NextResponse.json(queryTotalUsers.response, { status: 200 });
}
