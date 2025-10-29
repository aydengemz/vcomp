"use client";

import { useCallback, useEffect } from "react";
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
  interface Window { ttq?: TTQ }
}

export default function AppleRewardPage() {
  // ——— config ———
  const BASE_DEST_URL =
    "https://t.afftrackr.com/?lnwk=5yuBgl2A4ZKvvjXwmlNTY1xDZUMy8IfgvQJDRoz7h5U%3d&s1=";

  const TIKTOK_PIXEL_IDS = ["D40E20JC77U8M91303PG"];

  // ——— helpers ———
  const makeEventId = (prefix: string) =>
    `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;

  /** Extract your custom source from the URL:
   *  - supports "?mySource&ttclid=..."  (bare token)
   *  - supports "?source=mySource&ttclid=..."
   *  - skips ttclid and empty keys
   */
  const extractSource = (): string => {
    const raw = window.location.search.replace(/^\?/, "");
    if (!raw) return "";

    const parts = raw.split("&").filter(Boolean);
    for (const part of parts) {
      // "key=value" or possibly just "token"
      const [k, v] = part.split("=");
      const key = (k ?? "").trim();

      // skip ttclid
      if (key.toLowerCase() === "ttclid") continue;

      // if there is a value, prefer it; otherwise use the token itself
      if (typeof v === "string" && v.length) return decodeURIComponent(v);
      if (key.length) return decodeURIComponent(key);
    }
    return "";
  };

  // ——— pixel events ———
  useEffect(() => {
    // Fire ViewContent reliably (retry until ttq exists)
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

  // ——— CTA: ATC then redirect with only your source ———
  const handleCTA = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const eventId = makeEventId("atc");
      window.ttq?.track(
        "AddToCart",
        {
          content_type: "product",
          content_id: "apple-gc-750",
          value: 0.5,
          currency: "USD",
        },
        { event_id: eventId }
      );
    } catch {}

    const source = extractSource();
    const destUrl = source
      ? `${BASE_DEST_URL}${encodeURIComponent(source)}`
      : BASE_DEST_URL;

    // small delay improves event delivery before navigation
    setTimeout(() => (window.location.href = destUrl), 400);
  }, [BASE_DEST_URL]);

  return (
    <>
      <Head>
        <title>Apple Reward</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </Head>

      {/* TikTok Pixel loader (supports 1 or multiple IDs) */}
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
  // Load all your pixel IDs:
  ${TIKTOK_PIXEL_IDS.map(id => `ttq.load('${id}');`).join("\n  ")}
  ttq.page();
}(window, document, 'ttq');
        `}
      </Script>

      <div className="container">
        {/* Logo */}
        <div className="logo-section">
          <Image src="/applelogo1.png" alt="Apple Logo" width={32} height={32} className="logo" />
        </div>

        {/* Main Content */}
        <main>
          <h1>
            Get Your $750
            <br />
            Apple Gift Card
          </h1>
          <p className="subtitle">Complete 3 simple steps to claim your reward</p>

          <div className="steps">
            <div className="step">
              <div className="icon-circle blue">
                <svg className="icon blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3>
                Enter your <span className="highlight">basic info.</span>
              </h3>
              <p>Quick registration with just your name and email address</p>
            </div>

            <div className="step">
              <div className="icon-circle green">
                <svg className="icon green" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3>
                Complete a <span className="highlight">quick survey.</span>
              </h3>
              <p>Answer a few questions about your shopping preferences</p>
            </div>

            <div className="step">
              <div className="icon-circle yellow">
                <svg className="icon yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3>
                Select <span className="highlight">partner deals.</span>
              </h3>
              <p>Choose from recommended offers to maximize your reward</p>
            </div>
          </div>

          <button className="cta-button" onClick={handleCTA}>
            Claim Your Apple Reward
          </button>

          <div className="footer-links">
            <a href="#">Terms of Use</a>
            <a href="#">Privacy Policy</a>
            <a href="https://apple.com" target="_blank" rel="noreferrer">Apple.com</a>
          </div>
        </main>
      </div>

      <style jsx>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background-color: #f9fafb;
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          -webkit-text-size-adjust: 100%;
          touch-action: manipulation;
        }
        .container { min-height: 100vh; }
        .logo-section { background-color: white; padding: 1rem 1.5rem; border-bottom: 1px solid #e5e7eb; }
        .logo { width: 32px; height: 32px; }

        main { padding: 2rem 1.5rem; max-width: 28rem; margin: 0 auto; }
        h1 { font-size: 1.875rem; font-weight: 600; color: #111827; text-align: center; margin-bottom: 0.5rem; line-height: 1.25; }
        .subtitle { font-size: 0.875rem; color: #4b5563; text-align: center; margin-bottom: 1.5rem; }

        .steps { margin-bottom: 2rem; }
        .step { display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 1.5rem; }

        .icon-circle { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 0.75rem; }
        .icon-circle.blue { background-color: #dbeafe; }
        .icon-circle.green { background-color: #d1fae5; }
        .icon-circle.yellow { background-color: #fef3c7; }

        .icon { width: 24px; height: 24px; }
        .icon.blue { color: #3b82f6; }
        .icon.green { color: #10b981; }
        .icon.yellow { color: #eab308; }

        .step h3 { font-size: 1rem; font-weight: 500; color: #111827; margin-bottom: 0.25rem; }
        .highlight { color: #3b82f6; }
        .step p { font-size: 0.75rem; color: #6b7280; }

        .cta-button {
          width: 100%; background-color: #3b82f6; color: white; font-weight: 500; padding: 1rem;
          border-radius: 0.5rem; border: none; cursor: pointer; transition: background-color 0.2s;
          font-size: 1rem; margin-bottom: 1.5rem; -webkit-appearance: none; -webkit-tap-highlight-color: transparent;
          touch-action: manipulation; user-select: none; -webkit-user-select: none;
        }
        .cta-button:hover { background-color: #2563eb; }
        .cta-button:active { background-color: #1e40af; transform: scale(0.98); }

        .footer-links { display: flex; justify-content: center; gap: 1.5rem; font-size: 0.75rem; color: #6b7280; }
        .footer-links a { color: #6b7280; text-decoration: none; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
        .footer-links a:hover { color: #374151; }
        .footer-links a:active { color: #111827; }

        @supports (padding: max(0px)) {
          main { padding-bottom: max(2rem, env(safe-area-inset-bottom)); }
        }
      `}</style>
    </>
  );
}
