
export interface Env {
    TIKTOK_PIXEL_ID: string;
    TIKTOK_ACCESS_TOKEN: string;
  }
  
  export const onRequestPost = async (context: {
    request: Request;
    env: Env;
  }) => {
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
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  
    const {
      event,
      event_id,
      properties,
      page_url,
      referrer,
      ttclid,
    } = body;
  
    if (!event || !properties) {
      return new Response(
        JSON.stringify({ error: "Missing event or properties" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  
    // Real IP from Cloudflare
    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for") ||
      "";
  
    const payload = {
      pixel_code: pixelCode,
      event,
      event_id,
      timestamp: new Date().toISOString(), // REQUIRED FORMAT
      context: {
        page: {
          url: page_url,
          referrer,
        },
        user: {
          ip,
          user_agent: request.headers.get("user-agent") || "",
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
          "Access-Token": accessToken,
        },
        body: JSON.stringify(payload),
      }
    );
  
    const data = await res.json().catch(() => ({}));
  
    if (data.code !== 0) {
      console.error("TikTok Events API error:", data);
      return new Response(JSON.stringify(data), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  