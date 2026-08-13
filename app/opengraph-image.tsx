import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 140,
            height: 140,
            borderRadius: 36,
            background: "rgba(255,255,255,0.15)",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 84,
          }}
        >
          🏠
        </div>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 800, color: "#ffffff" }}>Hausheld</div>
        <div style={{ display: "flex", fontSize: 32, color: "rgba(255,255,255,0.85)" }}>
          Haushaltsaufgaben im Griff · Household Tasks Under Control
        </div>
      </div>
    ),
    { ...size },
  );
}
