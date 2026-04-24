export interface WorldCupMatch {
  id: string;
  homeCountry: string;
  awayCountry: string;
  startsAt: string;
  stage: string;
  venue: {
    city: string;
    stadium: string;
  };
  competition: string;
  note: string;
}

function match(matchData: WorldCupMatch) {
  return matchData;
}

export const worldCup2026Matches: WorldCupMatch[] = [
  match({
    id: "m1",
    homeCountry: "mexico",
    awayCountry: "canada",
    startsAt: "2026-06-11T15:00:00-04:00",
    stage: "Group Stage",
    venue: { city: "New York", stadium: "MetLife Stadium" },
    competition: "FIFA World Cup 2026",
    note: "Opening-week crowd builder with strong NYC crossover support."
  }),
  match({
    id: "m2",
    homeCountry: "usa",
    awayCountry: "england",
    startsAt: "2026-06-13T15:00:00-04:00",
    stage: "Group Stage",
    venue: { city: "New York", stadium: "MetLife Stadium" },
    competition: "FIFA World Cup 2026",
    note: "High-demand transatlantic watch-day fixture."
  }),
  match({
    id: "m3",
    homeCountry: "france",
    awayCountry: "morocco",
    startsAt: "2026-06-16T18:00:00-04:00",
    stage: "Group Stage",
    venue: { city: "New York", stadium: "MetLife Stadium" },
    competition: "FIFA World Cup 2026",
    note: "Elite matchup with major NYC fan communities."
  }),
  match({
    id: "m4",
    homeCountry: "brazil",
    awayCountry: "spain",
    startsAt: "2026-06-18T15:00:00-04:00",
    stage: "Group Stage",
    venue: { city: "New York", stadium: "MetLife Stadium" },
    competition: "FIFA World Cup 2026",
    note: "Big-screen atmosphere, likely one of the loudest nights."
  }),
  match({
    id: "m5",
    homeCountry: "portugal",
    awayCountry: "argentina",
    startsAt: "2026-06-21T18:00:00-04:00",
    stage: "Group Stage",
    venue: { city: "New York", stadium: "MetLife Stadium" },
    competition: "FIFA World Cup 2026",
    note: "Packed supporter bases and lots of reservation pressure."
  }),
  match({
    id: "m6",
    homeCountry: "germany",
    awayCountry: "netherlands",
    startsAt: "2026-06-24T15:00:00-04:00",
    stage: "Group Stage",
    venue: { city: "New York", stadium: "MetLife Stadium" },
    competition: "FIFA World Cup 2026",
    note: "Historic European rivalry with strong bar turnout."
  }),
  match({
    id: "m7",
    homeCountry: "belgium",
    awayCountry: "croatia",
    startsAt: "2026-06-26T18:00:00-04:00",
    stage: "Round of 32",
    venue: { city: "New York", stadium: "MetLife Stadium" },
    competition: "FIFA World Cup 2026",
    note: "Knockout-round energy and premium watch-spot demand."
  }),
  match({
    id: "m8",
    homeCountry: "spain",
    awayCountry: "england",
    startsAt: "2026-07-05T20:00:00-04:00",
    stage: "Quarterfinal",
    venue: { city: "New York", stadium: "MetLife Stadium" },
    competition: "FIFA World Cup 2026",
    note: "Late-stage heavyweight fixture with huge citywide interest."
  }),
  match({
    id: "m9",
    homeCountry: "argentina",
    awayCountry: "brazil",
    startsAt: "2026-07-19T20:00:00-04:00",
    stage: "Final",
    venue: { city: "New York", stadium: "MetLife Stadium" },
    competition: "FIFA World Cup 2026",
    note: "Championship night with maximum watch-party demand."
  }),
  match({
    id: "m10",
    homeCountry: "japan",
    awayCountry: "australia",
    startsAt: "2026-06-12T17:00:00-04:00",
    stage: "Group Stage",
    venue: { city: "Los Angeles", stadium: "SoFi Stadium" },
    competition: "FIFA World Cup 2026",
    note: "West Coast kickoff for Pacific community crowds."
  }),
  match({
    id: "m11",
    homeCountry: "ghana",
    awayCountry: "senegal",
    startsAt: "2026-06-12T20:00:00-04:00",
    stage: "Group Stage",
    venue: { city: "Dallas", stadium: "AT&T Stadium" },
    competition: "FIFA World Cup 2026",
    note: "African fan communities should make this one pop."
  }),
  match({
    id: "m12",
    homeCountry: "colombia",
    awayCountry: "ecuador",
    startsAt: "2026-06-14T19:00:00-04:00",
    stage: "Group Stage",
    venue: { city: "Miami", stadium: "Hard Rock Stadium" },
    competition: "FIFA World Cup 2026",
    note: "South Florida watch-day with strong Latin turnout."
  }),
  match({
    id: "m13",
    homeCountry: "egypt",
    awayCountry: "tunisia",
    startsAt: "2026-06-15T16:00:00-04:00",
    stage: "Group Stage",
    venue: { city: "Houston", stadium: "NRG Stadium" },
    competition: "FIFA World Cup 2026",
    note: "Arab and North African supporters should converge here."
  }),
  match({
    id: "m14",
    homeCountry: "uruguay",
    awayCountry: "paraguay",
    startsAt: "2026-06-17T15:00:00-04:00",
    stage: "Group Stage",
    venue: { city: "Seattle", stadium: "Lumen Field" },
    competition: "FIFA World Cup 2026",
    note: "Pacific Northwest crowd with strong South American interest."
  }),
  match({
    id: "m15",
    homeCountry: "switzerland",
    awayCountry: "austria",
    startsAt: "2026-06-19T18:00:00-04:00",
    stage: "Group Stage",
    venue: { city: "Atlanta", stadium: "Mercedes-Benz Stadium" },
    competition: "FIFA World Cup 2026",
    note: "Late-afternoon European audience overlap."
  }),
  match({
    id: "m16",
    homeCountry: "czechia",
    awayCountry: "bosnia-herzegovina",
    startsAt: "2026-06-20T15:00:00-04:00",
    stage: "Group Stage",
    venue: { city: "Philadelphia", stadium: "Lincoln Financial Field" },
    competition: "FIFA World Cup 2026",
    note: "Good fit for Northeast supporter travel."
  }),
  match({
    id: "m17",
    homeCountry: "saudi-arabia",
    awayCountry: "qatar",
    startsAt: "2026-06-22T18:00:00-04:00",
    stage: "Group Stage",
    venue: { city: "Boston", stadium: "Gillette Stadium" },
    competition: "FIFA World Cup 2026",
    note: "Regional fans and family groups should skew this one."
  }),
  match({
    id: "m18",
    homeCountry: "cabo-verde",
    awayCountry: "congo-dr",
    startsAt: "2026-06-23T20:00:00-04:00",
    stage: "Group Stage",
    venue: { city: "Kansas City", stadium: "Arrowhead Stadium" },
    competition: "FIFA World Cup 2026",
    note: "Smaller-community matchup with a lively undercard feel."
  }),
  match({
    id: "m19",
    homeCountry: "turkiye",
    awayCountry: "scotland",
    startsAt: "2026-06-25T17:00:00-04:00",
    stage: "Group Stage",
    venue: { city: "Los Angeles", stadium: "Rose Bowl" },
    competition: "FIFA World Cup 2026",
    note: "Huge supporter-energy fixture on the West Coast."
  }),
  match({
    id: "m20",
    homeCountry: "ir-iran",
    awayCountry: "iraq",
    startsAt: "2026-06-27T16:00:00-04:00",
    stage: "Round of 32",
    venue: { city: "Dallas", stadium: "AT&T Stadium" },
    competition: "FIFA World Cup 2026",
    note: "Knockout tension with strong regional fan interest."
  }),
  match({
    id: "m21",
    homeCountry: "canada",
    awayCountry: "morocco",
    startsAt: "2026-06-28T18:00:00-04:00",
    stage: "Round of 32",
    venue: { city: "Miami", stadium: "Hard Rock Stadium" },
    competition: "FIFA World Cup 2026",
    note: "Cross-continent crowd with strong watch-party potential."
  }),
  match({
    id: "m22",
    homeCountry: "mexico",
    awayCountry: "usa",
    startsAt: "2026-06-30T20:00:00-04:00",
    stage: "Round of 32",
    venue: { city: "New York", stadium: "MetLife Stadium" },
    competition: "FIFA World Cup 2026",
    note: "NYC region headline fixture for dual-fan gatherings."
  }),
  match({
    id: "m23",
    homeCountry: "brazil",
    awayCountry: "portugal",
    startsAt: "2026-07-02T18:00:00-04:00",
    stage: "Round of 16",
    venue: { city: "Houston", stadium: "NRG Stadium" },
    competition: "FIFA World Cup 2026",
    note: "Latin crowd magnet with a big reservation window."
  }),
  match({
    id: "m24",
    homeCountry: "france",
    awayCountry: "spain",
    startsAt: "2026-07-03T16:00:00-04:00",
    stage: "Round of 16",
    venue: { city: "Seattle", stadium: "Lumen Field" },
    competition: "FIFA World Cup 2026",
    note: "Strong European supporter overlap with premium venue demand."
  }),
  match({
    id: "m25",
    homeCountry: "england",
    awayCountry: "germany",
    startsAt: "2026-07-06T19:00:00-04:00",
    stage: "Quarterfinal",
    venue: { city: "Boston", stadium: "Gillette Stadium" },
    competition: "FIFA World Cup 2026",
    note: "Traditional heavyweight fixture with broad bar appeal."
  }),
  match({
    id: "m26",
    homeCountry: "argentina",
    awayCountry: "uruguay",
    startsAt: "2026-07-07T20:00:00-04:00",
    stage: "Quarterfinal",
    venue: { city: "Atlanta", stadium: "Mercedes-Benz Stadium" },
    competition: "FIFA World Cup 2026",
    note: "South American rivalry likely to pack the room."
  }),
  match({
    id: "m27",
    homeCountry: "colombia",
    awayCountry: "mexico",
    startsAt: "2026-07-10T18:00:00-04:00",
    stage: "Semifinal",
    venue: { city: "Los Angeles", stadium: "SoFi Stadium" },
    competition: "FIFA World Cup 2026",
    note: "Los Angeles can absorb a huge watch crowd for this one."
  }),
  match({
    id: "m28",
    homeCountry: "japan",
    awayCountry: "canada",
    startsAt: "2026-07-11T15:00:00-04:00",
    stage: "Semifinal",
    venue: { city: "Dallas", stadium: "AT&T Stadium" },
    competition: "FIFA World Cup 2026",
    note: "Big travel-day crowd with cross-continental appeal."
  }),
  match({
    id: "m29",
    homeCountry: "netherlands",
    awayCountry: "croatia",
    startsAt: "2026-07-12T20:00:00-04:00",
    stage: "Third Place",
    venue: { city: "Miami", stadium: "Hard Rock Stadium" },
    competition: "FIFA World Cup 2026",
    note: "Late-stage matchup with strong venue selection pressure."
  }),
  match({
    id: "m30",
    homeCountry: "morocco",
    awayCountry: "switzerland",
    startsAt: "2026-07-14T17:00:00-04:00",
    stage: "Semifinal",
    venue: { city: "Philadelphia", stadium: "Lincoln Financial Field" },
    competition: "FIFA World Cup 2026",
    note: "Watch-spots should fill quickly for this one."
  })
];

export function getUpcomingMatches(from = new Date()) {
  return worldCup2026Matches
    .slice()
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
    .filter((match) => Date.parse(match.startsAt) >= from.getTime());
}

export function getMatchDateKey(value: string | Date) {
  return new Date(value).toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}
