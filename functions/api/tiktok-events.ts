// functions/api/tiktok-events.ts

export interface Env {
  TIKTOK_PIXEL_ID: string;
  TIKTOK_ACCESS_TOKEN: string;
  // TIKTOK_TEST_EVENT_CODE?: string; // ❌ not needed for prod
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;

  const pixelCode = env.TIKTOK_PIXEL_ID;
  const accessToken = env.TIKTOK_ACCESS_TOKEN;

  if (!pixelCode || !accessToken) {
    return new Response(JSON.stringify({ error: "Missing TikTok secrets" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
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
    event_id: event_id || undefined, // you’re fine not using dedupe
    timestamp: new Date().toISOString(),
    context: {
      page: {
        url: page_url,
        referrer,
      },
      user: {
        ip,
        user_agent: userAgent,
        ttp, // TikTok’s first-party cookie if you pass it
      },
      // TikTok’s recommended place for ttclid
      ad: ttclid
        ? {
            callback: ttclid,
          }
        : undefined,
    },
    properties,
  };

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
    // ignore parse error
  }

  const ok = tikTokRes.ok && tikTokData && tikTokData.code === 0;

  if (!ok) {
    return new Response(
      JSON.stringify({
        success: false,
        status: tikTokRes.status,
        tikTokData,
        sentPayload: tikTokPayload,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      status: tikTokRes.status,
      tikTokData,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};

export const onRequestGet = async () =>
  new Response("TikTok events endpoint OK", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
