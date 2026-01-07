-- Update RLS policies to allow admins to see all data

-- Register Shifts - Admin access
DROP POLICY IF EXISTS "Users can view their own shifts" ON public.register_shifts;
CREATE POLICY "Users can view shifts" 
ON public.register_shifts 
FOR SELECT 
USING (
  operator_id = auth.uid() 
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'supervisor')
);

DROP POLICY IF EXISTS "Users can insert their own shifts" ON public.register_shifts;
CREATE POLICY "Users can insert shifts" 
ON public.register_shifts 
FOR INSERT 
WITH CHECK (
  operator_id = auth.uid() 
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'supervisor')
);

DROP POLICY IF EXISTS "Users can update their own shifts" ON public.register_shifts;
CREATE POLICY "Users can update shifts" 
ON public.register_shifts 
FOR UPDATE 
USING (
  operator_id = auth.uid() 
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'supervisor')
);

-- Cash Registers - Admin access
DROP POLICY IF EXISTS "Users can view registers" ON public.cash_registers;
CREATE POLICY "Users can view registers" 
ON public.cash_registers 
FOR SELECT 
USING (
  operator_id = auth.uid() 
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'supervisor')
);

DROP POLICY IF EXISTS "Users can insert registers" ON public.cash_registers;
CREATE POLICY "Users can insert registers" 
ON public.cash_registers 
FOR INSERT 
WITH CHECK (
  operator_id = auth.uid() 
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'supervisor')
);

DROP POLICY IF EXISTS "Users can update registers" ON public.cash_registers;
CREATE POLICY "Users can update registers" 
ON public.cash_registers 
FOR UPDATE 
USING (
  operator_id = auth.uid() 
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'supervisor')
);

-- Sales - Admin access
DROP POLICY IF EXISTS "Users can view their own sales" ON public.sales;
DROP POLICY IF EXISTS "Users can view sales" ON public.sales;
CREATE POLICY "Users can view sales" 
ON public.sales 
FOR SELECT 
USING (
  operator_id = auth.uid() 
  OR seller_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'supervisor')
);

-- Commissions - Admin access (sellers see their own, admins see all)
DROP POLICY IF EXISTS "Users can view their own commissions" ON public.commissions;
DROP POLICY IF EXISTS "Users can view commissions" ON public.commissions;
CREATE POLICY "Users can view commissions" 
ON public.commissions 
FOR SELECT 
USING (
  seller_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'supervisor')
);

DROP POLICY IF EXISTS "System can insert commissions" ON public.commissions;
CREATE POLICY "System can insert commissions" 
ON public.commissions 
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update commissions" ON public.commissions;
CREATE POLICY "Admins can update commissions" 
ON public.commissions 
FOR UPDATE 
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'supervisor')
);

-- Cash Movements - Admin access
DROP POLICY IF EXISTS "Users can view movements" ON public.cash_movements;
CREATE POLICY "Users can view movements" 
ON public.cash_movements 
FOR SELECT 
USING (
  operator_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'supervisor')
);

-- Profiles - Everyone can view, but only owner/admin can update
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
CREATE POLICY "Users can view profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update profile" 
ON public.profiles 
FOR UPDATE 
USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);