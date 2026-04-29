CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public."Profile" (
    id,
    "displayName",
    "favoriteCity",
    language,
    "prefersDarkMode",
    "defaultFilters",
    "promoOptIns",
    "createdAt",
    "updatedAt"
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    'nyc',
    'en',
    false,
    '{"soundOn":false,"reservationsPossible":false,"outdoorSeating":false}'::jsonb,
    '{"email":false,"push":false}'::jsonb,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public."ProfileMembership" ("profileId", tier)
  VALUES (NEW.id, 'free')
  ON CONFLICT ("profileId") DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
