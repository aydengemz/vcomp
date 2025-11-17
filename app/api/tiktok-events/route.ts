import { NextRequest, NextResponse } from "next/server";

const TIKTOK_PIXEL_CODE = process.env.TIKTOK_PIXEL_ID;
const TIKTOK_ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN;

export async function POST(req: NextRequest) {
  if (!TIKTOK_PIXEL_CODE || !TIKTOK_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "TikTok server config missing (pixel or access token)" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();

    const {
      event,      // "ViewContent" | "AddToCart" | "Purchase" | "SubmitForm"
      event_id,
      properties,
      page_url,
      referrer,
      ttclid,
    } = body;

    if (!event || !properties) {
      return NextResponse.json(
        { error: "Missing required fields: event or properties" },
        { status: 400 }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip")?.trim() ||
      "";

    const userAgent = req.headers.get("user-agent") || "";

    const tikTokPayload = {
      pixel_code: TIKTOK_PIXEL_CODE,
      event,
      event_id: event_id || undefined,
      timestamp: new Date().toISOString(),
      context: {
        page: {
          url: page_url,
          referrer,
        },
        user: {
          ip,
          user_agent: userAgent,
          ttclid,
        },
      },
      properties,
    };

    const res = await fetch(
      "https://business-api.tiktok.com/open_api/v1.3/pixel/track/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Token": TIKTOK_ACCESS_TOKEN,
        },
        body: JSON.stringify(tikTokPayload),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok || (data && data.code && data.code !== 0)) {
      console.error("TikTok Events API error", {
        status: res.status,
        data,
      });
      return NextResponse.json(
        { error: "TikTok Events API error", details: data },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Error in /api/tiktok-events:", err);
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 }
    );
  }
}
