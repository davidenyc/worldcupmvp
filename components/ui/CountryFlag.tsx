import { CountrySummary } from "@/lib/types";
import { getFlagImageUrl } from "@/lib/utils/flagImage";

interface Props {
  country: CountrySummary | null | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { text: "text-base", img: 20 },
  md: { text: "text-2xl", img: 28 },
  lg: { text: "text-5xl", img: 48 }
};

export function CountryFlag({ country, size = "md", className = "" }: Props) {
  if (!country) return <span className={`${sizes[size].text} ${className}`}>🏁</span>;

  const imageUrl = getFlagImageUrl(country.slug);
  const s = sizes[size];

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={`${country.name} flag`}
        width={s.img}
        height={Math.round(s.img * 0.67)}
        className={`inline-block rounded-sm object-cover shadow-sm ${className}`}
        style={{ width: s.img, height: Math.round(s.img * 0.67) }}
        loading="lazy"
      />
    );
  }

  const useCode = country.flagEmoji.length > 4 || country.flagEmoji.includes(" ");
  if (useCode) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded bg-surface-2 px-1 text-[10px] font-black tracking-[0.1em] text-deep ${className}`}
      >
        {country.fifaCode}
      </span>
    );
  }

  return <span className={`${s.text} leading-none ${className}`}>{country.flagEmoji}</span>;
}
