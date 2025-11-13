// functions/api/tiktok-events.ts

export interface Env {
    TIKTOK_PIXEL_ID: string;
    TIKTOK_ACCESS_TOKEN: string;
  }
  
  export const onRequestPost = async (context: { request: Request; env: Env }) => {
    const { request, env } = context;
  
    const pixelCode = env.TIKTOK_PIXEL_ID;
    const accessToken = env.TIKTOK_ACCESS_TOKEN;
  
    if (!pixelCode || !accessToken) {
      return new Response(
        JSON.stringify({ error: "Missing TikTok secrets" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  
    let body: any;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  
    const { event, event_id, properties, page_url, referrer, ttclid, ttp } = body;
  
    if (!event || !properties) {
      return new Response(
        JSON.stringify({ error: "Missing event or properties" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  
    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for") ||
      "";
  
    const userAgent = request.headers.get("user-agent") || "";
  
    const tikTokPayload = {
      pixel_code: pixelCode,
      event,
      // you said you DON'T want dedupe → event_id is optional/ignored
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
          ttp,
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
          "Access-Token": accessToken,
        },
        body: JSON.stringify(tikTokPayload),
      }
    );
  
    const data = await res.json().catch(() => ({}));
  
    if (!res.ok || (data && data.code && data.code !== 0)) {
      console.error("TikTok Events API error:", { status: res.status, data });
      return new Response(JSON.stringify({ error: "TikTok API error", details: data }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  
  // Optional: handle GET so /api/tiktok-events works in the browser too
  export const onRequestGet = async () =>
    new Response("TikTok events endpoint OK", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  