// ==========================================================
// CLIENTE SUPABASE - GESTIÓN DE CATÁLOGO Y ÓRDENES B2B
// Catálogo actualizado con empaques impresos y doypacks pesqueros
// ==========================================================
import { getConfig } from '../config.js';

export const FALLBACK_VACUUM_BAGS = [
  {
    id: '1a9e8f23-3b4c-45d6-8e7f-0123456789ab',
    name: 'Bolsa Vacío Impresa con Ventana (Pescado Entero)',
    dimensions: '40x25',
    base_cost: 52.25,
    retail_price: 110.00,
    stock_status: 'available',
    image_url: 'assets/images/bolsa_vacio_pescado_ventana.png',
    badge: 'Impresión HD + Ventana',
    category: 'Bolsas al Vacío con Gráfica',
    description: 'Empaque al vacío termosellado con impresión flexográfica en franjas azul y naranja, con ventana transparente central para exhibición de salmón y merluza fresca.'
  },
  {
    id: '2b8d7c12-4a5b-56c7-9f8e-1234567890cd',
    name: 'Stand-Up Doypack con Asa Troquelada (Frozen Foods)',
    dimensions: '38x24',
    base_cost: 62.00,
    retail_price: 128.00,
    stock_status: 'available',
    image_url: 'assets/images/bolsa_doypack_handle.png',
    badge: 'Asa Ergonómica + Zipper',
    category: 'Doypack Congelados',
    description: 'Bolsa pouch autosostenible con fuelle inferior, manija troquelada para transporte fácil, cierre hermético zipper y gráfica iceberg para productos congelados IQF.'
  },
  {
    id: '3c7b6a01-5d6e-67a8-0b9f-2345678901ef',
    name: 'Stand-Up Pouch Gráfica Marina Premium',
    dimensions: '36x20',
    base_cost: 48.00,
    retail_price: 105.00,
    stock_status: 'available',
    image_url: 'assets/images/bolsas_standup_ocean_print.png',
    badge: 'Acabado Mate Soft-Touch',
    category: 'Línea Gourmet Exportación',
    description: 'Diseño integral con textura marina en degrade azul océano y hielo, barniz sectorizado mate/brillo para porciones de merluza, salmón y pechugas IQF.'
  },
  {
    id: '4d6a5e90-6f7a-78b9-1c0d-3456789012ab',
    name: 'Bolsa Stand-Up con Ventana Retail Supermercado',
    dimensions: '30x18',
    base_cost: 41.50,
    retail_price: 88.00,
    stock_status: 'available',
    image_url: 'assets/images/bolsa_congelados_freezer_retail.jpg',
    badge: 'Apto Congelado -35°C',
    category: 'Retail Congelados',
    description: 'Bolsa celeste con motivos de copos de nieve, ventana panorámica transparente en base, tabla nutricional y código de barras lista para góndola de congelados.'
  },
  {
    id: '5e5f4d89-7a8b-89c0-2d1e-4567890123bc',
    name: 'Bolsa Vacío Gofrada Diamantada Transparente',
    dimensions: '40x25',
    base_cost: 49.00,
    retail_price: 98.00,
    stock_status: 'available',
    image_url: 'assets/images/bolsa_salmon_40x25.jpg',
    badge: 'Gofrado Antiahogo',
    category: 'Vacío Industrial',
    description: 'Película cristalina con microcanales diamantados para extracción máxima de aire en cámaras de campana industriales, preservando filetes sobre hielo.'
  },
  {
    id: '6f4e3c78-8b9c-90d1-3e2f-5678901234cd',
    name: 'Bolsa Vacío Mariscos & Cefalópodos Pesada',
    dimensions: '36x20',
    base_cost: 44.00,
    retail_price: 92.00,
    stock_status: 'available',
    image_url: 'assets/images/bolsa_mariscos_36x20.jpg',
    badge: '110μm Antipuntura',
    category: 'Mariscos & Pulpo',
    description: 'Sellado al vacío hermético diseñado para piezas con contornos irregulares como pulpo, jibia y langostinos, garantizando resistencia sin fugas.'
  }
];

let supabaseInstance = null;

export function getSupabaseClient() {
  const config = getConfig();
  
  const isPlaceholder = !config.supabaseUrl || 
                        config.supabaseUrl.includes('xyzcompany') || 
                        !config.supabaseAnonKey || 
                        config.supabaseAnonKey.includes('placeholder');
  
  if (isPlaceholder) {
    return null;
  }

  if (window.supabase && (!supabaseInstance || supabaseInstance._url !== config.supabaseUrl)) {
    supabaseInstance = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
    supabaseInstance._url = config.supabaseUrl;
  }
  return supabaseInstance;
}

/**
 * Consulta el catálogo de bolsas al vacío desde la tabla `vacuum_bags`
 */
export async function fetchVacuumBags() {
  const client = getSupabaseClient();
  
  if (!client) {
    console.info('ℹ️ Supabase en modo demo: cargando catálogo completo con las nuevas fotografías de empaques pesqueros.');
    return { data: FALLBACK_VACUUM_BAGS, isMock: true, error: null };
  }

  try {
    const { data, error } = await client
      .from('vacuum_bags')
      .select('*')
      .order('retail_price', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      return { data: FALLBACK_VACUUM_BAGS, isMock: true, error: null };
    }

    const mapped = data.map((item, idx) => ({
      ...item,
      image_url: item.image_url || FALLBACK_VACUUM_BAGS[idx % FALLBACK_VACUUM_BAGS.length].image_url
    }));

    return { data: mapped, isMock: false, error: null };
  } catch (err) {
    console.error('Error consultando Supabase:', err);
    return { data: FALLBACK_VACUUM_BAGS, isMock: true, error: err.message };
  }
}

/**
 * Inserta la orden o solicitud de cotización en la tabla `b2b_orders`
 */
export async function saveB2BOrder(orderPayload) {
  const client = getSupabaseClient();

  if (!client) {
    console.info('ℹ️ Modo demo: Orden registrada localmente.');
    return { success: true, orderId: 'BIOBÍO-' + Math.random().toString(36).substring(2, 9).toUpperCase(), isMock: true };
  }

  try {
    const { data, error } = await client
      .from('b2b_orders')
      .insert([
        {
          client_name: orderPayload.client_name,
          company_name: orderPayload.company_name,
          client_email: orderPayload.client_email,
          client_phone: orderPayload.client_phone,
          bag_id: orderPayload.bag_id,
          quantity: orderPayload.quantity,
          unit_price: orderPayload.unit_price,
          total_price: orderPayload.total_price,
          has_custom_logo: orderPayload.has_custom_logo,
          logo_file_name: orderPayload.logo_file_name,
          notes: orderPayload.notes,
          status: 'pending_payment'
        }
      ])
      .select();

    if (error) throw error;

    return { success: true, orderId: data[0]?.id, isMock: false };
  } catch (err) {
    console.error('Error guardando orden en Supabase:', err);
    return { success: false, error: err.message };
  }
}
