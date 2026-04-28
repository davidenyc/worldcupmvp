// Reusable QR image renderer for promo and access-code surfaces across the app.
"use client";

export function QRCodeImage({
  code,
  template,
  alt,
  className = ""
}: {
  code: string;
  template: string;
  alt: string;
  className?: string;
}) {
  const src = template.replace("{code}", encodeURIComponent(code));

  return (
    <img
      src={src}
      alt={alt}
      className={`rounded-[1.5rem] bg-white p-3 ${className}`.trim()}
    />
  );
}
