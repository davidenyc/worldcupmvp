import { ImageResponse } from "next/og";

import { demoCountries } from "@/lib/data/demo";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("country") ?? "";
  const country = demoCountries.find((item) => item.slug === slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: country
            ? `linear-gradient(135deg, ${country.primaryColors[0]}, #09111f)`
            : "linear-gradient(135deg, #0f172a, #020617)",
          color: "white",
          fontFamily: "Inter, system-ui, sans-serif"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ fontSize: "128px", lineHeight: 1 }}>{country?.flagEmoji ?? "🏟️"}</div>
          <div style={{ fontSize: "72px", fontWeight: 800, letterSpacing: "-0.04em" }}>
            {country?.name ?? "GameDay Map"}
          </div>
          <div style={{ fontSize: "30px", color: "rgba(255,255,255,0.8)" }}>
            Find World Cup watch spots in NYC
          </div>
        </div>
        <div style={{ fontSize: "22px", color: "rgba(255,255,255,0.75)" }}>
          GameDay Map · NYC-first World Cup fan discovery
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  );
}
