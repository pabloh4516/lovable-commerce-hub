-- ============================================
-- PROGRAMA DE FIDELIDADE - TABELAS
-- ============================================

-- Tabela de programas de fidelidade
CREATE TABLE public.loyalty_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  points_per_real NUMERIC NOT NULL DEFAULT 1,
  min_points_redeem INTEGER NOT NULL DEFAULT 100,
  points_value NUMERIC NOT NULL DEFAULT 0.01,
  is_active BOOLEAN NOT NULL DEFAULT true,
  store_id UUID REFERENCES public.stores(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de pontos dos clientes
CREATE TABLE public.customer_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.loyalty_programs(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  available_points INTEGER NOT NULL DEFAULT 0,
  redeemed_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(customer_id, program_id)
);

-- Tabela de transações de pontos
CREATE TABLE public.point_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.loyalty_programs(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES public.sales(id),
  type TEXT NOT NULL CHECK (type IN ('earn', 'redeem', 'expire', 'adjustment')),
  points INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  operator_id UUID
);

-- Habilitar RLS
ALTER TABLE public.loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas para loyalty_programs
CREATE POLICY "Admins can manage loyalty programs"
ON public.loyalty_programs FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view loyalty programs"
ON public.loyalty_programs FOR SELECT
USING (is_active = true);

-- Políticas para customer_points
CREATE POLICY "Authenticated users can view customer points"
ON public.customer_points FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage customer points"
ON public.customer_points FOR ALL
USING (true);

-- Políticas para point_transactions
CREATE POLICY "Authenticated users can view point transactions"
ON public.point_transactions FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create point transactions"
ON public.point_transactions FOR INSERT
WITH CHECK (true);

-- Triggers para updated_at
CREATE TRIGGER update_loyalty_programs_updated_at
BEFORE UPDATE ON public.loyalty_programs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_points_updated_at
BEFORE UPDATE ON public.customer_points
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();