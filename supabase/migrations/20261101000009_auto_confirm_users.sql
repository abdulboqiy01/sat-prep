-- Migration 9: Auto Confirm Auth Users
-- Automatically sets email_confirmed_at upon signup so students can immediately start without email verification.

CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, NOW());
  END IF;
  IF NEW.confirmed_at IS NULL THEN
    NEW.confirmed_at = COALESCE(NEW.confirmed_at, NOW());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;

CREATE TRIGGER on_auth_user_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_user();

