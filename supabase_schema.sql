-- ==========================================================
-- WELLPACK BIOBÍO - ESQUEMA SUPABASE ACTUALIZADO
-- Catálogo con formatos impresos y doypacks para pescados y mariscos
-- ==========================================================

CREATE TABLE IF NOT EXISTS vacuum_bags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  base_cost numeric NOT NULL,
  retail_price numeric NOT NULL,
  stock_status TEXT DEFAULT 'available',
  image_url TEXT,
  badge TEXT,
  category TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE vacuum_bags ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE vacuum_bags ADD COLUMN IF NOT EXISTS badge TEXT;
ALTER TABLE vacuum_bags ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE vacuum_bags ADD COLUMN IF NOT EXISTS description TEXT;

-- Insertar catálogo de bolsas impresas, doypacks y vacío
INSERT INTO vacuum_bags (name, dimensions, base_cost, retail_price, stock_status, image_url, badge, category, description)
VALUES 
  (
    'Bolsa Vacío Impresa con Ventana (Pescado Entero)', 
    '40x25', 
    52.25, 
    110.00, 
    'available',
    'assets/images/bolsa_vacio_pescado_ventana.png',
    'Impresión HD + Ventana',
    'Bolsas al Vacío con Gráfica',
    'Empaque al vacío termosellado con impresión flexográfica en franjas azul y naranja, con ventana transparente central para exhibición de salmón y merluza fresca.'
  ),
  (
    'Stand-Up Doypack con Asa Troquelada (Frozen Foods)', 
    '38x24', 
    62.00, 
    128.00, 
    'available',
    'assets/images/bolsa_doypack_handle.png',
    'Asa Ergonómica + Zipper',
    'Doypack Congelados',
    'Bolsa pouch autosostenible con fuelle inferior, manija troquelada para transporte fácil, cierre hermético zipper y gráfica iceberg para productos congelados IQF.'
  ),
  (
    'Stand-Up Pouch Gráfica Marina Premium', 
    '36x20', 
    48.00, 
    105.00, 
    'available',
    'assets/images/bolsas_standup_ocean_print.png',
    'Acabado Mate Soft-Touch',
    'Línea Gourmet Exportación',
    'Diseño integral con textura marina en degrade azul océano y hielo, barniz sectorizado mate/brillo para porciones de merluza, salmón y pechugas IQF.'
  ),
  (
    'Bolsa Stand-Up con Ventana Retail Supermercado', 
    '30x18', 
    41.50, 
    88.00, 
    'available',
    'assets/images/bolsa_congelados_freezer_retail.jpg',
    'Apto Congelado -35°C',
    'Retail Congelados',
    'Bolsa celeste con motivos de copos de nieve, ventana panorámica transparente en base, tabla nutricional y código de barras lista para góndola de congelados.'
  ),
  (
    'Bolsa Vacío Gofrada Diamantada Transparente', 
    '40x25', 
    49.00, 
    98.00, 
    'available',
    'assets/images/bolsa_salmon_40x25.jpg',
    'Gofrado Antiahogo',
    'Vacío Industrial',
    'Película cristalina con microcanales diamantados para extracción máxima de aire en cámaras de campana industriales, preservando filetes sobre hielo.'
  ),
  (
    'Bolsa Vacío Mariscos & Cefalópodos Pesada', 
    '36x20', 
    44.00, 
    92.00, 
    'available',
    'assets/images/bolsa_mariscos_36x20.jpg',
    '110μm Antipuntura',
    'Mariscos & Pulpo',
    'Sellado al vacío hermético diseñado para piezas con contornos irregulares como pulpo, jibia y langostinos, garantizando resistencia sin fugas.'
  )
ON CONFLICT DO NOTHING;

-- Tabla para las cotizaciones / órdenes B2B
CREATE TABLE IF NOT EXISTS b2b_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  bag_id UUID REFERENCES vacuum_bags(id),
  quantity INTEGER NOT NULL,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  has_custom_logo BOOLEAN DEFAULT true,
  logo_file_name TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending_payment',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE vacuum_bags ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura publica del catalogo" 
ON vacuum_bags FOR SELECT 
USING (true);

CREATE POLICY "Permitir crear cotizaciones B2B anonimas o autenticadas" 
ON b2b_orders FOR INSERT 
WITH CHECK (true);
