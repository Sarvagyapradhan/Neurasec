import { NextRequest, NextResponse } from "next/server";

// Simple placeholder that won't trigger type errors
export async function DELETE(request: NextRequest) {
      return NextResponse.json(
    { message: "This is a temporary placeholder" },
    { status: 501 }
    );
} 