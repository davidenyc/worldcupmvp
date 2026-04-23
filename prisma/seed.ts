import { PrismaClient } from "@prisma/client";

import * as demoData from "../lib/data/demo";

const {
  demoBoroughs,
  demoCountries,
  demoImportJobs,
  demoMatches,
  demoNeighborhoods,
  demoSubmissions,
  demoVenues
} = demoData;

const prisma = new PrismaClient();

async function main() {
  await prisma.venueSourceRecord.deleteMany();
  await prisma.venueMatchAssociation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.reservationOption.deleteMany();
  await prisma.match.deleteMany();
  await prisma.venueCountryTag.deleteMany();
  await prisma.venueType.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.neighborhood.deleteMany();
  await prisma.borough.deleteMany();
  await prisma.country.deleteMany();
  await prisma.importJob.deleteMany();

  for (const borough of demoBoroughs) {
    await prisma.borough.create({
      data: {
        key: borough.key,
        label: borough.label,
        centerLat: borough.centerLat,
        centerLng: borough.centerLng
      }
    });
  }

  const boroughs = await prisma.borough.findMany();
  const boroughMap = new Map(boroughs.map((borough) => [borough.key, borough.id]));

  for (const neighborhood of demoNeighborhoods) {
    await prisma.neighborhood.create({
      data: {
        id: neighborhood.id,
        name: neighborhood.name,
        boroughId: boroughMap.get(neighborhood.borough)!,
        lat: neighborhood.lat,
        lng: neighborhood.lng
      }
    });
  }

  for (const country of demoCountries) {
    await prisma.country.create({
      data: {
        name: country.name,
        slug: country.slug,
        fifaCode: country.fifaCode,
        iso2: country.iso2,
        continent: country.continent,
        confederation: country.confederation,
        flagAsset: country.flagAsset,
        flagEmoji: country.flagEmoji,
        primaryColors: [...country.primaryColors],
        supporterKeywords: country.supporterKeywords,
        supportersLabel: country.supportersLabel,
        featured: country.featured
      }
    });
  }

  const countryMap = new Map((await prisma.country.findMany()).map((country) => [country.slug, country.id]));

  for (const venue of demoVenues) {
    const created = await prisma.venue.create({
      data: {
        slug: venue.slug,
        name: venue.name,
        description: venue.description,
        address: venue.address,
        city: venue.city,
        state: venue.state,
        postalCode: venue.postalCode,
        lat: venue.lat,
        lng: venue.lng,
        boroughId: boroughMap.get(venue.borough),
        neighborhoodId: demoNeighborhoods.find((item) => item.name === venue.neighborhood)?.id,
        phone: venue.phone,
        website: venue.website,
        instagramUrl: venue.instagramUrl,
        cuisineTags: venue.cuisineTags,
        atmosphereTags: venue.atmosphereTags,
        likelySupporterCountry: venue.likelySupporterCountry ?? venue.associatedCountries[0] ?? "",
        showsSoccer: venue.showsSoccer,
        openNow: venue.openNow,
        numberOfScreens: venue.numberOfScreens,
        hasProjector: venue.hasProjector,
        hasOutdoorViewing: venue.hasOutdoorViewing,
        familyFriendly: venue.familyFriendly,
        standingRoomFriendly: venue.standingRoomFriendly,
        privateEventsAvailable: venue.privateEventsAvailable,
        goodForGroups: venue.goodForGroups,
        acceptsReservations: venue.acceptsReservations,
        reservationType: venue.reservationType,
        reservationUrl: venue.reservationUrl,
        reservationPhone: venue.reservationPhone,
        approximateCapacity: venue.approximateCapacity,
        capacityBucket: venue.capacityBucket,
        capacityConfidence: venue.capacityConfidence,
        priceLevel: venue.priceLevel,
        rating: venue.rating,
        reviewCount: venue.reviewCount,
        sourceType: venue.sourceType,
        sourceConfidence: venue.sourceConfidence,
        verificationStatus: venue.verificationStatus,
        isFeatured: venue.isFeatured,
        isOfficialFanHub: venue.isOfficialFanHub,
        gameDayScore: venue.gameDayScore,
        fanLikelihoodScore: venue.fanLikelihoodScore,
        editorialBoost: venue.editorialBoost,
        editorialNotes: venue.editorialNotes,
        matchdayNotes: venue.matchdayNotes,
        supporterNotes: venue.supporterNotes,
        imageUrls: venue.imageUrls,
        venueTypes: {
          create: venue.venueTypes.map((type) => ({
            key: type,
            label: type.replace(/_/g, " ")
          }))
        },
        countryTags: {
          create: venue.associatedCountries.map((countrySlug) => ({
            countryId: countryMap.get(countrySlug)!,
            strength: 1,
            note: venue.supporterNotes
          }))
        },
        reservationOptions: venue.acceptsReservations
          ? {
              create: [
                {
                  type: venue.reservationType,
                  label: "Primary reservation option",
                  url: venue.reservationUrl,
                  phone: venue.reservationPhone,
                  notes: venue.matchdayNotes,
                  isPrimary: true
                }
              ]
            }
          : undefined,
        reviews: venue.rating
          ? {
              create: [
                {
                  sourceName: "demo-editorial-rating",
                  rating: venue.rating,
                  reviewCount: venue.reviewCount,
                  snippet: venue.editorialNotes,
                  confidence: venue.sourceConfidence
                }
              ]
            }
          : undefined,
        sourceRecords: {
          create: [
            {
              sourceName: venue.sourceName,
              sourceType: venue.sourceType,
              sourceExternalId: venue.sourceExternalId,
              sourceConfidence: venue.sourceConfidence,
              attributionLabel: "Demo/imported/editorial source"
            }
          ]
        }
      }
    });

    if (venue.isOfficialFanHub && demoMatches.length > 0) {
      // Linked after matches are created.
      void created;
    }
  }

  const venueMap = new Map((await prisma.venue.findMany()).map((venue) => [venue.slug, venue.id]));

  for (const match of demoMatches) {
    await prisma.match.create({
      data: {
        slug: `${match.homeCountry}-${match.awayCountry}`.toLowerCase().replace(/\s+/g, "-"),
        competition: match.competition,
        startsAt: new Date(match.startsAt),
        note: match.note,
        homeCountryId: countryMap.get(match.homeCountry.toLowerCase().replace(/\s+/g, "-"))!,
        awayCountryId: countryMap.get(match.awayCountry.toLowerCase().replace(/\s+/g, "-"))!
      }
    });
  }

  const matches = await prisma.match.findMany();

  for (const venue of demoVenues.filter((item) => item.isOfficialFanHub).slice(0, matches.length)) {
    const match = matches.find((item) => item.slug.includes(venue.associatedCountries[0]));
    const venueId = venueMap.get(venue.slug);
    if (!match || !venueId) continue;

    await prisma.venueMatchAssociation.create({
      data: {
        venueId,
        matchId: match.id,
        featured: true,
        note: venue.matchdayNotes
      }
    });
  }

  for (const submission of demoSubmissions) {
    await prisma.submission.create({
      data: {
        name: submission.name,
        address: submission.address,
        borough: submission.borough,
        neighborhood: submission.neighborhood,
        website: submission.website,
        instagram: submission.instagram,
        countryId: countryMap.get(submission.countryAssociation.toLowerCase().replace(/\s+/g, "-")),
        showsSoccer: submission.showsSoccer,
        acceptsReservations: submission.acceptsReservations,
        approximateCapacity: submission.approximateCapacity,
        description: submission.description,
        status: submission.status,
        sourceConfidence: submission.sourceConfidence
      }
    });
  }

  for (const job of demoImportJobs) {
    await prisma.importJob.create({
      data: {
        id: job.id,
        sourceName: job.sourceName,
        fileName: job.fileName,
        status: job.status,
        rowsProcessed: job.rowsProcessed,
        createdAt: new Date(job.createdAt)
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
