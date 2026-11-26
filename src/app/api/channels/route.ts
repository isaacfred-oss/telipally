import { NextRequest, NextResponse } from "next/server";

import { queryChannels } from "@/lib/iptv/store";

export const dynamic = "force-dynamic";

const CACHE_HEADERS = { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" };

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const sortParam = sp.get("sort");
  const sort = sortParam === "name" || sortParam === "quality" ? sortParam : "default";

  const result = queryChannels({
    q: sp.get("q") ?? undefined,
    country: sp.get("country") ?? undefined,
    category: sp.get("category") ?? undefined,
    language: sp.get("lang") ?? undefined,
    page: Number(sp.get("page") ?? "1") || 1,
    pageSize: Number(sp.get("pageSize") ?? "60") || 60,
    sort,
  });

  return NextResponse.json(result, { headers: CACHE_HEADERS });
}
