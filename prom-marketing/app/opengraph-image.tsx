// Default OG image for the homepage. Next.js renders this as 1200x630 and
// serves it as `/opengraph-image`. Used automatically by social previews.

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ProMarketing LTD — AI автоматизации за бизнеса";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background:
            "linear-gradient(135deg, #050813 0%, #0A1329 50%, #060A1A 100%)",
          fontFamily: "Inter, system-ui",
          color: "#fff",
          position: "relative",
        }}
      >
        {/* Cyan glow top-right */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            background:
              "radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        {/* Violet glow bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: -200,
            left: -200,
            width: 600,
            height: 600,
            background:
              "radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Top badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            border: "1px solid rgba(6,182,212,0.3)",
            background: "rgba(6,182,212,0.08)",
            padding: "8px 16px",
            borderRadius: 999,
            fontSize: 18,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#06b6d4",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#06b6d4",
              display: "flex",
            }}
          />
          AI · Automation · Growth
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2,
            marginBottom: 32,
            maxWidth: 1000,
          }}
        >
          <div style={{ display: "flex" }}>Автоматизирай</div>
          <div style={{ display: "flex" }}>
            <span style={{ color: "#06b6d4", display: "flex" }}>бизнеса си</span>
            <span style={{ color: "rgba(255,255,255,0.7)", display: "flex" }}>
              &nbsp;с AI агенти.
            </span>
          </div>
        </div>

        {/* Subline */}
        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "rgba(255,255,255,0.7)",
            maxWidth: 900,
            lineHeight: 1.4,
            marginBottom: 48,
          }}
        >
          AI чат агенти, личен AI CRM и софтуер по поръчка — работят 24/7.
        </div>

        {/* Footer row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: 32,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background:
                  "linear-gradient(135deg, #06b6d4 0%, #a78bfa 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
                fontWeight: 800,
                color: "#0A1329",
              }}
            >
              PM
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 700, display: "flex" }}>
                ProMarketing
              </div>
              <div
                style={{
                  fontSize: 18,
                  color: "rgba(255,255,255,0.5)",
                  display: "flex",
                }}
              >
                promarketing.pw
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 24,
              fontSize: 18,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <div style={{ display: "flex" }}>
              <span style={{ color: "#22c55e", display: "flex", marginRight: 8 }}>
                12-15ч
              </span>
              спестени седмично
            </div>
            <div style={{ display: "flex" }}>
              <span style={{ color: "#06b6d4", display: "flex", marginRight: 8 }}>
                24/7
              </span>
              AI на смяна
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
