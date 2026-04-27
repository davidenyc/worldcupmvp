import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "GameDay Map";
  const subtitle = searchParams.get("subtitle") ?? "World Cup 2026 fan venue finder";
  const emoji = searchParams.get("emoji") ?? "⚽";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a1628",
          padding: "52px",
          color: "white",
          fontFamily: "Arial, sans-serif"
        }}
      >
        <div style={{ color: "#f4b942", fontSize: 28, fontWeight: 800, letterSpacing: "0.12em" }}>
          GAMEDAY MAP
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" }}>
          <div style={{ fontSize: 120, lineHeight: 1 }}>{emoji}</div>
          <div style={{ fontSize: 48, fontWeight: 800, maxWidth: 980 }}>{title}</div>
          <div style={{ fontSize: 28, color: "#f4b942", maxWidth: 980 }}>{subtitle}</div>
        </div>
        <div
          style={{
            background: "#f4b942",
            color: "#0a1628",
            borderRadius: 999,
            padding: "16px 28px",
            fontSize: 24,
            fontWeight: 700,
            alignSelf: "stretch",
            textAlign: "center"
          }}
        >
          World Cup 2026 · gamedaymap.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  );
}
