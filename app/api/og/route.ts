import { ImageResponse } from "next/og";
import React from "react";

import { demoCountries } from "@/lib/data/demo";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("country") ?? "";
  const country = demoCountries.find((item) => item.slug === slug);

  return new ImageResponse(
    React.createElement(
      "div",
      {
        style: {
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
        }
      },
      React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "18px" } },
        React.createElement("div", { style: { fontSize: "128px", lineHeight: 1 } }, country?.flagEmoji ?? "🏟️"),
        React.createElement(
          "div",
          { style: { fontSize: "72px", fontWeight: 800, letterSpacing: "-0.04em" } },
          country?.name ?? "GameDay Map"
        ),
        React.createElement(
          "div",
          { style: { fontSize: "30px", color: "rgba(255,255,255,0.8)" } },
          "Find World Cup watch spots across the host cities"
        )
      ),
      React.createElement(
        "div",
        { style: { fontSize: "22px", color: "rgba(255,255,255,0.75)" } },
        "GameDay Map · World Cup 2026 fan experience"
      )
    ),
    {
      width: 1200,
      height: 630
    }
  );
}
