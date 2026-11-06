import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { REVALIDATE_SECRET } from "@/lib/config";

// ON-DEMAND REVALIDATION. Time-based refresh (revalidate = 60) is not enough when an editor fixes a typo and wants
// it live NOW. The backend (or a CMS webhook) calls this endpoint after a change, naming the tag that changed, and
// Next marks every cached page/fetch that used the tag as stale. The next visitor gets the old copy instantly while a
// fresh one is built in the background ("stale-while-revalidate"), then everyone gets the new one.
//
//   POST /api/revalidate   header: x-revalidate-secret: <secret>   body: { "tag": "post-p3" }

const ALLOWED_TAG = /^(posts|post-p\d+)$/; // only tags we actually use: never revalidate arbitrary names

function isAuthorised(received: string | null): boolean {
  if (!REVALIDATE_SECRET || !received) return false; // fail closed: no secret configured means nobody is allowed
  const a = Buffer.from(received);
  const b = Buffer.from(REVALIDATE_SECRET);
  return a.length === b.length && timingSafeEqual(a, b); // constant-time compare: no timing side channel
}

export async function POST(request: Request) {
  if (!isAuthorised(request.headers.get("x-revalidate-secret"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as { tag?: unknown } | null;
  if (typeof body?.tag !== "string" || !ALLOWED_TAG.test(body.tag)) {
    return NextResponse.json({ error: "invalid_tag" }, { status: 400 });
  }
  revalidateTag(body.tag, "max"); // Next 16: the second argument picks the cache-life profile (stale-while-revalidate)
  return NextResponse.json({ revalidated: true, tag: body.tag });
}
