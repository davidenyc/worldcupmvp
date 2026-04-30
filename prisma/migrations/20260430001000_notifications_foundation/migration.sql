-- AlterTable
ALTER TABLE "Profile"
ADD COLUMN "notificationPrefs" JSONB NOT NULL DEFAULT '{"channels":{"push":true,"email":true,"in_app":true},"perKind":{"kickoff_1h":{"push":true,"email":false},"kickoff_30m":{"push":true,"email":false},"match_day_digest":{"email":true,"push":false},"promo_expiring":{"push":true,"email":true},"friend_request_received":{"push":true,"email":true},"watch_party_invite":{"push":true,"email":true},"watch_party_rsvp":{"push":true,"email":false},"new_promo_at_saved":{"push":true,"email":false}}}';

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "profileId" UUID NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "channels" TEXT[],
    "sentAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "profileId" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT,
    "authKey" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_profileId_createdAt_idx" ON "Notification"("profileId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Notification_profileId_readAt_idx" ON "Notification"("profileId", "readAt");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_profileId_endpoint_key" ON "PushSubscription"("profileId", "endpoint");

-- CreateIndex
CREATE INDEX "PushSubscription_profileId_idx" ON "PushSubscription"("profileId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
