// ==========================================================
// SERVICIO DE WEBHOOK MAKE.COM + AUTOMATIZACIÓN OPENAI
// ==========================================================
import { getConfig } from '../config.js';

/**
 * Dispara el webhook a Make.com con el payload completo B2B
 * para procesamiento de datos apoyado por OpenAI
 */
export async function triggerMakeWebhook(quoteData) {
  const config = getConfig();
  const webhookUrl = config.makeWebhookUrl;

  // Estructura del payload B2B enriquecido para el escenario de Make.com y OpenAI
  const payload = {
    event: 'b2b_quote_requested',
    timestamp: new Date().toISOString(),
    region: 'Biobío, Chile',
    client: {
      name: quoteData.client_name,
      company: quoteData.company_name, // Planta procesadora (ej: Talcahuano, Coronel, San Vicente)
      email: quoteData.client_email,
      phone: quoteData.client_phone
    },
    order: {
      bag_id: quoteData.bag_id,
      bag_name: quoteData.bag_name,
      dimensions: quoteData.dimensions,
      quantity: quoteData.quantity,
      unit_price: quoteData.unit_price,
      subtotal: quoteData.subtotal,
      discount_applied: quoteData.discount_applied,
      discount_percentage: quoteData.discount_percentage,
      total_price: quoteData.total_price,
      currency: 'CLP',
      payment_status: 'pending_quote_review'
    },
    customization: {
      has_custom_logo: quoteData.has_custom_logo,
      logo_file_name: quoteData.logo_file_name || null,
      logo_file_type: quoteData.logo_file_type || null,
      logo_base64_preview: quoteData.logo_base64_preview || null, // Permite análisis visual si OpenAI Vision está activo en Make
      technical_notes: quoteData.notes || 'Requerimiento de bolsas al vacío de alta resistencia para procesamiento de pescados y mariscos.'
    },
    // Metadatos útiles para los módulos de OpenAI en Make.com
    ai_context: {
      prompt_intent: 'Generar resumen ejecutivo de cotización B2B, propuesta técnica de barrera EVOH y borrador de contrato formal para planta pesquera.',
      priority_tier: quoteData.quantity >= 25000 ? 'ALTA_PRIORIDAD_INDUSTRIAL' : 'ESTANDAR_B2B'
    }
  };

  console.log('📦 Enviando payload hacia Make.com:', payload);

  // Si la URL es la de muestra, simulamos éxito para permitir pruebas en desarrollo
  if (!webhookUrl || webhookUrl.includes('your-custom-webhook-id')) {
    console.warn('⚠️ Webhook de Make.com no configurado con URL real. Simulando envío exitoso...');
    await new Promise(res => setTimeout(res, 900));
    return {
      success: true,
      isSimulated: true,
      message: 'Simulación exitosa: Configura tu URL de Make.com en el panel de configuración para recibir el POST real.',
      payload
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Error en webhook Make.com (HTTP ${response.status}: ${response.statusText})`);
    }

    let responseData = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    return {
      success: true,
      isSimulated: false,
      response: responseData,
      payload
    };
  } catch (error) {
    console.error('❌ Error disparando webhook hacia Make.com:', error);
    return {
      success: false,
      error: error.message,
      payload
    };
  }
}
