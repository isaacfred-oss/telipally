import { NextResponse } from "next/server";

import { getChannelById } from "@/lib/iptv/store";

export const dynamic = "force-dynamic";

const CACHE_HEADERS = { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" };

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const channel = getChannelById(id);
  if (!channel) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404, headers: CACHE_HEADERS });
  }
  return NextResponse.json(channel, { headers: CACHE_HEADERS });
}
