-- Create or replace the trigger function to handle new user creation
-- This allows the first user to become admin automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
  user_role app_role;
BEGIN
  -- Check how many users exist
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- Get the role from metadata, default to operator
  user_role := COALESCE((new.raw_user_meta_data ->> 'role')::app_role, 'operator');
  
  -- If this is the first user, make them admin regardless of role choice
  IF user_count = 0 THEN
    user_role := 'admin';
  END IF;
  
  -- Insert profile
  INSERT INTO public.profiles (user_id, name, code)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'name', 'Usuário'),
    COALESCE(new.raw_user_meta_data ->> 'code', 'USR001')
  );
  
  -- Insert user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, user_role);
  
  RETURN new;
END;
$$;

-- Drop and recreate the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();