-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "fifaCode" TEXT NOT NULL,
    "iso2" TEXT NOT NULL,
    "continent" TEXT NOT NULL,
    "confederation" TEXT NOT NULL,
    "flagAsset" TEXT NOT NULL,
    "flagEmoji" TEXT NOT NULL,
    "primaryColors" TEXT[],
    "supporterKeywords" TEXT[],
    "supportersLabel" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Borough" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "centerLat" DOUBLE PRECISION NOT NULL,
    "centerLng" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Borough_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Neighborhood" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "boroughId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Neighborhood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "boroughId" TEXT,
    "neighborhoodId" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "instagramUrl" TEXT,
    "cuisineTags" TEXT[],
    "atmosphereTags" TEXT[],
    "likelySupporterCountry" TEXT NOT NULL,
    "showsSoccer" BOOLEAN NOT NULL DEFAULT false,
    "openNow" BOOLEAN NOT NULL DEFAULT false,
    "numberOfScreens" INTEGER NOT NULL DEFAULT 0,
    "hasProjector" BOOLEAN NOT NULL DEFAULT false,
    "hasOutdoorViewing" BOOLEAN NOT NULL DEFAULT false,
    "familyFriendly" BOOLEAN NOT NULL DEFAULT false,
    "standingRoomFriendly" BOOLEAN NOT NULL DEFAULT false,
    "privateEventsAvailable" BOOLEAN NOT NULL DEFAULT false,
    "goodForGroups" BOOLEAN NOT NULL DEFAULT false,
    "acceptsReservations" BOOLEAN NOT NULL DEFAULT false,
    "reservationType" TEXT,
    "reservationUrl" TEXT,
    "reservationPhone" TEXT,
    "approximateCapacity" INTEGER,
    "capacityBucket" TEXT,
    "capacityConfidence" TEXT,
    "priceLevel" INTEGER,
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER,
    "sourceType" TEXT NOT NULL,
    "sourceConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "verificationStatus" TEXT NOT NULL DEFAULT 'demo_editorial',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isOfficialFanHub" BOOLEAN NOT NULL DEFAULT false,
    "gameDayScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fanLikelihoodScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "editorialBoost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "editorialNotes" TEXT,
    "matchdayNotes" TEXT,
    "supporterNotes" TEXT,
    "imageUrls" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueType" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,

    CONSTRAINT "VenueType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueCountryTag" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "strength" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VenueCountryTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER,
    "snippet" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationOption" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReservationOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "borough" TEXT NOT NULL,
    "neighborhood" TEXT,
    "website" TEXT,
    "instagram" TEXT,
    "countryId" TEXT,
    "submittedById" TEXT,
    "showsSoccer" BOOLEAN NOT NULL DEFAULT false,
    "acceptsReservations" BOOLEAN NOT NULL DEFAULT false,
    "approximateCapacity" INTEGER,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sourceConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "duplicateOfVenueId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "competition" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "homeCountryId" TEXT NOT NULL,
    "awayCountryId" TEXT NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueMatchAssociation" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,

    CONSTRAINT "VenueMatchAssociation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportJob" (
    "id" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "rowsProcessed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueSourceRecord" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceExternalId" TEXT,
    "sourceConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "attributionLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VenueSourceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_slug_key" ON "Country"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Country_fifaCode_key" ON "Country"("fifaCode");

-- CreateIndex
CREATE UNIQUE INDEX "Borough_key_key" ON "Borough"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Neighborhood_boroughId_name_key" ON "Neighborhood"("boroughId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Venue_slug_key" ON "Venue"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "VenueType_venueId_key_key" ON "VenueType"("venueId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "VenueCountryTag_venueId_countryId_key" ON "VenueCountryTag"("venueId", "countryId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Match_slug_key" ON "Match"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "VenueMatchAssociation_venueId_matchId_key" ON "VenueMatchAssociation"("venueId", "matchId");

-- AddForeignKey
ALTER TABLE "Neighborhood" ADD CONSTRAINT "Neighborhood_boroughId_fkey" FOREIGN KEY ("boroughId") REFERENCES "Borough"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_boroughId_fkey" FOREIGN KEY ("boroughId") REFERENCES "Borough"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_neighborhoodId_fkey" FOREIGN KEY ("neighborhoodId") REFERENCES "Neighborhood"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueType" ADD CONSTRAINT "VenueType_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueCountryTag" ADD CONSTRAINT "VenueCountryTag_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueCountryTag" ADD CONSTRAINT "VenueCountryTag_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationOption" ADD CONSTRAINT "ReservationOption_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_duplicateOfVenueId_fkey" FOREIGN KEY ("duplicateOfVenueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_homeCountryId_fkey" FOREIGN KEY ("homeCountryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_awayCountryId_fkey" FOREIGN KEY ("awayCountryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueMatchAssociation" ADD CONSTRAINT "VenueMatchAssociation_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueMatchAssociation" ADD CONSTRAINT "VenueMatchAssociation_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueSourceRecord" ADD CONSTRAINT "VenueSourceRecord_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
