// functions/api/tiktok-events.ts

export interface Env {
    TIKTOK_PIXEL_ID: string;
    TIKTOK_ACCESS_TOKEN: string;
    // optional while debugging
    TIKTOK_TEST_EVENT_CODE?: string;
  }
  
  export const onRequestPost = async (context: { request: Request; env: Env }) => {
    const { request, env } = context;
  
    const pixelCode = env.TIKTOK_PIXEL_ID;
    const accessToken = env.TIKTOK_ACCESS_TOKEN;
    const testEventCode = env.TIKTOK_TEST_EVENT_CODE;
  
    if (!pixelCode || !accessToken) {
      return new Response(
        JSON.stringify({ error: "Missing TikTok secrets" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
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
        JSON.stringify({ error: "Missing event or properties", body }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  
    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for") ||
      "";
  
    const userAgent = request.headers.get("user-agent") || "";
  
    const tikTokPayload: any = {
      pixel_code: pixelCode,
      event,
      // you said you *don’t* want dedupe, so this is optional
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
  
    // Optional: if you set TIKTOK_TEST_EVENT_CODE, events show in Test Events
    if (testEventCode) {
      tikTokPayload.test_event_code = testEventCode;
    }
  
    const tikTokRes = await fetch(
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
  
    let tikTokData: any = null;
    try {
      tikTokData = await tikTokRes.json();
    } catch {
      // no-op
    }
  
    const ok = tikTokRes.ok && tikTokData && tikTokData.code === 0;
  
    if (!ok) {
      // This is what you care about when debugging
      return new Response(
        JSON.stringify({
          success: false,
          status: tikTokRes.status,
          tikTokData,
          sentPayload: tikTokPayload,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  
    return new Response(
      JSON.stringify({
        success: true,
        status: tikTokRes.status,
        tikTokData,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  };
  
  // Keep GET for quick browser check
  export const onRequestGet = async () =>
    new Response("TikTok events endpoint OK", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  