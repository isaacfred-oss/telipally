import { NextRequest, NextResponse } from "next/server";

import { getCountriesWithCounts } from "@/lib/iptv/store";

export const dynamic = "force-dynamic";

const CACHE_HEADERS = { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" };

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") ?? undefined;
  return NextResponse.json({ items: getCountriesWithCounts(lang) }, { headers: CACHE_HEADERS });
}
