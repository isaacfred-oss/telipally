import { NextResponse } from "next/server";

import { getMeta } from "@/lib/iptv/store";

export const dynamic = "force-dynamic";

const CACHE_HEADERS = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" };

export async function GET() {
  return NextResponse.json(getMeta(), { headers: CACHE_HEADERS });
}
