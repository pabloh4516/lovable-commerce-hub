-- Create register_terminals table (physical cash registers)
CREATE TABLE public.register_terminals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  store_id UUID REFERENCES public.stores(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.register_terminals ENABLE ROW LEVEL SECURITY;

-- RLS policies for register_terminals
CREATE POLICY "Authenticated users can view terminals"
  ON public.register_terminals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and supervisors can manage terminals"
  ON public.register_terminals FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'supervisor')
  );

-- Add new columns to cash_registers
ALTER TABLE public.cash_registers 
  ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id),
  ADD COLUMN IF NOT EXISTS terminal_id UUID REFERENCES public.register_terminals(id),
  ADD COLUMN IF NOT EXISTS register_type TEXT NOT NULL DEFAULT 'central' CHECK (register_type IN ('central', 'individual'));

-- Create register_shifts table (operator shifts within a cash register)
CREATE TABLE public.register_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  register_id UUID NOT NULL REFERENCES public.cash_registers(id) ON DELETE CASCADE,
  operator_id UUID NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  starting_cash NUMERIC(12,2) NOT NULL DEFAULT 0,
  ending_cash NUMERIC(12,2),
  sales_count INTEGER DEFAULT 0,
  sales_total NUMERIC(12,2) DEFAULT 0,
  cash_total NUMERIC(12,2) DEFAULT 0,
  pix_total NUMERIC(12,2) DEFAULT 0,
  credit_total NUMERIC(12,2) DEFAULT 0,
  debit_total NUMERIC(12,2) DEFAULT 0,
  fiado_total NUMERIC(12,2) DEFAULT 0,
  withdrawals_total NUMERIC(12,2) DEFAULT 0,
  deposits_total NUMERIC(12,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.register_shifts ENABLE ROW LEVEL SECURITY;

-- RLS policies for register_shifts
CREATE POLICY "Authenticated users can view shifts"
  ON public.register_shifts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their own shifts"
  ON public.register_shifts FOR INSERT
  TO authenticated
  WITH CHECK (operator_id = auth.uid());

CREATE POLICY "Users can update their own shifts"
  ON public.register_shifts FOR UPDATE
  TO authenticated
  USING (operator_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor'));

-- Add current_shift_id to cash_registers
ALTER TABLE public.cash_registers 
  ADD COLUMN IF NOT EXISTS current_shift_id UUID REFERENCES public.register_shifts(id);

-- Add shift_id to sales to track which shift made the sale
ALTER TABLE public.sales 
  ADD COLUMN IF NOT EXISTS shift_id UUID REFERENCES public.register_shifts(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_register_shifts_register_id ON public.register_shifts(register_id);
CREATE INDEX IF NOT EXISTS idx_register_shifts_operator_id ON public.register_shifts(operator_id);
CREATE INDEX IF NOT EXISTS idx_register_shifts_status ON public.register_shifts(status);
CREATE INDEX IF NOT EXISTS idx_sales_shift_id ON public.sales(shift_id);
CREATE INDEX IF NOT EXISTS idx_sales_seller_id ON public.sales(seller_id);

-- Trigger for updated_at on register_terminals
CREATE TRIGGER update_register_terminals_updated_at
  BEFORE UPDATE ON public.register_terminals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();