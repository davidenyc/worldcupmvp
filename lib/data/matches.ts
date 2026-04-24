export type MatchStage = "group" | "round_of_32" | "round_of_16" | "quarter" | "semi" | "final";

export type MatchGroup = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | null;

export interface WorldCupMatch {
  id: string;
  homeCountry: string;
  awayCountry: string;
  startsAt: string;
  stage: MatchStage;
  group: MatchGroup;
  stadiumName: string;
  city: string;
  isNYNJ: boolean;
  isCanada: boolean;
  isMexico: boolean;
  competition: string;
  note: string;
  stageLabel: string;
  venue: {
    city: string;
    stadium: string;
  };
}

type MatchSeed = Omit<WorldCupMatch, "competition" | "note" | "stageLabel" | "venue" | "isCanada" | "isMexico">;

function isCanadaStadium(stadiumName: string) {
  return stadiumName === "BMO Field" || stadiumName === "BC Place";
}

function isMexicoStadium(stadiumName: string) {
  return stadiumName === "Estadio Azteca" || stadiumName === "Estadio Akron" || stadiumName === "Estadio Universitario";
}

function makeMatch(seed: MatchSeed): WorldCupMatch {
  return {
    ...seed,
    isCanada: isCanadaStadium(seed.stadiumName),
    isMexico: isMexicoStadium(seed.stadiumName),
    competition: "FIFA World Cup 2026",
    note: seed.isNYNJ
      ? "MetLife Stadium fixture with major NYC fan interest."
      : "Official group-stage fixture from the FIFA schedule.",
    stageLabel: formatMatchStage(seed.stage),
    venue: {
      city: seed.city,
      stadium: seed.stadiumName
    }
  };
}

export function formatMatchStage(stage: MatchStage) {
  switch (stage) {
    case "group":
      return "Group Stage";
    case "round_of_32":
      return "Round of 32";
    case "round_of_16":
      return "Round of 16";
    case "quarter":
      return "Quarterfinal";
    case "semi":
      return "Semifinal";
    case "final":
      return "Final";
    default:
      return stage;
  }
}

export const worldCup2026Matches: WorldCupMatch[] = [
  // Group A
  makeMatch({
    id: "a-1",
    homeCountry: "mexico",
    awayCountry: "south-africa",
    startsAt: "2026-06-11T15:00:00-04:00",
    stage: "group",
    group: "A",
    stadiumName: "Estadio Azteca",
    city: "Mexico City",
    isNYNJ: false
  }),
  makeMatch({
    id: "a-2",
    homeCountry: "korea-republic", // slug: verify
    awayCountry: "czechia", // slug: verify
    startsAt: "2026-06-12T03:00:00-04:00",
    stage: "group",
    group: "A",
    stadiumName: "Estadio Akron",
    city: "Zapopan",
    isNYNJ: false
  }),
  makeMatch({
    id: "a-3",
    homeCountry: "czechia", // slug: verify
    awayCountry: "south-africa",
    startsAt: "2026-06-18T12:00:00-04:00",
    stage: "group",
    group: "A",
    stadiumName: "Mercedes-Benz Stadium",
    city: "Atlanta",
    isNYNJ: false
  }),
  makeMatch({
    id: "a-4",
    homeCountry: "mexico",
    awayCountry: "korea-republic", // slug: verify
    startsAt: "2026-06-18T21:00:00-04:00",
    stage: "group",
    group: "A",
    stadiumName: "Estadio Akron",
    city: "Zapopan",
    isNYNJ: false
  }),
  makeMatch({
    id: "a-5",
    homeCountry: "czechia", // slug: verify
    awayCountry: "mexico",
    startsAt: "2026-06-24T21:00:00-04:00",
    stage: "group",
    group: "A",
    stadiumName: "Estadio Azteca",
    city: "Mexico City",
    isNYNJ: false
  }),
  makeMatch({
    id: "a-6",
    homeCountry: "south-africa",
    awayCountry: "korea-republic", // slug: verify
    startsAt: "2026-06-24T21:00:00-04:00",
    stage: "group",
    group: "A",
    stadiumName: "Estadio BBVA",
    city: "Guadalupe",
    isNYNJ: false
  }),

  // Group B
  makeMatch({
    id: "b-1",
    homeCountry: "canada",
    awayCountry: "bosnia-and-herzegovina", // slug: verify
    startsAt: "2026-06-12T15:00:00-04:00",
    stage: "group",
    group: "B",
    stadiumName: "BMO Field",
    city: "Toronto",
    isNYNJ: false
  }),
  makeMatch({
    id: "b-2",
    homeCountry: "qatar",
    awayCountry: "switzerland",
    startsAt: "2026-06-13T15:00:00-04:00",
    stage: "group",
    group: "B",
    stadiumName: "Levi's Stadium",
    city: "Santa Clara",
    isNYNJ: false
  }),
  makeMatch({
    id: "b-3",
    homeCountry: "switzerland",
    awayCountry: "bosnia-and-herzegovina", // slug: verify
    startsAt: "2026-06-18T15:00:00-04:00",
    stage: "group",
    group: "B",
    stadiumName: "SoFi Stadium",
    city: "Inglewood",
    isNYNJ: false
  }),
  makeMatch({
    id: "b-4",
    homeCountry: "canada",
    awayCountry: "qatar",
    startsAt: "2026-06-18T18:00:00-04:00",
    stage: "group",
    group: "B",
    stadiumName: "BC Place",
    city: "Vancouver",
    isNYNJ: false
  }),
  makeMatch({
    id: "b-5",
    homeCountry: "switzerland",
    awayCountry: "canada",
    startsAt: "2026-06-24T15:00:00-04:00",
    stage: "group",
    group: "B",
    stadiumName: "BC Place",
    city: "Vancouver",
    isNYNJ: false
  }),
  makeMatch({
    id: "b-6",
    homeCountry: "bosnia-and-herzegovina", // slug: verify
    awayCountry: "qatar",
    startsAt: "2026-06-24T15:00:00-04:00",
    stage: "group",
    group: "B",
    stadiumName: "Lumen Field",
    city: "Seattle",
    isNYNJ: false
  }),

  // Group C
  makeMatch({
    id: "c-1",
    homeCountry: "brazil",
    awayCountry: "morocco",
    startsAt: "2026-06-13T18:00:00-04:00",
    stage: "group",
    group: "C",
    stadiumName: "MetLife Stadium",
    city: "East Rutherford",
    isNYNJ: true
  }),
  makeMatch({
    id: "c-2",
    homeCountry: "haiti",
    awayCountry: "scotland",
    startsAt: "2026-06-13T21:00:00-04:00",
    stage: "group",
    group: "C",
    stadiumName: "Gillette Stadium",
    city: "Foxborough",
    isNYNJ: false
  }),
  makeMatch({
    id: "c-3",
    homeCountry: "scotland",
    awayCountry: "morocco",
    startsAt: "2026-06-19T18:00:00-04:00",
    stage: "group",
    group: "C",
    stadiumName: "Gillette Stadium",
    city: "Foxborough",
    isNYNJ: false
  }),
  makeMatch({
    id: "c-4",
    homeCountry: "brazil",
    awayCountry: "haiti",
    startsAt: "2026-06-19T20:30:00-04:00",
    stage: "group",
    group: "C",
    stadiumName: "Lincoln Financial Field",
    city: "Philadelphia",
    isNYNJ: false
  }),
  makeMatch({
    id: "c-5",
    homeCountry: "scotland",
    awayCountry: "brazil",
    startsAt: "2026-06-24T18:00:00-04:00",
    stage: "group",
    group: "C",
    stadiumName: "Hard Rock Stadium",
    city: "Miami Gardens",
    isNYNJ: false
  }),
  makeMatch({
    id: "c-6",
    homeCountry: "morocco",
    awayCountry: "haiti",
    startsAt: "2026-06-24T18:00:00-04:00",
    stage: "group",
    group: "C",
    stadiumName: "Mercedes-Benz Stadium",
    city: "Atlanta",
    isNYNJ: false
  }),

  // Group D
  makeMatch({
    id: "d-1",
    homeCountry: "usa", // slug: verify
    awayCountry: "paraguay",
    startsAt: "2026-06-12T21:00:00-04:00",
    stage: "group",
    group: "D",
    stadiumName: "SoFi Stadium",
    city: "Inglewood",
    isNYNJ: false
  }),
  makeMatch({
    id: "d-2",
    homeCountry: "australia",
    awayCountry: "turkiye", // slug: verify
    startsAt: "2026-06-14T00:00:00-04:00",
    stage: "group",
    group: "D",
    stadiumName: "BC Place",
    city: "Vancouver",
    isNYNJ: false
  }),
  makeMatch({
    id: "d-3",
    homeCountry: "usa", // slug: verify
    awayCountry: "australia",
    startsAt: "2026-06-19T15:00:00-04:00",
    stage: "group",
    group: "D",
    stadiumName: "Lumen Field",
    city: "Seattle",
    isNYNJ: false
  }),
  makeMatch({
    id: "d-4",
    homeCountry: "turkiye", // slug: verify
    awayCountry: "paraguay",
    startsAt: "2026-06-19T22:00:00-04:00",
    stage: "group",
    group: "D",
    stadiumName: "Levi's Stadium",
    city: "Santa Clara",
    isNYNJ: false
  }),
  makeMatch({
    id: "d-5",
    homeCountry: "turkiye", // slug: verify
    awayCountry: "usa", // slug: verify
    startsAt: "2026-06-25T22:00:00-04:00",
    stage: "group",
    group: "D",
    stadiumName: "SoFi Stadium",
    city: "Inglewood",
    isNYNJ: false
  }),
  makeMatch({
    id: "d-6",
    homeCountry: "paraguay",
    awayCountry: "australia",
    startsAt: "2026-06-25T22:00:00-04:00",
    stage: "group",
    group: "D",
    stadiumName: "Levi's Stadium",
    city: "Santa Clara",
    isNYNJ: false
  }),

  // Group E
  makeMatch({
    id: "e-1",
    homeCountry: "germany",
    awayCountry: "curacao",
    startsAt: "2026-06-14T13:00:00-04:00",
    stage: "group",
    group: "E",
    stadiumName: "NRG Stadium",
    city: "Houston",
    isNYNJ: false
  }),
  makeMatch({
    id: "e-2",
    homeCountry: "cote-d-ivoire", // slug: verify
    awayCountry: "ecuador",
    startsAt: "2026-06-14T19:00:00-04:00",
    stage: "group",
    group: "E",
    stadiumName: "Lincoln Financial Field",
    city: "Philadelphia",
    isNYNJ: false
  }),
  makeMatch({
    id: "e-3",
    homeCountry: "germany",
    awayCountry: "cote-d-ivoire", // slug: verify
    startsAt: "2026-06-20T16:00:00-04:00",
    stage: "group",
    group: "E",
    stadiumName: "BMO Field",
    city: "Toronto",
    isNYNJ: false
  }),
  makeMatch({
    id: "e-4",
    homeCountry: "ecuador",
    awayCountry: "curacao",
    startsAt: "2026-06-20T20:00:00-04:00",
    stage: "group",
    group: "E",
    stadiumName: "Arrowhead Stadium",
    city: "Kansas City",
    isNYNJ: false
  }),
  makeMatch({
    id: "e-5",
    homeCountry: "curacao",
    awayCountry: "cote-d-ivoire", // slug: verify
    startsAt: "2026-06-25T16:00:00-04:00",
    stage: "group",
    group: "E",
    stadiumName: "Lincoln Financial Field",
    city: "Philadelphia",
    isNYNJ: false
  }),
  makeMatch({
    id: "e-6",
    homeCountry: "ecuador",
    awayCountry: "germany",
    startsAt: "2026-06-25T16:00:00-04:00",
    stage: "group",
    group: "E",
    stadiumName: "MetLife Stadium",
    city: "East Rutherford",
    isNYNJ: true
  }),

  // Group F
  makeMatch({
    id: "f-1",
    homeCountry: "netherlands",
    awayCountry: "japan",
    startsAt: "2026-06-14T16:00:00-04:00",
    stage: "group",
    group: "F",
    stadiumName: "AT&T Stadium",
    city: "Arlington",
    isNYNJ: false
  }),
  makeMatch({
    id: "f-2",
    homeCountry: "sweden",
    awayCountry: "tunisia",
    startsAt: "2026-06-14T22:00:00-04:00",
    stage: "group",
    group: "F",
    stadiumName: "Estadio BBVA",
    city: "Guadalupe",
    isNYNJ: false
  }),
  makeMatch({
    id: "f-3",
    homeCountry: "netherlands",
    awayCountry: "sweden",
    startsAt: "2026-06-20T13:00:00-04:00",
    stage: "group",
    group: "F",
    stadiumName: "NRG Stadium",
    city: "Houston",
    isNYNJ: false
  }),
  makeMatch({
    id: "f-4",
    homeCountry: "tunisia",
    awayCountry: "japan",
    startsAt: "2026-06-21T00:00:00-04:00",
    stage: "group",
    group: "F",
    stadiumName: "Estadio BBVA",
    city: "Guadalupe",
    isNYNJ: false
  }),
  makeMatch({
    id: "f-5",
    homeCountry: "japan",
    awayCountry: "sweden",
    startsAt: "2026-06-25T19:00:00-04:00",
    stage: "group",
    group: "F",
    stadiumName: "AT&T Stadium",
    city: "Arlington",
    isNYNJ: false
  }),
  makeMatch({
    id: "f-6",
    homeCountry: "tunisia",
    awayCountry: "netherlands",
    startsAt: "2026-06-25T19:00:00-04:00",
    stage: "group",
    group: "F",
    stadiumName: "Arrowhead Stadium",
    city: "Kansas City",
    isNYNJ: false
  }),

  // Group G
  makeMatch({
    id: "g-1",
    homeCountry: "belgium",
    awayCountry: "egypt",
    startsAt: "2026-06-15T15:00:00-04:00",
    stage: "group",
    group: "G",
    stadiumName: "Lumen Field",
    city: "Seattle",
    isNYNJ: false
  }),
  makeMatch({
    id: "g-2",
    homeCountry: "ir-iran", // slug: verify
    awayCountry: "new-zealand",
    startsAt: "2026-06-15T21:00:00-04:00",
    stage: "group",
    group: "G",
    stadiumName: "SoFi Stadium",
    city: "Inglewood",
    isNYNJ: false
  }),
  makeMatch({
    id: "g-3",
    homeCountry: "belgium",
    awayCountry: "ir-iran", // slug: verify
    startsAt: "2026-06-21T15:00:00-04:00",
    stage: "group",
    group: "G",
    stadiumName: "SoFi Stadium",
    city: "Inglewood",
    isNYNJ: false
  }),
  makeMatch({
    id: "g-4",
    homeCountry: "new-zealand",
    awayCountry: "egypt",
    startsAt: "2026-06-21T21:00:00-04:00",
    stage: "group",
    group: "G",
    stadiumName: "BC Place",
    city: "Vancouver",
    isNYNJ: false
  }),
  makeMatch({
    id: "g-5",
    homeCountry: "egypt",
    awayCountry: "ir-iran", // slug: verify
    startsAt: "2026-06-26T23:00:00-04:00",
    stage: "group",
    group: "G",
    stadiumName: "Lumen Field",
    city: "Seattle",
    isNYNJ: false
  }),
  makeMatch({
    id: "g-6",
    homeCountry: "new-zealand",
    awayCountry: "belgium",
    startsAt: "2026-06-26T23:00:00-04:00",
    stage: "group",
    group: "G",
    stadiumName: "BC Place",
    city: "Vancouver",
    isNYNJ: false
  }),

  // Group H
  makeMatch({
    id: "h-1",
    homeCountry: "spain",
    awayCountry: "cabo-verde", // slug: verify
    startsAt: "2026-06-15T12:00:00-04:00",
    stage: "group",
    group: "H",
    stadiumName: "Mercedes-Benz Stadium",
    city: "Atlanta",
    isNYNJ: false
  }),
  makeMatch({
    id: "h-2",
    homeCountry: "saudi-arabia",
    awayCountry: "uruguay",
    startsAt: "2026-06-15T18:00:00-04:00",
    stage: "group",
    group: "H",
    stadiumName: "Hard Rock Stadium",
    city: "Miami Gardens",
    isNYNJ: false
  }),
  makeMatch({
    id: "h-3",
    homeCountry: "spain",
    awayCountry: "saudi-arabia",
    startsAt: "2026-06-21T12:00:00-04:00",
    stage: "group",
    group: "H",
    stadiumName: "Mercedes-Benz Stadium",
    city: "Atlanta",
    isNYNJ: false
  }),
  makeMatch({
    id: "h-4",
    homeCountry: "uruguay",
    awayCountry: "cabo-verde", // slug: verify
    startsAt: "2026-06-21T18:00:00-04:00",
    stage: "group",
    group: "H",
    stadiumName: "Hard Rock Stadium",
    city: "Miami Gardens",
    isNYNJ: false
  }),
  makeMatch({
    id: "h-5",
    homeCountry: "cabo-verde", // slug: verify
    awayCountry: "saudi-arabia",
    startsAt: "2026-06-26T20:00:00-04:00",
    stage: "group",
    group: "H",
    stadiumName: "NRG Stadium",
    city: "Houston",
    isNYNJ: false
  }),
  makeMatch({
    id: "h-6",
    homeCountry: "uruguay",
    awayCountry: "spain",
    startsAt: "2026-06-26T20:00:00-04:00",
    stage: "group",
    group: "H",
    stadiumName: "Estadio Akron",
    city: "Zapopan",
    isNYNJ: false
  }),

  // Group I
  makeMatch({
    id: "i-1",
    homeCountry: "france",
    awayCountry: "senegal",
    startsAt: "2026-06-16T15:00:00-04:00",
    stage: "group",
    group: "I",
    stadiumName: "MetLife Stadium",
    city: "East Rutherford",
    isNYNJ: true
  }),
  makeMatch({
    id: "i-2",
    homeCountry: "iraq",
    awayCountry: "norway",
    startsAt: "2026-06-16T18:00:00-04:00",
    stage: "group",
    group: "I",
    stadiumName: "Gillette Stadium",
    city: "Foxborough",
    isNYNJ: false
  }),
  makeMatch({
    id: "i-3",
    homeCountry: "france",
    awayCountry: "iraq",
    startsAt: "2026-06-22T17:00:00-04:00",
    stage: "group",
    group: "I",
    stadiumName: "Lincoln Financial Field",
    city: "Philadelphia",
    isNYNJ: false
  }),
  makeMatch({
    id: "i-4",
    homeCountry: "norway",
    awayCountry: "senegal",
    startsAt: "2026-06-22T20:00:00-04:00",
    stage: "group",
    group: "I",
    stadiumName: "MetLife Stadium",
    city: "East Rutherford",
    isNYNJ: true
  }),
  makeMatch({
    id: "i-5",
    homeCountry: "norway",
    awayCountry: "france",
    startsAt: "2026-06-26T15:00:00-04:00",
    stage: "group",
    group: "I",
    stadiumName: "Gillette Stadium",
    city: "Foxborough",
    isNYNJ: false
  }),
  makeMatch({
    id: "i-6",
    homeCountry: "senegal",
    awayCountry: "iraq",
    startsAt: "2026-06-26T15:00:00-04:00",
    stage: "group",
    group: "I",
    stadiumName: "BMO Field",
    city: "Toronto",
    isNYNJ: false
  }),

  // Group J
  makeMatch({
    id: "j-1",
    homeCountry: "argentina",
    awayCountry: "algeria",
    startsAt: "2026-06-16T21:00:00-04:00",
    stage: "group",
    group: "J",
    stadiumName: "Arrowhead Stadium",
    city: "Kansas City",
    isNYNJ: false
  }),
  makeMatch({
    id: "j-2",
    homeCountry: "austria",
    awayCountry: "jordan",
    startsAt: "2026-06-17T00:00:00-04:00",
    stage: "group",
    group: "J",
    stadiumName: "Levi's Stadium",
    city: "Santa Clara",
    isNYNJ: false
  }),
  makeMatch({
    id: "j-3",
    homeCountry: "argentina",
    awayCountry: "austria",
    startsAt: "2026-06-22T13:00:00-04:00",
    stage: "group",
    group: "J",
    stadiumName: "AT&T Stadium",
    city: "Arlington",
    isNYNJ: false
  }),
  makeMatch({
    id: "j-4",
    homeCountry: "jordan",
    awayCountry: "algeria",
    startsAt: "2026-06-22T23:00:00-04:00",
    stage: "group",
    group: "J",
    stadiumName: "Levi's Stadium",
    city: "Santa Clara",
    isNYNJ: false
  }),
  makeMatch({
    id: "j-5",
    homeCountry: "algeria",
    awayCountry: "austria",
    startsAt: "2026-06-27T22:00:00-04:00",
    stage: "group",
    group: "J",
    stadiumName: "Arrowhead Stadium",
    city: "Kansas City",
    isNYNJ: false
  }),
  makeMatch({
    id: "j-6",
    homeCountry: "jordan",
    awayCountry: "argentina",
    startsAt: "2026-06-27T22:00:00-04:00",
    stage: "group",
    group: "J",
    stadiumName: "AT&T Stadium",
    city: "Arlington",
    isNYNJ: false
  }),

  // Group K
  makeMatch({
    id: "k-1",
    homeCountry: "portugal",
    awayCountry: "congo-dr", // slug: verify
    startsAt: "2026-06-17T13:00:00-04:00",
    stage: "group",
    group: "K",
    stadiumName: "NRG Stadium",
    city: "Houston",
    isNYNJ: false
  }),
  makeMatch({
    id: "k-2",
    homeCountry: "uzbekistan",
    awayCountry: "colombia",
    startsAt: "2026-06-17T22:00:00-04:00",
    stage: "group",
    group: "K",
    stadiumName: "Estadio Azteca",
    city: "Mexico City",
    isNYNJ: false
  }),
  makeMatch({
    id: "k-3",
    homeCountry: "portugal",
    awayCountry: "uzbekistan",
    startsAt: "2026-06-23T13:00:00-04:00",
    stage: "group",
    group: "K",
    stadiumName: "NRG Stadium",
    city: "Houston",
    isNYNJ: false
  }),
  makeMatch({
    id: "k-4",
    homeCountry: "colombia",
    awayCountry: "congo-dr", // slug: verify
    startsAt: "2026-06-23T22:00:00-04:00",
    stage: "group",
    group: "K",
    stadiumName: "Estadio Akron",
    city: "Zapopan",
    isNYNJ: false
  }),
  makeMatch({
    id: "k-5",
    homeCountry: "colombia",
    awayCountry: "portugal",
    startsAt: "2026-06-27T19:30:00-04:00",
    stage: "group",
    group: "K",
    stadiumName: "Hard Rock Stadium",
    city: "Miami Gardens",
    isNYNJ: false
  }),
  makeMatch({
    id: "k-6",
    homeCountry: "congo-dr", // slug: verify
    awayCountry: "uzbekistan",
    startsAt: "2026-06-27T19:30:00-04:00",
    stage: "group",
    group: "K",
    stadiumName: "Mercedes-Benz Stadium",
    city: "Atlanta",
    isNYNJ: false
  }),

  // Group L
  makeMatch({
    id: "l-1",
    homeCountry: "england",
    awayCountry: "croatia",
    startsAt: "2026-06-17T16:00:00-04:00",
    stage: "group",
    group: "L",
    stadiumName: "AT&T Stadium",
    city: "Arlington",
    isNYNJ: false
  }),
  makeMatch({
    id: "l-2",
    homeCountry: "ghana",
    awayCountry: "panama",
    startsAt: "2026-06-17T19:00:00-04:00",
    stage: "group",
    group: "L",
    stadiumName: "BMO Field",
    city: "Toronto",
    isNYNJ: false
  }),
  makeMatch({
    id: "l-3",
    homeCountry: "england",
    awayCountry: "ghana",
    startsAt: "2026-06-23T16:00:00-04:00",
    stage: "group",
    group: "L",
    stadiumName: "Gillette Stadium",
    city: "Foxborough",
    isNYNJ: false
  }),
  makeMatch({
    id: "l-4",
    homeCountry: "panama",
    awayCountry: "croatia",
    startsAt: "2026-06-23T19:00:00-04:00",
    stage: "group",
    group: "L",
    stadiumName: "BMO Field",
    city: "Toronto",
    isNYNJ: false
  }),
  makeMatch({
    id: "l-5",
    homeCountry: "panama",
    awayCountry: "england",
    startsAt: "2026-06-27T17:00:00-04:00",
    stage: "group",
    group: "L",
    stadiumName: "MetLife Stadium",
    city: "East Rutherford",
    isNYNJ: true
  }),
  makeMatch({
    id: "l-6",
    homeCountry: "croatia",
    awayCountry: "ghana",
    startsAt: "2026-06-27T17:00:00-04:00",
    stage: "group",
    group: "L",
    stadiumName: "Lincoln Financial Field",
    city: "Philadelphia",
    isNYNJ: false
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
