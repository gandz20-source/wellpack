// ==========================================================
// CONFIGURACIÓN CENTRAL - WELLPACK BIOBÍO
// ==========================================================

const DEFAULT_CONFIG = {
  // Supabase Credentials
  supabaseUrl: 'https://xyzcompany.supabase.co', // Reemplazar con tu URL de Supabase
  supabaseAnonKey: 'public-anon-key-placeholder', // Reemplazar con tu Anon Public Key
  
  // Make.com Automation Webhook
  makeWebhookUrl: 'https://hook.eu1.make.com/your-custom-webhook-id', // Reemplazar con tu Webhook de Make
  
  // Región objetivo y parámetros B2B
  targetRegion: 'Región del Biobío, Chile (Talcahuano, Coronel, San Vicente)',
  minOrderQuantity: 1000,
  defaultQuantity: 5000,
  volumeDiscounts: [
    { min: 1000, discount: 0.00, label: 'Precio estándar B2B' },
    { min: 10000, discount: 0.05, label: '5% Descuento Mayorista' },
    { min: 25000, discount: 0.10, label: '10% Descuento Industrial' },
    { min: 50000, discount: 0.15, label: '15% Descuento Planta Corporativa' }
  ]
};

// Cargar configuración guardada en LocalStorage si existe, o usar default
export function getConfig() {
  const saved = localStorage.getItem('wellpack_config');
  if (saved) {
    try {
      return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Error parseando config de localStorage:', e);
    }
  }
  return DEFAULT_CONFIG;
}

export function saveConfig(newConfig) {
  const merged = { ...getConfig(), ...newConfig };
  localStorage.setItem('wellpack_config', JSON.stringify(merged));
  window.dispatchEvent(new CustomEvent('wellpack_config_updated', { detail: merged }));
  return merged;
}
