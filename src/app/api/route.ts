import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "TeliPally",
    time: new Date().toISOString(),
  });
}
