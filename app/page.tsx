// pages/index.tsx
"use client";

import { useCallback, useEffect } from "react";
import Head from "next/head";
import Script from "next/script";

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
  }
}

const TIKTOK_PIXEL_IDS = ["D4AP363C77U6M9K6S7TG"];

const BASE_DEST_URL =
  "https://trkfy.org/aff_c?offer_id=2977&aff_id=11848&source=";

const ALT_DEST_URL =
  "https://uplevelrewarded.com/aff_c?offer_id=2596&aff_id=11848&source=";

const generateEventId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const baseProps = {
  content_id: "apple-bonus-750",
  content_type: "product",
  value: 0.5,
  currency: "USD",
  contents: [{ content_id: "apple-bonus-750", quantity: 1 }],
};

export default function AppleRewardPage() {
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

  const getBaseDestUrl = (): string => {
    if (typeof window === "undefined") return BASE_DEST_URL;
    const url = window.location.href;
    if (/\?o=g(&|$)/i.test(url) || /&o=g(&|$)/i.test(url)) {
      return ALT_DEST_URL;
    }
    return BASE_DEST_URL;
  };

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

  // ViewContent on load
  useEffect(() => {
    const fireVC = () => {
      if (typeof window === "undefined") return;

      const eventId = generateEventId();

      if (window.ttq) {
        window.ttq.track("ViewContent", baseProps, { event_id: eventId });
      } else {
        setTimeout(fireVC, 50);
        return;
      }

      trackServerSideEvent("ViewContent", baseProps, eventId);
    };

    fireVC();
  }, [trackServerSideEvent]);

  // CTA click handler
  const handleCTA = useCallback(() => {
    if (typeof window === "undefined") return;

    const atcEventId = generateEventId();
    const submitEventId = generateEventId();
    const purchaseEventId = generateEventId();

    try {
      window.ttq?.track("AddToCart", baseProps, { event_id: atcEventId });
    } catch {}

    try {
      window.ttq?.track("SubmitForm", baseProps, { event_id: submitEventId });
    } catch {}

    try {
      window.ttq?.track("Purchase", baseProps, { event_id: purchaseEventId });
    } catch {}

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
        <title>Apple Gift Card - Get Your $750 Reward</title>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </Head>

      {/* TikTok Pixel loader */}
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

      {/* Geo Indicator */}
      <div className="geo-indicator">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
        <span>Region: USA</span>
      </div>

      {/* Header */}
      <header className="header">
        <div className="header-content">
          <a
            href="https://www.apple.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="apple-logo" viewBox="0 0 16 20" fill="currentColor">
              <path d="M13.1 6.5C12.9 6.7 11.8 7.4 11.8 9.1C11.8 11.1 13.2 11.8 13.3 11.8C13.3 11.9 13 12.9 12.3 14C11.7 14.9 11.1 15.8 10 15.8C9 15.8 8.6 15.2 7.5 15.2C6.4 15.2 5.9 15.8 5 15.8C4 15.8 3.4 14.9 2.7 13.9C1.9 12.7 1.2 10.8 1.2 9C1.2 6.6 2.7 5.3 4.3 5.3C5.3 5.3 6.2 6 6.8 6C7.4 6 8.4 5.3 9.6 5.3C10 5.3 11.5 5.3 12.5 6.5L13.1 6.5ZM9.6 3.4C10.1 2.8 10.5 2 10.4 1.2C9.7 1.2 8.8 1.7 8.3 2.3C7.8 2.8 7.4 3.6 7.5 4.4C8.3 4.5 9.1 4 9.6 3.4Z"></path>
            </svg>
          </a>

          <div className="header-icons">
            <a
              href="https://www.apple.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                className="header-icon"
                viewBox="0 0 18 18"
                fill="currentColor"
              >
                <path d="M17.5 16.4l-4.8-4.8c1-1.2 1.5-2.7 1.5-4.3 0-3.9-3.1-7-7-7s-7 3.1-7 7 3.1 7 7 7c1.6 0 3.1-.5 4.3-1.5l4.8 4.8c.2.2.4.3.6.3s.4-.1.6-.3c.3-.3.3-.8 0-1.2zM1.7 7.2c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5-2.5 5.5-5.5 5.5-5.5-2.5-5.5-5.5z"></path>
              </svg>
            </a>

            <a
              href="https://www.apple.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                className="header-icon"
                viewBox="0 0 18 18"
                fill="currentColor"
              >
                <path d="M13.5 5h-1c0-1.9-1.6-3.5-3.5-3.5S5.5 3.1 5.5 5h-1C3.7 5 3 5.7 3 6.5v8c0 .8.7 1.5 1.5 1.5h9c.8 0 1.5-.7 1.5-1.5v-8c0-.8-.7-1.5-1.5-1.5zM9 2.5c1.4 0 2.5 1.1 2.5 2.5h-5c0-1.4 1.1-2.5 2.5-2.5zm4.5 12c0 .3-.2.5-.5.5H5c-.3 0-.5-.2-.5-.5v-8c0-.3.2-.5.5-.5h.5v1.5c0 .3.2.5.5.5s.5-.2.5-.5V6h5v1.5c0 .3.2.5.5.5s.5-.2.5-.5V6h.5c.3 0 .5.2.5.5v8z"></path>
              </svg>
            </a>

            <a
              href="https://www.apple.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                className="header-icon"
                viewBox="0 0 18 18"
                fill="currentColor"
              >
                <path d="M2 4.5h14c.3 0 .5-.2.5-.5s-.2-.5-.5-.5H2c-.3 0-.5.2-.5.5s.2.5.5.5zm0 5h14c.3 0 .5-.2.5-.5s-.2-.5-.5-.5H2c-.3 0-.5.2-.5.5s.2.5.5.5zm0 5h14c.3 0 .5-.2.5-.5s-.2-.5-.5-.5H2c-.3 0-.5.2-.5.5s.2.5.5.5z"></path>
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Get Your $750
            <br />
            Apple Gift Card
          </h1>
          <p className="subtitle">Complete 3 simple steps to claim your reward</p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="steps-container">
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-icon-wrapper">
              <svg className="step-icon" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="28" fill="#F5F5F7"></circle>
                <path
                  d="M28 18C25.2 18 23 20.2 23 23C23 25.8 25.2 28 28 28C30.8 28 33 25.8 33 23C33 20.2 30.8 18 28 18ZM28 26C26.3 26 25 24.7 25 23C25 21.3 26.3 20 28 20C29.7 20 31 21.3 31 23C31 24.7 29.7 26 28 26ZM36 38V36C36 32.7 33.3 30 30 30H26C22.7 30 20 32.7 20 36V38H22V36C22 33.8 23.8 32 26 32H30C32.2 32 34 33.8 34 36V38H36Z"
                  fill="#0071E3"
                ></path>
              </svg>
            </div>
            <h3 className="step-title">
              Enter your <span className="highlight">basic info.</span>
            </h3>
            <p className="step-description">
              Quick registration with just your name and email address
            </p>
          </div>

          <div className="step-card">
            <div className="step-icon-wrapper">
              <svg className="step-icon" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="28" fill="#F5F5F7"></circle>
                <path
                  d="M34 20H22C20.9 20 20 20.9 20 22V34C20 35.1 20.9 36 22 36H34C35.1 36 36 35.1 36 34V22C36 20.9 35.1 20 34 20ZM34 34H22V22H34V34ZM24 26.5C24 26.2 24.2 26 24.5 26H31.5C31.8 26 32 26.2 32 26.5S31.8 27 31.5 27H24.5C24.2 27 24 26.8 24 26.5ZM24 29.5C24 29.2 24.2 29 24.5 29H31.5C31.8 29 32 29.2 32 29.5S31.8 30 31.5 30H24.5C24.2 30 24 29.8 24 29.5ZM24 32.5C24 32.2 24.2 32 24.5 32H28.5C28.8 32 29 32.2 29 32.5S28.8 33 28.5 33H24.5C24.2 33 24 32.8 24 32.5Z"
                  fill="#34C759"
                ></path>
              </svg>
            </div>
            <h3 className="step-title">
              Complete a <span className="highlight">quick survey.</span>
            </h3>
            <p className="step-description">
              Answer a few questions about your shopping preferences
            </p>
          </div>

          <div className="step-card">
            <div className="step-icon-wrapper">
              <svg className="step-icon" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="28" fill="#F5F5F7"></circle>
                <path
                  d="M35.5 24.5L26.5 33.5L20.5 27.5L22 26L26.5 30.5L34 23L35.5 24.5Z"
                  fill="#FF9500"
                ></path>
                <path
                  d="M28 18C22.5 18 18 22.5 18 28C18 33.5 22.5 38 28 38C33.5 38 38 33.5 38 28C38 22.5 33.5 18 28 18ZM28 36C23.6 36 20 32.4 20 28C20 23.6 23.6 20 28 20C32.4 20 36 23.6 36 28C36 32.4 32.4 36 28 36Z"
                  fill="#FF9500"
                ></path>
              </svg>
            </div>
            <h3 className="step-title">
              Select <span className="highlight">partner deals.</span>
            </h3>
            <p className="step-description">
              Choose from recommended offers to maximize your reward
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <button className="cta-button" onClick={handleCTA}>
            Claim Your $750 Reward
          </button>
          <p className="cta-helper-text">
            By continuing you accept our Terms &amp; Privacy.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <a
            href="https://www.apple.com/legal/"
            className="footer-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Use
          </a>
          <a
            href="https://www.apple.com/legal/privacy/"
            className="footer-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
          <a
            href="https://www.apple.com/"
            className="footer-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Apple.com
          </a>
        </div>
      </footer>
    </>
  );
}
