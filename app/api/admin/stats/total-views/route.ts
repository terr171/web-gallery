import { NextRequest, NextResponse } from "next/server";
import { getTotalNumberOfViews } from "@/features/admin/queries/admin.queries";

export async function GET(_request: NextRequest) {
  try {
    const queryTotalViews = await getTotalNumberOfViews();

    if (!queryTotalViews.success) {
      return NextResponse.json(queryTotalViews.error, {
        status: queryTotalViews.code,
      });
    }

    return NextResponse.json(queryTotalViews.response, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json("An unexpected error occurred on the server.", {
      status: 500,
    });
  }
}
