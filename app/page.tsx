"use client";

import Image from "next/image";
import "./globals.css";

export default function Home() {
  return (
    <div className="minimal-container">
      <div className="minimal-card">
        <div className="minimal-logo-container">
          <Image
            className="minimal-logo"
            src="/vlogo.png"
            alt="Brand logo"
            width={60}
            height={60}
            priority
          />
        </div>
        <h1 className="minimal-title">Claim Your Reward</h1>
        <div className="minimal-instructions">
          <ol>
            <li>Tap "Claim Now!" Button Below</li>
            <li>Enter Your Basic Information</li>
            <li>Complete 2-5 Partner Offers</li>
            <li>Receive Your Balance & Repeat</li>
          </ol>
        </div>
        <button
          className="minimal-claim-button"
          onClick={() => {
            window.location.href =
              "https://glstrck.com/aff_c?offer_id=1615&aff_id=11848&source=whwhw";
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
