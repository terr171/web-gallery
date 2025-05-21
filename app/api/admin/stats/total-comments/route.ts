import { NextRequest, NextResponse } from "next/server";
import { getTotalNumberOfComments } from "@/features/admin/queries/admin.queries";

export async function GET(_request: NextRequest) {
  try {
    const queryTotalComments = await getTotalNumberOfComments();

    if (!queryTotalComments.success) {
      return NextResponse.json(queryTotalComments.error, {
        status: queryTotalComments.code,
      });
    }

    return NextResponse.json(queryTotalComments.response, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json("An unexpected error occurred on the server.", {
      status: 500,
    });
  }
}
