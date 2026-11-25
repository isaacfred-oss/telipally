import { NextResponse } from "next/server";

import { getCountriesWithCounts } from "@/lib/iptv/store";

export const dynamic = "force-dynamic";

const CACHE_HEADERS = { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" };

export async function GET() {
  return NextResponse.json({ items: getCountriesWithCounts() }, { headers: CACHE_HEADERS });
}
