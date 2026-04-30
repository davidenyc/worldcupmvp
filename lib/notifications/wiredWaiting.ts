import "server-only";

import { dispatch } from "@/lib/notifications/dispatcher";

// TODO(social-sprint): call this from the server-backed friends request route when incoming requests are persisted.
export async function emitFriendRequestReceivedNotification(input: {
  profileId: string;
  fromName: string;
  fromUserId: string;
}) {
  await dispatch({
    profileId: input.profileId,
    kind: "friend_request_received",
    title: `${input.fromName} wants to watch with you`,
    body: "Open GameDay Map to accept the request and start planning match nights together.",
    payload: {
      fromName: input.fromName,
      fromUserId: input.fromUserId
    },
    href: "/groups"
  });
}

// TODO(social-sprint): call this from the server-backed watch-party invite writer when invites live in Postgres.
export async function emitWatchPartyInviteNotification(input: {
  profileId: string;
  partyName: string;
  hostName: string;
}) {
  await dispatch({
    profileId: input.profileId,
    kind: "watch_party_invite",
    title: `${input.hostName} invited you out`,
    body: `Join ${input.partyName} and lock the match-night plan with your crew.`,
    payload: {
      hostName: input.hostName,
      partyName: input.partyName
    },
    href: "/groups"
  });
}

// TODO(social-sprint): call this from the server-backed RSVP mutation when group attendance moves off the local store.
export async function emitWatchPartyRsvpNotification(input: {
  profileId: string;
  responderName: string;
  partyName: string;
}) {
  await dispatch({
    profileId: input.profileId,
    kind: "watch_party_rsvp",
    title: `${input.responderName} is in`,
    body: `${input.responderName} RSVP'd to ${input.partyName}.`,
    payload: {
      responderName: input.responderName,
      partyName: input.partyName
    },
    href: "/groups"
  });
}

// TODO(social-sprint): call this from the saved-venue promo ingestion path once saved venues and scraped promos are both server-backed.
export async function emitSavedVenuePromoNotification(input: {
  profileId: string;
  venueName: string;
  promoTitle: string;
  href?: string;
}) {
  await dispatch({
    profileId: input.profileId,
    kind: "new_promo_at_saved",
    title: `New offer at ${input.venueName}`,
    body: input.promoTitle,
    payload: {
      venueName: input.venueName,
      promoTitle: input.promoTitle
    },
    href: input.href ?? "/promos"
  });
}

// TODO(stripe-sprint): call this from the Stripe renewal-warning webhook when billing events are live.
export async function emitSubscriptionRenewingNotification(input: {
  profileId: string;
  renewsOn: string;
}) {
  await dispatch({
    profileId: input.profileId,
    kind: "subscription_renewing",
    title: "Your membership renews soon",
    body: `Your plan renews on ${input.renewsOn}. Review it any time in Membership.`,
    payload: {
      renewsOn: input.renewsOn
    },
    href: "/membership"
  });
}
