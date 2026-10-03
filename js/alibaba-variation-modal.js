// ==========================================================
// SELECTOR DE VARIACIONES & CANTIDAD B2B - ESTILO ALIBABA
// Tipos de Envasado, Medidas, Espesores y Precios Escalonados
// Tema: Dark Luxury Industrial Food (#121212, #F59E0B, #18181B)
// ==========================================================
import { triggerMakeWebhook } from './webhook-service.js';
import { saveB2BOrder } from './supabase-client.js';

export const PACKAGING_TYPES = [
  {
    id: 'vacio_3_sellos',
    name: 'Bolsa Vacío 3 Sellos',
    tag: 'Carnes, Pescados & Cecinas',
    image: 'assets/img/bolsa-vacio-carne-hueso.jpg',
    basePrice: 90
  },
  {
    id: 'vacio_gofrada',
    name: 'Bolsa Vacío Gofrada Diamantada',
    tag: 'Canales Antiahogo Selladoras Portátiles',
    image: 'assets/img/corte-vacuno-tomahawk.jpg',
    basePrice: 98
  },
  {
    id: 'doypack_zipper',
    name: 'Doypack Stand-Up con Zipper',
    tag: 'Frutos Secos, Snacks & Polvos',
    image: 'assets/img/doypack-frutos-secos.jpg',
    basePrice: 115
  },
  {
    id: 'doypack_handle',
    name: 'Doypack con Asa Troquelada',
    tag: 'Transporte Ergonómico 1kg - 5kg',
    image: 'assets/images/bolsa_doypack_handle.png',
    basePrice: 128
  },
  {
    id: 'termoencogible',
    name: 'Bolsa Termoencogible (Shrink)',
    tag: 'Segunda Piel Aves & Cortes Grandes',
    image: 'assets/img/termoencogible-pollo.jpg',
    basePrice: 105
  },
  {
    id: 'fuelle_lateral',
    name: 'Bolsa Fuelle Lateral / Flat Bottom',
    tag: 'Café de Especialidad & Master Pack',
    image: 'assets/img/bolsa-fuelle-cafe.jpg',
    basePrice: 120
  }
];

export const SIZES = [
  { id: '10x15', label: '10*15 cm', factor: 0.75, note: 'Muestras de producto / Porciones 100g' },
  { id: '15x20', label: '15*20 cm', factor: 0.85, note: 'Porción individual 250g' },
  { id: '20x30', label: '20*30 cm', factor: 1.00, note: 'Formato estándar 500g - 1kg' },
  { id: '25x35', label: '25*35 cm', factor: 1.20, note: 'Mix granos, carnes y mariscos 1kg - 2kg' },
  { id: '30x45', label: '30*45 cm', factor: 1.45, note: 'Piezas medianas porcionadas' },
  { id: '40x60', label: '40*60 cm', factor: 1.80, note: 'Piezas grandes 4kg - 6kg' },
  { id: '50x80', label: '50*80 cm', factor: 2.30, note: 'Master Pack / Bloques IQF' },
  { id: 'custom', label: 'Medida a Pedido', factor: 1.15, note: 'Fabricación a medida para tu producto' }
];

export const THICKNESSES = [
  { id: '70um', label: '0.07 mm (70 μm)', desc: 'Calibre liviano para alimentos sin bordes filosos', priceMod: 0.90 },
  { id: '90um', label: '0.09 mm (90 μm)', desc: 'Calibre estándar para carnes, filetes y quesos', priceMod: 1.00 },
  { id: '110um', label: '0.11 mm (110 μm)', desc: 'Alta barrera para congelación prolongada (-35°C)', priceMod: 1.12 },
  { id: '120um', label: '0.12 mm (120 μm)', desc: 'Antipunción pesada (huesos, mariscos con concha)', priceMod: 1.25 },
  { id: '150um', label: '0.15 mm (150 μm)', desc: 'Máxima resistencia mecánica y transporte rudo', priceMod: 1.40 }
];

export const COLORS_FINISHES = [
  { id: 'transparente', name: 'Cristalina Transparente', icon: 'sparkles' },
  { id: 'impresa_hd', name: 'Impresión Flexo HD (Con Ventana)', icon: 'palette' },
  { id: 'fondo_mate', name: 'Fondo Negro Mate / Industrial', icon: 'layers' },
  { id: 'metalizada', name: 'Metalizada Barrera Foil', icon: 'shield' }
];

export class AlibabaVariationModal {
  constructor() {
    this.selectedType = PACKAGING_TYPES[0];
    this.selectedSize = SIZES[2]; // 20x30 cm
    this.selectedFinish = COLORS_FINISHES[1]; // Impresión HD
    this.quantities = {
      '70um': 0,
      '90um': 10000,
      '110um': 0,
      '120um': 0,
      '150um': 0
    };
    this.modalEl = null;
    this.isOpen = false;
  }

  init() {
    this.createModalDOM();
    this.bindEvents();
    this.updateCalculations();
  }

  createModalDOM() {
    const existing = document.getElementById('alibaba-variation-modal');
    if (existing) existing.remove();

    const modalHTML = `
      <div id="alibaba-variation-modal" class="fixed inset-0 z-50 hidden bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
        <div class="bg-[#18181B] text-white w-full sm:max-w-xl md:max-w-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-neutral-800 animate-slide-up">
          
          <!-- Header con Título y Botón Cerrar -->
          <div class="px-6 py-4 border-b border-neutral-800 flex items-center justify-between sticky top-0 bg-[#18181B] z-20">
            <div>
              <h3 class="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Configurar Variaciones & Cantidad</span>
                <span class="text-[11px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md">Venta B2B</span>
              </h3>
              <p class="text-xs text-neutral-400 font-mono">Selecciona tipo de envasado, dimensiones y calibres</p>
            </div>
            <button id="btn-close-alibaba-modal" class="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <!-- Escala de Precios Escalonados por Volumen (Tiered Pricing Header) -->
          <div class="px-6 py-4 bg-[#121212] border-b border-neutral-800">
            <div class="grid grid-cols-3 gap-2 text-center" id="tier-header-container">
              <!-- Tier 1 -->
              <div id="tier-box-1" class="p-2.5 rounded-2xl border border-neutral-800 bg-[#1C1C1E] transition-all">
                <div class="text-lg sm:text-xl font-black text-white font-mono" id="tier-price-1">$110</div>
                <div class="text-[10px] text-neutral-400 font-mono uppercase font-semibold">500 - 4.999 un.</div>
              </div>
              <!-- Tier 2 -->
              <div id="tier-box-2" class="p-2.5 rounded-2xl border-2 border-[#F59E0B] bg-gradient-to-b from-amber-500/20 to-amber-500/5 shadow-md shadow-amber-500/10 transition-all">
                <div class="text-lg sm:text-xl font-black text-amber-400 font-mono" id="tier-price-2">$92</div>
                <div class="text-[10px] text-amber-300 font-mono uppercase font-bold">5.000 - 49.999 un.</div>
                <span class="text-[9px] font-bold text-amber-400 block font-mono">Más Popular</span>
              </div>
              <!-- Tier 3 -->
              <div id="tier-box-3" class="p-2.5 rounded-2xl border border-neutral-800 bg-[#1C1C1E] transition-all">
                <div class="text-lg sm:text-xl font-black text-emerald-400 font-mono" id="tier-price-3">$74</div>
                <div class="text-[10px] text-neutral-400 font-mono uppercase font-semibold">≥ 50.000 un.</div>
              </div>
            </div>
          </div>

          <!-- Contenido Scrolleable de Variaciones -->
          <div class="px-6 py-5 overflow-y-auto space-y-6 flex-1 text-sm font-sans">
            
            <!-- 1. Tipo de Envasado (Multi-Alimentos) -->
            <div>
              <div class="flex items-center justify-between mb-2.5">
                <label class="text-xs font-mono uppercase font-bold text-neutral-300 tracking-wider">
                  1. Tipo de Envasado Industrial
                </label>
                <span id="selected-type-badge" class="text-xs font-mono font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                  ${this.selectedType.name}
                </span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5" id="packaging-type-grid">
                ${PACKAGING_TYPES.map(pt => `
                  <button 
                    type="button"
                    data-type-id="${pt.id}"
                    class="packaging-type-btn p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${pt.id === this.selectedType.id ? 'border-[#F59E0B] bg-amber-500/15 ring-2 ring-amber-500/30 text-white' : 'border-neutral-800 bg-[#1C1C1E] hover:border-neutral-700 text-neutral-300'}">
                    <img src="${pt.image}" alt="${pt.name}" class="w-10 h-10 object-cover rounded-lg bg-neutral-900 border border-neutral-800 p-0.5 shrink-0">
                    <div class="min-w-0">
                      <span class="text-xs font-bold text-white block truncate leading-tight">${pt.name}</span>
                      <span class="text-[10px] text-neutral-400 block truncate">${pt.tag}</span>
                    </div>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- 2. Acabado / Color -->
            <div>
              <label class="block text-xs font-mono uppercase font-bold text-neutral-300 tracking-wider mb-2">
                2. Acabado & Presentación
              </label>
              <div class="flex flex-wrap gap-2" id="finish-btn-group">
                ${COLORS_FINISHES.map(fin => `
                  <button 
                    type="button"
                    data-finish-id="${fin.id}"
                    class="finish-btn px-3.5 py-2 rounded-xl text-xs font-mono font-bold border flex items-center gap-2 transition ${fin.id === this.selectedFinish.id ? 'border-[#F59E0B] bg-[#F59E0B] text-neutral-950 font-bold shadow-md' : 'border-neutral-800 bg-[#1C1C1E] text-neutral-300 hover:border-neutral-700'}">
                    <i data-lucide="${fin.icon}" class="w-3.5 h-3.5"></i>
                    <span>${fin.name}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- 3. Medidas / Size (Pills estilo Alibaba) -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-xs font-mono uppercase font-bold text-neutral-300 tracking-wider">
                  3. Medida / Dimensión: <span id="current-size-label" class="text-amber-400">${this.selectedSize.label}</span>
                </label>
                <span class="text-[11px] text-neutral-400 font-mono" id="current-size-note">${this.selectedSize.note}</span>
              </div>
              <div class="flex flex-wrap gap-2" id="size-pill-group">
                ${SIZES.map(s => `
                  <button 
                    type="button"
                    data-size-id="${s.id}"
                    class="size-pill-btn px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition ${s.id === this.selectedSize.id ? 'border-[#F59E0B] bg-amber-500/20 text-amber-300 ring-2 ring-amber-500/40 font-bold' : 'border-neutral-800 bg-[#1C1C1E] text-neutral-400 hover:border-neutral-700'}">
                    ${s.label}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- 4. Espesor (Thickness) con Multi-Item Counter (- [0] +) -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-xs font-mono uppercase font-bold text-neutral-300 tracking-wider">
                  4. Espesor (Calibre en Micras / mm) & Tiraje
                </label>
                <span class="text-[11px] text-neutral-400 font-mono">Multi-selección acumulable</span>
              </div>
              
              <div class="border border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-800/80 bg-[#1C1C1E]" id="thickness-list">
                ${THICKNESSES.map(th => `
                  <div class="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-neutral-800/40 transition">
                    <div class="min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-mono font-bold text-neutral-200 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-700">
                          ${th.label}
                        </span>
                        <span class="text-xs font-mono font-bold text-amber-400" id="unit-price-${th.id}">$0 CLP</span>
                      </div>
                      <p class="text-[11px] text-neutral-400 mt-0.5 truncate max-w-xs sm:max-w-md">${th.desc}</p>
                    </div>

                    <!-- Counter (- [input] +) -->
                    <div class="flex items-center gap-1.5 shrink-0 font-mono">
                      <button 
                        type="button" 
                        data-action="minus" 
                        data-th="${th.id}"
                        class="counter-btn w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center justify-center font-bold text-base transition active:scale-90">
                        -
                      </button>
                      
                      <input 
                        type="number" 
                        min="0" 
                        step="500" 
                        value="${this.quantities[th.id] || 0}" 
                        data-th="${th.id}"
                        class="thickness-qty-input w-20 text-center text-xs font-mono font-bold bg-[#121212] text-white border border-neutral-700 rounded-lg py-1.5 focus:border-amber-400 focus:outline-none">
                      
                      <button 
                        type="button" 
                        data-action="plus" 
                        data-th="${th.id}"
                        class="counter-btn w-8 h-8 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold text-base transition active:scale-90">
                        +
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Campos Rápidos de Contacto Planta -->
            <div class="pt-2 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-mono text-neutral-400 mb-1">Nombre y Empresa / Planta</label>
                <input type="text" id="alibaba-input-company" placeholder="Ej: Frigorífico / Planta Empacadora" class="w-full text-xs bg-[#121212] border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none">
              </div>
              <div>
                <label class="block text-[11px] font-mono text-neutral-400 mb-1">Email / WhatsApp de Contacto</label>
                <input type="text" id="alibaba-input-contact" placeholder="compras@empresa.cl / +56 9..." class="w-full text-xs bg-[#121212] border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none">
              </div>
            </div>

          </div>

          <!-- Barra Inferior Fija (Sticky Bottom Bar con Subtotal y Acciones) -->
          <div class="px-6 py-4 bg-[#121212] text-white border-t border-neutral-800 sticky bottom-0 z-20 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <!-- Resumen de Subtotal -->
            <div class="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono text-neutral-400 uppercase">Subtotal Neto:</span>
                  <span id="alibaba-subtotal" class="text-2xl font-black text-amber-400 font-mono">$0</span>
                </div>
                <div class="text-[11px] font-mono text-neutral-300 flex items-center gap-2">
                  <span id="alibaba-total-pieces">0 piezas seleccionadas</span>
                  <span id="alibaba-tier-badge" class="bg-neutral-900 px-2 py-0.5 rounded text-amber-300 border border-amber-500/30">Escala Estándar</span>
                </div>
              </div>
            </div>

            <!-- Botones de Acción (Send Inquiry & Chat Now) -->
            <div class="w-full sm:w-auto flex items-center gap-2.5">
              
              <!-- Botón 1: Enviar Cotización Make.com -->
              <button 
                id="btn-alibaba-send-inquiry" 
                class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 font-extrabold text-xs px-5 py-3 rounded-xl transition shadow-lg active:scale-95">
                <i data-lucide="send" class="w-4 h-4 text-amber-400"></i>
                <span>Enviar Cotización</span>
              </button>

              <!-- Botón 2: WhatsApp Comercial Inmediato -->
              <button 
                id="btn-alibaba-chat-now" 
                class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#F59E0B] hover:bg-amber-400 text-neutral-950 font-black text-xs px-5 py-3 rounded-xl transition shadow-lg shadow-amber-500/25 active:scale-95">
                <i data-lucide="message-circle" class="w-4 h-4"></i>
                <span>Chat Now (WhatsApp)</span>
              </button>

            </div>

          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modalEl = document.getElementById('alibaba-variation-modal');
    if (window.lucide) window.lucide.createIcons();
  }

  bindEvents() {
    // Cerrar modal
    document.getElementById('btn-close-alibaba-modal')?.addEventListener('click', () => this.close());
    this.modalEl?.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    // 1. Selección de Tipo de Envasado
    document.querySelectorAll('.packaging-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-type-id');
        this.selectedType = PACKAGING_TYPES.find(pt => pt.id === id) || PACKAGING_TYPES[0];
        
        document.querySelectorAll('.packaging-type-btn').forEach(b => {
          b.classList.remove('border-[#F59E0B]', 'bg-amber-500/15', 'ring-2', 'ring-amber-500/30', 'text-white');
          b.classList.add('border-neutral-800', 'bg-[#1C1C1E]', 'text-neutral-300');
        });
        btn.classList.add('border-[#F59E0B]', 'bg-amber-500/15', 'ring-2', 'ring-amber-500/30', 'text-white');
        btn.classList.remove('border-neutral-800', 'bg-[#1C1C1E]', 'text-neutral-300');

        const badge = document.getElementById('selected-type-badge');
        if (badge) badge.textContent = this.selectedType.name;

        this.updateCalculations();
      });
    });

    // 2. Selección de Acabado / Color
    document.querySelectorAll('.finish-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-finish-id');
        this.selectedFinish = COLORS_FINISHES.find(cf => cf.id === id) || COLORS_FINISHES[0];

        document.querySelectorAll('.finish-btn').forEach(b => {
          b.classList.remove('border-[#F59E0B]', 'bg-[#F59E0B]', 'text-neutral-950', 'font-bold', 'shadow-md');
          b.classList.add('border-neutral-800', 'bg-[#1C1C1E]', 'text-neutral-300');
        });
        btn.classList.add('border-[#F59E0B]', 'bg-[#F59E0B]', 'text-neutral-950', 'font-bold', 'shadow-md');
        btn.classList.remove('border-neutral-800', 'bg-[#1C1C1E]', 'text-neutral-300');

        this.updateCalculations();
      });
    });

    // 3. Selección de Medida (Size Pills)
    document.querySelectorAll('.size-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-size-id');
        this.selectedSize = SIZES.find(s => s.id === id) || SIZES[2];

        document.querySelectorAll('.size-pill-btn').forEach(b => {
          b.classList.remove('border-[#F59E0B]', 'bg-amber-500/20', 'text-amber-300', 'ring-2', 'ring-amber-500/40', 'font-bold');
          b.classList.add('border-neutral-800', 'bg-[#1C1C1E]', 'text-neutral-400');
        });
        btn.classList.add('border-[#F59E0B]', 'bg-amber-500/20', 'text-amber-300', 'ring-2', 'ring-amber-500/40', 'font-bold');
        btn.classList.remove('border-neutral-800', 'bg-[#1C1C1E]', 'text-neutral-400');

        const label = document.getElementById('current-size-label');
        const note = document.getElementById('current-size-note');
        if (label) label.textContent = this.selectedSize.label;
        if (note) note.textContent = this.selectedSize.note;

        this.updateCalculations();
      });
    });

    // 4. Contadores de Espesor (- [input] +)
    document.querySelectorAll('.counter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const thId = btn.getAttribute('data-th');
        const action = btn.getAttribute('data-action');
        let current = parseInt(this.quantities[thId] || 0, 10);

        if (action === 'plus') {
          current = current === 0 ? 1000 : current + 1000;
        } else if (action === 'minus') {
          current = Math.max(0, current - 1000);
        }

        this.quantities[thId] = current;
        const input = document.querySelector(`.thickness-qty-input[data-th="${thId}"]`);
        if (input) input.value = current;

        this.updateCalculations();
      });
    });

    document.querySelectorAll('.thickness-qty-input').forEach(input => {
      input.addEventListener('change', () => {
        const thId = input.getAttribute('data-th');
        let val = parseInt(input.value, 10);
        if (isNaN(val) || val < 0) val = 0;
        this.quantities[thId] = val;
        this.updateCalculations();
      });
    });

    // 5. Botón Enviar Cotización (Make.com + Supabase)
    document.getElementById('btn-alibaba-send-inquiry')?.addEventListener('click', async () => {
      await this.handleSendInquiry();
    });

    // 6. Botón Chat Now (WhatsApp)
    document.getElementById('btn-alibaba-chat-now')?.addEventListener('click', () => {
      this.handleChatNow();
    });
  }

  open(options = {}) {
    if (!this.modalEl) this.init();
    if (options.typeId) {
      const found = PACKAGING_TYPES.find(p => p.id === options.typeId);
      if (found) this.selectedType = found;
    }
    this.modalEl.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    this.isOpen = true;
    this.updateCalculations();
    if (window.lucide) window.lucide.createIcons();
  }

  close() {
    if (!this.modalEl) return;
    this.modalEl.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    this.isOpen = false;
  }

  calculateTotalPieces() {
    return Object.values(this.quantities).reduce((acc, q) => acc + (parseInt(q, 10) || 0), 0);
  }

  getTierInfo(totalPieces) {
    if (totalPieces >= 40000) {
      return { tier: 3, discount: 0.20, label: '≥ 40.000 un. (-20% Industrial)' };
    } else if (totalPieces >= 20000) {
      return { tier: 2, discount: 0.10, label: '20.000 - 39.999 un. (-10% Mayorista)' };
    } else {
      return { tier: 1, discount: 0.00, label: '10.000 - 19.999 un. (Plan Escala Base)' };
    }
  }

  updateCalculations() {
    const totalPieces = this.calculateTotalPieces();
    const tierInfo = this.getTierInfo(totalPieces);

    // Actualizar Precios en el Header según Tipo y Medida
    const base = this.selectedType.basePrice * this.selectedSize.factor;
    const p1 = Math.round(base);
    const p2 = Math.round(base * 0.90);
    const p3 = Math.round(base * 0.80);

    const elP1 = document.getElementById('tier-price-1');
    const elP2 = document.getElementById('tier-price-2');
    const elP3 = document.getElementById('tier-price-3');
    if (elP1) elP1.textContent = `$${p1}`;
    if (elP2) elP2.textContent = `$${p2}`;
    if (elP3) elP3.textContent = `$${p3}`;

    // Destacar Tier activo con estilo dark / amber
    [1, 2, 3].forEach(t => {
      const box = document.getElementById(`tier-box-${t}`);
      if (box) {
        if (t === tierInfo.tier) {
          box.className = 'p-2.5 rounded-2xl border-2 border-[#F59E0B] bg-gradient-to-b from-amber-500/20 to-amber-500/5 shadow-md shadow-amber-500/10 transition-all scale-105';
        } else {
          box.className = 'p-2.5 rounded-2xl border border-neutral-800 bg-[#1C1C1E] transition-all opacity-80';
        }
      }
    });

    // Calcular Subtotal acumulando cada espesor
    let subtotalNeto = 0;
    THICKNESSES.forEach(th => {
      const qty = parseInt(this.quantities[th.id] || 0, 10);
      const unitPrice = Math.round(base * th.priceMod * (1 - tierInfo.discount));
      
      const priceEl = document.getElementById(`unit-price-${th.id}`);
      if (priceEl) priceEl.textContent = `$${unitPrice} CLP`;

      subtotalNeto += qty * unitPrice;
    });

    // Actualizar Barra Inferior
    const subtotalEl = document.getElementById('alibaba-subtotal');
    const totalPiecesEl = document.getElementById('alibaba-total-pieces');
    const tierBadgeEl = document.getElementById('alibaba-tier-badge');

    if (subtotalEl) subtotalEl.textContent = `$${subtotalNeto.toLocaleString('es-CL')} CLP`;
    if (totalPiecesEl) totalPiecesEl.textContent = `${totalPieces.toLocaleString('es-CL')} piezas seleccionadas`;
    if (tierBadgeEl) tierBadgeEl.textContent = tierInfo.label;
  }

  async handleSendInquiry() {
    const totalPieces = this.calculateTotalPieces();
    if (totalPieces === 0) {
      alert('Por favor selecciona al menos una cantidad en los espesores para cotizar.');
      return;
    }

    const company = document.getElementById('alibaba-input-company')?.value.trim() || 'Empresa / Planta';
    const contact = document.getElementById('alibaba-input-contact')?.value.trim() || 'compras@empresa.cl';
    const tierInfo = this.getTierInfo(totalPieces);

    const base = this.selectedType.basePrice * this.selectedSize.factor;
    let subtotalNeto = 0;
    const thicknessBreakdown = [];

    THICKNESSES.forEach(th => {
      const qty = parseInt(this.quantities[th.id] || 0, 10);
      if (qty > 0) {
        const unitPrice = Math.round(base * th.priceMod * (1 - tierInfo.discount));
        subtotalNeto += qty * unitPrice;
        thicknessBreakdown.push({
          calibre: th.label,
          cantidad: qty,
          precio_unitario: unitPrice,
          total_linea: qty * unitPrice
        });
      }
    });

    const quotePayload = {
      event: 'alibaba_b2b_inquiry',
      company_name: company,
      client_name: company,
      client_email: contact.includes('@') ? contact : 'contacto@empresa.cl',
      client_phone: !contact.includes('@') ? contact : '+56900000000',
      packaging_type: this.selectedType.name,
      dimensions: this.selectedSize.label,
      finish: this.selectedFinish.name,
      total_quantity: totalPieces,
      total_price: subtotalNeto,
      thickness_breakdown: thicknessBreakdown,
      notes: `Cotización B2B configurada desde selector Alibaba: ${this.selectedType.name} (${this.selectedSize.label}) con acabado ${this.selectedFinish.name}.`
    };

    // 1. Guardar en Supabase
    await saveB2BOrder({
      client_name: company,
      company_name: company,
      client_email: quotePayload.client_email,
      client_phone: quotePayload.client_phone,
      bag_id: null,
      quantity: totalPieces,
      unit_price: Math.round(subtotalNeto / totalPieces),
      total_price: subtotalNeto,
      has_custom_logo: true,
      notes: quotePayload.notes
    });

    // 2. Disparar Webhook a Make.com
    const result = await triggerMakeWebhook({
      client_name: company,
      company_name: company,
      client_email: quotePayload.client_email,
      client_phone: quotePayload.client_phone,
      bag_name: `${this.selectedType.name} (${this.selectedSize.label})`,
      dimensions: this.selectedSize.label,
      quantity: totalPieces,
      unit_price: Math.round(subtotalNeto / totalPieces),
      subtotal: subtotalNeto,
      discount_applied: 0,
      discount_percentage: tierInfo.discount * 100,
      total_price: subtotalNeto,
      has_custom_logo: true,
      notes: quotePayload.notes
    });

    this.close();
    alert(`¡Cotización B2B enviada con éxito hacia Make.com!\n\nEmpresa: ${company}\nTotal: $${subtotalNeto.toLocaleString('es-CL')} CLP (${totalPieces.toLocaleString('es-CL')} piezas)\nUn asesor técnico se contactará en minutos.`);
  }

  handleChatNow() {
    const totalPieces = this.calculateTotalPieces();
    const base = this.selectedType.basePrice * this.selectedSize.factor;
    const tierInfo = this.getTierInfo(totalPieces);
    let subtotalNeto = 0;

    THICKNESSES.forEach(th => {
      const qty = parseInt(this.quantities[th.id] || 0, 10);
      if (qty > 0) {
        const unitPrice = Math.round(base * th.priceMod * (1 - tierInfo.discount));
        subtotalNeto += qty * unitPrice;
      }
    });

    const msg = `Hola WellPack, me interesa cotizar empaques industriales:\n` +
      `📦 Formato: ${this.selectedType.name}\n` +
      `📐 Medida: ${this.selectedSize.label}\n` +
      `✨ Acabado: ${this.selectedFinish.name}\n` +
      `🔢 Cantidad Total: ${totalPieces.toLocaleString('es-CL')} un.\n` +
      `💰 Subtotal Estimado: $${subtotalNeto.toLocaleString('es-CL')} CLP\n` +
      `Solicito contacto comercial para afinar especificaciones y despacho.`;

    const whatsappUrl = `https://wa.me/56987654321?text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, '_blank');
  }
}

// Instancia singleton accesible globalmente
export const alibabaModal = new AlibabaVariationModal();
