export type SocialMockEntry = {
  id: string;
  avatar: string;
  label: string;
  href: string;
};

export const socialMock: SocialMockEntry[] = [
  { id: "lucia-save", avatar: "🟢", label: "Lucia just saved La Esquina", href: "/nyc/map" },
  { id: "maria-rsvp", avatar: "🇲🇽", label: "Maria RSVP'd Mexico vs USA", href: "/today?city=nyc" },
  { id: "bahia-drop", avatar: "📍", label: "3 fans landed at Bahia", href: "/nyc/map" },
  { id: "brooklyn-going", avatar: "🔥", label: "27 going to Brooklyn watch", href: "/nyc/map?vibe=watch_party" },
  { id: "crew-join", avatar: "🇦🇷", label: "Andres joined NYC Argentina Crew", href: "/groups" },
  { id: "reserve-lock", avatar: "⭐", label: "Jules locked in a Fan Pass reservation", href: "/membership" },
  { id: "williamsburg", avatar: "🧃", label: "Mexico crowd building in Williamsburg", href: "/nyc/map?country=mexico" },
  { id: "chelsea", avatar: "🎉", label: "12 more fans picked Chelsea Market screens", href: "/nyc/map" },
  { id: "france-save", avatar: "🇫🇷", label: "Camille saved Le District for France night", href: "/nyc/map?country=france" },
  { id: "brazil-watch", avatar: "🇧🇷", label: "18 heading to a Brazil watch in Queens", href: "/nyc/map?country=brazil" },
  { id: "promo-live", avatar: "🏷️", label: "New promo just dropped at Tijuana Picnic", href: "/promos" },
  { id: "family-plan", avatar: "👨‍👩‍👧", label: "A family crew picked an outdoor final spot", href: "/nyc/map?vibe=family" },
  { id: "quiet-room", avatar: "🎙️", label: "Quiet-watch fans just found an Astoria room", href: "/nyc/map?vibe=quiet" },
  { id: "portugal", avatar: "🇵🇹", label: "Portugal supporters are filling a Lower East Side bar", href: "/nyc/map?country=portugal" },
  { id: "late-pick", avatar: "⏱️", label: "Last-minute fans are still picking rooms tonight", href: "/today?city=nyc" }
];
