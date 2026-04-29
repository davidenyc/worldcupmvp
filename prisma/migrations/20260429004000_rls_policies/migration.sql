ALTER TABLE public."Profile" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see and edit their own profile" ON public."Profile";
CREATE POLICY "Users see and edit their own profile"
  ON public."Profile"
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

ALTER TABLE public."ProfileFollowedCountry" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users CRUD their own followed countries" ON public."ProfileFollowedCountry";
CREATE POLICY "Users CRUD their own followed countries"
  ON public."ProfileFollowedCountry"
  FOR ALL
  USING (auth.uid() = "profileId")
  WITH CHECK (auth.uid() = "profileId");

ALTER TABLE public."ProfileFavoriteVenue" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users CRUD their own favorites" ON public."ProfileFavoriteVenue";
CREATE POLICY "Users CRUD their own favorites"
  ON public."ProfileFavoriteVenue"
  FOR ALL
  USING (auth.uid() = "profileId")
  WITH CHECK (auth.uid() = "profileId");

ALTER TABLE public."ProfileWatchedMatch" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users CRUD their own watched matches" ON public."ProfileWatchedMatch";
CREATE POLICY "Users CRUD their own watched matches"
  ON public."ProfileWatchedMatch"
  FOR ALL
  USING (auth.uid() = "profileId")
  WITH CHECK (auth.uid() = "profileId");

ALTER TABLE public."ProfileMembership" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users CRUD their own membership" ON public."ProfileMembership";
CREATE POLICY "Users CRUD their own membership"
  ON public."ProfileMembership"
  FOR ALL
  USING (auth.uid() = "profileId")
  WITH CHECK (auth.uid() = "profileId");

ALTER TABLE public."ActivityEvent" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users CRUD their own activity events" ON public."ActivityEvent";
CREATE POLICY "Users CRUD their own activity events"
  ON public."ActivityEvent"
  FOR ALL
  USING (auth.uid() = "profileId")
  WITH CHECK (auth.uid() = "profileId");

ALTER TABLE public."Country" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read Country" ON public."Country";
CREATE POLICY "Public read Country"
  ON public."Country"
  FOR SELECT
  USING (true);

ALTER TABLE public."Borough" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read Borough" ON public."Borough";
CREATE POLICY "Public read Borough"
  ON public."Borough"
  FOR SELECT
  USING (true);

ALTER TABLE public."Neighborhood" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read Neighborhood" ON public."Neighborhood";
CREATE POLICY "Public read Neighborhood"
  ON public."Neighborhood"
  FOR SELECT
  USING (true);

ALTER TABLE public."Venue" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read Venue" ON public."Venue";
CREATE POLICY "Public read Venue"
  ON public."Venue"
  FOR SELECT
  USING (true);

ALTER TABLE public."VenueType" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read VenueType" ON public."VenueType";
CREATE POLICY "Public read VenueType"
  ON public."VenueType"
  FOR SELECT
  USING (true);

ALTER TABLE public."VenueCountryTag" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read VenueCountryTag" ON public."VenueCountryTag";
CREATE POLICY "Public read VenueCountryTag"
  ON public."VenueCountryTag"
  FOR SELECT
  USING (true);

ALTER TABLE public."Review" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read Review" ON public."Review";
CREATE POLICY "Public read Review"
  ON public."Review"
  FOR SELECT
  USING (true);

ALTER TABLE public."ReservationOption" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read ReservationOption" ON public."ReservationOption";
CREATE POLICY "Public read ReservationOption"
  ON public."ReservationOption"
  FOR SELECT
  USING (true);

ALTER TABLE public."Match" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read Match" ON public."Match";
CREATE POLICY "Public read Match"
  ON public."Match"
  FOR SELECT
  USING (true);

ALTER TABLE public."VenueMatchAssociation" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read VenueMatchAssociation" ON public."VenueMatchAssociation";
CREATE POLICY "Public read VenueMatchAssociation"
  ON public."VenueMatchAssociation"
  FOR SELECT
  USING (true);
