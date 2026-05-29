import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Verify database connection is alive
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error: any) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      { status: "error", detail: error.message || String(error) },
      { status: 503 }
    );
  }
}
