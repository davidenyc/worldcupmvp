ALTER TABLE public."Notification" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see their own notifications" ON public."Notification";
CREATE POLICY "Users see their own notifications"
  ON public."Notification"
  FOR ALL
  USING (auth.uid() = "profileId")
  WITH CHECK (auth.uid() = "profileId");

ALTER TABLE public."PushSubscription" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage their own push subs" ON public."PushSubscription";
CREATE POLICY "Users manage their own push subs"
  ON public."PushSubscription"
  FOR ALL
  USING (auth.uid() = "profileId")
  WITH CHECK (auth.uid() = "profileId");
