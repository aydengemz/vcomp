"use client";

import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import Script from "next/script";
import Image from "next/image";

declare global {
  type TTQMethod = (...args: unknown[]) => void;
  interface TTQ {
    track: (
      eventName: string,
      params?: Record<string, unknown>,
      options?: { event_id?: string }
    ) => void;
    page: TTQMethod;
    identify?: TTQMethod;
    instances?: TTQMethod;
    debug?: TTQMethod;
    on?: TTQMethod;
    off?: TTQMethod;
    once?: TTQMethod;
    ready?: TTQMethod;
    alias?: TTQMethod;
    group?: TTQMethod;
    enableCookie?: TTQMethod;
    disableCookie?: TTQMethod;
    holdConsent?: TTQMethod;
    revokeConsent?: TTQMethod;
    grantConsent?: TTQMethod;
  }

  interface ParticlesJSConfig {
    particles?: {
      number?: { value: number; density?: { enable: boolean; value_area: number } };
      color?: { value: string };
      shape?: { type: string };
      opacity?: { value: number };
      size?: { value: number; random?: boolean };
      line_linked?: {
        enable: boolean;
        distance: number;
        color: string;
        opacity: number;
        width: number;
      };
      move?: { enable: boolean; speed: number };
    };
    interactivity?: {
      events?: {
        onhover?: { enable: boolean; mode: string };
        onclick?: { enable: boolean; mode: string };
        resize?: boolean;
      };
    };
    retina_detect?: boolean;
  }

  interface Window {
    ttq?: TTQ;
    particlesJS?: (elementId: string, config: ParticlesJSConfig) => void;
  }
}

const TIKTOK_PIXEL_IDS = ["D4AP363C77U6M9K6S7TG"];

const NAMES = [
  "John D.",
  "Sarah M.",
  "David L.",
  "Emma W.",
  "Michael R.",
  "Jessica K.",
  "Chris P.",
  "Amanda S.",
  "Ryan L.",
  "Taylor G.",
];

// Old/Default affiliate base
const BASE_DEST_URL =
  "https://trkfy.org/aff_c?offer_id=2977&aff_id=11848&source=";

// New affiliate base if "?o=g" present in URL
const ALT_DEST_URL =
  "https://uplevelrewarded.com/aff_c?offer_id=2596&aff_id=11848&source=";

// simple client-side event_id helper
const generateEventId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const baseProps = {
  content_id: "apple-bonus-1000",
  content_type: "product",
  value: 0.5,
  currency: "USD",
  contents: [{ content_id: "apple-bonus-1000", quantity: 1 }],
};

export default function AppleRewardPage() {
  // ——— helpers ———
  const extractSource = (): string => {
    if (typeof window === "undefined") return "";
    const raw = window.location.search.replace(/^\?/, "");
    if (!raw) return "";

    const parts = raw.split("&").filter(Boolean);
    for (const part of parts) {
      const [k, v] = part.split("=");
      const key = (k ?? "").trim();

      if (key.toLowerCase() === "ttclid") continue;

      if (typeof v === "string" && v.length) return decodeURIComponent(v);
      if (key.length) return decodeURIComponent(key);
    }
    return "";
  };

  const getTtclid = (): string => {
    if (typeof window === "undefined") return "";
    try {
      const url = new URL(window.location.href);
      return url.searchParams.get("ttclid") || "";
    } catch {
      return "";
    }
  };

  // ——— helper to choose dest url based on "?o=g" (case-insensitive) ———
  const getBaseDestUrl = (): string => {
    if (typeof window === "undefined") return BASE_DEST_URL;
    // Look for ?o=g (as param) in the url string
    const url = window.location.href;
    // checks for ?o=g or &o=g; not case-sensitive
    if (/\?o=g(&|$)/i.test(url) || /&o=g(&|$)/i.test(url)) {
      return ALT_DEST_URL;
    }
    return BASE_DEST_URL;
  };

  // ——— state for “New Order” notifications ———
  const [notifications, setNotifications] = useState<
    { id: string; name: string }[]
  >([]);

  useEffect(() => {
    const createNotification = () => {
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const id = `${name}-${Date.now()}`;
      setNotifications((prev) => [...prev, { id, name }]);
      setTimeout(
        () => setNotifications((prev) => prev.filter((n) => n.id !== id)),
        5000
      );
    };

    const first = setTimeout(createNotification, 2000);
    const interval = setInterval(
      createNotification,
      Math.random() * 4000 + 8000
    );

    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, []);

  // ——— server-side tracking helper (calls Next.js API route) ———
  const trackServerSideEvent = useCallback(
    async (
      eventType: "ViewContent" | "AddToCart" | "Purchase" | "SubmitForm",
      properties: Record<string, unknown>,
      eventId?: string
    ) => {
      if (typeof window === "undefined") return;

      const pageUrl = window.location.href;
      const referrer = document.referrer || "";
      const ttclid = getTtclid();

      try {
        await fetch("/api/tiktok-events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: eventType,
            event_id: eventId,
            properties,
            page_url: pageUrl,
            referrer,
            ttclid,
          }),
          keepalive: true,
        });
      } catch (err) {
        console.warn("Server-side TikTok tracking error:", err);
      }
    },
    []
  );

  // ——— ViewContent on load (browser + server, like Playful but with server copy) ———
  useEffect(() => {
    const fireVC = () => {
      if (typeof window === "undefined") return;

      const eventId = generateEventId();

      // browser-side ViewContent
      if (window.ttq) {
        window.ttq.track("ViewContent", baseProps, { event_id: eventId });
      } else {
        // retry until ttq exists
        setTimeout(fireVC, 50);
        return;
      }

      // server-side ViewContent
      trackServerSideEvent("ViewContent", baseProps, eventId);
    };

    fireVC();
  }, [trackServerSideEvent]);

  // ——— CTA: AddToCart + SubmitForm + Purchase (browser + server) ———
  const handleCTA = useCallback(() => {
    if (typeof window === "undefined") return;

    const atcEventId = generateEventId();
    const submitEventId = generateEventId();
    const purchaseEventId = generateEventId();

    // 🔹 Browser-side events (same pattern as Playful lander)
    try {
      window.ttq?.track("AddToCart", baseProps, { event_id: atcEventId });
    } catch {
      /* ignore */
    }

    try {
      window.ttq?.track("SubmitForm", baseProps, { event_id: submitEventId });
    } catch {
      /* ignore */
    }

    try {
      window.ttq?.track("Purchase", baseProps, { event_id: purchaseEventId });
    } catch {
      /* ignore */
    }

    // 🔹 Server-side copies using the SAME event_ids (for dedupe)
    const trackingPromise = Promise.all([
      trackServerSideEvent("AddToCart", baseProps, atcEventId),
      trackServerSideEvent("SubmitForm", baseProps, submitEventId),
      trackServerSideEvent("Purchase", baseProps, purchaseEventId),
    ]);

    const source = extractSource();
    const baseDestUrl = getBaseDestUrl();
    const destUrl = source
      ? `${baseDestUrl}${encodeURIComponent(source)}`
      : baseDestUrl;

    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 1200));

    Promise.race([trackingPromise, timeoutPromise]).finally(() => {
      window.location.href = destUrl;
    });
  }, [trackServerSideEvent]);

  return (
    <>
      <Head>
        <title>Apple Pay</title>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </Head>

      {/* TikTok Pixel loader (multi-ID ready) */}
      <Script id="ttq-init" strategy="afterInteractive">
        {`
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
  ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
  ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat([].slice.call(arguments,0)))}};
  for (var i=0;i<ttq.methods.length;i++) ttq.setAndDefer(ttq, ttq.methods[i]);
  ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++) ttq.setAndDefer(e,ttq.methods[n]); return e};
  ttq.load=function(e,n){
    var r="https://analytics.tiktok.com/i18n/pixel/events.js";
    ttq._i=ttq._i||{}, ttq._i[e]=[], ttq._i[e]._u=r, ttq._t=ttq._t||{}, ttq._t[e]=+new Date, ttq._o=ttq._o||{}, ttq._o[e]=n||{};
    n=d.createElement("script"); n.type="text/javascript"; n.async=!0; n.src=r+"?sdkid="+e+"&lib="+t;
    var s=d.getElementsByTagName("script")[0]; s.parentNode.insertBefore(n,s);
  };

  ${TIKTOK_PIXEL_IDS.map((id) => `ttq.load('${id}');`).join("\n  ")}
  ttq.page();
}(window, document, 'ttq');
        `}
      </Script>

      <Script src="/js/particles.min.js" strategy="afterInteractive" />

<Script id="particles-init" strategy="afterInteractive">
  {`
(function initParticles() {
  function start() {
    if (window.particlesJS) {
      window.particlesJS('particles-js', {
        particles: {
          number: { value: 80, density: { enable: true, value_area: 800 } },
          color: { value: '#1d1d1f' },
          shape: { type: 'circle' },
          opacity: { value: 0.5 },
          size: { value: 3, random: true },
          line_linked: {
            enable: true,
            distance: 150,
            color: '#1d1d1f',
            opacity: 0.4,
            width: 1
          },
          move: { enable: true, speed: 6 }
        },
        interactivity: {
          events: {
            onhover: { enable: true, mode: 'repulse' },
            onclick: { enable: true, mode: 'push' },
            resize: true
          }
        },
        retina_detect: true
      });
    } else {
      // Try again until the script is ready
      setTimeout(start, 50);
    }
  }
  start();
})();
  `}
</Script>


      {/* Background particles layer */}
      <div id="particles-js" className="particles-bg"/>

      {/* Notifications */}
      {notifications.map((n) => (
        <div key={n.id} className="notification show">
          <div className="notification-icon">📱</div>
          <div>
            <b>New Order</b>
            <div>{n.name} claimed $750!</div>
          </div>
        </div>
      ))}

      {/* Main card */}
      <div className="page-container">
        <div className="reward-card">
          <div className="app-logo-container">
            <Image
              src="/applogo1.jpg"
              alt="Apple Logo"
              width={130}
              height={130}
              className="app-logo"
            />
            <div className="cash-text">APPLE BONUS</div>
          </div>

          <div id="amount" className="amount">
            $1000
          </div>
          <div className="amount-subtext">deposited to you</div>

          <div className="instructions-container">
            <div className="instruction-item">
              <span className="number">1</span>
              <span>Click the Button Below</span>
            </div>
            <div className="instruction-item">
              <span className="number">2</span>
              <span>Enter Details, Take a Quiz</span>
            </div>
            <div className="instruction-item">
              <span className="number">3</span>
              <span>Complete Recommended Deals</span>
            </div>
            <div className="instruction-item">
              <span className="number">4</span>
              <span>Claim Reward &amp; Repeat</span>
            </div>
          </div>

          <button className="claim-button" onClick={handleCTA}>
            Get Yours →
          </button>

          <div className="tiny-note">
            By continuing you accept our Terms &amp; Privacy.
          </div>
        </div>
      </div>
    </>
  );
}
