import { NextRequest, NextResponse } from "next/server";

const CACHE_SECONDS = 60 * 60 * 24;

function buildTileUrl(slug: string[]) {
  const [provider, z, x, yFile] = slug;

  if (!provider || !z || !x || !yFile) {
    return null;
  }

  if (provider === "carto-voyager") {
    return `https://c.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${yFile}`;
  }

  if (provider === "carto-dark") {
    return `https://c.basemaps.cartocdn.com/dark_all/${z}/${x}/${yFile}`;
  }

  return null;
}

export async function GET(_request: NextRequest, context: { params: { slug: string[] } }) {
  const tileUrl = buildTileUrl(context.params.slug);

  if (!tileUrl) {
    return NextResponse.json({ error: "Invalid tile request" }, { status: 400 });
  }

  const upstream = await fetch(tileUrl, {
    headers: {
      "User-Agent": "GameDayMaps/1.0"
    },
    next: {
      revalidate: CACHE_SECONDS
    }
  });

  if (!upstream.ok) {
    return NextResponse.json({ error: "Tile fetch failed" }, { status: upstream.status });
  }

  const contentType = upstream.headers.get("content-type") ?? "image/png";
  const body = await upstream.arrayBuffer();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}`
    }
  });
}
