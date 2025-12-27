-- ============================================
-- FASE 1: INFRAESTRUTURA ENTERPRISE
-- ============================================

-- 1. SISTEMA MULTI-LOJA (Filiais)
-- ============================================

CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  cnpj TEXT,
  ie TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  cep TEXT,
  phone TEXT,
  email TEXT,
  is_matrix BOOLEAN DEFAULT FALSE,
  parent_store_id UUID REFERENCES public.stores(id),
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Produtos por loja (preços e estoque diferenciados)
CREATE TABLE public.store_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL DEFAULT 0,
  cost NUMERIC NOT NULL DEFAULT 0,
  stock NUMERIC NOT NULL DEFAULT 0,
  min_stock NUMERIC NOT NULL DEFAULT 0,
  max_stock NUMERIC,
  location TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, product_id)
);

-- Usuários vinculados a lojas
CREATE TABLE public.store_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  can_transfer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, user_id)
);

-- 2. GESTÃO DE ESTOQUE AVANÇADA
-- ============================================

CREATE TYPE public.stock_movement_type AS ENUM (
  'entrada', 'saida', 'ajuste', 'transferencia_entrada', 
  'transferencia_saida', 'perda', 'venda', 'devolucao', 'inventario'
);

CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id),
  product_id UUID NOT NULL REFERENCES public.products(id),
  type stock_movement_type NOT NULL,
  quantity NUMERIC NOT NULL,
  previous_stock NUMERIC NOT NULL DEFAULT 0,
  new_stock NUMERIC NOT NULL DEFAULT 0,
  unit_cost NUMERIC,
  total_cost NUMERIC,
  reason TEXT,
  reference_type TEXT,
  reference_id UUID,
  batch_number TEXT,
  expiry_date DATE,
  operator_id UUID NOT NULL,
  supervisor_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE public.transfer_status AS ENUM (
  'pending', 'approved', 'in_transit', 'received', 'partial', 'cancelled'
);

CREATE TABLE public.stock_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number SERIAL,
  from_store_id UUID NOT NULL REFERENCES public.stores(id),
  to_store_id UUID NOT NULL REFERENCES public.stores(id),
  status transfer_status DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  shipped_at TIMESTAMPTZ,
  shipped_by UUID,
  received_at TIMESTAMPTZ,
  received_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.stock_transfer_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID NOT NULL REFERENCES public.stock_transfers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  requested_quantity NUMERIC NOT NULL,
  shipped_quantity NUMERIC,
  received_quantity NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SISTEMA DE PROMOÇÕES E OFERTAS
-- ============================================

CREATE TYPE public.promotion_type AS ENUM (
  'percentage', 'fixed', 'buy_x_get_y', 'combo', 'progressive', 'happy_hour'
);

CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  type promotion_type NOT NULL,
  value NUMERIC,
  buy_quantity INTEGER,
  get_quantity INTEGER,
  min_quantity INTEGER,
  min_value NUMERIC,
  max_discount NUMERIC,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  start_time TIME,
  end_time TIME,
  days_of_week INTEGER[],
  applies_to TEXT DEFAULT 'product',
  is_cumulative BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.promotion_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.promotion_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(promotion_id, store_id)
);

-- 4. SISTEMA DE AUDITORIA COMPLETA
-- ============================================

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id),
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  reason TEXT,
  supervisor_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_audit_logs_store ON public.audit_logs(store_id);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX idx_stock_movements_store ON public.stock_movements(store_id);
CREATE INDEX idx_stock_movements_product ON public.stock_movements(product_id);
CREATE INDEX idx_store_products_store ON public.store_products(store_id);
CREATE INDEX idx_store_products_product ON public.store_products(product_id);
CREATE INDEX idx_promotions_dates ON public.promotions(start_date, end_date);
CREATE INDEX idx_promotions_active ON public.promotions(is_active) WHERE is_active = TRUE;

-- 5. SISTEMA DE PERMISSÕES GRANULARES
-- ============================================

CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, permission_id)
);

-- Função para verificar permissão específica
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission_code TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = _user_id AND p.code = _permission_code
  )
$$;

-- Função para obter loja ativa do usuário
CREATE OR REPLACE FUNCTION public.get_user_store(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT store_id 
  FROM public.store_users 
  WHERE user_id = _user_id AND is_primary = TRUE
  LIMIT 1
$$;

-- Triggers para updated_at
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON public.stores
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_store_products_updated_at BEFORE UPDATE ON public.store_products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stock_transfers_updated_at BEFORE UPDATE ON public.stock_transfers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON public.promotions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. RLS POLICIES
-- ============================================

-- Stores
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stores they belong to" ON public.stores
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.store_users WHERE store_id = id AND user_id = auth.uid())
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can manage stores" ON public.stores
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Store Products
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view store products" ON public.store_products
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.store_users WHERE store_id = store_products.store_id AND user_id = auth.uid())
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins and supervisors can manage store products" ON public.store_products
FOR ALL USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')
);

-- Store Users
ALTER TABLE public.store_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own store assignments" ON public.store_users
FOR SELECT USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage store users" ON public.store_users
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Stock Movements
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view store stock movements" ON public.stock_movements
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.store_users WHERE store_id = stock_movements.store_id AND user_id = auth.uid())
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can create stock movements" ON public.stock_movements
FOR INSERT WITH CHECK (operator_id = auth.uid());

-- Stock Transfers
ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view transfers for their stores" ON public.stock_transfers
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.store_users WHERE (store_id = from_store_id OR store_id = to_store_id) AND user_id = auth.uid())
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can create transfers" ON public.stock_transfers
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.store_users WHERE store_id = from_store_id AND user_id = auth.uid() AND can_transfer = TRUE)
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can update transfers" ON public.stock_transfers
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.store_users WHERE (store_id = from_store_id OR store_id = to_store_id) AND user_id = auth.uid())
  OR has_role(auth.uid(), 'admin')
);

-- Stock Transfer Items
ALTER TABLE public.stock_transfer_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view transfer items" ON public.stock_transfer_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.stock_transfers t
    JOIN public.store_users su ON (su.store_id = t.from_store_id OR su.store_id = t.to_store_id)
    WHERE t.id = transfer_id AND su.user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can manage transfer items" ON public.stock_transfer_items
FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- Promotions
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active promotions" ON public.promotions
FOR SELECT USING (is_active = TRUE OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage promotions" ON public.promotions
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Promotion Products
ALTER TABLE public.promotion_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view promotion products" ON public.promotion_products
FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage promotion products" ON public.promotion_products
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Promotion Stores
ALTER TABLE public.promotion_stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view promotion stores" ON public.promotion_stores
FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage promotion stores" ON public.promotion_stores
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Audit Logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own audit logs" ON public.audit_logs
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert audit logs" ON public.audit_logs
FOR INSERT WITH CHECK (TRUE);

-- Permissions
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view permissions" ON public.permissions
FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage permissions" ON public.permissions
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Role Permissions
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view role permissions" ON public.role_permissions
FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- 7. DADOS INICIAIS
-- ============================================

-- Permissões padrão
INSERT INTO public.permissions (code, name, description, category) VALUES
-- Vendas
('sale.create', 'Criar Venda', 'Pode criar novas vendas', 'vendas'),
('sale.cancel', 'Cancelar Venda', 'Pode cancelar vendas', 'vendas'),
('sale.cancel_item', 'Cancelar Item', 'Pode cancelar itens da venda', 'vendas'),
('sale.discount', 'Aplicar Desconto', 'Pode aplicar descontos', 'vendas'),
('sale.discount_above_limit', 'Desconto Acima do Limite', 'Pode aplicar descontos acima do limite', 'vendas'),
-- Caixa
('register.open', 'Abrir Caixa', 'Pode abrir caixa', 'caixa'),
('register.close', 'Fechar Caixa', 'Pode fechar caixa', 'caixa'),
('register.withdrawal', 'Sangria', 'Pode fazer sangria', 'caixa'),
('register.deposit', 'Suprimento', 'Pode fazer suprimento', 'caixa'),
-- Produtos
('product.view', 'Ver Produtos', 'Pode ver produtos', 'produtos'),
('product.create', 'Criar Produto', 'Pode criar produtos', 'produtos'),
('product.edit', 'Editar Produto', 'Pode editar produtos', 'produtos'),
('product.delete', 'Excluir Produto', 'Pode excluir produtos', 'produtos'),
('product.price_change', 'Alterar Preço', 'Pode alterar preços', 'produtos'),
-- Estoque
('stock.view', 'Ver Estoque', 'Pode ver estoque', 'estoque'),
('stock.adjust', 'Ajustar Estoque', 'Pode ajustar estoque', 'estoque'),
('stock.transfer', 'Transferir Estoque', 'Pode transferir entre lojas', 'estoque'),
('stock.receive', 'Receber Mercadoria', 'Pode receber mercadorias', 'estoque'),
-- Promoções
('promotion.view', 'Ver Promoções', 'Pode ver promoções', 'promocoes'),
('promotion.create', 'Criar Promoção', 'Pode criar promoções', 'promocoes'),
('promotion.edit', 'Editar Promoção', 'Pode editar promoções', 'promocoes'),
('promotion.delete', 'Excluir Promoção', 'Pode excluir promoções', 'promocoes'),
-- Relatórios
('report.sales', 'Relatório de Vendas', 'Pode ver relatório de vendas', 'relatorios'),
('report.stock', 'Relatório de Estoque', 'Pode ver relatório de estoque', 'relatorios'),
('report.financial', 'Relatório Financeiro', 'Pode ver relatório financeiro', 'relatorios'),
('report.audit', 'Relatório de Auditoria', 'Pode ver logs de auditoria', 'relatorios'),
-- Administração
('admin.users', 'Gerenciar Usuários', 'Pode gerenciar usuários', 'admin'),
('admin.stores', 'Gerenciar Lojas', 'Pode gerenciar lojas', 'admin'),
('admin.settings', 'Configurações', 'Pode alterar configurações', 'admin');

-- Vincular permissões aos roles
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin', id FROM public.permissions;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'supervisor', id FROM public.permissions 
WHERE code NOT LIKE 'admin.%';

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'operator', id FROM public.permissions 
WHERE code IN (
  'sale.create', 'sale.cancel_item', 'sale.discount',
  'register.open', 'register.close',
  'product.view', 'stock.view', 'promotion.view'
);

-- Loja padrão (Matriz)
INSERT INTO public.stores (code, name, is_matrix, cnpj, address, city, state)
VALUES ('001', 'Matriz - Loja Principal', TRUE, '00.000.000/0001-00', 'Rua Principal, 100', 'São Paulo', 'SP');