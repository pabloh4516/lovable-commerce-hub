-- ================================================
-- MÓDULO 1: CADASTROS COMPLETOS
-- ================================================

-- Tabela de empresa (configurações da loja principal)
ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS fantasy_name text,
ADD COLUMN IF NOT EXISTS ie text,
ADD COLUMN IF NOT EXISTS im text,
ADD COLUMN IF NOT EXISTS cep text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS neighborhood text,
ADD COLUMN IF NOT EXISTS number text,
ADD COLUMN IF NOT EXISTS complement text;

-- Fornecedores
CREATE TABLE IF NOT EXISTS public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  fantasy_name text,
  cnpj text,
  cpf text,
  ie text,
  im text,
  phone text,
  phone2 text,
  email text,
  website text,
  address text,
  number text,
  complement text,
  neighborhood text,
  city text,
  state text,
  cep text,
  contact_name text,
  contact_phone text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view suppliers" ON public.suppliers
  FOR SELECT USING (true);

CREATE POLICY "Admins and supervisors can manage suppliers" ON public.suppliers
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- Subgrupos de produtos
CREATE TABLE IF NOT EXISTS public.subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view subcategories" ON public.subcategories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage subcategories" ON public.subcategories
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Adicionar campos extras em produtos
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS subcategory_id uuid REFERENCES public.subcategories(id),
ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES public.suppliers(id),
ADD COLUMN IF NOT EXISTS brand text,
ADD COLUMN IF NOT EXISTS model text,
ADD COLUMN IF NOT EXISTS reference text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS ncm text,
ADD COLUMN IF NOT EXISTS cest text,
ADD COLUMN IF NOT EXISTS cfop text,
ADD COLUMN IF NOT EXISTS origin text DEFAULT '0',
ADD COLUMN IF NOT EXISTS expiry_date date,
ADD COLUMN IF NOT EXISTS manufacture_date date,
ADD COLUMN IF NOT EXISTS warranty_days integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_wholesale numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_wholesale_qty integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS commission_percent numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS image_url text;

-- Grade/Variações de produtos
CREATE TABLE IF NOT EXISTS public.product_variations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  sku text,
  barcode text,
  size text,
  color text,
  material text,
  weight numeric,
  stock numeric DEFAULT 0,
  min_stock numeric DEFAULT 0,
  price numeric,
  cost numeric,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view variations" ON public.product_variations
  FOR SELECT USING (true);

CREATE POLICY "Admins and supervisors can manage variations" ON public.product_variations
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- Formas de pagamento com taxas
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'other', -- cash, credit, debit, pix, boleto, check, fiado, other
  fee_percent numeric DEFAULT 0,
  fee_fixed numeric DEFAULT 0,
  installments_max integer DEFAULT 1,
  days_to_receive integer DEFAULT 0,
  is_active boolean DEFAULT true,
  requires_customer boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view payment methods" ON public.payment_methods
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage payment methods" ON public.payment_methods
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Inserir formas de pagamento padrão
INSERT INTO public.payment_methods (code, name, type, sort_order) VALUES
  ('cash', 'Dinheiro', 'cash', 1),
  ('pix', 'PIX', 'pix', 2),
  ('credit', 'Cartão de Crédito', 'credit', 3),
  ('debit', 'Cartão de Débito', 'debit', 4),
  ('fiado', 'Fiado/Crediário', 'fiado', 5),
  ('check', 'Cheque', 'check', 6),
  ('boleto', 'Boleto', 'boleto', 7)
ON CONFLICT (code) DO NOTHING;

-- Adicionar campos extras em clientes
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS fantasy_name text,
ADD COLUMN IF NOT EXISTS rg text,
ADD COLUMN IF NOT EXISTS cnpj text,
ADD COLUMN IF NOT EXISTS ie text,
ADD COLUMN IF NOT EXISTS birth_date date,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS profession text,
ADD COLUMN IF NOT EXISTS workplace text,
ADD COLUMN IF NOT EXISTS income numeric,
ADD COLUMN IF NOT EXISTS number text,
ADD COLUMN IF NOT EXISTS complement text,
ADD COLUMN IF NOT EXISTS neighborhood text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS cep text,
ADD COLUMN IF NOT EXISTS phone2 text,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS block_reason text;

-- Adicionar campos extras em profiles (vendedores/usuários)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS commission_percent numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_goal numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_goal numeric DEFAULT 0;

-- ================================================
-- MÓDULO 2: PDV AVANÇADO
-- ================================================

-- Orçamentos e pré-vendas
CREATE TABLE IF NOT EXISTS public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number serial,
  customer_id uuid REFERENCES public.customers(id),
  seller_id uuid NOT NULL,
  store_id uuid REFERENCES public.stores(id),
  subtotal numeric DEFAULT 0,
  discount numeric DEFAULT 0,
  discount_type text DEFAULT 'value',
  total numeric DEFAULT 0,
  status text DEFAULT 'pending', -- pending, approved, converted, cancelled, expired
  valid_until date,
  notes text,
  converted_sale_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view quotes" ON public.quotes
  FOR SELECT USING (seller_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

CREATE POLICY "Users can create quotes" ON public.quotes
  FOR INSERT WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Users can update own quotes" ON public.quotes
  FOR UPDATE USING (seller_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- Itens do orçamento
CREATE TABLE IF NOT EXISTS public.quote_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) NOT NULL,
  variation_id uuid REFERENCES public.product_variations(id),
  quantity numeric DEFAULT 1,
  unit_price numeric NOT NULL,
  discount numeric DEFAULT 0,
  discount_type text DEFAULT 'value',
  subtotal numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view quote items" ON public.quote_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM quotes WHERE quotes.id = quote_items.quote_id AND (quotes.seller_id = auth.uid() OR has_role(auth.uid(), 'admin'))));

CREATE POLICY "Users can manage quote items" ON public.quote_items
  FOR ALL USING (EXISTS (SELECT 1 FROM quotes WHERE quotes.id = quote_items.quote_id AND quotes.seller_id = auth.uid()));

-- Vale-compras / Créditos
CREATE TABLE IF NOT EXISTS public.store_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  customer_id uuid REFERENCES public.customers(id),
  original_amount numeric NOT NULL,
  current_amount numeric NOT NULL,
  source text NOT NULL, -- return, promotion, manual
  source_id uuid,
  expires_at date,
  is_active boolean DEFAULT true,
  notes text,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.store_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view store credits" ON public.store_credits
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage store credits" ON public.store_credits
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- Devoluções
CREATE TABLE IF NOT EXISTS public.returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number serial,
  sale_id uuid REFERENCES public.sales(id),
  customer_id uuid REFERENCES public.customers(id),
  operator_id uuid NOT NULL,
  supervisor_id uuid,
  total numeric NOT NULL,
  refund_method text NOT NULL, -- cash, credit_card, store_credit, exchange
  store_credit_id uuid REFERENCES public.store_credits(id),
  reason text NOT NULL,
  notes text,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view returns" ON public.returns
  FOR SELECT USING (operator_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create returns" ON public.returns
  FOR INSERT WITH CHECK (operator_id = auth.uid());

-- Itens da devolução
CREATE TABLE IF NOT EXISTS public.return_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id uuid REFERENCES public.returns(id) ON DELETE CASCADE NOT NULL,
  sale_item_id uuid REFERENCES public.sale_items(id),
  product_id uuid REFERENCES public.products(id) NOT NULL,
  quantity numeric NOT NULL,
  unit_price numeric NOT NULL,
  subtotal numeric NOT NULL,
  return_to_stock boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.return_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view return items" ON public.return_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM returns WHERE returns.id = return_items.return_id AND (returns.operator_id = auth.uid() OR has_role(auth.uid(), 'admin'))));

CREATE POLICY "Users can manage return items" ON public.return_items
  FOR ALL USING (EXISTS (SELECT 1 FROM returns WHERE returns.id = return_items.return_id AND returns.operator_id = auth.uid()));

-- Adicionar campos extras em vendas
ALTER TABLE public.sales
ADD COLUMN IF NOT EXISTS seller_id uuid,
ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id),
ADD COLUMN IF NOT EXISTS quote_id uuid REFERENCES public.quotes(id),
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS delivery_address text,
ADD COLUMN IF NOT EXISTS delivery_date date,
ADD COLUMN IF NOT EXISTS commission_amount numeric DEFAULT 0;

-- Adicionar campos extras em sale_items
ALTER TABLE public.sale_items
ADD COLUMN IF NOT EXISTS variation_id uuid REFERENCES public.product_variations(id),
ADD COLUMN IF NOT EXISTS commission_percent numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS cost numeric DEFAULT 0;

-- Adicionar campos extras em payments
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS payment_method_id uuid REFERENCES public.payment_methods(id),
ADD COLUMN IF NOT EXISTS installments integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS fee_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_amount numeric,
ADD COLUMN IF NOT EXISTS due_date date,
ADD COLUMN IF NOT EXISTS paid_at timestamptz,
ADD COLUMN IF NOT EXISTS notes text;

-- ================================================
-- MÓDULO 3: COMPRAS
-- ================================================

-- Pedidos de compra
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number serial,
  supplier_id uuid REFERENCES public.suppliers(id) NOT NULL,
  store_id uuid REFERENCES public.stores(id),
  operator_id uuid NOT NULL,
  subtotal numeric DEFAULT 0,
  discount numeric DEFAULT 0,
  shipping numeric DEFAULT 0,
  other_costs numeric DEFAULT 0,
  total numeric DEFAULT 0,
  status text DEFAULT 'pending', -- pending, approved, partial, received, cancelled
  invoice_number text,
  invoice_key text,
  invoice_date date,
  expected_date date,
  received_date date,
  payment_method text,
  payment_condition text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view purchase orders" ON public.purchase_orders
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

CREATE POLICY "Admins can manage purchase orders" ON public.purchase_orders
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- Itens do pedido de compra
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id uuid REFERENCES public.purchase_orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) NOT NULL,
  variation_id uuid REFERENCES public.product_variations(id),
  quantity numeric NOT NULL,
  received_quantity numeric DEFAULT 0,
  unit_cost numeric NOT NULL,
  discount numeric DEFAULT 0,
  subtotal numeric NOT NULL,
  batch_number text,
  expiry_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view purchase order items" ON public.purchase_order_items
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

CREATE POLICY "Admins can manage purchase order items" ON public.purchase_order_items
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- ================================================
-- MÓDULO 4: ORDEM DE SERVIÇO
-- ================================================

-- Status de OS
CREATE TYPE service_order_status AS ENUM (
  'received', 'waiting_approval', 'approved', 'in_progress', 
  'waiting_parts', 'completed', 'delivered', 'cancelled'
);

-- Ordens de serviço
CREATE TABLE IF NOT EXISTS public.service_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number serial,
  customer_id uuid REFERENCES public.customers(id) NOT NULL,
  store_id uuid REFERENCES public.stores(id),
  technician_id uuid,
  receptionist_id uuid NOT NULL,
  equipment_type text NOT NULL,
  equipment_brand text,
  equipment_model text,
  equipment_serial text,
  equipment_color text,
  equipment_accessories text,
  equipment_condition text,
  defect_reported text NOT NULL,
  defect_found text,
  solution text,
  technical_report text,
  status service_order_status DEFAULT 'received',
  priority text DEFAULT 'normal', -- low, normal, high, urgent
  estimated_value numeric,
  final_value numeric,
  parts_value numeric DEFAULT 0,
  labor_value numeric DEFAULT 0,
  discount numeric DEFAULT 0,
  warranty_until date,
  estimated_date date,
  completed_date date,
  delivered_date date,
  internal_notes text,
  customer_notes text,
  checklist jsonb,
  images text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view service orders" ON public.service_orders
  FOR SELECT USING (receptionist_id = auth.uid() OR technician_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

CREATE POLICY "Users can create service orders" ON public.service_orders
  FOR INSERT WITH CHECK (receptionist_id = auth.uid());

CREATE POLICY "Users can update service orders" ON public.service_orders
  FOR UPDATE USING (receptionist_id = auth.uid() OR technician_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- Peças/produtos usados na OS
CREATE TABLE IF NOT EXISTS public.service_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_order_id uuid REFERENCES public.service_orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id),
  description text NOT NULL,
  quantity numeric DEFAULT 1,
  unit_price numeric NOT NULL,
  discount numeric DEFAULT 0,
  subtotal numeric NOT NULL,
  type text DEFAULT 'part', -- part, labor, other
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.service_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view service order items" ON public.service_order_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM service_orders WHERE service_orders.id = service_order_items.service_order_id AND (service_orders.technician_id = auth.uid() OR has_role(auth.uid(), 'admin'))));

CREATE POLICY "Users can manage service order items" ON public.service_order_items
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- Histórico/ocorrências da OS
CREATE TABLE IF NOT EXISTS public.service_order_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_order_id uuid REFERENCES public.service_orders(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  action text NOT NULL,
  old_status text,
  new_status text,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.service_order_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view service order history" ON public.service_order_history
  FOR SELECT USING (EXISTS (SELECT 1 FROM service_orders WHERE service_orders.id = service_order_history.service_order_id AND (service_orders.technician_id = auth.uid() OR has_role(auth.uid(), 'admin'))));

CREATE POLICY "Users can create service order history" ON public.service_order_history
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Pagamentos da OS
CREATE TABLE IF NOT EXISTS public.service_order_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_order_id uuid REFERENCES public.service_orders(id) ON DELETE CASCADE NOT NULL,
  payment_method_id uuid REFERENCES public.payment_methods(id),
  method text NOT NULL,
  amount numeric NOT NULL,
  installments integer DEFAULT 1,
  type text DEFAULT 'final', -- advance, partial, final
  notes text,
  operator_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.service_order_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view service order payments" ON public.service_order_payments
  FOR SELECT USING (EXISTS (SELECT 1 FROM service_orders WHERE service_orders.id = service_order_payments.service_order_id AND (service_orders.technician_id = auth.uid() OR has_role(auth.uid(), 'admin'))));

CREATE POLICY "Users can manage service order payments" ON public.service_order_payments
  FOR ALL USING (operator_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- ================================================
-- MÓDULO 5: FINANCEIRO
-- ================================================

-- Categorias de despesas/receitas
CREATE TABLE IF NOT EXISTS public.financial_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL, -- income, expense
  parent_id uuid REFERENCES public.financial_categories(id),
  color text DEFAULT '#6366f1',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view financial categories" ON public.financial_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage financial categories" ON public.financial_categories
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Inserir categorias padrão
INSERT INTO public.financial_categories (name, type) VALUES
  ('Vendas', 'income'),
  ('Serviços', 'income'),
  ('Outras Receitas', 'income'),
  ('Fornecedores', 'expense'),
  ('Salários', 'expense'),
  ('Aluguel', 'expense'),
  ('Água/Luz/Telefone', 'expense'),
  ('Impostos', 'expense'),
  ('Manutenção', 'expense'),
  ('Marketing', 'expense'),
  ('Material de Escritório', 'expense'),
  ('Outras Despesas', 'expense')
ON CONFLICT DO NOTHING;

-- Contas bancárias
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bank_name text,
  bank_code text,
  agency text,
  account_number text,
  account_type text DEFAULT 'checking', -- checking, savings, cash
  initial_balance numeric DEFAULT 0,
  current_balance numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view bank accounts" ON public.bank_accounts
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

CREATE POLICY "Admins can manage bank accounts" ON public.bank_accounts
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Contas a pagar/receber
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number serial,
  type text NOT NULL, -- payable, receivable
  category_id uuid REFERENCES public.financial_categories(id),
  bank_account_id uuid REFERENCES public.bank_accounts(id),
  customer_id uuid REFERENCES public.customers(id),
  supplier_id uuid REFERENCES public.suppliers(id),
  sale_id uuid REFERENCES public.sales(id),
  service_order_id uuid REFERENCES public.service_orders(id),
  purchase_order_id uuid REFERENCES public.purchase_orders(id),
  description text NOT NULL,
  amount numeric NOT NULL,
  paid_amount numeric DEFAULT 0,
  due_date date NOT NULL,
  paid_date date,
  status text DEFAULT 'pending', -- pending, partial, paid, overdue, cancelled
  payment_method text,
  installment_number integer,
  total_installments integer,
  document_number text,
  barcode text,
  notes text,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view financial transactions" ON public.financial_transactions
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

CREATE POLICY "Admins can manage financial transactions" ON public.financial_transactions
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- Movimentações bancárias
CREATE TABLE IF NOT EXISTS public.bank_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id uuid REFERENCES public.bank_accounts(id) NOT NULL,
  financial_transaction_id uuid REFERENCES public.financial_transactions(id),
  type text NOT NULL, -- credit, debit, transfer
  amount numeric NOT NULL,
  balance_after numeric NOT NULL,
  description text,
  reference_type text, -- sale, purchase, expense, transfer, adjustment
  reference_id uuid,
  reconciled boolean DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view bank transactions" ON public.bank_transactions
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

CREATE POLICY "Admins can manage bank transactions" ON public.bank_transactions
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Controle de cheques
CREATE TABLE IF NOT EXISTS public.checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL, -- received, issued
  bank_account_id uuid REFERENCES public.bank_accounts(id),
  customer_id uuid REFERENCES public.customers(id),
  supplier_id uuid REFERENCES public.suppliers(id),
  check_number text NOT NULL,
  bank_name text,
  agency text,
  account text,
  amount numeric NOT NULL,
  issue_date date,
  due_date date NOT NULL,
  compensation_date date,
  status text DEFAULT 'pending', -- pending, compensated, returned, cancelled
  notes text,
  sale_id uuid REFERENCES public.sales(id),
  financial_transaction_id uuid REFERENCES public.financial_transactions(id),
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view checks" ON public.checks
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

CREATE POLICY "Admins can manage checks" ON public.checks
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- Comissões
CREATE TABLE IF NOT EXISTS public.commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  sale_id uuid REFERENCES public.sales(id),
  service_order_id uuid REFERENCES public.service_orders(id),
  product_id uuid REFERENCES public.products(id),
  sale_total numeric NOT NULL,
  commission_percent numeric NOT NULL,
  commission_amount numeric NOT NULL,
  status text DEFAULT 'pending', -- pending, approved, paid
  paid_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own commissions" ON public.commissions
  FOR SELECT USING (seller_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage commissions" ON public.commissions
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- ================================================
-- TRIGGERS E FUNÇÕES
-- ================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Aplicar triggers de updated_at
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['suppliers', 'product_variations', 'quotes', 'store_credits', 
    'purchase_orders', 'service_orders', 'financial_transactions', 'bank_accounts', 'checks']) 
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at()', t);
  END LOOP;
END $$;

-- Habilitar realtime para tabelas importantes
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quotes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.financial_transactions;