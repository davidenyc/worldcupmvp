import { ImageResponse } from "next/og";
import React from "react";

import { demoCountries } from "@/lib/data/demo";
import { getHostCity } from "@/lib/data/hostCities";
import { getPromosByCity } from "@/lib/data/promos";
import { getAllCountries, getMapPageData, getVenueDetails } from "@/lib/data/repository";
import { getFallbackTonightFeed, getTonightFeed } from "@/lib/hooks/useTonightFeed";
import { consumeRateLimit, getRequestIp } from "@/lib/rateLimit/consume";

export const runtime = "nodejs";

type OgPayload = {
  eyebrow: string;
  title: string;
  subtitle: string;
  accent: string;
  emoji: string;
  pill?: string;
};

function renderOgImage(payload: OgPayload) {
  const { eyebrow, title, subtitle, accent, emoji, pill } = payload;
  const titleFontSize = title.length > 26 ? 62 : title.length > 18 ? 68 : 74;
  const subtitleFontSize = subtitle.length > 100 ? 24 : 28;

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
          padding: "56px",
          background: "linear-gradient(145deg, #0a1628 0%, #121a27 55%, #1b2333 100%)",
          color: "#f8fbff",
          fontFamily: "Inter, system-ui, sans-serif"
        }
      },
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }
        },
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: "18px" } },
          React.createElement(
            "div",
            {
              style: {
                width: "74px",
                height: "74px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "26px",
                background: "#f4b942",
                color: "#0a1628",
                fontSize: "32px",
                fontWeight: 900
              }
            },
            "GM"
          ),
          React.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: "4px" } },
            React.createElement(
              "div",
              { style: { fontSize: "28px", fontWeight: 800, letterSpacing: "-0.04em" } },
              "GameDay Map"
            ),
            React.createElement(
              "div",
              { style: { fontSize: "15px", color: "rgba(248,251,255,0.74)", textTransform: "uppercase", letterSpacing: "0.3em" } },
              "World Cup 2026 watch parties"
            )
          )
        ),
        pill
          ? React.createElement(
              "div",
              {
                style: {
                  padding: "12px 20px",
                  borderRadius: "999px",
                  border: "1px solid rgba(248,251,255,0.14)",
                  color: "#f8fbff",
                  fontSize: "20px",
                  fontWeight: 700
                }
              },
              pill
            )
          : null
      ),
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "22px",
            maxWidth: "900px"
          }
        },
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "18px",
              fontSize: "24px",
              color: "rgba(248,251,255,0.78)",
              textTransform: "uppercase",
              letterSpacing: "0.28em"
            }
          },
          React.createElement(
            "span",
            {
              style: {
                width: "14px",
                height: "14px",
                borderRadius: "999px",
                background: accent
              }
            }
          ),
          eyebrow
        ),
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "flex-start",
              gap: "28px",
              maxWidth: "980px"
            }
          },
          React.createElement(
            "div",
            {
              style: {
                width: "96px",
                minWidth: "96px",
                height: "96px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "64px",
                lineHeight: 1
              }
            },
            emoji
          ),
          React.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: "14px", maxWidth: "860px" } },
            React.createElement(
              "div",
              {
                style: {
                  fontSize: `${titleFontSize}px`,
                  fontWeight: 800,
                  lineHeight: 1.06,
                  letterSpacing: "-0.05em"
                }
              },
              title
            ),
            React.createElement(
              "div",
              {
                style: {
                  fontSize: `${subtitleFontSize}px`,
                  lineHeight: 1.4,
                  color: "rgba(248,251,255,0.8)"
                }
              },
              subtitle
            )
          )
        )
      ),
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "22px",
            color: "rgba(248,251,255,0.72)"
          }
        },
        React.createElement("div", null, "17 host cities · 48 nations · match-night rooms for every crowd"),
        React.createElement(
          "div",
          {
            style: {
              width: "240px",
              height: "6px",
              borderRadius: "999px",
              background: accent
            }
          }
        )
      )
    ),
    {
      width: 1200,
      height: 630
    }
  );
}

async function buildHomePayload() {
  return {
    eyebrow: "GameDay Map",
    title: "Find your World Cup 2026 watch party.",
    subtitle: "See fan bars, country rooms, and match-night promos across all 17 host cities.",
    accent: "#f4b942",
    emoji: "🏟️",
    pill: "Home"
  } satisfies OgPayload;
}

async function buildCityPayload(cityKey: string) {
  const city = getHostCity(cityKey) ?? getHostCity("nyc");
  const data = await getMapPageData(city?.key ?? "nyc");
  const countryCount = new Set(
    data.venues.map((venue) => venue.likelySupporterCountry).filter(Boolean)
  ).size;

  return {
    eyebrow: `${city?.label ?? "New York"} watch map`,
    title: `${city?.label ?? "New York"} watch parties`,
    subtitle: `${data.venues.length} venues for ${countryCount} supporter nations, all sorted for match-day energy.`,
    accent: "#f4b942",
    emoji: "📍",
    pill: city?.shortLabel?.toUpperCase() ?? "NYC"
  } satisfies OgPayload;
}

async function buildCountryPayload(slug: string) {
  const countries = await getAllCountries();
  const country = countries.find((item) => item.slug === slug) ?? demoCountries.find((item) => item.slug === slug);

  return {
    eyebrow: "Country rooms",
    title: country ? `${country.name} fan venues` : "Country fan venues",
    subtitle: country
      ? `Find ${country.name} watch parties across New York, Los Angeles, Miami, and the rest of the host-city grid.`
      : "Find supporter rooms and fan bars across the host-city grid.",
    accent: "#f4b942",
    emoji: country?.flagEmoji ?? "🏳️",
    pill: country?.fifaCode ?? "WC26"
  } satisfies OgPayload;
}

async function buildVenuePayload(slug: string) {
  const data = await getVenueDetails(slug);

  if (!data) {
    return {
      eyebrow: "Venue not found",
      title: "GameDay Map",
      subtitle: "Find World Cup watch parties, fan bars, and promos across 17 host cities.",
      accent: "#f4b942",
      emoji: "🏟️",
      pill: "Venue"
    } satisfies OgPayload;
  }

  return {
    eyebrow: `${data.venue.city} venue`,
    title: data.venue.name,
    subtitle: `${data.venue.neighborhood} · ${data.country?.name ?? "Sports bar"} supporters · World Cup watch room`,
    accent: "#f4b942",
    emoji: data.country?.flagEmoji ?? "⚽",
    pill: data.venue.city
  } satisfies OgPayload;
}

async function buildPromosPayload(cityKey: string | null) {
  const city = cityKey ? getHostCity(cityKey) : null;
  const cityLabel = city?.label ?? "17 host cities";

  let promoCount = 0;
  if (city) {
    const mapData = await getMapPageData(city.key);
    promoCount = getPromosByCity(city.key, mapData.venues).length;
  }

  return {
    eyebrow: "Match-night deals",
    title: city ? `${city.label} promos` : "World Cup promos",
    subtitle: city
      ? `${promoCount} live offers and venue perks ready for your next ${city.label} watch party.`
      : "Save at watch parties, bars, and fan rooms across all 17 host cities.",
    accent: "#f4b942",
    emoji: "🏷️",
    pill: city ? city.shortLabel.toUpperCase() : cityLabel
  } satisfies OgPayload;
}

async function buildWelcomePayload() {
  return {
    eyebrow: "Personalize your Cup",
    title: "Set up your GameDay Map",
    subtitle: "Choose your city, your nation, and the rooms you want waiting for you on match day.",
    accent: "#f4b942",
    emoji: "✨",
    pill: "Welcome"
  } satisfies OgPayload;
}

async function buildTonightPayload(cityKey: string) {
  const city = getHostCity(cityKey) ?? getHostCity("nyc");

  try {
    const feed = await getTonightFeed(city?.key ?? "nyc");
    const hero = feed.hero;

    if (!hero) {
      return {
        eyebrow: `${city?.label ?? "New York"} tonight`,
        title: "Find your match-night room.",
        subtitle: `Watch parties, crowd signals, and venue counts for ${city?.label ?? "New York"}.`,
        accent: "#f4b942",
        emoji: "🌙",
        pill: city?.shortLabel?.toUpperCase() ?? "NYC"
      } satisfies OgPayload;
    }

    const crowdLine = hero.topNeighborhood
      ? `Strongest ${
          hero.topNeighborhood.supporterCountrySlug === hero.homeCountry.slug
            ? hero.homeCountry.name
            : hero.awayCountry.name
        } crowd in ${hero.topNeighborhood.name}.`
      : "Find the loudest room before kickoff.";

    return {
      eyebrow: `${feed.windowLabel} in ${city?.label ?? "New York"}`,
      title: `${hero.homeCountry.name} vs ${hero.awayCountry.name}`,
      subtitle: `${hero.venueCount} venues showing this in ${hero.cityLabel}. ${crowdLine}`,
      accent: "#f4b942",
      emoji: hero.homeCountry.flagEmoji,
      pill: city?.shortLabel?.toUpperCase() ?? hero.cityLabel.toUpperCase()
    } satisfies OgPayload;
  } catch {
    try {
      const feed = await getFallbackTonightFeed(city?.key ?? "nyc");
      const hero = feed.hero;

      if (!hero) {
        return {
          eyebrow: `${city?.label ?? "New York"} tonight`,
          title: "Next match day",
          subtitle: `The next World Cup watch parties are lining up now in ${city?.label ?? "New York"}.`,
          accent: "#f4b942",
          emoji: "🌙",
          pill: city?.shortLabel?.toUpperCase() ?? "NYC"
        } satisfies OgPayload;
      }

      return {
        eyebrow: `${feed.windowLabel} in ${city?.label ?? "New York"}`,
        title: `${hero.homeCountry.name} vs ${hero.awayCountry.name}`,
        subtitle: `Browse the map early for the next ${city?.label ?? "New York"} match-night room.`,
        accent: "#f4b942",
        emoji: hero.awayCountry.flagEmoji,
        pill: city?.shortLabel?.toUpperCase() ?? hero.cityLabel.toUpperCase()
      } satisfies OgPayload;
    } catch {
      return {
        eyebrow: `${city?.label ?? "New York"} tonight`,
        title: "Find your match-night room.",
        subtitle: `Watch parties, crowd signals, and venue counts for ${city?.label ?? "New York"}.`,
        accent: "#f4b942",
        emoji: "🌙",
        pill: city?.shortLabel?.toUpperCase() ?? "NYC"
      } satisfies OgPayload;
    }
  }
}

async function buildMePayload() {
  return {
    eyebrow: "My Cup",
    title: "My Cup · GameDay Map",
    subtitle: "Your saved venues, country follows, and World Cup watch-party plans in one place.",
    accent: "#f4b942",
    emoji: "🗂️",
    pill: "My Cup"
  } satisfies OgPayload;
}

export async function GET(request: Request) {
  const allowed = await consumeRateLimit({
    key: `og:${getRequestIp(request)}`,
    limit: 60,
    windowMs: 60 * 60_000
  });
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { "content-type": "application/json" }
    });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "home";

  let payload: OgPayload;

  switch (type) {
    case "city-map":
      payload = await buildCityPayload(searchParams.get("city") ?? "nyc");
      break;
    case "country":
      payload = await buildCountryPayload(searchParams.get("slug") ?? "");
      break;
    case "venue":
      payload = await buildVenuePayload(searchParams.get("slug") ?? "");
      break;
    case "promos":
      payload = await buildPromosPayload(searchParams.get("city"));
      break;
    case "welcome":
      payload = await buildWelcomePayload();
      break;
    case "tonight":
      payload = await buildTonightPayload(searchParams.get("city") ?? "nyc");
      break;
    case "me":
      payload = await buildMePayload();
      break;
    default:
      payload = await buildHomePayload();
      break;
  }

  return renderOgImage(payload);
}
