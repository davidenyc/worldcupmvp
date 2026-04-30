// Reusable QR image renderer for promo and access-code surfaces across the app.
"use client";

import Image from "next/image";

export function QRCodeImage({
  code,
  template,
  src,
  alt,
  className = "",
  size = 224
}: {
  code?: string;
  template?: string;
  src?: string;
  alt: string;
  className?: string;
  size?: number;
}) {
  const resolvedSrc = src ?? template?.replace("{code}", encodeURIComponent(code ?? ""));

  if (!resolvedSrc) return null;

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      width={size}
      height={size}
      unoptimized
      className={`rounded-[1.5rem] bg-white p-3 ${className}`.trim()}
    />
  );
}
