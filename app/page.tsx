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
  interface Window {
    ttq?: TTQ;
    particlesJS?: any;
  }
}

const TIKTOK_PIXEL_IDS = [
  "D40E2VRC77UD89P2K3TG",
  "D40OCMRC77U53GC03IJ0",
  "D43SLAJC77UER98133U0",
];

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

export default function AppleRewardPage() {
  // ——— config ———
  const BASE_DEST_URL =
    "https://t.afftrackr.com/?lnwk=5yuBgl2A4ZKvvjXwmlNTY1xDZUMy8IfgvQJDRoz7h5U%3d&s1=";

  // ——— helpers ———
  const makeEventId = (prefix: string) =>
    `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;

  const extractSource = (): string => {
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
        () =>
          setNotifications((prev) => prev.filter((n) => n.id !== id)),
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

  // ——— pixel events ———
  useEffect(() => {
    const fireVC = () => {
      if (window.ttq) {
        window.ttq.track("ViewContent", {
          content_type: "product",
          content_id: "apple-lander",
          currency: "USD",
          value: 0,
        });
      } else {
        setTimeout(fireVC, 50);
      }
    };
    fireVC();
  }, []);

  // ——— CTA: ATC + SubmitForm then redirect ———
  const handleCTA = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const atcEventId = makeEventId("atc");
      window.ttq?.track(
        "AddToCart",
        {
          content_type: "product",
          content_id: "apple-gc-750",
          value: 0,
          currency: "USD",
        },
        { event_id: atcEventId }
      );

      const formEventId = makeEventId("submitform");
      window.ttq?.track(
        "SubmitForm",
        {
          form_name: "apple_reward_cta",
          content_category: "lead",
        },
        { event_id: formEventId }
      );
    } catch (err) {
      console.warn("CTA tracking error:", err);
    }

    const source = extractSource();
    const destUrl = source
      ? `${BASE_DEST_URL}${encodeURIComponent(source)}`
      : BASE_DEST_URL;

    setTimeout(() => {
      window.location.href = destUrl;
    }, 400);
  }, [BASE_DEST_URL]);

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

      {/* TikTok Pixel loader (multi-ID) */}
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

      {/* particles.js script – put particles.min.js in /public/js */}
      <Script src="/js/particles.min.js" strategy="afterInteractive" />
      <Script id="particles-init" strategy="afterInteractive">
        {`
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
}
        `}
      </Script>

      {/* Background particles layer */}
      <div id="particles-js" className="particles-bg" />

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
              src="/applogo1.jpg" // ensure this exists in /public
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
