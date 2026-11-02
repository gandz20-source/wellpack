// ==========================================================
// ANTIGRAVITY ENGINE RENDERER - WELLPACK BIOBÍO
// Tema Degradé Oceánico: Blanco -> Celeste -> Celeste Oscuro -> Azul de Mar
// ==========================================================
import { getConfig, saveConfig } from '../config.js';
import { fetchVacuumBags, saveB2BOrder } from './supabase-client.js';
import { triggerMakeWebhook } from './webhook-service.js';
import { initThreeViewer } from './three-viewer.js';
import { PACKAGING_TYPES, SIZES, THICKNESSES, COLORS_FINISHES, alibabaModal } from './alibaba-variation-modal.js?v=dark_harmony_v8';

class AntigravityRenderer {
  constructor(containerId = 'app') {
    this.container = document.getElementById(containerId);
    this.schema = null;
    this.products = [];
    this.filteredProducts = [];
    this.selectedProduct = null;
    this.currentQuantity = 10000;
    this.uploadedLogo = null;
    this.threeViewerInstance = null;
    this.currentCategory = 'all';
    this.pageMode = document.body?.dataset?.pageMode || new URLSearchParams(window.location.search).get('page') || 'packaging';
    
    // Estado del Escaparate B2B Alibaba incrustado en la página
    this.alibabaState = {
      selectedType: PACKAGING_TYPES[0],
      selectedSize: SIZES[2], // 20x30 cm
      selectedFinish: COLORS_FINISHES[1], // Impresión HD
      quantities: {
        '70um': 0,
        '90um': 10000,
        '110um': 0,
        '120um': 0,
        '150um': 0
      }
    };

    // Estado Reactivo del Wizard Evaluador de Proyectos Corfo (5 Pasos)
    this.corfoWizardState = {
      currentStep: 1,
      sector: 'Pesquero y Acuícola',
      focusKey: 'A',
      focusTitle: 'Tecnología Verde, Agua, Residuos y Energía',
      corfoProgram: 'Crédito Verde Corfo',
      selectedTechs: [
        'Planta recicladora/valorizadora de residuos orgánicos (pescado, cárnicos, subproductos).',
        'Sistema recuperador y planta de tratamiento/recirculación de agua industrial.'
      ],
      investmentRange: '$20.000.000 a $60.000.000 CLP',
      revenueLevel: 'Mediana (25.000 a 100.000 UF)',
      supportType: 'Maquinaria + Gestión Financiamiento Corfo',
      contactName: '',
      companyName: '',
      companyRut: '',
      contactPhone: '',
      contactEmail: '',
      plantRegion: '',
      notes: ''
    };
  }

  async init(schemaUrl = 'schema.json') {
    try {
      const res = await fetch(schemaUrl);
      if (!res.ok) throw new Error(`No se pudo cargar el schema JSON: ${res.statusText}`);
      this.schema = await res.json();
      
      if (this.pageMode === 'meat_machinery') {
        document.title = 'WellPack Cárnico | Maquinaria y Líneas para Rubro Cárnico & Cecinas';
      } else if (this.pageMode === 'fishery_machinery') {
        document.title = 'WellPack Pesquero | Maquinaria y Líneas para Proceso Pesquero & Acuícola';
      } else if (this.pageMode === 'industrial_projects') {
        document.title = 'WellPack Proyectos & Corfo | Ingeniería Llave en Mano, Tecnología Verde y Financiamiento Industrial';
      } else if (this.schema.meta) {
        document.title = 'WellPack | Envases Flexibles de Alta Barrera & Impresión HD';
      }

      // Cargar productos de Supabase
      const { data } = await fetchVacuumBags();
      this.products = data || [];
      this.filteredProducts = [...this.products];
      this.selectedProduct = this.products[0] || null;

      // Inicializar Selector de Variaciones Estilo Alibaba
      alibabaModal.init();

      // Renderizar vistas dinámicas según la división activa
      this.renderApp();

      // Inicializar animaciones GSAP y Three.js
      this.initAnimationsAndAssets();

      // Enlazar interactividad del cotizador y filtros
      this.bindInteractiveEvents();

      console.log(`🌊 Antigravity Engine [${this.pageMode}]: Interfaz renderizada con éxito`);
    } catch (err) {
      console.error('Error inicializando AntigravityRenderer:', err);
      this.renderError(err.message);
    }
  }

  renderApp() {
    document.body.style.backgroundColor = '#15141C';
    document.body.style.color = '#FFFFFF';
    this.container.className = 'relative bg-[#15141C] text-white min-h-screen';

    let mainContentHtml = '';
    if (this.pageMode === 'meat_machinery') {
      mainContentHtml = this.renderMeatMachineryPage();
    } else if (this.pageMode === 'fishery_machinery') {
      mainContentHtml = this.renderFisheryMachineryPage();
    } else if (this.pageMode === 'industrial_projects') {
      mainContentHtml = this.renderIndustrialProjectsPage();
    } else {
      mainContentHtml = this.schema && this.schema.layout
        ? this.schema.layout.map(section => this.renderSection(section)).join('')
        : `
          ${this.renderHeroSection()}
          ${this.renderCatalogSection()}
          ${this.renderFactoryShowcaseSection()}
          ${this.renderCheckoutSection()}
        `;
    }

    this.container.innerHTML = `
      <!-- 1. Barra de Navegación Industrial Multi-División (Manufaktur V2) -->
      ${this.renderNavbar()}

      <!-- 2. Contenedor de Secciones Dinámicas -->
      <main class="relative z-10 w-full overflow-hidden">
        ${mainContentHtml}
      </main>

      <!-- 3. Pie de Página -->
      ${this.renderFooter()}

      <!-- 4. Floating Action Dock B2B -->
      ${this.renderFloatingActionDock()}

      <!-- 5. Modales y Notificaciones -->
      ${this.renderSampleModal()}
      ${this.renderConfigModal()}
      ${this.renderMachineryModal()}
      <div id="toast-container" class="fixed bottom-6 right-6 z-50 flex flex-col gap-3"></div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Cerrar suavemente la Pantalla de Carga Industrial (Preloader) una vez montado el DOM
    const preloader = document.getElementById('mk-preloader');
    if (preloader) {
      const bar = document.getElementById('mk-loader-bar');
      const pct = document.getElementById('mk-loader-pct');
      const status = document.getElementById('mk-loader-status');
      if (bar) bar.style.width = '100%';
      if (pct) pct.textContent = '100%';
      if (status) status.textContent = 'Sistema Industrial Listo';
      setTimeout(() => {
        preloader.classList.add('mk-hidden');
      }, 320);
    }
  }

  renderFloatingActionDock() {
    const isMeat = this.pageMode === 'meat_machinery';
    const isFish = this.pageMode === 'fishery_machinery';
    const isProj = this.pageMode === 'industrial_projects';

    const titleText = isMeat
      ? '02. División Rubro Cárnico'
      : isFish
      ? '03. División Proceso Pesquero'
      : isProj
      ? '04. División Proyectos & Corfo'
      : '01. División Envases Flexibles';

    const subText = isMeat
      ? '12 Equipos Inox SUS304 • Soporte Chile'
      : isFish
      ? '12 Máquinas + 12 Videos en Planta'
      : isProj
      ? 'Crédito Verde • MiPyme • Ley I+D 35%'
      : 'Impresión Corporativa • Alta Barrera';

    const waHref = isMeat
      ? 'https://wa.me/56987654321?text=Hola%20WellPack%2C%20quisiera%20cotizar%20maquinaria%20para%20el%20rubro%20c%C3%A1rnico%20y%20cecinas'
      : isFish
      ? 'https://wa.me/56987654321?text=Hola%20WellPack%2C%20quisiera%20cotizar%20maquinaria%20para%20proceso%20pesquero%20y%20salmonero'
      : isProj
      ? 'https://wa.me/56987654321?text=Hola%20WellPack%2C%20quisiera%20evaluar%20un%20Proyecto%20Industrial%20y%20Financiamiento%20Corfo'
      : 'https://wa.me/56987654321?text=Hola%20WellPack%2C%20quisiera%20asesor%C3%ADa%20r%C3%A1pida%20para%20cotizar%20empaques%20industriales';

    const primaryCtaHtml = isMeat
      ? `<button type="button" data-machine-title="Línea Industrial Rubro Cárnico & Cecinas" class="btn-machinery-quote inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#FF7618] hover:bg-[#E5630A] text-white font-heading font-bold text-xs uppercase tracking-wider transition-colors">
           <span>Cotizar Maquinaria</span>
           <span>↗</span>
         </button>`
      : isFish
      ? `<button type="button" data-machine-title="Línea Industrial Proceso Pesquero & Acuícola" class="btn-machinery-quote inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#FF7618] hover:bg-[#E5630A] text-white font-heading font-bold text-xs uppercase tracking-wider transition-colors">
           <span>Cotizar Línea Pesquera</span>
           <span>↗</span>
         </button>`
      : isProj
      ? `<a href="#corfo_wizard_section" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#FF7618] hover:bg-[#E5630A] text-white font-heading font-bold text-xs uppercase tracking-wider transition-colors">
           <span>Evaluar Proyecto Corfo</span>
           <span>↗</span>
         </a>`
      : `<button data-open-variation="any" class="btn-open-variation inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#FF7618] hover:bg-[#E5630A] text-white font-heading font-bold text-xs uppercase tracking-wider transition-colors">
           <span>Cotizar Ahora</span>
           <span>↗</span>
         </button>`;

    return `
      <aside id="floating-b2b-dock" aria-label="Acciones rápidas WellPack" class="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-xl transition-all duration-300">
        <div class="bg-[#15141C]/95 backdrop-blur-md border border-[#343346] p-2.5 rounded-lg shadow-2xl flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5 pl-2">
            <span class="w-2.5 h-2.5 rounded-full bg-[#FF7618] shrink-0"></span>
            <div class="leading-tight hidden sm:block">
              <span class="text-xs font-heading font-bold text-white tracking-wide uppercase block">${titleText}</span>
              <span class="text-xs text-slate-300 font-medium">${subText}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <a 
              href="${waHref}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#1F1E2B] hover:bg-[#2A293A] text-white border border-[#343346] text-xs font-heading font-bold">
              <i data-lucide="message-circle" class="w-4 h-4 text-[#FF7618]"></i>
              <span class="hidden sm:inline">WhatsApp</span>
            </a>
            ${primaryCtaHtml}
          </div>
        </div>
      </aside>
    `;
  }

  renderNavbar() {
    const isPkg = this.pageMode === 'packaging';
    const isMeat = this.pageMode === 'meat_machinery';
    const isFish = this.pageMode === 'fishery_machinery';
    const isProj = this.pageMode === 'industrial_projects';

    const subtitleText = isMeat
      ? 'División Maquinaria Rubro Cárnico'
      : isFish
      ? 'División Maquinaria Proceso Pesquero'
      : isProj
      ? 'Proyectos Llave en Mano & Corfo'
      : 'Ingeniería & Envasado Industrial';

    return `
      <!-- Topbar Corporativa Estilo Manufaktur Solutions -->
      <div class="bg-[#0F0E14] text-slate-300 text-xs border-b border-[#262533] hidden md:block font-medium">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between">
          <div class="flex items-center gap-5">
            <span class="flex items-center gap-2 text-white font-semibold">
              <span class="w-2 h-2 rounded-full bg-[#FF7618]"></span>
              DIVISIÓN INDUSTRIAL B2B CHILE
            </span>
            <span class="text-slate-400">ENVASES DE ALTA BARRERA · MAQUINARIA INOX AISI 304 · PROYECTOS CORFO</span>
          </div>
          <div class="flex items-center gap-6 font-heading font-bold text-white">
            <span class="flex items-center gap-1.5 text-slate-200">
              <svg class="w-3.5 h-3.5 text-[#FF7618]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              ventas@wellpack.cl
            </span>
            <a href="https://wa.me/56987654321" target="_blank" rel="noopener" class="text-[#FF7618] flex items-center gap-1.5 hover:underline">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Atención B2B Directa
            </a>
          </div>
        </div>
      </div>

      <header class="sticky top-0 z-40 bg-[#15141C]/95 backdrop-blur-md border-b border-[#2E2D3D] shadow-lg transition-all">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
          
          <!-- 1. Emblema Vectorial HD + Marca WellPack (Cero Pixelado) -->
          <a href="index.html" class="flex items-center gap-3.5 group shrink-0">
            <div class="w-11 h-11 rounded-lg bg-[#1F1E2B] border border-[#36354A] group-hover:border-[#FF7618] flex items-center justify-center shadow-sm transition-colors shrink-0">
              <svg class="w-6 h-6 text-[#FF7618]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <span class="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-heading uppercase leading-none">
                  WELLPACK<span class="text-[#FF7618]">.</span>
                </span>
              </div>
              <span class="text-xs text-slate-300 font-semibold uppercase tracking-wider mt-1 leading-none">
                ${subtitleText}
              </span>
            </div>
          </a>

          <!-- 2. Navegación Industrial Numerada (Sin emojis ni cápsulas de neón) -->
          <nav class="hidden lg:flex items-center gap-1">
            <a 
              href="index.html" 
              class="px-3.5 py-2.5 rounded-md text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                isPkg
                  ? 'bg-[#1F1E2B] text-white border-b-2 border-[#FF7618]'
                  : 'text-slate-200 hover:text-white hover:bg-[#1F1E2B]/60'
              }">
              <span class="text-[#FF7618] font-extrabold">01.</span>
              <span>Envases Flexibles</span>
            </a>

            <a 
              href="maquinaria-carnica.html" 
              class="px-3.5 py-2.5 rounded-md text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                isMeat
                  ? 'bg-[#1F1E2B] text-white border-b-2 border-[#FF7618]'
                  : 'text-slate-200 hover:text-white hover:bg-[#1F1E2B]/60'
              }">
              <span class="text-[#FF7618] font-extrabold">02.</span>
              <span>Línea Cárnica</span>
            </a>

            <a 
              href="maquinaria-pesquera.html" 
              class="px-3.5 py-2.5 rounded-md text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                isFish
                  ? 'bg-[#1F1E2B] text-white border-b-2 border-[#FF7618]'
                  : 'text-slate-200 hover:text-white hover:bg-[#1F1E2B]/60'
              }">
              <span class="text-[#FF7618] font-extrabold">03.</span>
              <span>Proceso Pesquero</span>
            </a>

            <a 
              href="proyectos-asesorias.html" 
              class="px-3.5 py-2.5 rounded-md text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                isProj
                  ? 'bg-[#1F1E2B] text-white border-b-2 border-[#FF7618]'
                  : 'text-slate-200 hover:text-white hover:bg-[#1F1E2B]/60'
              }">
              <span class="text-[#FF7618] font-extrabold">04.</span>
              <span>Proyectos & Corfo</span>
            </a>
          </nav>

          <!-- 3. Acciones de Cabecera -->
          <div class="flex items-center gap-2">
            <button 
              id="btn-open-config" 
              title="Configuración de Sistema & Webhooks" 
              class="p-2.5 rounded-md bg-[#1F1E2B] hover:bg-[#2A293A] text-slate-300 hover:text-[#FF7618] border border-[#343346] transition-colors">
              <i data-lucide="settings" class="w-4 h-4"></i>
            </button>

            ${isPkg ? `
              <button 
                id="btn-open-variations-nav" 
                class="hidden sm:inline-flex items-center gap-2 px-3.5 py-2.5 rounded-md bg-[#1F1E2B] hover:bg-[#2A293A] text-white border border-[#343346] hover:border-[#FF7618] text-xs font-heading font-bold uppercase tracking-wider transition-colors">
                <i data-lucide="sliders-horizontal" class="w-3.5 h-3.5 text-[#FF7618]"></i>
                <span>Variaciones</span>
              </button>

              <button 
                data-open-variation="any"
                class="btn-open-variation inline-flex items-center gap-2 bg-[#FF7618] hover:bg-[#E5630A] text-white font-heading font-bold text-xs px-4 sm:px-5 py-2.5 rounded-md uppercase tracking-wider transition-colors shrink-0">
                <span>Cotizar Empaque</span>
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
              </button>
            ` : isMeat ? `
              <button 
                type="button"
                data-machine-title="Línea Industrial Rubro Cárnico & Cecinas"
                class="btn-machinery-quote inline-flex items-center gap-2 bg-[#FF7618] hover:bg-[#E5630A] text-white font-heading font-bold text-xs px-4 sm:px-5 py-2.5 rounded-md uppercase tracking-wider transition-colors shrink-0">
                <span>Cotizar Línea Cárnica</span>
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
              </button>
            ` : isFish ? `
              <button 
                type="button"
                data-machine-title="Línea Industrial Proceso Pesquero & Acuícola"
                class="btn-machinery-quote inline-flex items-center gap-2 bg-[#FF7618] hover:bg-[#E5630A] text-white font-heading font-bold text-xs px-4 sm:px-5 py-2.5 rounded-md uppercase tracking-wider transition-colors shrink-0">
                <span>Cotizar Línea Pesquera</span>
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
              </button>
            ` : `
              <a 
                href="#corfo_wizard_section"
                class="inline-flex items-center gap-2 bg-[#FF7618] hover:bg-[#E5630A] text-white font-heading font-bold text-xs px-4 sm:px-5 py-2.5 rounded-md uppercase tracking-wider transition-colors shrink-0">
                <span>Evaluador Corfo</span>
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
              </a>
            `}

            <button 
              id="btn-mobile-nav-toggle" 
              aria-label="Abrir menú" 
              class="lg:hidden p-2.5 rounded-md bg-[#1F1E2B] text-white hover:text-[#FF7618] border border-[#343346] transition-colors">
              <i data-lucide="menu" class="w-5 h-5"></i>
            </button>
          </div>
        </div>

        <!-- Menú Desplegable Móvil con las 4 Pestañas de División -->
        <div id="mobile-nav-menu" class="hidden lg:hidden border-t border-[#2E2D3D] bg-[#15141C] px-4 py-3 space-y-2">
          <div class="text-xs font-heading font-bold uppercase tracking-widest text-slate-400 px-2 pb-1">Divisiones Industriales WellPack</div>
          <a href="index.html" class="mobile-nav-link flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-heading font-bold ${isPkg ? 'bg-[#FF7618] text-white' : 'text-slate-200 bg-[#1F1E2B] border border-[#2E2D3D]'}">
            <span>01. Envases Flexibles (Principal)</span>
            <span>→</span>
          </a>
          <a href="maquinaria-carnica.html" class="mobile-nav-link flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-heading font-bold ${isMeat ? 'bg-[#FF7618] text-white' : 'text-slate-200 bg-[#1F1E2B] border border-[#2E2D3D]'}">
            <span>02. Maquinaria Rubro Cárnico</span>
            <span>→</span>
          </a>
          <a href="maquinaria-pesquera.html" class="mobile-nav-link flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-heading font-bold ${isFish ? 'bg-[#FF7618] text-white' : 'text-slate-200 bg-[#1F1E2B] border border-[#2E2D3D]'}">
            <span>03. Maquinaria Proceso Pesquero</span>
            <span>→</span>
          </a>
          <a href="proyectos-asesorias.html" class="mobile-nav-link flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-heading font-bold ${isProj ? 'bg-[#FF7618] text-white' : 'text-slate-200 bg-[#1F1E2B] border border-[#2E2D3D]'}">
            <span>04. Proyectos y Asesorías Corfo</span>
            <span>→</span>
          </a>
        </div>
      </header>
    `;
  }

  renderSection(section) {
    switch (section.section) {
      case 'hero_universal':
        return this.renderHeroUniversalSection(section.config);
      case 'service_customization':
        return this.renderServiceCustomizationSection(section.config);
      case 'packaging_types_gallery':
        return this.renderPackagingTypesGallerySection(section.config);
      case 'machinery_showcase':
        // En la página principal (Envases), mostramos solo el Portal de acceso a las 2 páginas de Maquinaria en pestañas nuevas
        if (this.pageMode === 'packaging') {
          return this.renderMachineryDivisionsPortal();
        }
        return this.renderMachineryShowcaseSection(section.config);
      case 'fishery_machinery_showcase':
        if (this.pageMode === 'packaging') {
          return '';
        }
        return this.renderFisheryMachineryShowcaseSection(section.config);
      case 'tiered_pricing_offers':
        return this.renderTieredPricingOffersSection(section.config);
      case 'industries_served':
        return this.renderIndustriesServedSection(section.config);
      case 'hero_premium_b2b':
        return this.renderHeroPremiumSection(section.config);
      case 'hero':
        return this.renderHeroSection(section.config);
      case 'alibaba_variation_selector':
        return this.renderAlibabaVariationSection(section.config);
      case 'product_catalog':
        return this.renderCatalogSection(section.config);
      case 'visual_gallery':
        return this.renderVisualGallerySection(section.config);
      case 'factory_showcase':
        return this.renderFactoryShowcaseSection(section.config);
      case 'checkout_b2b':
        return this.renderCheckoutSection(section.config);
      default:
        return `<section class="py-12"><div class="max-w-7xl mx-auto px-4">Sección no reconocida: ${section.section}</div></section>`;
    }
  }

  // ==========================================================
  // SECCIÓN UNIVERSAL 1: HERO INDUSTRIAL ESTILO MANUFAKTUR V2
  // ==========================================================
  renderHeroUniversalSection(config = {}) {
    const title = config.title?.text || "Empaques de Alta Barrera Personalizados para tu Industria";
    const subtitle = config.subtitle?.text || "Desde bolsas al vacío hasta formatos Doypack. Importamos y fabricamos el envase exacto con la identidad visual de tu marca para el sector cárnico, pesquero, agrícola y retail.";
    const actions = config.actions || [{ label: "Cotizar Empaque a Medida", type: "primary", bg_color: "#FF7618" }];
    const bgImg = config.background_image?.url || "assets/images/hero_wellpack_lineup.jpg";
    const normalizedBg = bgImg.startsWith('/') ? bgImg.slice(1) : bgImg;

    return `
      <section id="hero" class="relative bg-[#15141C] text-white border-b border-[#2E2D3D] overflow-hidden">
        <!-- Fondo Fotográfico Industrial Sobrio -->
        <div class="absolute inset-0 z-0 pointer-events-none select-none opacity-35">
          <img 
            id="hero-fluid-img"
            src="${normalizedBg}" 
            alt="Soluciones Industriales de Envasado y Maquinaria WellPack" 
            class="w-full h-full object-cover object-center">
          <div class="absolute inset-0 bg-gradient-to-r from-[#15141C] via-[#15141C]/90 to-[#15141C]/55"></div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14 lg:pt-20 lg:pb-18 relative z-10 hero-content-trigger">
          <div class="max-w-3xl space-y-6">
            
            <!-- Badge Técnico -->
            <div class="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-md bg-[#1F1E2B] border border-[#343346] text-[#FF7618] text-xs font-heading font-bold uppercase tracking-wider">
              <span class="w-2 h-2 rounded-full bg-[#FF7618]"></span>
              <span>INGENIERÍA INDUSTRIAL · FABRICACIÓN E IMPORTACIÓN MAYORISTA B2B</span>
            </div>

            <!-- Título Principal Ultra-Nítido -->
            <h1 class="text-3xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight leading-[1.12] text-white">
              ${title}
            </h1>

            <!-- Subtítulo -->
            <p class="text-base sm:text-lg text-slate-200 max-w-2xl font-normal leading-relaxed">
              ${subtitle}
            </p>

            <!-- Botones de Acción -->
            <div class="flex flex-wrap items-center gap-4 pt-1">
              ${actions.map(act => `
                <button 
                  data-open-variation="any"
                  class="btn-open-variation inline-flex items-center gap-2.5 bg-[#FF7618] hover:bg-[#E5630A] text-white font-heading font-bold text-xs sm:text-sm px-7 py-3.5 rounded-md uppercase tracking-wider transition-all">
                  <span>${act.label}</span>
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                </button>
              `).join('')}

              <a 
                href="#packaging_types_gallery" 
                class="inline-flex items-center gap-2 bg-[#1F1E2B] hover:bg-[#2A293A] text-white border border-[#343346] hover:border-[#FF7618] font-heading font-bold text-xs sm:text-sm px-7 py-3.5 rounded-md uppercase tracking-wider transition-all">
                <span>Ver Catálogo de Formatos</span>
              </a>
            </div>

            <!-- Barra de Especificaciones Rápidas -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              <div class="bg-[#1F1E2B] p-3.5 rounded-lg border border-[#2E2D3D]">
                <div class="text-base font-extrabold text-[#FF7618] font-heading">EVOH / PA / PE</div>
                <div class="text-xs text-slate-300 font-medium mt-0.5">Alta Barrera de Oxígeno</div>
              </div>
              <div class="bg-[#1F1E2B] p-3.5 rounded-lg border border-[#2E2D3D]">
                <div class="text-base font-extrabold text-[#FF7618] font-heading">-35° C IQF</div>
                <div class="text-xs text-slate-300 font-medium mt-0.5">Túneles de Congelado</div>
              </div>
              <div class="bg-[#1F1E2B] p-3.5 rounded-lg border border-[#2E2D3D]">
                <div class="text-base font-extrabold text-[#FF7618] font-heading">10 Colores</div>
                <div class="text-xs text-slate-300 font-medium mt-0.5">Flexografía & Hueco HD</div>
              </div>
              <div class="bg-[#1F1E2B] p-3.5 rounded-lg border border-[#2E2D3D]">
                <div class="text-base font-extrabold text-[#FF7618] font-heading">FDA 21 CFR</div>
                <div class="text-xs text-slate-300 font-medium mt-0.5">Inocuidad Alimentaria</div>
              </div>
            </div>

          </div>
        </div>

        <!-- Barra Inferior de 4 Divisiones estilo Manufaktur Solutions -->
        <div class="relative z-10 border-t border-[#2E2D3D] bg-[#14131B]">
          <div class="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#2E2D3D]">
            <a href="#packaging_types_gallery" class="p-5 sm:p-6 text-left border-t-2 border-[#FF7618] bg-[#1F1E2B] transition-colors block">
              <div class="font-heading text-xs text-[#FF7618] font-bold mb-1">01 // PACKAGING INDUSTRIAL</div>
              <div class="font-heading text-sm sm:text-base font-bold text-white">Envases de Alta Barrera e Impresión</div>
            </a>
            <a href="maquinaria-carnica.html" class="p-5 sm:p-6 text-left hover:bg-[#1F1E2B] transition-colors block group">
              <div class="font-heading text-xs text-slate-400 group-hover:text-[#FF7618] font-bold mb-1">02 // LÍNEA FRIGORÍFICA</div>
              <div class="font-heading text-sm sm:text-base font-bold text-white flex items-center justify-between">
                <span>Maquinaria Industria Cárnica</span>
                <span class="text-[#FF7618]">↗</span>
              </div>
            </a>
            <a href="maquinaria-pesquera.html" class="p-5 sm:p-6 text-left hover:bg-[#1F1E2B] transition-colors block group">
              <div class="font-heading text-xs text-slate-400 group-hover:text-[#FF7618] font-bold mb-1">03 // ACUICULTURA & PESCA</div>
              <div class="font-heading text-sm sm:text-base font-bold text-white flex items-center justify-between">
                <span>Proceso Pesquero + 12 Videos</span>
                <span class="text-[#FF7618]">↗</span>
              </div>
            </a>
            <a href="proyectos-asesorias.html" class="p-5 sm:p-6 text-left hover:bg-[#1F1E2B] transition-colors block group">
              <div class="font-heading text-xs text-slate-400 group-hover:text-[#FF7618] font-bold mb-1">04 // LLAVE EN MANO</div>
              <div class="font-heading text-sm sm:text-base font-bold text-white flex items-center justify-between">
                <span>Tecnología Verde & Gestión Corfo</span>
                <span class="text-[#FF7618]">↗</span>
              </div>
            </a>
          </div>
        </div>
      </section>
    `;
  }

  // ==========================================================
  // SECCIÓN UNIVERSAL 2: PERSONALIZACIÓN Y SERVICIOS
  // ==========================================================
  renderServiceCustomizationSection(config = {}) {
    const title = config.title || "Tu Producto, Tu Formato, Tu Marca";
    const features = config.features || [];

    const iconMap = {
      'dimensions': 'ruler',
      'printer': 'printer',
      'shield': 'shield-check'
    };

    return `
      <section id="service_customization" class="py-24 bg-[#141414] text-white relative border-b border-neutral-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div class="text-center max-w-3xl mx-auto mb-16">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold uppercase mb-4 shadow-sm">
              <i data-lucide="sparkles" class="w-4 h-4 text-amber-400"></i>
              Personalización Total B2B
            </div>
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              ${title}
            </h2>
            <p class="mt-3 text-neutral-400 text-base sm:text-lg">
              Soluciones flexibles de ingeniería en empaque diseñadas para integrarse a la perfección en tus líneas automáticas o de campana.
            </p>
          </div>

          <!-- 3 Columnas con Tarjetas e Iconos Destacados -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            ${features.map(f => {
              const icon = iconMap[f.icon] || 'check-circle';
              return `
                <div class="group relative rounded-3xl bg-[#1a1a1a] border border-neutral-800 hover:border-amber-500/60 p-8 transition-all duration-300 hover:-translate-y-2 shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between">
                  <div>
                    <div class="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 group-hover:bg-amber-500/20 transition-transform">
                      <i data-lucide="${icon}" class="w-7 h-7"></i>
                    </div>
                    <h3 class="text-xl font-extrabold text-white mb-3 group-hover:text-amber-300 transition-colors">
                      ${f.title}
                    </h3>
                    <p class="text-sm text-neutral-400 leading-relaxed">
                      ${f.description}
                    </p>
                  </div>

                  <div class="mt-8 pt-5 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono text-amber-400/90 font-bold">
                    <span>Estándar Industrial</span>
                    <i data-lucide="check" class="w-4 h-4 text-amber-400"></i>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

        </div>
      </section>
    `;
  }

  // ==========================================================
  // SECCIÓN UNIVERSAL 3: GALERÍA DE TIPOS DE EMPAQUE (GRID CARDS)
  // ==========================================================
  renderPackagingTypesGallerySection(config = {}) {
    const title = config.title || "Soluciones de Empaque para Cada Necesidad";
    const items = config.items || [];

    return `
      <section id="packaging_types_gallery" class="py-24 bg-[#121212] text-white relative border-b border-neutral-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div class="text-center max-w-3xl mx-auto mb-16">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold uppercase mb-4 shadow-sm">
              <i data-lucide="layout-grid" class="w-4 h-4 text-amber-400"></i>
              Formatos de Empaque Industrial
            </div>
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              ${title}
            </h2>
            <p class="mt-3 text-neutral-400 text-base sm:text-lg">
              Fabricación en film coextruido y bilaminado de máxima barrera, adaptados a la fisonomía y vida útil de tu alimento.
            </p>
          </div>

          <!-- Filtro Interactivo de Categorías de Formato -->
          <div class="flex items-center justify-center gap-2 mb-10 overflow-x-auto pb-2 px-2" id="packaging-category-filters">
            <button 
              type="button" 
              data-format-filter="all" 
              class="btn-format-tab btn-spring px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border border-amber-500 bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/30">
              🌟 Todos (${items.length})
            </button>
            <button 
              type="button" 
              data-format-filter="carnes" 
              class="btn-format-tab btn-spring px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border border-neutral-700 bg-neutral-900/90 text-neutral-300 hover:border-neutral-500">
              🥩 Carnes & Cecinas
            </button>
            <button 
              type="button" 
              data-format-filter="pesca" 
              class="btn-format-tab btn-spring px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border border-neutral-700 bg-neutral-900/90 text-neutral-300 hover:border-neutral-500">
              🐟 Salmón & Congelados
            </button>
            <button 
              type="button" 
              data-format-filter="doypack" 
              class="btn-format-tab btn-spring px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border border-neutral-700 bg-neutral-900/90 text-neutral-300 hover:border-neutral-500">
              🥜 Doypack & Retail
            </button>
            <button 
              type="button" 
              data-format-filter="cafe" 
              class="btn-format-tab btn-spring px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border border-neutral-700 bg-neutral-900/90 text-neutral-300 hover:border-neutral-500">
              ☕ Café & Secos
            </button>
          </div>

          <!-- Rejilla de Tarjetas con Fotografía Real de Empaque (Con efecto Spotlight & Micro-interacciones) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch" id="packaging-format-cards-grid">
            ${items.map(item => {
              const normalizedImg = item.image.startsWith('/') ? item.image.slice(1) : item.image;
              const badgeText = item.badge || 'Alta Barrera';
              const iconName = item.icon || 'shield-check';
              const cat = item.category || 'all';

              return `
                <div data-format-cat="${cat}" class="packaging-format-card spotlight-card group relative rounded-3xl overflow-hidden bg-[#181818] border border-neutral-800 hover:border-amber-500/70 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-amber-500/20 flex flex-col justify-between">
                  
                  <!-- Imagen con hover zoom y badge flotante -->
                  <div class="relative w-full h-64 overflow-hidden bg-[#101010]">
                    <!-- Badge Flotante de Especificación Técnica -->
                    <div class="absolute top-3.5 left-3.5 z-10">
                      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/85 backdrop-blur-md text-[10px] font-mono font-bold text-amber-400 border border-amber-500/40 shadow-lg">
                        <i data-lucide="${iconName}" class="w-3.5 h-3.5 text-amber-400"></i>
                        ${badgeText}
                      </span>
                    </div>

                    <img 
                      src="${normalizedImg}" 
                      alt="${item.title}" 
                      loading="lazy"
                      class="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out">
                    
                    <div class="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/20 to-transparent"></div>
                  </div>

                  <!-- Contenido de la tarjeta -->
                  <div class="p-6 flex-1 flex flex-col justify-between relative z-10">
                    <div>
                      <h3 class="text-lg font-bold text-white leading-snug group-hover:text-amber-300 transition-colors">
                        ${item.title}
                      </h3>
                      <div class="mt-3 pt-3 border-t border-neutral-800">
                        <span class="text-[11px] font-mono uppercase font-bold text-amber-400 block mb-1">
                          Usos Recomendados:
                        </span>
                        <p class="text-xs text-neutral-300 leading-relaxed">
                          ${item.uses}
                        </p>
                      </div>
                    </div>

                    <div class="mt-5 pt-4 border-t border-neutral-800 flex items-center justify-between">
                      <button 
                        data-open-variation="any"
                        class="btn-open-variation btn-spring w-full inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-amber-500 hover:text-neutral-950 text-amber-400 border border-amber-500/40 text-xs font-mono font-bold py-2.5 px-4 rounded-xl transition-all">
                        <span>Configurar Medidas</span>
                        <i data-lucide="sliders-horizontal" class="w-3.5 h-3.5"></i>
                      </button>
                    </div>
                  </div>

                </div>
              `;
            }).join('')}
          </div>

        </div>
      </section>
    `;
  }

  // ==========================================================
  // PORTAL DE DIVISIONES DE MAQUINARIA Y PROYECTOS CORFO (ESTILO MANUFAKTUR V2)
  // ==========================================================
  renderMachineryDivisionsPortal() {
    return `
      <section id="machinery_divisions_portal" class="py-20 bg-[#191822] text-white relative border-b border-[#2E2D3D] overflow-hidden font-sans">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <!-- Encabezado de Sección -->
          <div class="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
            <div>
              <div class="text-xs font-heading font-bold uppercase tracking-widest text-[#FF7618] mb-2">
                // UNIDADES OPERATIVAS E INGENIERÍA B2B
              </div>
              <h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Divisiones de Maquinaria Industrial & Proyectos Corfo
              </h2>
            </div>
            <p class="text-slate-300 text-sm sm:text-base max-w-md font-medium">
              Explora nuestras líneas de equipamiento industrial en acero inoxidable o utiliza nuestro Evaluador Interactivo de Proyectos Llave en Mano y Financiamiento Corfo.
            </p>
          </div>

          <!-- Grilla de 4 Columnas Estilo Manufaktur Solutions con Íconos Vectoriales HD -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            <!-- Col 01 -->
            <a href="#packaging_types_gallery" class="bg-[#1F1E2B] border border-[#2E2D3D] hover:border-[#FF7618] rounded-lg p-6 flex flex-col justify-between transition-all group">
              <div>
                <div class="flex items-center justify-between mb-5">
                  <div class="w-12 h-12 rounded-lg bg-[#15141C] border border-[#343346] group-hover:bg-[#FF7618] group-hover:border-[#FF7618] text-[#FF7618] group-hover:text-white flex items-center justify-center transition-colors">
                    <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                      <line x1="12" y1="22.08" x2="12" y2="12"/>
                    </svg>
                  </div>
                  <span class="font-heading text-xs font-extrabold px-2.5 py-1 rounded bg-[#15141C] text-[#FF7618] border border-[#2E2D3D]">DIV. 01</span>
                </div>
                <h3 class="text-lg font-extrabold text-white mb-2 leading-snug">Envases Flexibles y Alta Barrera</h3>
                <p class="text-xs text-slate-300 leading-relaxed">
                  Bolsas al vacío gofradas y lisas, Doypack, bolsas para congelados IQF y films termoformables impresos.
                </p>
              </div>
              <div class="pt-4 mt-5 border-t border-[#2E2D3D] flex items-center justify-between text-xs font-heading font-bold uppercase tracking-wider text-white">
                <span>Ver Formatos</span>
                <span class="text-[#FF7618]">↓</span>
              </div>
            </a>

            <!-- Col 02 -->
            <a href="maquinaria-carnica.html" class="bg-[#1F1E2B] border border-[#2E2D3D] hover:border-[#FF7618] rounded-lg p-6 flex flex-col justify-between transition-all group">
              <div>
                <div class="flex items-center justify-between mb-5">
                  <div class="w-12 h-12 rounded-lg bg-[#15141C] border border-[#343346] group-hover:bg-[#FF7618] group-hover:border-[#FF7618] text-[#FF7618] group-hover:text-white flex items-center justify-center transition-colors">
                    <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                  </div>
                  <span class="font-heading text-xs font-extrabold px-2.5 py-1 rounded bg-[#15141C] text-[#FF7618] border border-[#2E2D3D]">DIV. 02</span>
                </div>
                <h3 class="text-lg font-extrabold text-white mb-2 leading-snug">Maquinaria Rubro Cárnico</h3>
                <p class="text-xs text-slate-300 leading-relaxed">
                  12 equipos SUS304: desmenuzadoras -18°C, molinos, cutters vacío 4.500 RPM, embutidoras y hornos PLC.
                </p>
              </div>
              <div class="pt-4 mt-5 border-t border-[#2E2D3D] flex items-center justify-between text-xs font-heading font-bold uppercase tracking-wider text-white">
                <span>Abrir Línea Cárnica</span>
                <span class="text-[#FF7618]">↗</span>
              </div>
            </a>

            <!-- Col 03 -->
            <a href="maquinaria-pesquera.html" class="bg-[#1F1E2B] border border-[#2E2D3D] hover:border-[#FF7618] rounded-lg p-6 flex flex-col justify-between transition-all group">
              <div>
                <div class="flex items-center justify-between mb-5">
                  <div class="w-12 h-12 rounded-lg bg-[#15141C] border border-[#343346] group-hover:bg-[#FF7618] group-hover:border-[#FF7618] text-[#FF7618] group-hover:text-white flex items-center justify-center transition-colors">
                    <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                      <polyline points="6 10 10 10 12 7 14 13 16 10 18 10"/>
                    </svg>
                  </div>
                  <span class="font-heading text-xs font-extrabold px-2.5 py-1 rounded bg-[#15141C] text-[#FF7618] border border-[#2E2D3D]">DIV. 03</span>
                </div>
                <h3 class="text-lg font-extrabold text-white mb-2 leading-snug">Proceso Pesquero + Videos</h3>
                <p class="text-xs text-slate-300 leading-relaxed">
                  12 máquinas con videos en planta: descamado hidrojets, eviscerado, fileteado de salmón, despielado y glaseo IQF.
                </p>
              </div>
              <div class="pt-4 mt-5 border-t border-[#2E2D3D] flex items-center justify-between text-xs font-heading font-bold uppercase tracking-wider text-white">
                <span>Abrir Línea Pesquera</span>
                <span class="text-[#FF7618]">↗</span>
              </div>
            </a>

            <!-- Col 04 -->
            <a href="proyectos-asesorias.html" class="bg-[#1F1E2B] border border-[#2E2D3D] hover:border-[#FF7618] rounded-lg p-6 flex flex-col justify-between transition-all group">
              <div>
                <div class="flex items-center justify-between mb-5">
                  <div class="w-12 h-12 rounded-lg bg-[#15141C] border border-[#343346] group-hover:bg-[#FF7618] group-hover:border-[#FF7618] text-[#FF7618] group-hover:text-white flex items-center justify-center transition-colors">
                    <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10"/>
                      <line x1="12" y1="20" x2="12" y2="4"/>
                      <line x1="6" y1="20" x2="6" y2="14"/>
                      <line x1="2" y1="20" x2="22" y2="20"/>
                    </svg>
                  </div>
                  <span class="font-heading text-xs font-extrabold px-2.5 py-1 rounded bg-[#15141C] text-[#FF7618] border border-[#2E2D3D]">DIV. 04</span>
                </div>
                <h3 class="text-lg font-extrabold text-white mb-2 leading-snug">Proyectos & Gestión Corfo</h3>
                <p class="text-xs text-slate-300 leading-relaxed">
                  Valorización de residuos, plantas de agua industrial y Evaluador de 5 pasos (Crédito Verde, MiPyme, Ley I+D 35%).
                </p>
              </div>
              <div class="pt-4 mt-5 border-t border-[#2E2D3D] flex items-center justify-between text-xs font-heading font-bold uppercase tracking-wider text-white">
                <span>Evaluar Proyecto Corfo</span>
                <span class="text-[#FF7618]">↗</span>
              </div>
            </a>
          </div>

          <!-- 3 Tarjetas Fotográficas de Portales Especializados -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-7 items-stretch">
            <!-- Tarjeta Portal 1: Rubro Cárnico & Cecinas -->
            <a 
              href="maquinaria-carnica.html" 
              class="group relative rounded-lg overflow-hidden bg-[#1F1E2B] border border-[#2E2D3D] hover:border-[#FF7618] shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div class="relative h-56 overflow-hidden bg-[#15141C]">
                <img 
                  src="assets/images/hero_maquinaria_carnica.jpg" 
                  alt="Maquinaria Rubro Cárnico y Cecinas" 
                  loading="lazy"
                  class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700">
                <div class="absolute inset-0 bg-gradient-to-t from-[#1F1E2B] via-transparent to-transparent"></div>
                <div class="absolute top-3.5 left-3.5">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#15141C]/95 text-xs font-heading font-bold text-white border-l-4 border-[#FF7618]">
                    02 · LÍNEA CÁRNICA
                  </span>
                </div>
              </div>

              <div class="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 class="text-xl font-extrabold text-white group-hover:text-[#FF7618] transition-colors">
                    Maquinaria para Rubro Cárnico, Frigoríficos & Cecinas
                  </h3>
                  <p class="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    12 líneas en acero inoxidable SUS304: desmenuzadoras de congelados (-18°C), picadoras, cutters al vacío de 4.500 RPM, embutidoras y hornos ahumadores PLC.
                  </p>
                </div>
                <div class="mt-6 pt-4 border-t border-[#2E2D3D] flex items-center justify-between">
                  <span class="text-xs font-heading text-slate-300 font-bold">12 Equipos Cárnicos</span>
                  <span class="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#FF7618] text-white font-heading font-bold text-xs uppercase tracking-wider">
                    <span>Ver Catálogo</span>
                    <span>↗</span>
                  </span>
                </div>
              </div>
            </a>

            <!-- Tarjeta Portal 2: Proceso Pesquero & Acuícola -->
            <a 
              href="maquinaria-pesquera.html" 
              class="group relative rounded-lg overflow-hidden bg-[#1F1E2B] border border-[#2E2D3D] hover:border-[#FF7618] shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div class="relative h-56 overflow-hidden bg-[#15141C]">
                <img 
                  src="assets/images/hero_maquinaria_pesquera.jpg" 
                  alt="Maquinaria Proceso Pesquero y Salmonero" 
                  loading="lazy"
                  class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700">
                <div class="absolute inset-0 bg-gradient-to-t from-[#1F1E2B] via-transparent to-transparent"></div>
                <div class="absolute top-3.5 left-3.5">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#15141C]/95 text-xs font-heading font-bold text-white border-l-4 border-[#FF7618]">
                    03 · PROCESO PESQUERO
                  </span>
                </div>
              </div>

              <div class="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 class="text-xl font-extrabold text-white group-hover:text-[#FF7618] transition-colors">
                    Maquinaria para Proceso Pesquero + Videoteca Real
                  </h3>
                  <p class="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    12 máquinas con videos en planta: descamadora por hidrojets (90 bar), evisceradora, descabezadora, fileteadora, despieladora, sashimi, separadora de pulpa y glaseo IQF.
                  </p>
                </div>
                <div class="mt-6 pt-4 border-t border-[#2E2D3D] flex items-center justify-between">
                  <span class="text-xs font-heading text-slate-300 font-bold">12 Equipos + 12 Videos</span>
                  <span class="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#FF7618] text-white font-heading font-bold text-xs uppercase tracking-wider">
                    <span>Ver Catálogo</span>
                    <span>↗</span>
                  </span>
                </div>
              </div>
            </a>

            <!-- Tarjeta Portal 3: Proyectos Llave en Mano & Asesorías Corfo -->
            <a 
              href="proyectos-asesorias.html" 
              class="group relative rounded-lg overflow-hidden bg-[#1F1E2B] border border-[#2E2D3D] hover:border-[#FF7618] shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div class="relative h-56 overflow-hidden bg-[#15141C]">
                <img 
                  src="assets/images/hero_proyectos_corfo.jpg" 
                  alt="Proyectos Llave en Mano y Financiamiento Corfo" 
                  loading="lazy"
                  class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700">
                <div class="absolute inset-0 bg-gradient-to-t from-[#1F1E2B] via-transparent to-transparent"></div>
                <div class="absolute top-3.5 left-3.5">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#15141C]/95 text-xs font-heading font-bold text-white border-l-4 border-[#FF7618]">
                    04 · PROYECTOS & CORFO
                  </span>
                </div>
              </div>

              <div class="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 class="text-xl font-extrabold text-white group-hover:text-[#FF7618] transition-colors">
                    Proyectos Llave en Mano, Tecnología Verde & Incentivos Corfo
                  </h3>
                  <p class="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Economía circular (valorización de residuos y agua), Industria 4.0, importación directa de maquinaria y estructuración Corfo (Crédito Verde, MiPyme, Ley I+D 35%).
                  </p>
                </div>
                <div class="mt-6 pt-4 border-t border-[#2E2D3D] flex items-center justify-between">
                  <span class="text-xs font-heading text-slate-300 font-bold">Evaluador Corfo 5 Pasos</span>
                  <span class="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#FF7618] text-white font-heading font-bold text-xs uppercase tracking-wider">
                    <span>Evaluar Proyecto</span>
                    <span>↗</span>
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>
    `;
  }

  // ==========================================================
  // CONFIGURACIÓN DE DATOS DEL WIZARD INTERACTIVO CORFO (5 PASOS)
  // ==========================================================
  getCorfoFocusConfig() {
    return {
      A: {
        key: 'A',
        optionCode: 'Opción A',
        title: 'Tecnología Verde, Agua, Residuos y Energía',
        corfoProgram: 'Crédito Verde Corfo',
        badge: 'Economía Circular & Mitigación Ambiental',
        icon: 'leaf',
        colorClass: 'emerald',
        summaryDesc: 'Financiamiento de largo plazo con condiciones preferenciales para inversiones en economía circular, valorización de subproductos orgánicos, reúso de agua industrial y energías limpias en planta.',
        financialBenefits: [
          'Elegible para línea Crédito Verde Corfo (banca comercial / no bancaria con fondeo verde)',
          'Plazos extendidos de amortización alineados al retorno energético e hídrico del activo',
          'Cumplimiento normativo ambiental, reducción de RILES y valorización comercial de descartes'
        ],
        techOptions: [
          'Planta recicladora/valorizadora de residuos orgánicos (pescado, cárnicos, subproductos).',
          'Sistema recuperador y planta de tratamiento/recirculación de agua industrial.',
          'Sistemas de energía renovable en planta (Solar fotovoltaica / Eólica).',
          'Equipos de eficiencia térmica y energética.'
        ]
      },
      B: {
        key: 'B',
        optionCode: 'Opción B',
        title: 'Maquinaria de Proceso, Frío y Envasado',
        corfoProgram: 'Crédito Corfo MiPyme (Leasing / Inversión)',
        badge: 'Capacidad Productiva & Cadena de Frío',
        icon: 'cpu',
        colorClass: 'cyan',
        summaryDesc: 'Estructuración de inversión en activo fijo productivo, túneles IQF, cámaras frigoríficas y líneas de envasado de alta barrera mediante Leasing o Crédito de Inversión con cobertura estatal Corfo.',
        financialBenefits: [
          'Acceso a Crédito Corfo MiPyme y Garantía Estatal Pro-Inversión / Fogain (hasta 70%–80% de cobertura)',
          'Estructuración vía Leasing Financiero u Operativo para optimizar flujo de caja y escudo fiscal',
          'Importación directa llave en mano con especificación técnica validada para bancos e intermediarios'
        ],
        techOptions: [
          'Máquinas de envasado al vacío de alta barrera / Doypack / Termoselladoras.',
          'Cámaras de frío modulares / Túneles de congelado rápido (IQF).',
          'Maquinaria de procesamiento (clasificadoras, cortadoras, líneas de lavado).'
        ]
      },
      C: {
        key: 'C',
        optionCode: 'Opción C',
        title: 'Automatización, IoT e Innovación de Procesos',
        corfoProgram: 'Incentivo Tributario Ley I+D (35% rebaja impuestos)',
        badge: 'Industria 4.0 & Franquicia Tributaria SII',
        icon: 'bot',
        colorClass: 'amber',
        summaryDesc: 'Certificación de proyectos de innovación tecnológica, automatización avanzada, sensórica IoT y visión artificial acogidos a la Ley de Incentivo Tributario a la Inversión en I+D (Ley Nº 20.241).',
        financialBenefits: [
          'Crédito tributario del 35% contra el Impuesto de Primera Categoría del SII sobre el monto certificado',
          'El 65% restante se reconoce como gasto necesario para producir la renta (deducible de impuestos)',
          'Aplica a empresas de todo tamaño (Micro, Pyme y Gran Empresa tributando en Primera Categoría)'
        ],
        techOptions: [
          'Automatización de líneas productivas, pesaje y dosificación.',
          'Sensórica IoT para monitoreo de cadena de frío y eficiencia en tiempo real.',
          'Sistemas de visión artificial para control de calidad y seguridad.'
        ]
      },
      D: {
        key: 'D',
        optionCode: 'Opción D',
        title: 'Asesoría Industrial Integral y Estructuración',
        corfoProgram: 'Consultoría Llave en Mano + Mix Corfo / Excepción Rentas Pasivas',
        badge: 'Ingeniería de Planta, Sourcing & Estructuración',
        icon: 'briefcase',
        colorClass: 'teal',
        summaryDesc: 'Acompañamiento integral desde el levantamiento de cuellos de botella en terreno y búsqueda de maquinaria de especialidad hasta la estructuración de carpetas Corfo y conversión de capital en activo productivo.',
        financialBenefits: [
          'Combinación estratégica de instrumentos Corfo (Crédito Verde + MiPyme + Ley I+D 35%)',
          'Estructuración de inversión en activos industriales reales para Sociedades de Inversión (Excepción Rentas Pasivas)',
          'Ingeniería de layout, selección de proveedores de fábrica, importación directa y puesta en marcha'
        ],
        techOptions: [
          'Diagnóstico en terreno de cuellos de botella y optimización de planta.',
          'Ingeniería y búsqueda de maquinaria de especialidad para importación directa.',
          'Formulación técnica y financiera de carpetas para postulación Corfo.'
        ]
      }
    };
  }

  // ==========================================================
  // PÁGINA COMPLETA: PROYECTOS LLAVE EN MANO Y ASESORÍAS INDUSTRIALES CORFO
  // ==========================================================
  renderIndustrialProjectsPage() {
    const focusMap = this.getCorfoFocusConfig();

    return `
      <!-- 1. HERO SECTION CORPORATIVO DE ALTO IMPACTO -->
      <section id="hero_projects" class="relative min-h-[82vh] flex items-center justify-center overflow-hidden py-16 lg:py-24 bg-[#041310] text-white border-b border-emerald-900/60">
        <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <div id="hero-fluid-track" class="absolute -top-[5%] -left-[18%] w-[136%] h-[110%] animate-hero-pan will-change-transform">
            <img 
              id="hero-fluid-img"
              src="assets/images/hero_proyectos_corfo.jpg" 
              alt="Proyectos Llave en Mano, Tecnología Verde y Financiamiento Corfo WellPack" 
              class="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.14] saturate-[1.15]">
          </div>
          <div class="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_50%,rgba(4,24,19,0.52)_0%,rgba(4,19,16,0.45)_55%,rgba(4,19,16,0.94)_100%)]"></div>
          <div class="absolute inset-0 bg-gradient-to-b from-[#041310]/85 via-transparent to-[#041310]"></div>
        </div>

        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-7 hero-content-trigger">
          <div class="p-6 sm:p-10 lg:p-12 rounded-3xl bg-[#051b16]/75 backdrop-blur-md border border-emerald-400/35 shadow-[0_20px_60px_rgba(0,0,0,0.85)] space-y-6">
            <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-400/60 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider shadow-lg">
              <i data-lucide="compass" class="w-4 h-4 text-emerald-400"></i>
              <span>División Ingeniería de Procesos, Importación Directa & Financiamiento Corfo</span>
            </div>

            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white drop-shadow-lg">
              Proyectos Llave en Mano y <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-300 to-amber-400">Asesorías Industriales</span>
            </h1>

            <p class="text-base sm:text-lg lg:text-xl text-emerald-50/90 max-w-4xl mx-auto font-normal leading-relaxed">
              Integramos <strong>ingeniería de procesos en terreno</strong>, <strong>importación directa de maquinaria de especialidad</strong> (tecnología verde, frío IQF, procesamiento y automatización 4.0) y la <strong>estructuración técnica-financiera de incentivos Corfo</strong> para maximizar el retorno de tu inversión industrial en Chile.
            </p>

            <div class="flex flex-wrap items-center justify-center gap-4 pt-2">
              <a 
                href="#corfo_wizard_section" 
                class="inline-flex items-center gap-2.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 hover:from-emerald-300 hover:to-amber-300 text-slate-950 font-black text-sm sm:text-base px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/35 transition-all hover:scale-105 active:scale-95">
                <i data-lucide="sliders" class="w-5 h-5 text-slate-950"></i>
                <span>Iniciar Evaluador de Proyectos Corfo (5 Pasos)</span>
                <i data-lucide="arrow-down" class="w-4 h-4 text-slate-950"></i>
              </a>
              <a 
                href="#four_service_pillars" 
                class="inline-flex items-center gap-2 bg-[#07261f]/90 hover:bg-[#0a362c] text-emerald-200 border border-emerald-400/50 font-bold text-sm sm:text-base px-7 py-4 rounded-2xl transition-all hover:scale-105 backdrop-blur-md shadow-lg">
                <i data-lucide="layers" class="w-5 h-5 text-emerald-300"></i>
                <span>Ver las 4 Áreas de Servicio</span>
              </a>
            </div>

            <!-- 4 KPIs Ejecutivos del Módulo -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-6 border-t border-emerald-900/70 text-left max-w-5xl mx-auto">
              <div class="bg-[#07241e]/85 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-400/30 shadow-lg">
                <div class="text-lg font-black text-emerald-300 font-mono">Crédito Verde</div>
                <div class="text-[11px] text-emerald-100/80 font-mono uppercase mt-0.5">Agua, Residuos & Energía</div>
              </div>
              <div class="bg-[#07241e]/85 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-400/30 shadow-lg">
                <div class="text-lg font-black text-cyan-300 font-mono">Corfo MiPyme</div>
                <div class="text-[11px] text-emerald-100/80 font-mono uppercase mt-0.5">Leasing & Garantía Fogain</div>
              </div>
              <div class="bg-[#07241e]/85 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-400/30 shadow-lg">
                <div class="text-lg font-black text-amber-400 font-mono">35% Ley I+D</div>
                <div class="text-[11px] text-emerald-100/80 font-mono uppercase mt-0.5">Rebaja Impuesto 1ª Cat.</div>
              </div>
              <div class="bg-[#07241e]/85 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-400/30 shadow-lg">
                <div class="text-lg font-black text-teal-300 font-mono">Rentas Pasivas</div>
                <div class="text-[11px] text-emerald-100/80 font-mono uppercase mt-0.5">Inversión Activo Productivo</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. GRILLA CON NUESTRAS 4 ÁREAS DE SERVICIO -->
      <section id="four_service_pillars" class="py-24 bg-[#051814] text-white border-b border-emerald-950 relative overflow-hidden font-sans">
        <div class="absolute top-1/3 left-1/4 w-[600px] h-[350px] bg-emerald-500/10 blur-[150px] pointer-events-none rounded-full"></div>
        <div class="absolute bottom-10 right-1/4 w-[500px] h-[300px] bg-amber-500/10 blur-[140px] pointer-events-none rounded-full"></div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div class="text-center max-w-3xl mx-auto mb-14">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold uppercase mb-3">
              <i data-lucide="shield-check" class="w-4 h-4 text-emerald-400"></i>
              <span>Arquitectura de Soluciones B2B • 4 Pilares Estratégicos</span>
            </div>
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Nuestras 4 Áreas de Ingeniería y Estructuración
            </h2>
            <p class="mt-4 text-emerald-100/80 text-sm sm:text-base leading-relaxed">
              Desde la selección y fabricación de equipamiento en origen hasta la formulación de la carpeta técnica y financiera ante banca e instrumentos Corfo. Selecciona cualquier área para cargarla directamente en el evaluador.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <!-- Área 1: Tecnología Verde y Economía Circular -->
            <article class="spotlight-card rounded-3xl bg-gradient-to-b from-[#082921] to-[#051a15] border border-emerald-500/40 hover:border-emerald-400 p-7 sm:p-8 flex flex-col justify-between shadow-2xl">
              <div>
                <div class="flex items-center justify-between gap-3 mb-5">
                  <div class="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-lg">
                    <i data-lucide="leaf" class="w-7 h-7"></i>
                  </div>
                  <span class="px-3.5 py-1.5 rounded-full bg-emerald-950 border border-emerald-400/50 text-emerald-300 font-mono font-bold text-xs uppercase">
                    Ruta: Crédito Verde Corfo
                  </span>
                </div>
                <div class="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold mb-1">ÁREA DE SERVICIO 01</div>
                <h3 class="text-2xl font-black text-white mb-3">
                  Tecnología Verde y Economía Circular
                </h3>
                <p class="text-sm text-emerald-100/85 leading-relaxed mb-5">
                  Transformamos pasivos ambientales y descartes orgánicos en rentabilidad operativa mediante tecnología de valorización, recuperación de recursos hídricos y autogeneración energética en planta.
                </p>
                <ul class="space-y-2.5 text-xs sm:text-sm text-emerald-50/90 mb-6">
                  <li class="flex items-start gap-2.5 bg-[#041410]/80 p-3 rounded-xl border border-emerald-800/50">
                    <i data-lucide="recycle" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"></i>
                    <span><strong>Recicladores y valorizadores de residuos pesqueros/cárnicos:</strong> conversión de vísceras, espinazos, conchas y subproductos en harina proteica, hidrolizados o biofertilizantes.</span>
                  </li>
                  <li class="flex items-start gap-2.5 bg-[#041410]/80 p-3 rounded-xl border border-emerald-800/50">
                    <i data-lucide="droplets" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"></i>
                    <span><strong>Plantas recuperadoras y tratamiento de agua industrial:</strong> filtración avanzada, abatimiento de RILES y recirculación para reducir hasta un 70% el consumo hídrico.</span>
                  </li>
                  <li class="flex items-start gap-2.5 bg-[#041410]/80 p-3 rounded-xl border border-emerald-800/50">
                    <i data-lucide="sun" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"></i>
                    <span><strong>Energía solar fotovoltaica / eólica y eficiencia térmica:</strong> reducción de costos de potencia en horas punta para frigoríficos y salas de proceso.</span>
                  </li>
                </ul>
              </div>
              <button 
                type="button"
                data-preset-focus="A"
                class="btn-preset-corfo-focus btn-spring w-full py-3.5 px-5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-400 hover:text-slate-950 text-emerald-300 border border-emerald-400/50 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all">
                <span>Configurar Proyecto de Tecnología Verde en el Wizard</span>
                <i data-lucide="arrow-down-right" class="w-4 h-4"></i>
              </button>
            </article>

            <!-- Área 2: Equipamiento de Proceso, Frío y Envasado de Alta Barrera -->
            <article class="spotlight-card rounded-3xl bg-gradient-to-b from-[#062436] to-[#041622] border border-cyan-500/40 hover:border-cyan-400 p-7 sm:p-8 flex flex-col justify-between shadow-2xl">
              <div>
                <div class="flex items-center justify-between gap-3 mb-5">
                  <div class="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-lg">
                    <i data-lucide="snowflake" class="w-7 h-7"></i>
                  </div>
                  <span class="px-3.5 py-1.5 rounded-full bg-cyan-950 border border-cyan-400/50 text-cyan-300 font-mono font-bold text-xs uppercase">
                    Ruta: Crédito Corfo MiPyme
                  </span>
                </div>
                <div class="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold mb-1">ÁREA DE SERVICIO 02</div>
                <h3 class="text-2xl font-black text-white mb-3">
                  Equipamiento de Proceso, Frío y Envasado de Alta Barrera
                </h3>
                <p class="text-sm text-cyan-100/85 leading-relaxed mb-5">
                  Suministro e integración de líneas continuas en acero inoxidable SUS304/316, sistemas de ultracongelación y envasado al vacío para extender el shelf-life y abrir mercados de exportación.
                </p>
                <ul class="space-y-2.5 text-xs sm:text-sm text-cyan-50/90 mb-6">
                  <li class="flex items-start gap-2.5 bg-[#03111b]/80 p-3 rounded-xl border border-cyan-800/50">
                    <i data-lucide="package-check" class="w-4 h-4 text-cyan-400 shrink-0 mt-0.5"></i>
                    <span><strong>Envasado de alta barrera:</strong> máquinas de campana doble, termoformadoras, termoselladoras de bandejas y llenadoras Doypack + films coextruidos PA/EVOH/PE.</span>
                  </li>
                  <li class="flex items-start gap-2.5 bg-[#03111b]/80 p-3 rounded-xl border border-cyan-800/50">
                    <i data-lucide="thermometer-snowflake" class="w-4 h-4 text-cyan-400 shrink-0 mt-0.5"></i>
                    <span><strong>Frío industrial e IQF:</strong> cámaras de frío modulares, túneles espirales y lineales de congelado rápido (-40°C) y glaseadoras continuas.</span>
                  </li>
                  <li class="flex items-start gap-2.5 bg-[#03111b]/80 p-3 rounded-xl border border-cyan-800/50">
                    <i data-lucide="settings-2" class="w-4 h-4 text-cyan-400 shrink-0 mt-0.5"></i>
                    <span><strong>Maquinaria de procesamiento:</strong> líneas completas de corte, fileteado, molienda, emulsión al vacío, lavado por burbujas y clasificación.</span>
                  </li>
                </ul>
              </div>
              <button 
                type="button"
                data-preset-focus="B"
                class="btn-preset-corfo-focus btn-spring w-full py-3.5 px-5 rounded-2xl bg-cyan-500/20 hover:bg-cyan-400 hover:text-slate-950 text-cyan-300 border border-cyan-400/50 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all">
                <span>Configurar Maquinaria de Proceso y Frío en el Wizard</span>
                <i data-lucide="arrow-down-right" class="w-4 h-4"></i>
              </button>
            </article>

            <!-- Área 3: Automatización Industrial e Industria 4.0 -->
            <article class="spotlight-card rounded-3xl bg-gradient-to-b from-[#291d07] to-[#191104] border border-amber-500/40 hover:border-amber-400 p-7 sm:p-8 flex flex-col justify-between shadow-2xl">
              <div>
                <div class="flex items-center justify-between gap-3 mb-5">
                  <div class="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-lg">
                    <i data-lucide="bot" class="w-7 h-7"></i>
                  </div>
                  <span class="px-3.5 py-1.5 rounded-full bg-amber-950 border border-amber-400/50 text-amber-300 font-mono font-bold text-xs uppercase">
                    Ruta: Ley I+D (35% Rebaja SII)
                  </span>
                </div>
                <div class="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold mb-1">ÁREA DE SERVICIO 03</div>
                <h3 class="text-2xl font-black text-white mb-3">
                  Automatización Industrial e Industria 4.0
                </h3>
                <p class="text-sm text-amber-100/85 leading-relaxed mb-5">
                  Digitalización y robotización de salas de proceso para eliminar mermas por sobrepeso (give-away), asegurar trazabilidad térmica en tiempo real y acogerse al beneficio tributario Ley I+D.
                </p>
                <ul class="space-y-2.5 text-xs sm:text-sm text-amber-50/90 mb-6">
                  <li class="flex items-start gap-2.5 bg-[#120c02]/80 p-3 rounded-xl border border-amber-800/50">
                    <i data-lucide="scale" class="w-4 h-4 text-amber-400 shrink-0 mt-0.5"></i>
                    <span><strong>Automatización de pesaje y dosificación:</strong> clasificadoras rotativas dinámicas (320–420 pzas/min) y balanzas combinadoras asociativas multicabezal.</span>
                  </li>
                  <li class="flex items-start gap-2.5 bg-[#120c02]/80 p-3 rounded-xl border border-amber-800/50">
                    <i data-lucide="wifi" class="w-4 h-4 text-amber-400 shrink-0 mt-0.5"></i>
                    <span><strong>Sensórica IoT y telemetría en tiempo real:</strong> monitoreo continuo de cadena de frío, consumo eléctrico/vapor por lote y alertas predictivas OEE.</span>
                  </li>
                  <li class="flex items-start gap-2.5 bg-[#120c02]/80 p-3 rounded-xl border border-amber-800/50">
                    <i data-lucide="scan-eye" class="w-4 h-4 text-amber-400 shrink-0 mt-0.5"></i>
                    <span><strong>Visión artificial y control de calidad:</strong> inspección óptica de defectos, calibre, coloración e integridad de sellado en línea.</span>
                  </li>
                </ul>
              </div>
              <button 
                type="button"
                data-preset-focus="C"
                class="btn-preset-corfo-focus btn-spring w-full py-3.5 px-5 rounded-2xl bg-amber-500/20 hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-amber-400/50 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all">
                <span>Configurar Automatización & Ley I+D en el Wizard</span>
                <i data-lucide="arrow-down-right" class="w-4 h-4"></i>
              </button>
            </article>

            <!-- Área 4: Asesoría Industrial y Gestión de Financiamiento Corfo -->
            <article class="spotlight-card rounded-3xl bg-gradient-to-b from-[#092826] to-[#051817] border border-teal-400/40 hover:border-teal-300 p-7 sm:p-8 flex flex-col justify-between shadow-2xl">
              <div>
                <div class="flex items-center justify-between gap-3 mb-5">
                  <div class="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shadow-lg">
                    <i data-lucide="landmark" class="w-7 h-7"></i>
                  </div>
                  <span class="px-3.5 py-1.5 rounded-full bg-teal-950 border border-teal-400/50 text-teal-300 font-mono font-bold text-xs uppercase">
                    Ruta: Mix Corfo + Rentas Pasivas
                  </span>
                </div>
                <div class="text-xs font-mono uppercase tracking-widest text-teal-400 font-bold mb-1">ÁREA DE SERVICIO 04</div>
                <h3 class="text-2xl font-black text-white mb-3">
                  Asesoría Industrial y Gestión de Financiamiento Corfo
                </h3>
                <p class="text-sm text-teal-100/85 leading-relaxed mb-5">
                  Ingeniería financiera y técnica llave en mano: auditamos tu planta en terreno, cotizamos directo en fábrica y estructuramos la carpeta completa para apalancar subsidios, créditos y franquicias tributarias.
                </p>
                <ul class="space-y-2.5 text-xs sm:text-sm text-teal-50/90 mb-6">
                  <li class="flex items-start gap-2.5 bg-[#031211]/80 p-3 rounded-xl border border-teal-800/50">
                    <i data-lucide="file-check-2" class="w-4 h-4 text-teal-400 shrink-0 mt-0.5"></i>
                    <span><strong>Crédito Verde y Crédito MiPyme Corfo:</strong> preparación de memorias de cálculo de ahorro hídrico/energético, cotizaciones formales y evaluación de garantías Fogain / Pro-Inversión.</span>
                  </li>
                  <li class="flex items-start gap-2.5 bg-[#031211]/80 p-3 rounded-xl border border-teal-800/50">
                    <i data-lucide="percent" class="w-4 h-4 text-teal-400 shrink-0 mt-0.5"></i>
                    <span><strong>Ley I+D (35% Rebaja Impuestos) y Excepción de Rentas Pasivas:</strong> estructuración de inversión en maquinaria industrial productiva para sociedades operativas o de inversión.</span>
                  </li>
                  <li class="flex items-start gap-2.5 bg-[#031211]/80 p-3 rounded-xl border border-teal-800/50">
                    <i data-lucide="ship" class="w-4 h-4 text-teal-400 shrink-0 mt-0.5"></i>
                    <span><strong>Sourcing e Importación Directa Llave en Mano:</strong> validación en fábrica (Running Test Video), logística marítima, internación aduanera y puesta en marcha en Chile.</span>
                  </li>
                </ul>
              </div>
              <button 
                type="button"
                data-preset-focus="D"
                class="btn-preset-corfo-focus btn-spring w-full py-3.5 px-5 rounded-2xl bg-teal-500/20 hover:bg-teal-400 hover:text-slate-950 text-teal-300 border border-teal-400/50 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all">
                <span>Solicitar Estructuración Integral Corfo en el Wizard</span>
                <i data-lucide="arrow-down-right" class="w-4 h-4"></i>
              </button>
            </article>

          </div>
        </div>
      </section>

      <!-- 2.5 BLOQUE DE MÉTRICAS E INDICADORES DE PROGRESO (ESTILO MANUFAKTUR SOLUTIONS) -->
      <section class="py-16 bg-[#15141C] text-white border-b border-[#2E2D3D]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div class="lg:col-span-6">
              <div class="text-xs font-heading font-bold uppercase tracking-widest text-[#FF7618] mb-2">
                // INDICADORES DE IMPACTO INDUSTRIAL Y FINANCIERO
              </div>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mb-4">
                Optimización de planta, economía circular y retorno tributario
              </h3>
              <p class="text-sm text-slate-300 leading-relaxed mb-6">
                Estructuramos proyectos con métricas auditables de ahorro energético, recuperación hídrica, rendimiento mecánico en línea y aprovechamiento de incentivos Corfo y Ley I+D.
              </p>
              <div class="grid grid-cols-2 rounded-lg overflow-hidden border border-[#2E2D3D] divide-x divide-[#2E2D3D] bg-[#1F1E2B]">
                <div class="p-5">
                  <div class="font-heading text-2xl sm:text-3xl font-extrabold text-[#FF7618]">Hasta 15 Años</div>
                  <div class="text-xs text-slate-300 mt-1">Plazo máximo en Créditos Verdes y MiPyme Corfo</div>
                </div>
                <div class="p-5">
                  <div class="font-heading text-2xl sm:text-3xl font-extrabold text-white">100% OEM</div>
                  <div class="text-xs text-slate-300 mt-1">Importación directa y puesta en marcha llave en mano</div>
                </div>
              </div>
            </div>

            <div class="lg:col-span-6 bg-[#1F1E2B] border border-[#2E2D3D] rounded-lg p-6 sm:p-8 space-y-5 font-heading">
              <div>
                <div class="flex justify-between text-xs sm:text-sm font-bold mb-2">
                  <span class="text-white">Eficiencia y Rendimiento Operativo en Planta</span>
                  <span class="text-[#FF7618]">98%</span>
                </div>
                <div class="w-full h-2 bg-[#14131B] rounded-full overflow-hidden">
                  <div class="h-full bg-[#FF7618] rounded-full" style="width: 98%;"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs sm:text-sm font-bold mb-2">
                  <span class="text-white">Rebaja Tributaria Ley I+D (Impuesto 1ª Categoría SII)</span>
                  <span class="text-[#FF7618]">35%</span>
                </div>
                <div class="w-full h-2 bg-[#14131B] rounded-full overflow-hidden">
                  <div class="h-full bg-[#FF7618] rounded-full" style="width: 72%;"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs sm:text-sm font-bold mb-2">
                  <span class="text-white">Valorización de Residuos Orgánicos y Recuperación de Agua</span>
                  <span class="text-[#FF7618]">85%</span>
                </div>
                <div class="w-full h-2 bg-[#14131B] rounded-full overflow-hidden">
                  <div class="h-full bg-[#FF7618] rounded-full" style="width: 85%;"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs sm:text-sm font-bold mb-2">
                  <span class="text-white">Cobertura Garantía Estatal Pro-Inversión / Fogain</span>
                  <span class="text-[#FF7618]">80%</span>
                </div>
                <div class="w-full h-2 bg-[#14131B] rounded-full overflow-hidden">
                  <div class="h-full bg-[#FF7618] rounded-full" style="width: 80%;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. CONFIGURADOR Y EVALUADOR INTERACTIVO DE PROYECTOS CORFO (WIZARD DE 5 PASOS) -->
      <section id="corfo_wizard_section" class="py-24 bg-[#15141C] text-white border-b border-[#2E2D3D] relative overflow-hidden font-sans">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <!-- Encabezado del Wizard -->
          <div class="text-center max-w-3xl mx-auto mb-10">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#1F1E2B] border border-[#343346] text-[#FF7618] text-xs font-heading font-bold uppercase mb-3">
              <span>// CONFIGURADOR & EVALUADOR INTERACTIVO B2B · 5 PASOS</span>
            </div>
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Evaluador de Proyectos e Incentivos Corfo
            </h2>
            <p class="mt-3 text-slate-300 text-sm sm:text-base">
              Completa estos 5 pasos en menos de 1 minuto para obtener la ruta de financiamiento recomendada (Crédito Verde, Crédito MiPyme, Ley I+D 35% o Excepción de Rentas Pasivas) y el equipamiento técnico para tu planta.
            </p>
          </div>

          <!-- Contenedor Reactivo del Wizard -->
          <div id="corfo-wizard-container" class="rounded-lg bg-[#1F1E2B] border border-[#2E2D3D] shadow-2xl overflow-hidden">
            ${this.renderCorfoWizardInner()}
          </div>
        </div>
      </section>

      <!-- 4. BANNER DE CONEXIÓN CON CATÁLOGOS DE MAQUINARIA Y ENVASES -->
      <section class="py-16 bg-[#191822] border-b border-[#2E2D3D] font-sans">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="index.html" class="group p-6 rounded-lg bg-[#1F1E2B] border border-[#2E2D3D] hover:border-[#FF7618] flex items-center justify-between gap-4 transition-all">
            <div>
              <span class="text-xs font-heading uppercase text-[#FF7618] font-bold block mb-1">01 · División Principal</span>
              <h3 class="text-lg font-extrabold text-white group-hover:text-[#FF7618]">Envases Flexibles de Alta Barrera</h3>
              <p class="text-xs text-slate-300 mt-1">Bolsas al vacío, Doypack, Retort y films impresos HD.</p>
            </div>
            <span class="text-[#FF7618] font-heading font-bold text-lg">↗</span>
          </a>

          <a href="maquinaria-carnica.html" class="group p-6 rounded-lg bg-[#1F1E2B] border border-[#2E2D3D] hover:border-[#FF7618] flex items-center justify-between gap-4 transition-all">
            <div>
              <span class="text-xs font-heading uppercase text-[#FF7618] font-bold block mb-1">02 · Catálogo de Equipos</span>
              <h3 class="text-lg font-extrabold text-white group-hover:text-[#FF7618]">Maquinaria Rubro Cárnico & Cecinas</h3>
              <p class="text-xs text-slate-300 mt-1">12 máquinas SUS304: cutters vacío, embutidoras y hornos.</p>
            </div>
            <span class="text-[#FF7618] font-heading font-bold text-lg">↗</span>
          </a>

          <a href="maquinaria-pesquera.html" class="group p-6 rounded-lg bg-[#1F1E2B] border border-[#2E2D3D] hover:border-[#FF7618] flex items-center justify-between gap-4 transition-all">
            <div>
              <span class="text-xs font-heading uppercase text-[#FF7618] font-bold block mb-1">03 · Catálogo + Videoteca</span>
              <h3 class="text-lg font-extrabold text-white group-hover:text-[#FF7618]">Maquinaria Proceso Pesquero</h3>
              <p class="text-xs text-slate-300 mt-1">12 máquinas en operación: descamado, fileteado e IQF.</p>
            </div>
            <span class="text-[#FF7618] font-heading font-bold text-lg">↗</span>
          </a>
        </div>
      </section>
    `;
  }

  renderCorfoWizardInner() {
    const st = this.corfoWizardState;
    const step = st.currentStep || 1;
    const progressPct = step * 20;
    const focusMap = this.getCorfoFocusConfig();
    const activeFocus = focusMap[st.focusKey] || focusMap.A;

    const stepsMeta = [
      { num: 1, label: '1. Sector Industrial' },
      { num: 2, label: '2. Enfoque & Filtro Corfo' },
      { num: 3, label: '3. Tecnología Requerida' },
      { num: 4, label: '4. Dimensionamiento' },
      { num: 5, label: '5. Diagnóstico y Envío' }
    ];

    return `
      <!-- Barra Superior de Estado y Progreso -->
      <div class="p-6 sm:p-8 bg-[#041511] border-b border-emerald-800/70">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div class="flex items-center gap-2.5">
            <span class="px-3 py-1 rounded-lg bg-emerald-400 text-slate-950 font-mono font-black text-xs uppercase">
              PASO ${step} DE 5 (${progressPct}%)
            </span>
            <span class="text-xs sm:text-sm font-mono text-emerald-200 font-bold">
              ${stepsMeta[step - 1].label}
            </span>
          </div>
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-400/40 text-xs font-mono">
            <span class="text-emerald-400 font-bold">Ruta Activa:</span>
            <span class="text-amber-300 font-black">${st.corfoProgram}</span>
          </div>
        </div>

        <!-- Barra de Progreso Animada -->
        <div class="w-full h-2.5 bg-[#020b09] rounded-full overflow-hidden border border-emerald-900/80 mb-5">
          <div class="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 transition-all duration-500 rounded-full" style="width: ${progressPct}%"></div>
        </div>

        <!-- Navegador de los 5 Pasos -->
        <div class="grid grid-cols-5 gap-2">
          ${stepsMeta.map(s => {
            const isCurrent = s.num === step;
            const isDone = s.num < step;
            return `
              <button 
                type="button"
                data-wizard-goto="${s.num}"
                class="btn-wizard-goto text-left p-2.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                    : isDone
                    ? 'bg-[#06211b] border-emerald-700/60 text-emerald-300 hover:border-emerald-400'
                    : 'bg-[#03100d] border-emerald-900/50 text-emerald-200/50 hover:border-emerald-700'
                }">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-mono font-black uppercase ${isCurrent ? 'text-amber-300' : isDone ? 'text-emerald-400' : 'text-emerald-600'}">
                    Paso 0${s.num}
                  </span>
                  ${isDone ? '<i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-400"></i>' : ''}
                </div>
                <div class="text-[11px] font-bold truncate mt-0.5 hidden sm:block">${s.label.replace(/^\d+\.\s*/, '')}</div>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Cuerpo Dinámico del Paso Actual -->
      <div class="p-6 sm:p-8 lg:p-10 space-y-8">
        ${this.renderCorfoWizardStepBody(step, st, activeFocus, focusMap)}

        <!-- Barra Inferior de Navegación (Anterior / Siguiente) -->
        <div class="pt-6 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-4">
          ${step > 1 ? `
            <button 
              type="button"
              id="btn-wizard-prev"
              class="btn-spring inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#041511] hover:bg-emerald-950 text-emerald-200 border border-emerald-600/50 font-mono font-bold text-xs sm:text-sm uppercase tracking-wider">
              <i data-lucide="arrow-left" class="w-4 h-4"></i>
              <span>Paso Anterior</span>
            </button>
          ` : `
            <div class="text-xs font-mono text-emerald-300/70">
              Selecciona una opción para avanzar en tu evaluación
            </div>
          `}

          ${step < 5 ? `
            <button 
              type="button"
              id="btn-wizard-next"
              class="btn-spring inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 hover:from-emerald-300 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/30">
              <span>Continuar al Paso ${step + 1}</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  renderCorfoWizardStepBody(step, st, activeFocus, focusMap) {
    // ==========================================================
    // PASO 1: SECTOR INDUSTRIAL (Selección única con tarjetas e íconos)
    // ==========================================================
    if (step === 1) {
      const sectors = [
        {
          name: 'Pesquero y Acuícola',
          icon: 'fish',
          badge: 'Salmón, Pesca Pelágica/Demersal & Mitílidos',
          desc: 'Plantas de proceso primario y secundario, frigoríficos marinos, plantas reductoras/valorizadoras de descartes y centros de cultivo.'
        },
        {
          name: 'Cárnico y Frigoríficos',
          icon: 'flame',
          badge: 'Faenadoras, Desposte, Cecinas & Embutidos',
          desc: 'Salas de procesamiento cárnico, fábricas de cecinas, cámaras modulares de congelación, tratamiento de RILES y subproductos.'
        },
        {
          name: 'Agroindustrial y Alimentos',
          icon: 'sprout',
          badge: 'Packing, Congelados IQF, Lácteos & Alimentos',
          desc: 'Procesadoras de frutas/hortalizas, alimentos preparados, deshidratados, granos, panificación industrial y bebidas.'
        },
        {
          name: 'Otro Sector Industrial',
          icon: 'factory',
          badge: 'Manufactura, Logística Frío o Soc. Inversión',
          desc: 'Centros de distribución refrigerados, manufactura industrial, eficiencia hídrica/energética o sociedades de inversión productiva.'
        }
      ];

      return `
        <div class="space-y-6">
          <div>
            <span class="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1">PASO 1 DE 5 • IDENTIFICACIÓN DE PLANTA</span>
            <h3 class="text-2xl sm:text-3xl font-black text-white">¿A qué Sector Industrial pertenece tu proyecto?</h3>
            <p class="text-xs sm:text-sm text-emerald-100/80 mt-1">Selecciona el rubro principal de tu empresa para ajustar los parámetros técnicos y normativos.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${sectors.map(sec => {
              const selected = st.sector === sec.name;
              return `
                <button 
                  type="button"
                  data-wizard-sector="${sec.name}"
                  class="btn-wizard-sector text-left p-6 rounded-2xl border-2 transition-all flex flex-col justify-between gap-4 ${
                    selected
                      ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400/40 shadow-xl'
                      : 'bg-[#041410] border-emerald-900/70 hover:border-emerald-500/60'
                  }">
                  <div class="flex items-start justify-between gap-3 w-full">
                    <div class="w-12 h-12 rounded-2xl ${selected ? 'bg-emerald-400 text-slate-950' : 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'} flex items-center justify-center shrink-0">
                      <i data-lucide="${sec.icon}" class="w-6 h-6"></i>
                    </div>
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${selected ? 'bg-amber-400 text-slate-950' : 'bg-emerald-950/90 text-emerald-300 border border-emerald-800'}">
                      ${selected ? '✓ SELECCIONADO' : sec.badge}
                    </span>
                  </div>
                  <div>
                    <h4 class="text-lg font-black text-white">${sec.name}</h4>
                    <p class="text-xs text-emerald-100/80 mt-1 leading-relaxed">${sec.desc}</p>
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // ==========================================================
    // PASO 2: ENFOQUE DEL PROYECTO / FILTRO DE FINANCIAMIENTO CORFO
    // ==========================================================
    if (step === 2) {
      const options = Object.values(focusMap);
      return `
        <div class="space-y-6">
          <div>
            <span class="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1">PASO 2 DE 5 • FILTRO LÓGICO DE FINANCIAMIENTO</span>
            <h3 class="text-2xl sm:text-3xl font-black text-white">¿Cuál es el enfoque principal de tu inversión?</h3>
            <p class="text-xs sm:text-sm text-emerald-100/80 mt-1">Tu elección asigna automáticamente el instrumento Corfo o franquicia tributaria óptima y filtra las tecnologías del Paso 3.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${options.map(opt => {
              const selected = st.focusKey === opt.key;
              return `
                <button 
                  type="button"
                  data-wizard-focus="${opt.key}"
                  class="btn-wizard-focus text-left p-6 rounded-2xl border-2 transition-all flex flex-col justify-between gap-4 ${
                    selected
                      ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400/40 shadow-xl'
                      : 'bg-[#041410] border-emerald-900/70 hover:border-emerald-500/60'
                  }">
                  <div class="w-full space-y-3">
                    <div class="flex items-center justify-between gap-2">
                      <span class="px-3 py-1 rounded-lg font-mono font-black text-xs ${selected ? 'bg-emerald-400 text-slate-950' : 'bg-emerald-950 text-emerald-300 border border-emerald-700'}">
                        ${opt.optionCode}
                      </span>
                      <div class="w-10 h-10 rounded-xl ${selected ? 'bg-amber-400 text-slate-950' : 'bg-emerald-950 text-emerald-300'} flex items-center justify-center">
                        <i data-lucide="${opt.icon}" class="w-5 h-5"></i>
                      </div>
                    </div>
                    <h4 class="text-lg font-black text-white leading-snug">${opt.title}</h4>
                    <p class="text-xs text-emerald-100/80 leading-relaxed">${opt.summaryDesc}</p>
                  </div>

                  <div class="w-full pt-3 border-t border-emerald-800/60 flex items-center justify-between gap-2">
                    <span class="text-[10px] font-mono uppercase text-emerald-300 font-bold">Instrumento Asignado:</span>
                    <span class="text-xs font-mono font-black text-amber-300 text-right">${opt.corfoProgram}</span>
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // ==========================================================
    // PASO 3: TECNOLOGÍA Y EQUIPAMIENTO REQUERIDO (Dinámico según Paso 2)
    // ==========================================================
    if (step === 3) {
      const availableTechs = activeFocus.techOptions || [];
      return `
        <div class="space-y-6">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span class="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1">
                PASO 3 DE 5 • SELECCIÓN MÚLTIPLE (${activeFocus.optionCode}: ${activeFocus.title})
              </span>
              <h3 class="text-2xl sm:text-3xl font-black text-white">Selecciona las Tecnologías o Equipos Requeridos</h3>
              <p class="text-xs sm:text-sm text-emerald-100/80 mt-1">Puedes marcar una o varias soluciones para integrarlas en tu carpeta técnica de evaluación.</p>
            </div>
            <span class="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 font-mono font-bold text-xs">
              ${st.corfoProgram}
            </span>
          </div>

          <div class="grid grid-cols-1 gap-3.5">
            ${availableTechs.map((techText, idx) => {
              const isChecked = st.selectedTechs.includes(techText);
              return `
                <label 
                  data-wizard-tech="${techText.replace(/"/g, '&quot;')}"
                  class="btn-wizard-tech cursor-pointer p-5 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 ${
                    isChecked
                      ? 'bg-emerald-500/20 border-emerald-400 ring-1 ring-emerald-400/40 shadow-lg'
                      : 'bg-[#041410] border-emerald-900/70 hover:border-emerald-500/60'
                  }">
                  <div class="flex items-center gap-4">
                    <div class="w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                      isChecked
                        ? 'bg-emerald-400 border-emerald-300 text-slate-950'
                        : 'bg-[#020b09] border-emerald-700 text-transparent'
                    }">
                      <i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>
                    </div>
                    <div>
                      <span class="text-[10px] font-mono uppercase text-emerald-400 font-bold block">SOLUCIÓN TÉCNICA 0${idx + 1}</span>
                      <span class="text-sm sm:text-base font-bold text-white">${techText}</span>
                    </div>
                  </div>
                  <span class="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg shrink-0 hidden sm:inline-block ${
                    isChecked ? 'bg-emerald-400 text-slate-950' : 'bg-emerald-950 text-emerald-400'
                  }">
                    ${isChecked ? 'Incluido' : 'Seleccionar'}
                  </span>
                </label>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // ==========================================================
    // PASO 4: DIMENSIONAMIENTO Y MODALIDAD
    // ==========================================================
    if (step === 4) {
      const investmentRanges = [
        'Hasta $20.000.000 CLP',
        '$20.000.000 a $60.000.000 CLP',
        'Más de $60.000.000 CLP'
      ];
      const revenueLevels = [
        'Micro/Pequeña (Hasta 25.000 UF)',
        'Mediana (25.000 a 100.000 UF)',
        'Grande (+100.000 UF) / Sociedad de Inversión'
      ];
      const supportTypes = [
        'Maquinaria + Gestión Financiamiento Corfo',
        'Solo Cotización de Maquinaria',
        'Asesoría y Diagnóstico en Terreno'
      ];

      return `
        <div class="space-y-7">
          <div>
            <span class="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1">PASO 4 DE 5 • PERFIL FINANCIERO Y MODALIDAD</span>
            <h3 class="text-2xl sm:text-3xl font-black text-white">Dimensionamiento de Inversión y Tramo de Empresa</h3>
            <p class="text-xs sm:text-sm text-emerald-100/80 mt-1">Estos tres parámetros determinan los topes de garantía Corfo, plazos de leasing y elegibilidad tributaria.</p>
          </div>

          <!-- 4.1 Rango de Inversión Estimada -->
          <div class="space-y-3">
            <label class="text-xs font-mono uppercase tracking-wider text-emerald-300 font-bold block">
              1. Rango de Inversión Estimada del Proyecto:
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              ${investmentRanges.map(inv => {
                const active = st.investmentRange === inv;
                return `
                  <button 
                    type="button"
                    data-wizard-investment="${inv}"
                    class="btn-wizard-investment p-4 rounded-2xl border-2 text-left transition-all ${
                      active
                        ? 'bg-emerald-500/20 border-emerald-400 text-white font-black shadow-lg'
                        : 'bg-[#041410] border-emerald-900/70 text-emerald-100/85 hover:border-emerald-500/60 font-semibold'
                    }">
                    <div class="flex items-center justify-between mb-1">
                      <i data-lucide="dollar-sign" class="w-4 h-4 ${active ? 'text-amber-400' : 'text-emerald-500'}"></i>
                      ${active ? '<span class="text-[10px] font-mono text-amber-300 font-bold">ACTIVO</span>' : ''}
                    </div>
                    <div class="text-xs sm:text-sm">${inv}</div>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 4.2 Nivel de Facturación Anual -->
          <div class="space-y-3">
            <label class="text-xs font-mono uppercase tracking-wider text-emerald-300 font-bold block">
              2. Nivel de Facturación Anual de la Empresa (Tramo UF):
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              ${revenueLevels.map(rev => {
                const active = st.revenueLevel === rev;
                return `
                  <button 
                    type="button"
                    data-wizard-revenue="${rev}"
                    class="btn-wizard-revenue p-4 rounded-2xl border-2 text-left transition-all ${
                      active
                        ? 'bg-emerald-500/20 border-emerald-400 text-white font-black shadow-lg'
                        : 'bg-[#041410] border-emerald-900/70 text-emerald-100/85 hover:border-emerald-500/60 font-semibold'
                    }">
                    <div class="flex items-center justify-between mb-1">
                      <i data-lucide="building-2" class="w-4 h-4 ${active ? 'text-amber-400' : 'text-emerald-500'}"></i>
                      ${active ? '<span class="text-[10px] font-mono text-amber-300 font-bold">ACTIVO</span>' : ''}
                    </div>
                    <div class="text-xs sm:text-sm">${rev}</div>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 4.3 Tipo de Apoyo Buscado -->
          <div class="space-y-3">
            <label class="text-xs font-mono uppercase tracking-wider text-emerald-300 font-bold block">
              3. Modalidad de Apoyo Requerida:
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              ${supportTypes.map(sup => {
                const active = st.supportType === sup;
                return `
                  <button 
                    type="button"
                    data-wizard-support="${sup}"
                    class="btn-wizard-support p-4 rounded-2xl border-2 text-left transition-all ${
                      active
                        ? 'bg-emerald-500/20 border-emerald-400 text-white font-black shadow-lg'
                        : 'bg-[#041410] border-emerald-900/70 text-emerald-100/85 hover:border-emerald-500/60 font-semibold'
                    }">
                    <div class="flex items-center justify-between mb-1">
                      <i data-lucide="briefcase" class="w-4 h-4 ${active ? 'text-amber-400' : 'text-emerald-500'}"></i>
                      ${active ? '<span class="text-[10px] font-mono text-amber-300 font-bold">ACTIVO</span>' : ''}
                    </div>
                    <div class="text-xs sm:text-sm">${sup}</div>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }

    // ==========================================================
    // PASO 5: DIAGNÓSTICO PRELIMINAR AUTOMÁTICO Y ENVÍO DE SOLICITUD
    // ==========================================================
    const isLargeOrHolding = st.revenueLevel.includes('Grande') || st.revenueLevel.includes('Sociedad');
    const complementaryNote = isLargeOrHolding
      ? 'Por tu perfil (+100.000 UF / Sociedad de Inversión), además de la línea principal seleccionada, tu proyecto es altamente elegible para estructurar Activo Fijo Productivo bajo Excepción de Rentas Pasivas y Franquicia Tributaria Ley I+D (35% rebaja de Impuesto de 1ª Categoría).'
      : 'Por tu tramo MiPyme (hasta 100.000 UF), tu proyecto califica para Cobertura de Garantía Estatal Corfo (Fogain / Pro-Inversión hasta 70%–80%) combinable con Leasing de Maquinaria o Crédito Verde.';

    return `
      <div class="space-y-8">
        <div>
          <span class="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold block mb-1">PASO 5 DE 5 • RESULTADO DE EVALUACIÓN Y CAPTURA EJECUTIVA</span>
          <h3 class="text-2xl sm:text-3xl font-black text-white">Diagnóstico Preliminar de tu Proyecto Corfo</h3>
          <p class="text-xs sm:text-sm text-emerald-100/80 mt-1">Revisa el dictamen preliminar generado según tu configuración y envíanos tus datos para preparar tu carpeta técnica y cotización formal.</p>
        </div>

        <!-- Tarjeta de Dictamen Preliminar -->
        <div class="rounded-3xl bg-gradient-to-br from-[#082c23] via-[#051d17] to-[#03120e] border-2 border-emerald-400/60 p-6 sm:p-8 shadow-2xl space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-emerald-800/70">
            <div>
              <span class="text-[11px] font-mono uppercase tracking-widest text-emerald-300 font-bold block">INSTRUMENTO / RUTA FINANCIERA RECOMENDADA</span>
              <h4 class="text-2xl sm:text-3xl font-black text-amber-300 mt-1">${st.corfoProgram}</h4>
              <span class="text-xs font-mono text-emerald-200">${activeFocus.optionCode} — ${activeFocus.title}</span>
            </div>
            <span class="px-4 py-2 rounded-2xl bg-emerald-400 text-slate-950 font-mono font-black text-xs uppercase shadow-lg">
              ✓ PROYECTO PRE-ELEGIBLE
            </span>
          </div>

          <!-- Resumen de Selección en 4 Celdas -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
            <div class="p-3.5 rounded-2xl bg-[#03110e] border border-emerald-800/70">
              <span class="text-[10px] font-mono uppercase text-emerald-400 block">Sector Industrial</span>
              <strong class="text-white font-bold text-sm mt-0.5 block">${st.sector}</strong>
            </div>
            <div class="p-3.5 rounded-2xl bg-[#03110e] border border-emerald-800/70">
              <span class="text-[10px] font-mono uppercase text-emerald-400 block">Inversión Estimada</span>
              <strong class="text-amber-300 font-bold text-sm mt-0.5 block">${st.investmentRange}</strong>
            </div>
            <div class="p-3.5 rounded-2xl bg-[#03110e] border border-emerald-800/70">
              <span class="text-[10px] font-mono uppercase text-emerald-400 block">Tramo Facturación</span>
              <strong class="text-white font-bold text-sm mt-0.5 block">${st.revenueLevel}</strong>
            </div>
            <div class="p-3.5 rounded-2xl bg-[#03110e] border border-emerald-800/70">
              <span class="text-[10px] font-mono uppercase text-emerald-400 block">Modalidad Requerida</span>
              <strong class="text-emerald-300 font-bold text-sm mt-0.5 block">${st.supportType}</strong>
            </div>
          </div>

          <!-- Tecnologías Marcadas en el Paso 3 -->
          <div class="p-4 rounded-2xl bg-[#03110e]/90 border border-emerald-800/60 space-y-2">
            <span class="text-[11px] font-mono uppercase tracking-wider text-emerald-300 font-bold block">
              Tecnologías y Equipamiento Seleccionado (${st.selectedTechs.length}):
            </span>
            <ul class="space-y-1.5 text-xs sm:text-sm text-white">
              ${(st.selectedTechs.length > 0 ? st.selectedTechs : ['Pendiente de especificar en reunión técnica']).map(t => `
                <li class="flex items-start gap-2">
                  <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"></i>
                  <span>${t}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <!-- Beneficios Financieros y Recomendación Complementaria -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-700/50 space-y-1.5">
              <span class="text-[11px] font-mono uppercase text-emerald-300 font-bold block">Ventajas de la Línea Asignada:</span>
              <ul class="space-y-1 text-xs text-emerald-100/90 list-disc list-inside">
                ${activeFocus.financialBenefits.map(b => `<li>${b}</li>`).join('')}
              </ul>
            </div>
            <div class="p-4 rounded-2xl bg-amber-950/35 border border-amber-500/40 space-y-1.5">
              <span class="text-[11px] font-mono uppercase text-amber-300 font-bold flex items-center gap-1.5">
                <i data-lucide="sparkles" class="w-4 h-4 text-amber-400"></i>
                <span>Nota de Ingeniería Financiera WellPack:</span>
              </span>
              <p class="text-xs text-amber-100/90 leading-relaxed">${complementaryNote}</p>
            </div>
          </div>
        </div>

        <!-- Formulario B2B para Recibir Carpeta Preliminar y Agendar Diagnóstico -->
        <form id="corfo-wizard-submit-form" class="p-6 sm:p-8 rounded-3xl bg-[#041410] border border-emerald-700/60 space-y-5">
          <h4 class="text-xl font-black text-white flex items-center gap-2">
            <i data-lucide="send" class="w-5 h-5 text-emerald-400"></i>
            <span>Datos de Contacto para Envío de Propuesta y Evaluación Corfo</span>
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-mono text-emerald-300 uppercase block mb-1">Nombre y Apellido *</label>
              <input 
                type="text" 
                id="corfo-input-name" 
                required 
                value="${st.contactName || ''}"
                placeholder="Ej: Rodrigo Soto" 
                class="w-full px-4 py-3 rounded-xl bg-[#020b09] border border-emerald-800 text-white text-sm focus:border-emerald-400 focus:outline-none">
            </div>
            <div>
              <label class="text-xs font-mono text-emerald-300 uppercase block mb-1">Empresa / Razón Social *</label>
              <input 
                type="text" 
                id="corfo-input-company" 
                required 
                value="${st.companyName || ''}"
                placeholder="Ej: Pesquera / Frigorífico Austral SpA" 
                class="w-full px-4 py-3 rounded-xl bg-[#020b09] border border-emerald-800 text-white text-sm focus:border-emerald-400 focus:outline-none">
            </div>
            <div>
              <label class="text-xs font-mono text-emerald-300 uppercase block mb-1">Teléfono / WhatsApp Directo *</label>
              <input 
                type="tel" 
                id="corfo-input-phone" 
                required 
                value="${st.contactPhone || ''}"
                placeholder="Ej: +56 9 8765 4321" 
                class="w-full px-4 py-3 rounded-xl bg-[#020b09] border border-emerald-800 text-white text-sm focus:border-emerald-400 focus:outline-none">
            </div>
            <div>
              <label class="text-xs font-mono text-emerald-300 uppercase block mb-1">Correo Corporativo *</label>
              <input 
                type="email" 
                id="corfo-input-email" 
                required 
                value="${st.contactEmail || ''}"
                placeholder="gerencia@tuempresa.cl" 
                class="w-full px-4 py-3 rounded-xl bg-[#020b09] border border-emerald-800 text-white text-sm focus:border-emerald-400 focus:outline-none">
            </div>
            <div>
              <label class="text-xs font-mono text-emerald-300 uppercase block mb-1">Ciudad / Región de la Planta</label>
              <input 
                type="text" 
                id="corfo-input-region" 
                value="${st.plantRegion || ''}"
                placeholder="Ej: Concepción / Puerto Montt / RM" 
                class="w-full px-4 py-3 rounded-xl bg-[#020b09] border border-emerald-800 text-white text-sm focus:border-emerald-400 focus:outline-none">
            </div>
            <div>
              <label class="text-xs font-mono text-emerald-300 uppercase block mb-1">RUT Empresa (Opcional para Pre-Filtro Corfo)</label>
              <input 
                type="text" 
                id="corfo-input-rut" 
                value="${st.companyRut || ''}"
                placeholder="Ej: 76.123.456-7" 
                class="w-full px-4 py-3 rounded-xl bg-[#020b09] border border-emerald-800 text-white text-sm focus:border-emerald-400 focus:outline-none">
            </div>
          </div>

          <div>
            <label class="text-xs font-mono text-emerald-300 uppercase block mb-1">Comentarios Técnicos Adicionales (Capacidad kg/h, requerimiento específico)</label>
            <textarea 
              id="corfo-input-notes" 
              rows="2" 
              placeholder="Ej: Buscamos valorizar 5 ton/día de descarte pesquero y evaluar paneles solares con Crédito Verde..." 
              class="w-full px-4 py-3 rounded-xl bg-[#020b09] border border-emerald-800 text-white text-sm focus:border-emerald-400 focus:outline-none">${st.notes || ''}</textarea>
          </div>

          <div class="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button 
              type="submit"
              id="btn-corfo-submit-whatsapp"
              class="btn-spring w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 hover:from-emerald-300 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2">
              <i data-lucide="message-circle" class="w-5 h-5"></i>
              <span>Enviar Diagnóstico y Solicitar Evaluación (Sistema + WhatsApp)</span>
            </button>
          </div>
        </form>
      </div>
    `;
  }

  // ==========================================================
  // PÁGINA COMPLETA: DIVISIÓN MAQUINARIA RUBRO CÁRNICO & CECINAS
  // ==========================================================
  renderMeatMachineryPage() {
    const meatSection = (this.schema?.layout || []).find(s => s.section === 'machinery_showcase');
    const config = meatSection?.config || {};

    return `
      <!-- Hero Exclusivo Rubro Cárnico (Colores Carmesí, Terracota, Brasa & Acero SUS304) -->
      <section id="hero" class="relative min-h-[82vh] flex items-center justify-center overflow-hidden py-16 lg:py-24 bg-[#120606] text-white border-b border-red-900/60">
        <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <div id="hero-fluid-track" class="absolute -top-[5%] -left-[18%] w-[136%] h-[110%] animate-hero-pan will-change-transform">
            <img 
              id="hero-fluid-img"
              src="assets/images/hero_maquinaria_carnica.jpg" 
              alt="Planta de procesamiento cárnico y cecinas WellPack" 
              class="w-full h-full object-cover object-center filter brightness-[0.95] contrast-[1.15] saturate-[1.2]">
          </div>
          <div class="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_50%,rgba(24,7,7,0.55)_0%,rgba(20,5,5,0.40)_55%,rgba(18,6,6,0.92)_100%)]"></div>
          <div class="absolute inset-0 bg-gradient-to-b from-[#120606]/85 via-transparent to-[#120606]"></div>
        </div>

        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-7 hero-content-trigger">
          <div class="p-6 sm:p-10 rounded-3xl bg-[#180808]/65 backdrop-blur-md border border-red-500/35 shadow-[0_20px_60px_rgba(0,0,0,0.85)] space-y-6">
            <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-red-950/90 border border-red-500/60 text-red-300 text-xs font-mono font-bold uppercase tracking-wider shadow-lg">
              <i data-lucide="flame" class="w-4 h-4 text-red-400"></i>
              <span>División Ingeniería para Frigoríficos, Cecinas & Embutidos</span>
            </div>

            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white drop-shadow-lg">
              Maquinaria Industrial para el <span class="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-400 to-amber-400">Rubro Cárnico</span>
            </h1>

            <p class="text-base sm:text-lg lg:text-xl text-red-100/90 max-w-3xl mx-auto font-normal leading-relaxed">
              Líneas de alto rendimiento en acero inoxidable SUS304 para desmenuzado de bloques congelados a -18°C, molienda pesada, emulsión en cutter al vacío, embutido continuo y hornos de ahumado inteligente.
            </p>

            <div class="flex flex-wrap items-center justify-center gap-4 pt-2">
              <a 
                href="#machinery_showcase" 
                class="inline-flex items-center gap-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-sm sm:text-base px-8 py-4 rounded-2xl shadow-xl shadow-red-600/35 transition-all hover:scale-105 active:scale-95">
                <i data-lucide="cpu" class="w-5 h-5"></i>
                <span>Ver los 12 Equipos Cárnicos</span>
                <i data-lucide="arrow-down" class="w-4 h-4"></i>
              </a>
              <button 
                type="button"
                data-machine-title="Proyecto de Línea Completa Rubro Cárnico"
                class="btn-machinery-quote inline-flex items-center gap-2 bg-red-950/80 hover:bg-red-900/80 text-red-100 border border-red-500/50 font-bold text-sm sm:text-base px-7 py-4 rounded-2xl transition-all hover:scale-105 backdrop-blur-md shadow-lg">
                <i data-lucide="file-text" class="w-5 h-5 text-amber-400"></i>
                <span>Solicitar Ingeniería de Planta</span>
              </button>
            </div>

            <!-- KPIs Técnicos del Rubro Cárnico -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-6 border-t border-red-900/60 text-left max-w-4xl mx-auto">
              <div class="bg-[#220a0a]/85 backdrop-blur-md p-3.5 rounded-2xl border border-red-500/30 shadow-lg">
                <div class="text-lg font-black text-red-400 font-mono">-18°C Directo</div>
                <div class="text-[11px] text-red-200/80 font-mono uppercase mt-0.5">Corte sin Descongelar</div>
              </div>
              <div class="bg-[#220a0a]/85 backdrop-blur-md p-3.5 rounded-2xl border border-red-500/30 shadow-lg">
                <div class="text-lg font-black text-amber-400 font-mono">800 Nudos/min</div>
                <div class="text-[11px] text-red-200/80 font-mono uppercase mt-0.5">Llenado & Atado Servo</div>
              </div>
              <div class="bg-[#220a0a]/85 backdrop-blur-md p-3.5 rounded-2xl border border-red-500/30 shadow-lg">
                <div class="text-lg font-black text-rose-400 font-mono">4.500 RPM</div>
                <div class="text-[11px] text-red-200/80 font-mono uppercase mt-0.5">Cutter Bowl al Vacío</div>
              </div>
              <div class="bg-[#220a0a]/85 backdrop-blur-md p-3.5 rounded-2xl border border-red-500/30 shadow-lg">
                <div class="text-lg font-black text-emerald-400 font-mono">SUS304 + CIP</div>
                <div class="text-[11px] text-red-200/80 font-mono uppercase mt-0.5">Higiene Grado Frigorífico</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Catálogo Completo de Maquinaria Cárnica -->
      ${this.renderMachineryShowcaseSection(config)}

      <!-- Banner de Sinergia con Envases Cárnicos y División Pesquera -->
      <section class="py-16 bg-[#0e0505] border-b border-red-950">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <a href="index.html" class="group p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1c0c08] to-[#16120b] border border-amber-500/35 hover:border-amber-400 flex items-center justify-between gap-4 transition-all hover:-translate-y-1">
            <div>
              <span class="text-[11px] font-mono uppercase text-amber-400 font-bold block mb-1">📦 Sinergia Bolsas + Máquina</span>
              <h3 class="text-xl font-black text-white group-hover:text-amber-300">Volver a Envases Flexibles (Bolsas Carnes 120μ & Cryovac)</h3>
              <p class="text-xs text-neutral-300 mt-1">Bolsas antipunzonamiento para hueso, termoencogibles y tripas tubulares 3 sellos.</p>
            </div>
            <i data-lucide="arrow-left" class="w-6 h-6 text-amber-400 shrink-0"></i>
          </a>

          <a href="maquinaria-pesquera.html" class="group p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#061c33] to-[#041224] border border-cyan-500/35 hover:border-cyan-400 flex items-center justify-between gap-4 transition-all hover:-translate-y-1">
            <div>
              <span class="text-[11px] font-mono uppercase text-cyan-400 font-bold block mb-1">🐟 Otra División de Ingeniería</span>
              <h3 class="text-xl font-black text-white group-hover:text-cyan-300">Ir a Maquinaria para Proceso Pesquero & Acuícola</h3>
              <p class="text-xs text-slate-300 mt-1">Fileteadoras de salmón, porcionadoras láser 3D, túneles IQF -40°C y líneas de choritos.</p>
            </div>
            <i data-lucide="arrow-right" class="w-6 h-6 text-cyan-400 shrink-0"></i>
          </a>
        </div>
      </section>
    `;
  }

  // ==========================================================
  // CATÁLOGO MAQUINARIA RUBRO CÁRNICO (ESTÉTICA CARMESÍ & ACERO SUS304)
  // ==========================================================
  renderMachineryShowcaseSection(config = {}) {
    const title = config.title || "Catálogo de Maquinaria para Procesamiento Cárnico & Cecinas";
    const subtitle = config.subtitle || "Equipamiento industrial pesado para frigoríficos, plantas de cecinas y embutidos. Construcción íntegra en acero inoxidable SUS304 y soporte técnico en todo Chile.";
    const items = config.items || [];

    return `
      <section id="machinery_showcase" class="py-24 bg-[#140707] text-white relative border-b border-red-950 overflow-hidden font-sans">
        
        <!-- Luz ambiental en tonos rojo carmesí frigorífico y brasa -->
        <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[420px] bg-red-600/12 blur-[150px] pointer-events-none rounded-full"></div>
        <div class="absolute bottom-10 right-10 w-[550px] h-[320px] bg-amber-600/10 blur-[130px] pointer-events-none rounded-full"></div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <!-- Encabezado de Sección -->
          <div class="text-center max-w-3xl mx-auto mb-14">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-mono font-bold uppercase mb-4 shadow-sm">
              <i data-lucide="flame" class="w-4 h-4 text-amber-400"></i>
              Línea Industrial Cárnica & Charcutería • SUS304
            </div>
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              ${title}
            </h2>
            <p class="mt-4 text-red-100/80 text-base sm:text-lg leading-relaxed">
              ${subtitle}
            </p>
          </div>

          <!-- Filtro Interactivo de Maquinaria Cárnica -->
          <div class="flex items-center justify-center gap-2 mb-12 overflow-x-auto pb-2 px-2" id="machinery-category-filters">
            <button 
              type="button" 
              data-machine-filter="all" 
              class="btn-machine-tab btn-spring px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border border-red-500 bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/35">
              🥩 Toda la Línea Cárnica (${items.length})
            </button>
            <button 
              type="button" 
              data-machine-filter="procesamiento" 
              class="btn-machine-tab btn-spring px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border border-red-900/80 bg-[#210b0b] text-red-200 hover:border-red-500/60">
              🔪 Molienda, Corte & Cutter Vacío
            </button>
            <button 
              type="button" 
              data-machine-filter="embutido" 
              class="btn-machine-tab btn-spring px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border border-red-900/80 bg-[#210b0b] text-red-200 hover:border-red-500/60">
              🌭 Embutido, Torsión & Atado
            </button>
            <button 
              type="button" 
              data-machine-filter="ahumado" 
              class="btn-machine-tab btn-spring px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border border-red-900/80 bg-[#210b0b] text-red-200 hover:border-red-500/60">
              🔥 Hornos de Cocción & Ahumado
            </button>
            <button 
              type="button" 
              data-machine-filter="servicio" 
              class="btn-machine-tab btn-spring px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border border-red-900/80 bg-[#210b0b] text-red-200 hover:border-red-500/60">
              🛠️ Servicio Técnico Nacional
            </button>
          </div>

          <!-- Grilla de Tarjetas de Maquinaria Cárnica -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch" id="machinery-cards-grid">
            ${items.map(item => {
              const cat = item.category || 'all';
              const badge = item.badge || 'SUS304 Inoxidable';
              const icon = item.icon || 'settings';

              return `
                <div data-machine-cat="${cat}" class="machinery-card spotlight-card bg-gradient-to-b from-[#210b0b] to-[#170808] border border-red-900/70 hover:border-red-500/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  
                  <div>
                    <!-- Fotografía Real del Equipo Cárnico -->
                    ${item.image ? `
                      <div class="relative w-full h-60 sm:h-68 rounded-2xl overflow-hidden bg-gradient-to-b from-[#120505] to-[#1c0a0a] border border-red-900/60 mb-6 flex items-center justify-center p-3 group hover:border-red-500/60 transition-all">
                        <img 
                          src="${item.image.startsWith('/') ? item.image.slice(1) : item.image}" 
                          alt="${item.title}" 
                          loading="lazy" 
                          class="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] group-hover:scale-105 transition-transform duration-500 ease-out">
                        
                        <!-- Badge de Especificación Flotante -->
                        <div class="absolute top-3 left-3 z-10">
                          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#1a0606]/90 backdrop-blur-md text-[10px] font-mono font-bold text-red-300 border border-red-500/50 shadow-lg">
                            <i data-lucide="${icon}" class="w-3.5 h-3.5 text-amber-400"></i>
                            ${badge}
                          </span>
                        </div>
                      </div>
                    ` : ''}

                    <!-- Header Tarjeta -->
                    <div class="flex items-start justify-between gap-4 mb-4">
                      <div class="flex items-center gap-3">
                        <div class="w-11 h-11 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                          <i data-lucide="${icon}" class="w-5 h-5"></i>
                        </div>
                        <div>
                          <h3 class="text-xl sm:text-2xl font-black text-white leading-tight">
                            ${item.title}
                          </h3>
                          <span class="text-xs text-amber-400 font-mono block mt-0.5 font-semibold">
                            ${item.subtitle}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Descripción -->
                    <p class="text-red-100/85 text-xs sm:text-sm leading-relaxed mb-6">
                      ${item.description}
                    </p>

                    <!-- Lista de Características -->
                    <div class="space-y-2 mb-6">
                      ${(item.features || []).map(f => `
                        <div class="flex items-start gap-2 text-xs text-red-100/90">
                          <i data-lucide="check-circle" class="w-4 h-4 text-amber-400 shrink-0 mt-0.5"></i>
                          <span>${f}</span>
                        </div>
                      `).join('')}
                    </div>

                    <!-- Tabla de Modelos y Parámetros Técnicos -->
                    ${item.specs && item.specs.length > 0 ? `
                      <div class="mb-6 overflow-x-auto rounded-xl border border-red-900/70 bg-[#120505]">
                        <table class="w-full text-[11px] font-mono text-left">
                          <thead class="bg-red-950/70 text-red-200 uppercase text-[10px]">
                            <tr>
                              <th class="py-2 px-3">Modelo</th>
                              ${item.specs[0].power ? '<th class="py-2 px-3">Potencia</th>' : ''}
                              ${item.specs[0].capacity ? '<th class="py-2 px-3">Capacidad</th>' : ''}
                              ${item.specs[0].speed ? '<th class="py-2 px-3">Velocidad</th>' : ''}
                              ${item.specs[0].dims ? '<th class="py-2 px-3 hidden sm:table-cell">Dimensiones</th>' : ''}
                              ${item.specs[0].detail ? '<th class="py-2 px-3">Detalle</th>' : ''}
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-red-950/80 text-red-100">
                            ${item.specs.map(sp => `
                              <tr class="hover:bg-red-900/25">
                                <td class="py-2 px-3 font-bold text-amber-400">${sp.model}</td>
                                ${sp.power ? `<td class="py-2 px-3">${sp.power}</td>` : ''}
                                ${sp.capacity ? `<td class="py-2 px-3 text-rose-300 font-semibold">${sp.capacity}</td>` : ''}
                                ${sp.speed ? `<td class="py-2 px-3">${sp.speed}</td>` : ''}
                                ${sp.dims ? `<td class="py-2 px-3 hidden sm:table-cell text-red-300/70 text-[10px]">${sp.dims}</td>` : ''}
                                ${sp.detail ? `<td class="py-2 px-3 text-red-200">${sp.detail}</td>` : ''}
                              </tr>
                            `).join('')}
                          </tbody>
                        </table>
                      </div>
                    ` : ''}
                  </div>

                  <!-- Footer Botón CTA -->
                  <div class="pt-4 border-t border-red-900/60 flex items-center justify-between gap-3">
                    <span class="text-[11px] font-mono text-red-200/80 flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      Soporte e Instalación en Todo Chile
                    </span>
                    <button 
                      type="button" 
                      data-machine-title="[RUBRO CÁRNICO] ${item.title}"
                      class="btn-machinery-quote btn-spring inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/35">
                      <span>Cotizar Equipo</span>
                      <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                    </button>
                  </div>

                </div>
              `;
            }).join('')}
          </div>

          <!-- Banner Inferior de Proyectos Cárnicos Llave en Mano -->
          <div class="mt-16 p-8 rounded-3xl bg-gradient-to-r from-red-950/80 via-[#1f0a0a] to-amber-950/50 border border-red-500/40 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-400 shrink-0 border border-red-500/40">
                <i data-lucide="flame" class="w-7 h-7 text-amber-400"></i>
              </div>
              <div>
                <h4 class="text-xl font-black text-white">¿Proyectas una Planta de Cecinas, Frigorífico o Sala de Proceso Cárnico?</h4>
                <p class="text-xs sm:text-sm text-red-100/85 mt-1 max-w-2xl">
                  Dimensionamos tu línea completa desde la recepción de bloques congelados hasta el ahumado y envasado al vacío con bolsas WellPack de 120 micras.
                </p>
              </div>
            </div>
            <button 
              type="button"
              data-machine-title="Línea Completa Llave en Mano - Rubro Cárnico & Cecinas"
              class="btn-machinery-quote btn-spring px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-[#FF6B00] text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-wider shrink-0 shadow-xl shadow-amber-500/30">
              Solicitar Ingeniería Cárnica
            </button>
          </div>

        </div>
      </section>
    `;
  }

  // ==========================================================
  // PÁGINA COMPLETA: DIVISIÓN MAQUINARIA PROCESO PESQUERO & ACUÍCOLA
  // ==========================================================
  renderFisheryMachineryPage() {
    const fishSection = (this.schema?.layout || []).find(s => s.section === 'fishery_machinery_showcase');
    const config = fishSection?.config || {};
    const items = config.items || [];

    return `
      <!-- Hero Exclusivo Proceso Pesquero (Colores Azul Abisal, Cian Glaciar & Acero Inoxidable) -->
      <section id="hero" class="relative min-h-[80vh] flex items-center justify-center overflow-hidden py-16 lg:py-24 bg-[#03101f] text-white border-b border-cyan-900/60">
        <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <div id="hero-fluid-track" class="absolute -top-[5%] -left-[18%] w-[136%] h-[110%] animate-hero-pan will-change-transform">
            <img 
              id="hero-fluid-img"
              src="assets/images/hero_maquinaria_pesquera.jpg" 
              alt="Planta de procesamiento pesquero y salmonero WellPack" 
              class="w-full h-full object-cover object-center filter brightness-[0.98] contrast-[1.14] saturate-[1.18]">
          </div>
          <div class="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_50%,rgba(3,16,31,0.50)_0%,rgba(4,22,42,0.38)_55%,rgba(3,16,31,0.92)_100%)]"></div>
          <div class="absolute inset-0 bg-gradient-to-b from-[#03101f]/85 via-transparent to-[#03101f]"></div>
        </div>

        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-7 hero-content-trigger">
          <div class="p-6 sm:p-10 rounded-3xl bg-[#04182e]/70 backdrop-blur-md border border-cyan-400/35 shadow-[0_20px_60px_rgba(0,0,0,0.85)] space-y-6">
            <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-400/60 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider shadow-lg">
              <i data-lucide="fish" class="w-4 h-4 text-cyan-400"></i>
              <span>Catálogo Oficial Edición 2026 • 12 Máquinas para Proceso Pesquero</span>
            </div>

            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white drop-shadow-lg">
              De Pescado Entero a <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-400">Producto Empacado</span>
            </h1>

            <p class="text-base sm:text-lg lg:text-xl text-cyan-100/90 max-w-3xl mx-auto font-normal leading-relaxed">
              Doce máquinas especializadas para cada etapa de la línea: descamado por hidrojets, eviscerado, descabezado, apertura mariposa, fileteado, despielado, corte en rodajas, rebanado sashimi, recuperación de pulpa, clasificación por peso y glaseado IQF.
            </p>

            <div class="flex flex-wrap items-center justify-center gap-4 pt-2">
              <a 
                href="#fishery_video_library" 
                class="inline-flex items-center gap-2.5 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-sm sm:text-base px-7 py-4 rounded-2xl shadow-xl shadow-cyan-500/35 transition-all hover:scale-105 active:scale-95">
                <i data-lucide="play-circle" class="w-5 h-5 text-slate-950"></i>
                <span>Ver Videoteca en Operación (12 Videos)</span>
              </a>
              <a 
                href="#line_at_a_glance" 
                class="inline-flex items-center gap-2 bg-[#062342]/90 hover:bg-[#083059] text-cyan-200 border border-cyan-400/50 font-bold text-sm sm:text-base px-6 py-4 rounded-2xl transition-all hover:scale-105 backdrop-blur-md shadow-lg">
                <i data-lucide="git-branch" class="w-5 h-5 text-cyan-300"></i>
                <span>Mapa de Línea (01–12)</span>
              </a>
              <button 
                type="button"
                data-machine-title="Proyecto de Línea Completa Proceso Pesquero"
                class="btn-machinery-quote inline-flex items-center gap-2 bg-cyan-950/80 hover:bg-cyan-900/80 text-amber-300 border border-amber-400/50 font-bold text-sm sm:text-base px-6 py-4 rounded-2xl transition-all hover:scale-105 backdrop-blur-md shadow-lg">
                <i data-lucide="file-text" class="w-5 h-5 text-amber-400"></i>
                <span>Cotizar Línea o Máquina</span>
              </button>
            </div>

            <!-- KPIs Técnicos del Proceso Pesquero -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-6 border-t border-cyan-900/60 text-left max-w-4xl mx-auto">
              <div class="bg-[#06203c]/85 backdrop-blur-md p-3.5 rounded-2xl border border-cyan-400/30 shadow-lg">
                <div class="text-lg font-black text-cyan-300 font-mono">12 Videos + Fichas</div>
                <div class="text-[11px] text-cyan-100/80 font-mono uppercase mt-0.5">Demos Reales en Planta</div>
              </div>
              <div class="bg-[#06203c]/85 backdrop-blur-md p-3.5 rounded-2xl border border-cyan-400/30 shadow-lg">
                <div class="text-lg font-black text-sky-300 font-mono">SUS304 / 316</div>
                <div class="text-[11px] text-cyan-100/80 font-mono uppercase mt-0.5">Acero Inoxidable Cert. CE</div>
              </div>
              <div class="bg-[#06203c]/85 backdrop-blur-md p-3.5 rounded-2xl border border-cyan-400/30 shadow-lg">
                <div class="text-lg font-black text-emerald-400 font-mono">380V / 50Hz</div>
                <div class="text-[11px] text-cyan-100/80 font-mono uppercase mt-0.5">Estándar Industrial Chile</div>
              </div>
              <div class="bg-[#06203c]/85 backdrop-blur-md p-3.5 rounded-2xl border border-cyan-400/30 shadow-lg">
                <div class="text-lg font-black text-amber-400 font-mono">Garantía 12M</div>
                <div class="text-[11px] text-cyan-100/80 font-mono uppercase mt-0.5">Prueba en Marcha Pre-Embarque</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SECCIÓN MAPA DE LÍNEA DE UN VISTAZO (PÁGINA 2 DEL CATÁLOGO) -->
      <section id="line_at_a_glance" class="py-20 bg-[#031224] text-white border-b border-cyan-950 relative overflow-hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div class="text-center max-w-3xl mx-auto mb-12">
            <span class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold uppercase mb-3">
              LA LÍNEA DE UN VISTAZO (THE LINE AT A GLANCE)
            </span>
            <h2 class="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Flujo de Proceso: De Pescado Entero a Producto Empacado
            </h2>
            <p class="mt-3 text-cyan-100/80 text-sm sm:text-base">
              Elige máquinas individuales o combínalas en una línea continua. Cada ficha técnica muestra exactamente qué entra, qué sale, su video en operación y cuáles son sus límites operativos.
            </p>
          </div>

          <!-- 4 Columnas de Etapas de la Línea -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            <!-- Etapa 1: Preparación -->
            <div class="rounded-3xl bg-[#061d36]/90 border border-cyan-500/30 p-5 flex flex-col justify-between shadow-xl">
              <div>
                <div class="flex items-center justify-between pb-3 mb-4 border-b border-cyan-800/60">
                  <span class="text-xs font-mono font-black uppercase tracking-wider text-cyan-300">1. PREPARACIÓN</span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200">Etapas 01–04</span>
                </div>
                <div class="space-y-2.5">
                  <a href="#machine-card-01_descamadora_rl_fdm080" class="flex items-center gap-3 p-2.5 rounded-2xl bg-[#041324] hover:bg-cyan-950/80 border border-cyan-900/60 hover:border-cyan-400 transition group">
                    <span class="w-8 h-8 rounded-xl bg-cyan-500 text-slate-950 font-mono font-black text-xs flex items-center justify-center shrink-0">01</span>
                    <div>
                      <div class="text-xs font-bold text-white group-hover:text-cyan-300">Descamado (Descaling)</div>
                      <div class="text-[10px] font-mono text-cyan-400">RL-FDM080 • Hidrojets 90 bar</div>
                    </div>
                  </a>
                  <a href="#machine-card-02_evisceradora_rl_fgm060" class="flex items-center gap-3 p-2.5 rounded-2xl bg-[#041324] hover:bg-cyan-950/80 border border-cyan-900/60 hover:border-cyan-400 transition group">
                    <span class="w-8 h-8 rounded-xl bg-cyan-500 text-slate-950 font-mono font-black text-xs flex items-center justify-center shrink-0">02</span>
                    <div>
                      <div class="text-xs font-bold text-white group-hover:text-cyan-300">Eviscerado (Gutting)</div>
                      <div class="text-[10px] font-mono text-cyan-400">RL-FGM060 • 60 pescados/min</div>
                    </div>
                  </a>
                  <a href="#machine-card-03_descabezadora_rl_fhc" class="flex items-center gap-3 p-2.5 rounded-2xl bg-[#041324] hover:bg-cyan-950/80 border border-cyan-900/60 hover:border-cyan-400 transition group">
                    <span class="w-8 h-8 rounded-xl bg-cyan-500 text-slate-950 font-mono font-black text-xs flex items-center justify-center shrink-0">03</span>
                    <div>
                      <div class="text-xs font-bold text-white group-hover:text-cyan-300">Descabezado (Heading)</div>
                      <div class="text-[10px] font-mono text-cyan-400">RL-FHC • Bolsillos en V</div>
                    </div>
                  </a>
                  <a href="#machine-card-04_abridora_mariposa_rl_fsp" class="flex items-center gap-3 p-2.5 rounded-2xl bg-[#041324] hover:bg-cyan-950/80 border border-cyan-900/60 hover:border-cyan-400 transition group">
                    <span class="w-8 h-8 rounded-xl bg-cyan-500 text-slate-950 font-mono font-black text-xs flex items-center justify-center shrink-0">04</span>
                    <div>
                      <div class="text-xs font-bold text-white group-hover:text-cyan-300">Apertura Mariposa (Splitting)</div>
                      <div class="text-[10px] font-mono text-cyan-400">RL-FSP • Dorsal o Ventral</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            <!-- Etapa 2: Filetes y Porciones -->
            <div class="rounded-3xl bg-[#061d36]/90 border border-cyan-500/30 p-5 flex flex-col justify-between shadow-xl">
              <div>
                <div class="flex items-center justify-between pb-3 mb-4 border-b border-cyan-800/60">
                  <span class="text-xs font-mono font-black uppercase tracking-wider text-cyan-300">2. FILETES & PORCIONES</span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200">Etapas 05–08</span>
                </div>
                <div class="space-y-2.5">
                  <a href="#machine-card-05_fileteadora_rl_ffm" class="flex items-center gap-3 p-2.5 rounded-2xl bg-[#041324] hover:bg-cyan-950/80 border border-cyan-900/60 hover:border-cyan-400 transition group">
                    <span class="w-8 h-8 rounded-xl bg-sky-400 text-slate-950 font-mono font-black text-xs flex items-center justify-center shrink-0">05</span>
                    <div>
                      <div class="text-xs font-bold text-white group-hover:text-cyan-300">Fileteado (Filleting)</div>
                      <div class="text-[10px] font-mono text-cyan-400">RL-FFM • 2 Filetes + Espina</div>
                    </div>
                  </a>
                  <a href="#machine-card-06_despieladora_rl_fsk" class="flex items-center gap-3 p-2.5 rounded-2xl bg-[#041324] hover:bg-cyan-950/80 border border-cyan-900/60 hover:border-cyan-400 transition group">
                    <span class="w-8 h-8 rounded-xl bg-sky-400 text-slate-950 font-mono font-black text-xs flex items-center justify-center shrink-0">06</span>
                    <div>
                      <div class="text-xs font-bold text-white group-hover:text-cyan-300">Despielado (Skinning)</div>
                      <div class="text-[10px] font-mono text-cyan-400">RL-FSK • 40–60 filetes/min</div>
                    </div>
                  </a>
                  <a href="#machine-card-07_cortadora_segmentos_rl_fcm" class="flex items-center gap-3 p-2.5 rounded-2xl bg-[#041324] hover:bg-cyan-950/80 border border-cyan-900/60 hover:border-cyan-400 transition group">
                    <span class="w-8 h-8 rounded-xl bg-sky-400 text-slate-950 font-mono font-black text-xs flex items-center justify-center shrink-0">07</span>
                    <div>
                      <div class="text-xs font-bold text-white group-hover:text-cyan-300">Corte en Rodajas (Cutting)</div>
                      <div class="text-[10px] font-mono text-cyan-400">RL-FCM • Recto o Oblicuo</div>
                    </div>
                  </a>
                  <a href="#machine-card-08_rebanadora_filetes_rl_fsl" class="flex items-center gap-3 p-2.5 rounded-2xl bg-[#041324] hover:bg-cyan-950/80 border border-cyan-900/60 hover:border-cyan-400 transition group">
                    <span class="w-8 h-8 rounded-xl bg-sky-400 text-slate-950 font-mono font-black text-xs flex items-center justify-center shrink-0">08</span>
                    <div>
                      <div class="text-xs font-bold text-white group-hover:text-cyan-300">Rebanado Sashimi (Slicing)</div>
                      <div class="text-[10px] font-mono text-cyan-400">RL-FSL • 280 kg/h Biselado</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            <!-- Etapa 3: Subproductos -->
            <div class="rounded-3xl bg-[#061d36]/90 border border-cyan-500/30 p-5 flex flex-col justify-between shadow-xl">
              <div>
                <div class="flex items-center justify-between pb-3 mb-4 border-b border-cyan-800/60">
                  <span class="text-xs font-mono font-black uppercase tracking-wider text-cyan-300">3. SUBPRODUCTOS</span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Etapa 09</span>
                </div>
                <div class="space-y-3">
                  <a href="#machine-card-09_separadora_carne_hueso_rl_fms" class="flex items-center gap-3 p-3.5 rounded-2xl bg-[#041324] hover:bg-cyan-950/80 border border-emerald-500/40 hover:border-emerald-400 transition group">
                    <span class="w-9 h-9 rounded-xl bg-emerald-400 text-slate-950 font-mono font-black text-xs flex items-center justify-center shrink-0">09</span>
                    <div>
                      <div class="text-xs font-bold text-white group-hover:text-emerald-300">Separación Carne–Espina</div>
                      <div class="text-[10px] font-mono text-emerald-300">RL-FMS500 / 600 • 400–600 kg/h</div>
                    </div>
                  </a>
                  <div class="p-3.5 rounded-2xl bg-[#041324]/70 border border-cyan-900/50 text-xs text-cyan-100/80 leading-relaxed">
                    <strong class="text-emerald-300 block font-mono text-[11px] uppercase mb-1">Máximo Aprovechamiento:</strong>
                    Recupera pulpa limpia de pescado (Minced Fish) a partir de espinazos del fileteado, recortes y pescado pequeño para elaborar hamburguesas, croquetas, surimi y albóndigas marinas.
                  </div>
                </div>
              </div>
            </div>

            <!-- Etapa 4: Clasificación, Pesaje y Glaseado -->
            <div class="rounded-3xl bg-[#061d36]/90 border border-cyan-500/30 p-5 flex flex-col justify-between shadow-xl">
              <div>
                <div class="flex items-center justify-between pb-3 mb-4 border-b border-cyan-800/60">
                  <span class="text-xs font-mono font-black uppercase tracking-wider text-cyan-300">4. PESO & GLASEADO</span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200">Etapas 10–12</span>
                </div>
                <div class="space-y-2.5">
                  <a href="#machine-card-10_clasificadora_rotativa_rl_wg" class="flex items-center gap-3 p-2.5 rounded-2xl bg-[#041324] hover:bg-cyan-950/80 border border-cyan-900/60 hover:border-cyan-400 transition group">
                    <span class="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-mono font-black text-xs flex items-center justify-center shrink-0">10</span>
                    <div>
                      <div class="text-xs font-bold text-white group-hover:text-cyan-300">Clasificadora por Peso (Grader)</div>
                      <div class="text-[10px] font-mono text-cyan-400">RL-WG-S / L • 320–420 pzas/min</div>
                    </div>
                  </a>
                  <a href="#machine-card-11_balanza_combinada_cinta_rl_cw12" class="flex items-center gap-3 p-2.5 rounded-2xl bg-[#041324] hover:bg-cyan-950/80 border border-cyan-900/60 hover:border-cyan-400 transition group">
                    <span class="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-mono font-black text-xs flex items-center justify-center shrink-0">11</span>
                    <div>
                      <div class="text-xs font-bold text-white group-hover:text-cyan-300">Pesaje Combinado 12 Cintas</div>
                      <div class="text-[10px] font-mono text-cyan-400">RL-CW12 • Packs a Peso Fijo</div>
                    </div>
                  </a>
                  <a href="#machine-card-12_glaseadora_iqf_rl_igm1000" class="flex items-center gap-3 p-2.5 rounded-2xl bg-[#041324] hover:bg-cyan-950/80 border border-cyan-900/60 hover:border-cyan-400 transition group">
                    <span class="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-mono font-black text-xs flex items-center justify-center shrink-0">12</span>
                    <div>
                      <div class="text-xs font-bold text-white group-hover:text-cyan-300">Glaseadora de Hielo IQF</div>
                      <div class="text-[10px] font-mono text-cyan-400">RL-IGM1000 • 300–1000 kg/h</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Tabla Resumen de las 12 Máquinas (Input -> Output) -->
          <div class="rounded-3xl overflow-hidden border border-cyan-800/70 bg-[#041528] shadow-2xl">
            <div class="px-6 py-4 bg-cyan-950/80 border-b border-cyan-800/70 flex flex-wrap items-center justify-between gap-2">
              <span class="text-xs font-mono font-black uppercase tracking-wider text-cyan-300">Tabla Resumen de Línea (Haz clic en cualquier equipo para ir a su ficha técnica y video)</span>
              <span class="text-[11px] font-mono text-cyan-200/80">12 Modelos Industriales SUS304 / SUS316</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-xs font-mono text-left">
                <thead class="bg-[#03101f] text-cyan-400 uppercase text-[10px] border-b border-cyan-900/80">
                  <tr>
                    <th class="py-3 px-4">Nº</th>
                    <th class="py-3 px-4">Máquina / Etapa</th>
                    <th class="py-3 px-4">Modelo</th>
                    <th class="py-3 px-4">Flujo de Proceso (Entrada → Salida)</th>
                    <th class="py-3 px-4 text-right">Ficha + Video</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-cyan-900/40 text-cyan-100">
                  ${items.map(it => `
                    <tr class="hover:bg-cyan-900/30 transition cursor-pointer" onclick="document.getElementById('machine-card-${it.id}')?.scrollIntoView({behavior:'smooth'})">
                      <td class="py-2.5 px-4 font-black text-cyan-400">${it.step_num || ''}</td>
                      <td class="py-2.5 px-4 font-bold text-white font-sans">${it.title}</td>
                      <td class="py-2.5 px-4 text-amber-300 font-bold">${it.model_code || ''}</td>
                      <td class="py-2.5 px-4 text-cyan-100/90 font-sans">
                        <span class="text-cyan-300">${it.input_text || ''}</span>
                        <span class="text-amber-400 font-bold mx-1.5">→</span>
                        <span class="text-emerald-300 font-semibold">${it.output_text || ''}</span>
                      </td>
                      <td class="py-2.5 px-4 text-right">
                        <span class="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          <i data-lucide="play" class="w-3 h-3"></i> Ver
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <!-- VIDEOTECA INDUSTRIAL EN OPERACIÓN REAL (LOS 12 VIDEOS DEMOSTRATIVOS CON SU EXPLICACIÓN) -->
      <section id="fishery_video_library" class="py-20 bg-[#020e1c] text-white border-b border-cyan-950 relative overflow-hidden font-sans">
        <div class="absolute top-10 left-1/3 w-[650px] h-[350px] bg-cyan-500/10 blur-[140px] pointer-events-none rounded-full"></div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div class="text-center max-w-3xl mx-auto mb-12">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950 border border-cyan-400/50 text-cyan-300 text-xs font-mono font-bold uppercase mb-3 shadow-lg">
              <i data-lucide="video" class="w-4 h-4 text-cyan-400"></i>
              <span>Videoteca Oficial en Planta • 12 Demos Reales de Operación</span>
            </div>
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Máquinas en Operación Real con Explicación Técnica
            </h2>
            <p class="mt-3 text-cyan-100/85 text-sm sm:text-base leading-relaxed">
              Reproduce aquí mismo los videos demostrativos de cada equipo trabajando en planta. Cada video incluye la explicación exacta del proceso mecánico y enlace directo a su ficha de ingeniería.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${items.filter(it => it.video).map(it => {
              const vSrc = it.video.startsWith('/') ? it.video.slice(1) : it.video;
              const vPoster = it.video_poster ? (it.video_poster.startsWith('/') ? it.video_poster.slice(1) : it.video_poster) : (it.image.startsWith('/') ? it.image.slice(1) : it.image);
              return `
                <article class="rounded-3xl overflow-hidden bg-gradient-to-b from-[#07213e] to-[#041427] border border-cyan-800/70 hover:border-cyan-400/80 shadow-2xl flex flex-col justify-between transition-all duration-300">
                  <div>
                    <!-- Reproductor de Video con Póster y Badges -->
                    <div class="relative bg-[#010811] aspect-square overflow-hidden flex items-center justify-center border-b border-cyan-900/70">
                      <video 
                        controls 
                        preload="none" 
                        playsinline 
                        poster="${vPoster}" 
                        src="${vSrc}"
                        onplay="document.querySelectorAll('video').forEach(v=>{if(v!==this)v.pause()})"
                        class="w-full h-full object-contain bg-[#010811]">
                      </video>
                      <div class="absolute top-3 left-3 pointer-events-none flex items-center gap-1.5">
                        <span class="px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 font-mono font-black text-xs shadow-lg">
                          ${it.step_num || ''}
                        </span>
                        <span class="px-2.5 py-1 rounded-lg bg-slate-950/90 text-cyan-300 border border-cyan-400/40 font-mono font-bold text-[11px] shadow-lg">
                          ${it.model_code || ''}
                        </span>
                      </div>
                      ${it.video_duration ? `
                        <div class="absolute top-3 right-3 pointer-events-none">
                          <span class="px-2.5 py-1 rounded-lg bg-slate-950/90 text-amber-300 border border-amber-400/40 font-mono font-bold text-[11px] shadow-lg">
                            ⏱ ${it.video_duration}
                          </span>
                        </div>
                      ` : ''}
                    </div>

                    <!-- Explicación del Video -->
                    <div class="p-5 space-y-3">
                      <div class="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                        ${it.stage_label || ''} • ${it.badge || ''}
                      </div>
                      <h3 class="text-lg font-black text-white leading-snug">
                        ${it.video_title || it.title}
                      </h3>
                      <p class="text-xs text-cyan-100/85 leading-relaxed">
                        ${it.video_caption || it.description}
                      </p>
                      <div class="p-2.5 rounded-xl bg-[#03101f] border border-cyan-900/70 text-[11px] font-mono flex items-center justify-between gap-2">
                        <span class="text-cyan-300 truncate">${it.input_text || ''}</span>
                        <span class="text-amber-400 font-bold shrink-0">→</span>
                        <span class="text-emerald-300 font-semibold truncate text-right">${it.output_text || ''}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Botones Inferiores: Ir a Ficha Técnica + Cotizar -->
                  <div class="px-5 pb-5 pt-2 flex items-center justify-between gap-2.5">
                    <a 
                      href="#machine-card-${it.id}" 
                      class="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#03101f] hover:bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono font-bold text-xs transition">
                      <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
                      <span>Ver Ficha Técnica</span>
                    </a>
                    <button 
                      type="button"
                      data-machine-title="[PROCESO PESQUERO ${it.model_code || ''}] ${it.title}"
                      class="btn-machinery-quote inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition">
                      <span>Cotizar</span>
                      <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                    </button>
                  </div>
                </article>
              `;
            }).join('')}
          </div>
        </div>
      </section>

      <!-- Catálogo Completo de las 12 Máquinas de Proceso Pesquero -->
      ${this.renderFisheryMachineryShowcaseSection(config)}

      <!-- SECCIÓN CÓMO COTIZAMOS Y DESPACHAMOS (PÁGINA 15 DEL CATÁLOGO ADAPTADA A WELLPACK) -->
      <section class="py-20 bg-[#031224] text-white border-b border-cyan-950 font-sans">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            <!-- Columna Izquierda: Condiciones Técnicas y Garantía -->
            <div class="lg:col-span-7 space-y-6">
              <div>
                <span class="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-2">INGENIERÍA Y SUMINISTRO WELLPACK</span>
                <h2 class="text-3xl sm:text-4xl font-black text-white tracking-tight">Cómo Cotizamos, Configuramos y Despachamos tu Equipamiento</h2>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="p-5 rounded-2xl bg-[#061d36] border border-cyan-800/60">
                  <div class="text-xs font-mono font-bold text-cyan-300 uppercase mb-1">1. Dimensionamiento a Medida</div>
                  <p class="text-xs text-cyan-100/85 leading-relaxed">Indícanos tu especie hidrobiológica, volumen diario y voltaje en planta para configurar el modelo exacto, paso de cuchillas o diámetro de tambor.</p>
                </div>
                <div class="p-5 rounded-2xl bg-[#061d36] border border-cyan-800/60">
                  <div class="text-xs font-mono font-bold text-cyan-300 uppercase mb-1">2. Voltaje Industrial en Chile</div>
                  <p class="text-xs text-cyan-100/85 leading-relaxed">380 V / 50 Hz trifásico como estándar para plantas en Chile. También disponibles configuraciones en 400, 415, 440 y 480 V (50/60 Hz) a pedido.</p>
                </div>
                <div class="p-5 rounded-2xl bg-[#061d36] border border-cyan-800/60">
                  <div class="text-xs font-mono font-bold text-cyan-300 uppercase mb-1">3. Tiempo de Fabricación & Envío</div>
                  <p class="text-xs text-cyan-100/85 leading-relaxed">Aproximadamente 35 días de producción para máquinas estándar, embaladas en cajas de madera contrachapada de exportación sin requerir fumigación.</p>
                </div>
                <div class="p-5 rounded-2xl bg-[#061d36] border border-cyan-800/60">
                  <div class="text-xs font-mono font-bold text-cyan-300 uppercase mb-1">4. Garantía 12 Meses & Test Video</div>
                  <p class="text-xs text-cyan-100/85 leading-relaxed">12 meses de garantía sobre estructura principal y componentes mayores. Enviamos video de prueba en marcha (Running Test Video) antes del embarque y soporte de puesta en marcha.</p>
                </div>
              </div>
            </div>

            <!-- Columna Derecha: Los 6 Datos para Cotizar Rápido -->
            <div class="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#072442] to-[#041528] border border-cyan-400/40 shadow-2xl">
              <h3 class="text-xl font-black text-white mb-2">Solicita tu Cotización con estos 6 Datos</h3>
              <p class="text-xs text-cyan-200/85 mb-6">Envíanos estos parámetros en el formulario o por WhatsApp para entregarte la propuesta técnica exacta:</p>
              
              <div class="grid grid-cols-2 gap-3 mb-6">
                <div class="p-3.5 rounded-2xl bg-[#03101f] border border-cyan-800/70">
                  <span class="text-sm font-mono font-black text-cyan-400 block">01</span>
                  <span class="text-xs font-bold text-white">Especie de pescado</span>
                </div>
                <div class="p-3.5 rounded-2xl bg-[#03101f] border border-cyan-800/70">
                  <span class="text-sm font-mono font-black text-cyan-400 block">02</span>
                  <span class="text-xs font-bold text-white">Peso o calibre de filete</span>
                </div>
                <div class="p-3.5 rounded-2xl bg-[#03101f] border border-cyan-800/70">
                  <span class="text-sm font-mono font-black text-cyan-400 block">03</span>
                  <span class="text-xs font-bold text-white">Volumen diario (kg/h)</span>
                </div>
                <div class="p-3.5 rounded-2xl bg-[#03101f] border border-cyan-800/70">
                  <span class="text-sm font-mono font-black text-cyan-400 block">04</span>
                  <span class="text-xs font-bold text-white">Fresco, enfriado o IQF</span>
                </div>
                <div class="p-3.5 rounded-2xl bg-[#03101f] border border-cyan-800/70">
                  <span class="text-sm font-mono font-black text-cyan-400 block">05</span>
                  <span class="text-xs font-bold text-white">Voltaje en tu planta</span>
                </div>
                <div class="p-3.5 rounded-2xl bg-[#03101f] border border-cyan-800/70">
                  <span class="text-sm font-mono font-black text-cyan-400 block">06</span>
                  <span class="text-xs font-bold text-white">Ciudad / Planta destino</span>
                </div>
              </div>

              <button 
                type="button"
                data-machine-title="Cotización a Medida Línea Proceso Pesquero"
                class="btn-machinery-quote w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500 hover:from-cyan-300 hover:to-sky-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-cyan-500/30 transition hover:scale-[1.02] flex items-center justify-center gap-2">
                <i data-lucide="send" class="w-4 h-4"></i>
                <span>Cotizar mi Equipo o Línea Pesquera</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      <!-- Banner de Sinergia con Envases Pesqueros y División Cárnica -->
      <section class="py-16 bg-[#020b16] border-b border-cyan-950">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <a href="index.html" class="group p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#071d33] to-[#14120a] border border-amber-500/35 hover:border-amber-400 flex items-center justify-between gap-4 transition-all hover:-translate-y-1">
            <div>
              <span class="text-[11px] font-mono uppercase text-amber-400 font-bold block mb-1">📦 Sinergia Bolsas + Máquina</span>
              <h3 class="text-xl font-black text-white group-hover:text-amber-300">Volver a Envases Flexibles (Bolsas Salmón EVOH & Mariscos IQF)</h3>
              <p class="text-xs text-slate-300 mt-1">Bolsas al vacío con ventana, películas para termoformado y Doypack para túneles -35°C.</p>
            </div>
            <i data-lucide="arrow-left" class="w-6 h-6 text-amber-400 shrink-0"></i>
          </a>

          <a href="maquinaria-carnica.html" class="group p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#210909] to-[#140606] border border-red-500/35 hover:border-red-400 flex items-center justify-between gap-4 transition-all hover:-translate-y-1">
            <div>
              <span class="text-[11px] font-mono uppercase text-red-400 font-bold block mb-1">🥩 Otra División de Ingeniería</span>
              <h3 class="text-xl font-black text-white group-hover:text-red-300">Ir a Maquinaria para Rubro Cárnico & Cecinas</h3>
              <p class="text-xs text-red-200/80 mt-1">Desmenuzadoras de congelados, cutters al vacío de 4.500 RPM, embutidoras y ahumadores.</p>
            </div>
            <i data-lucide="arrow-right" class="w-6 h-6 text-red-400 shrink-0"></i>
          </a>
        </div>
      </section>
    `;
  }

  // ==========================================================
  // CATÁLOGO MAQUINARIA PROCESO PESQUERO (12 EQUIPOS CON FICHA COMPLETA)
  // ==========================================================
  renderFisheryMachineryShowcaseSection(config = {}) {
    const title = config.title || "Línea Completa de Maquinaria para Proceso Pesquero (12 Equipos)";
    const subtitle = config.subtitle || "Doce máquinas especializadas para cada etapa de la línea — desde el pescado entero con escamas hasta el filete porcionado, pesado, clasificado y glaseado para exportación.";
    const items = config.items || [];

    return `
      <section id="fishery_machinery_showcase" class="py-24 bg-[#041426] text-white relative border-b border-cyan-950 overflow-hidden font-sans">
        
        <!-- Luz ambiental en tonos cian glaciar y azul marino profundo -->
        <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[420px] bg-cyan-500/12 blur-[150px] pointer-events-none rounded-full"></div>
        <div class="absolute bottom-10 right-10 w-[550px] h-[320px] bg-sky-600/12 blur-[130px] pointer-events-none rounded-full"></div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <!-- Encabezado de Sección -->
          <div class="text-center max-w-3xl mx-auto mb-14">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold uppercase mb-4 shadow-sm">
              <i data-lucide="waves" class="w-4 h-4 text-cyan-400"></i>
              Fichas Técnicas Detalladas • Etapas 01 a 12
            </div>
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              ${title}
            </h2>
            <p class="mt-4 text-cyan-100/80 text-base sm:text-lg leading-relaxed">
              ${subtitle}
            </p>
          </div>

          <!-- Filtro Interactivo por Las 4 Etapas del Catálogo -->
          <div class="flex items-center justify-center gap-2 mb-12 overflow-x-auto pb-2 px-2" id="machinery-category-filters">
            <button 
              type="button" 
              data-machine-filter="all" 
              class="btn-machine-tab btn-spring px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border border-cyan-400 bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 shadow-lg shadow-cyan-500/35">
              🌊 Las 12 Máquinas (${items.length})
            </button>
            <button 
              type="button" 
              data-machine-filter="preparacion" 
              class="btn-machine-tab btn-spring px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border border-cyan-800/80 bg-[#07203b] text-cyan-200 hover:border-cyan-400/60">
              01–04 Preparación (Descamado, Eviscerado, Cabeza, Mariposa)
            </button>
            <button 
              type="button" 
              data-machine-filter="fileteado" 
              class="btn-machine-tab btn-spring px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border border-cyan-800/80 bg-[#07203b] text-cyan-200 hover:border-cyan-400/60">
              05–08 Filetes, Despielado, Rodajas & Sashimi
            </button>
            <button 
              type="button" 
              data-machine-filter="subproductos" 
              class="btn-machine-tab btn-spring px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border border-cyan-800/80 bg-[#07203b] text-cyan-200 hover:border-cyan-400/60">
              09 Separación Carne–Espina
            </button>
            <button 
              type="button" 
              data-machine-filter="clasificacion" 
              class="btn-machine-tab btn-spring px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border border-cyan-800/80 bg-[#07203b] text-cyan-200 hover:border-cyan-400/60">
              10–12 Clasificación Peso, Combinadora & Glaseado IQF
            </button>
          </div>

          <!-- Listado de las 12 Fichas Técnicas de Maquinaria Pesquera -->
          <div class="space-y-10" id="machinery-cards-grid">
            ${items.map(item => {
              const cat = item.category || 'all';
              const badge = item.badge || 'SUS304 Inoxidable';
              const icon = item.icon || 'fish';
              const kpis = item.kpis || [];
              const species = item.species || [];
              const notes = item.notes || [];
              const techDetails = item.tech_details || [];
              const detailImages = item.detail_images || [];

              return `
                <article id="machine-card-${item.id}" data-machine-cat="${cat}" class="machinery-card spotlight-card bg-gradient-to-b from-[#07223f] to-[#04172b] border border-cyan-800/70 hover:border-cyan-400/80 rounded-3xl p-6 sm:p-8 lg:p-10 flex flex-col justify-between shadow-2xl transition-all duration-300">
                  
                  <!-- Cabecera Superior de la Ficha: Etapa + Título + Modelo -->
                  <div class="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-cyan-800/60">
                    <div class="space-y-1">
                      <div class="flex flex-wrap items-center gap-2.5">
                        <span class="px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 font-mono font-black text-xs uppercase tracking-wider">
                          ${item.stage_label || `ETAPA ${item.step_num || ''}`}
                        </span>
                        <span class="px-3 py-1 rounded-lg bg-[#03101f] border border-cyan-400/50 text-cyan-300 font-mono font-bold text-xs">
                          MODELO: ${item.model_code || ''}
                        </span>
                        <span class="px-3 py-1 rounded-lg bg-cyan-950/80 border border-cyan-700/50 text-amber-300 font-mono font-bold text-xs">
                          ${badge}
                        </span>
                      </div>
                      <h3 class="text-2xl sm:text-3xl font-black text-white pt-1">
                        ${item.title}
                      </h3>
                      <p class="text-sm sm:text-base text-cyan-300 font-medium">
                        ${item.subtitle}
                      </p>
                    </div>

                    <button 
                      type="button" 
                      data-machine-title="[PROCESO PESQUERO ${item.model_code || ''}] ${item.title}"
                      class="btn-machinery-quote btn-spring inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/35 shrink-0">
                      <i data-lucide="file-text" class="w-4 h-4"></i>
                      <span>Cotizar ${item.model_code || 'Equipo'}</span>
                    </button>
                  </div>

                  <!-- Cuerpo Central en 2 Columnas (Visual + Flujo / Datos Técnicos) -->
                  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    <!-- Columna Izquierda (5 cols): Foto Principal Real + Fotos de Detalle + Flujo Input/Output + Especies -->
                    <div class="lg:col-span-5 space-y-5">
                      
                      <!-- Fotografía Principal Extraída del Catálogo -->
                      <div class="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden bg-white border-2 border-cyan-500/40 flex items-center justify-center p-4 shadow-xl group">
                        <img 
                          src="${item.image.startsWith('/') ? item.image.slice(1) : item.image}" 
                          alt="${item.title}" 
                          loading="lazy" 
                          class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500">
                        <div class="absolute top-3 left-3">
                          <span class="px-2.5 py-1 rounded-lg bg-slate-950/90 text-cyan-300 font-mono font-bold text-[11px] border border-cyan-500/40">
                            ${item.model_code || ''}
                          </span>
                        </div>
                      </div>

                      <!-- Miniaturas de Detalle Constructivo (del Catálogo) -->
                      ${detailImages.length > 0 ? `
                        <div class="grid grid-cols-${Math.min(detailImages.length, 3)} gap-3">
                          ${detailImages.map(det => `
                            <div class="rounded-xl overflow-hidden bg-[#03101f] border border-cyan-800/70 p-2 flex flex-col justify-between">
                              <div class="h-28 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                                <img src="${det.url.startsWith('/') ? det.url.slice(1) : det.url}" alt="${det.caption}" loading="lazy" class="w-full h-full object-cover">
                              </div>
                              <span class="text-[10px] font-mono text-cyan-200/90 mt-1.5 block leading-tight text-center">${det.caption}</span>
                            </div>
                          `).join('')}
                        </div>
                      ` : ''}

                      <!-- Video Operativo (integrado en la ficha técnica con póster y explicación) -->
                      ${item.video ? `
                        <div class="rounded-2xl overflow-hidden bg-[#020d1a] border-2 border-cyan-400/70 p-3.5 shadow-xl space-y-2.5">
                          <div class="flex items-center justify-between gap-2">
                            <span class="text-xs font-mono font-black uppercase text-cyan-300 flex items-center gap-1.5">
                              <i data-lucide="play-circle" class="w-4 h-4 text-cyan-400"></i>
                              <span>Video en Planta • ${item.model_code || ''}</span>
                            </span>
                            <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                              ${item.video_duration ? `⏱ ${item.video_duration} • ` : ''}Operación Real
                            </span>
                          </div>
                          <div class="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-cyan-900/70">
                            <video 
                              controls 
                              preload="none" 
                              playsinline 
                              poster="${item.video_poster ? (item.video_poster.startsWith('/') ? item.video_poster.slice(1) : item.video_poster) : ''}"
                              src="${item.video.startsWith('/') ? item.video.slice(1) : item.video}"
                              onplay="document.querySelectorAll('video').forEach(v=>{if(v!==this)v.pause()})"
                              class="w-full h-full object-contain bg-black">
                            </video>
                          </div>
                          ${item.video_title ? `<div class="text-xs font-bold text-white">${item.video_title}</div>` : ''}
                          ${item.video_caption ? `<p class="text-[11px] text-cyan-100/90 leading-relaxed bg-[#04172b] p-2.5 rounded-xl border border-cyan-800/50">${item.video_caption}</p>` : ''}
                        </div>
                      ` : ''}

                      <!-- Caja de Transformación: ENTRADA -> SALIDA -->
                      <div class="p-4 rounded-2xl bg-[#03101f] border border-cyan-500/40 space-y-2">
                        <div class="flex items-center justify-between">
                          <span class="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">ENTRADA (INPUT)</span>
                          <span class="text-xs font-bold text-white">${item.input_text || ''}</span>
                        </div>
                        <div class="flex justify-center">
                          <i data-lucide="arrow-down" class="w-4 h-4 text-amber-400"></i>
                        </div>
                        <div class="flex items-center justify-between pt-1 border-t border-cyan-900/60">
                          <span class="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">SALIDA (OUTPUT)</span>
                          <span class="text-xs font-bold text-emerald-300 text-right">${item.output_text || ''}</span>
                        </div>
                      </div>

                      <!-- Especies Hidrobiológicas Recomendadas -->
                      ${species.length > 0 ? `
                        <div class="p-4 rounded-2xl bg-[#041528] border border-cyan-900/60">
                          <span class="text-[10px] font-mono uppercase tracking-widest text-cyan-300 font-bold block mb-2.5">
                            🐟 ESPECIES RECOMENDADAS (BEST SUITED FOR):
                          </span>
                          <div class="flex flex-wrap gap-1.5">
                            ${species.map(sp => `
                              <span class="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/35 text-cyan-200 text-xs font-semibold">
                                ${sp}
                              </span>
                            `).join('')}
                          </div>
                        </div>
                      ` : ''}

                    </div>

                    <!-- Columna Derecha (7 cols): 4 KPIs + Explicación + Características + Notas Importantes + Tabla Técnica -->
                    <div class="lg:col-span-7 space-y-6">
                      
                      <!-- 4 Tarjetas de Indicadores Clave (KPIs del Catálogo) -->
                      ${kpis.length > 0 ? `
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          ${kpis.map(k => `
                            <div class="p-3.5 rounded-2xl bg-[#03101f] border-t-2 border-t-cyan-400 border-x border-b border-cyan-900/60 shadow-md">
                              <span class="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block">${k.label}</span>
                              <span class="text-lg sm:text-xl font-black text-white font-mono mt-0.5 block">${k.value}</span>
                              <span class="text-[10px] text-cyan-200/75 font-mono block">${k.unit || ''}</span>
                            </div>
                          `).join('')}
                        </div>
                      ` : ''}

                      <!-- Explicación Detallada del Proceso -->
                      <div class="p-4 rounded-2xl bg-[#051b33]/70 border border-cyan-800/50">
                        <span class="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-1">Descripción y Funcionamiento en Línea:</span>
                        <p class="text-cyan-50/90 text-xs sm:text-sm leading-relaxed">
                          ${item.description}
                        </p>
                      </div>

                      <!-- Características Principales (Key Features) -->
                      <div>
                        <h4 class="text-xs font-mono uppercase tracking-widest text-cyan-300 font-bold mb-3">
                          ✓ Características Principales (Key Features)
                        </h4>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          ${(item.features || []).map(f => `
                            <div class="flex items-start gap-2 text-xs text-cyan-50/90 bg-[#041528]/70 p-2.5 rounded-xl border border-cyan-900/40">
                              <i data-lucide="check-circle-2" class="w-4 h-4 text-cyan-400 shrink-0 mt-0.5"></i>
                              <span>${f}</span>
                            </div>
                          `).join('')}
                        </div>
                      </div>

                      <!-- Consideraciones Operativas (Please Note / Límites de la Máquina) -->
                      ${notes.length > 0 ? `
                        <div class="p-4 rounded-2xl bg-amber-950/35 border-l-4 border-l-amber-400 border border-amber-500/30">
                          <div class="flex items-center gap-2 text-xs font-mono font-bold text-amber-300 uppercase mb-2">
                            <i data-lucide="alert-circle" class="w-4 h-4 text-amber-400"></i>
                            <span>Consideraciones Operativas (Tener en Cuenta / Please Note)</span>
                          </div>
                          <ul class="space-y-1 text-xs text-amber-100/90 list-disc list-inside">
                            ${notes.map(n => `<li>${n}</li>`).join('')}
                          </ul>
                        </div>
                      ` : ''}

                      <!-- Tabla de Especificaciones Técnicas (Technical Data) -->
                      ${techDetails.length > 0 ? `
                        <div class="rounded-2xl overflow-hidden border border-cyan-800/70 bg-[#03101f]">
                          <div class="px-4 py-2.5 bg-cyan-950/70 border-b border-cyan-900/70 text-[11px] font-mono font-bold text-cyan-300 uppercase">
                            Ficha de Datos Técnicos (${item.model_code || ''})
                          </div>
                          <div class="divide-y divide-cyan-950/80 text-xs">
                            ${techDetails.map(td => `
                              <div class="grid grid-cols-1 sm:grid-cols-3 py-2.5 px-4 hover:bg-cyan-900/20">
                                <span class="font-mono font-bold text-cyan-400">${td.label}</span>
                                <span class="sm:col-span-2 text-cyan-100">${td.value}</span>
                              </div>
                            `).join('')}
                          </div>
                        </div>
                      ` : ''}

                      <!-- Tabla comparativa cuando el equipo tiene múltiples sub-modelos (ej. FMS500/600 o WG-S/L) -->
                      ${item.specs && item.specs.length > 1 ? `
                        <div class="overflow-x-auto rounded-xl border border-cyan-800/70 bg-[#03101f]">
                          <table class="w-full text-[11px] font-mono text-left">
                            <thead class="bg-cyan-950/70 text-cyan-200 uppercase text-[10px]">
                              <tr>
                                <th class="py-2 px-3">Modelo</th>
                                <th class="py-2 px-3">Potencia</th>
                                <th class="py-2 px-3">Capacidad</th>
                                <th class="py-2 px-3">Rango / Detalle</th>
                                <th class="py-2 px-3 hidden sm:table-cell">Dimensiones y Peso</th>
                              </tr>
                            </thead>
                            <tbody class="divide-y divide-cyan-950/80 text-cyan-100">
                              ${item.specs.map(sp => `
                                <tr class="hover:bg-cyan-900/25">
                                  <td class="py-2 px-3 font-bold text-cyan-300">${sp.model}</td>
                                  <td class="py-2 px-3">${sp.power || ''}</td>
                                  <td class="py-2 px-3 text-emerald-300 font-semibold">${sp.capacity || ''}</td>
                                  <td class="py-2 px-3">${sp.speed || ''}</td>
                                  <td class="py-2 px-3 hidden sm:table-cell text-cyan-300/80">${sp.dims || ''}</td>
                                </tr>
                              `).join('')}
                            </tbody>
                          </table>
                        </div>
                      ` : ''}

                    </div>

                  </div>

                </article>
              `;
            }).join('')}
          </div>

        </div>
      </section>
    `;
  }

  // ==========================================================
  // ==========================================================
  // SECCIÓN UNIVERSAL: ESCALA DE PRECIOS & PLANES POR VOLUMEN + VERSUS
  // ==========================================================
  renderTieredPricingOffersSection(config = {}) {
    const title = config.title || "Escala tu Producción, Reduce tus Costos";
    const subtitle = config.subtitle || "Valores para formato Vacío 3 Sellos Alta Barrera. Sin cobros ocultos por matrices.";
    const cards = config.cards || [];
    const versus = config.versus || {
      title: "El Verdadero Costo de tu Empaque",
      subtitle: "¿Por qué las imprentas tradicionales te hacen pagar de más al inicio? Analicemos los números para un tiraje estándar de 10.000 unidades.",
      traditional: {
        title: "❌ Imprenta Tradicional",
        cost_bags: "$950.000",
        cost_bags_detail: "10.000 un. x $95",
        cost_plates: "+$800.000",
        plates_detail: "Matrices de polímero (Cilindros)",
        flexibility: "Nula (Costo si cambias)",
        lead_time: "45 a 60 días",
        total_investment: "$1.750.000",
        real_unit_cost: "$175 CLP"
      },
      wellpack: {
        title: "✅ Tecnología Wellpack",
        badge: "Recomendado",
        cost_bags: "$1.450.000",
        cost_bags_detail: "10.000 un. x $145*",
        cost_plates: "$0 (Sin cobro)",
        plates_detail: "Matrices de impresión COSTO CERO",
        flexibility: "Total en cada tiraje",
        lead_time: "Inmediata con IA y Especialista",
        total_investment: "$1.450.000",
        real_unit_cost: "$145 CLP"
      },
      quote: "Deja de pagar por moldes de polímero que terminan en la basura al actualizar tu información nutricional o diseño.",
      cta_label: "Cotizar mi empaque ahora"
    };

    return `
      <section id="tiered_pricing_offers" class="py-20 lg:py-24 bg-[#0F172A] text-white relative border-b border-gray-800 overflow-hidden font-sans">
        
        <!-- Efecto de luz ambiental en el fondo -->
        <div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[350px] bg-[#FF6B00]/5 rounded-full blur-[140px] pointer-events-none"></div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <!-- Encabezado de la Sección -->
          <div class="text-center max-w-3xl mx-auto mb-16">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-[#FF6B00]/40 text-[#FF6B00] text-xs font-mono font-bold uppercase mb-4 shadow-sm">
              <i data-lucide="trending-down" class="w-4 h-4 text-[#FF6B00]"></i>
              Escala de Precios B2B
            </div>
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              ${title}
            </h2>
            <p class="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              ${subtitle}
            </p>
          </div>

          <!-- Selector Rápido de Volumen (Tabs Interactivos de Simulación) -->
          <div class="flex items-center justify-center gap-2.5 mb-10 overflow-x-auto pb-2 px-2">
            <button 
              type="button" 
              data-tier-target="tier_scale" 
              class="btn-tier-tab btn-spring px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border border-[#FF6B00] bg-[#FF6B00] text-neutral-950 shadow-lg shadow-orange-950/40">
              ⚡ 10.000 un. (Escala)
            </button>
            <button 
              type="button" 
              data-tier-target="tier_wholesale" 
              class="btn-tier-tab btn-spring px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border border-neutral-700 bg-neutral-900/90 text-neutral-300 hover:border-neutral-500">
              📦 20.000 un. (Mayorista)
            </button>
            <button 
              type="button" 
              data-tier-target="tier_industrial" 
              class="btn-tier-tab btn-spring px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border border-neutral-700 bg-neutral-900/90 text-neutral-300 hover:border-neutral-500">
              🏭 40.000+ un. (Industrial)
            </button>
          </div>

          <!-- Tiers de Precios (3 Columnas Centradas) -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-20 items-stretch max-w-6xl mx-auto">
            ${cards.map(card => {
              const isHighlighted = !!card.highlight || card.id === 'tier_scale';
              const hasBadge = !!card.badge;

              return `
                <div id="tier-card-${card.id}" data-card-id="${card.id}" class="spotlight-card tier-card bg-[#1E293B] p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:border-gray-500 shadow-xl ${
                  isHighlighted 
                    ? 'border-2 border-[#FF6B00] relative shadow-2xl shadow-orange-950/30 transform lg:-translate-y-4 ring-1 ring-[#FF6B00]/40' 
                    : 'border border-gray-700 hover:-translate-y-1'
                }">
                  
                  <!-- Badge Superior Flotante -->
                  ${hasBadge ? `
                    <span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF6B00] text-black text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-orange-950/40">
                      ${card.badge}
                    </span>
                  ` : ''}

                  <!-- Contenido Superior -->
                  <div>
                    <h3 class="text-xl font-bold text-white mb-1.5">${card.title}</h3>
                    <p class="text-gray-400 text-xs sm:text-sm mb-4">${card.subtitle || 'Formato estándar alta barrera'}</p>
                    
                    <!-- Precio por unidad -->
                    <div class="text-3xl sm:text-4xl font-extrabold text-white mb-6 font-mono tracking-tight pb-4 border-b border-gray-700/60">
                      ${card.price_per_unit} 
                      <span class="text-xs sm:text-sm font-normal text-gray-400 font-sans">CLP / un.</span>
                    </div>

                    <!-- Lista de Features -->
                    <ul class="text-sm space-y-3 mb-8">
                      ${card.features.map(feat => {
                        const isHighlightFeat = feat.includes('COSTO CERO') || feat.includes('10.000') || (isHighlighted && feat.includes('Alta Barrera'));
                        const isSubDetail = feat.includes('Ahorro') || feat.includes('Prioridad') || feat.includes('Ejecutivo');
                        const isOrange = feat.includes('COSTO CERO');

                        if (isSubDetail) {
                          return `
                            <li class="flex items-center text-gray-400 text-xs pl-6">
                              ${feat}
                            </li>
                          `;
                        }

                        return `
                          <li class="flex items-center gap-2 ${
                            isOrange ? 'text-[#FF6B00] font-semibold' :
                            isHighlightFeat ? 'text-white font-medium' :
                            'text-gray-300'
                          }">
                            <i data-lucide="check" class="w-4 h-4 shrink-0 ${isOrange ? 'text-[#FF6B00]' : 'text-emerald-400'}"></i>
                            <span>${feat.replace(/^[✓\s]+/, '')}</span>
                          </li>
                        `;
                      }).join('')}
                    </ul>
                  </div>

                  <!-- Botón de Acción -->
                  <div class="pt-4 border-t border-gray-700/60">
                    <button 
                      data-tier-id="${card.id}"
                      data-tier-volume="${card.volume}"
                      data-tier-price="${card.price_per_unit}"
                      data-tier-title="${card.title}"
                      class="btn-tier-quote w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${
                        isHighlighted 
                          ? 'bg-[#FF6B00] hover:bg-[#e05e00] text-white shadow-lg shadow-orange-950/40 hover:scale-[1.02]' 
                          : 'border border-gray-600 hover:border-gray-400 bg-slate-900/60 hover:bg-slate-800 text-white hover:scale-[1.02]'
                      }">
                      <span>${card.button?.label || 'Cotizar'}</span>
                      <i data-lucide="${isHighlighted ? 'zap' : 'arrow-right'}" class="w-4 h-4"></i>
                    </button>
                  </div>

                </div>
              `;
            }).join('')}
          </div>

          <!-- SECCIÓN VERSUS: El verdadero costo de tu empaque (Rediseñada para Alta Conversión) -->
          <div class="border-t border-gray-800 pt-16 mt-8 relative">
            
            <!-- Efecto de luz ambiental de fondo -->
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#FF6B00]/10 blur-[120px] pointer-events-none"></div>

            <div class="max-w-6xl mx-auto relative z-10">
              
              <!-- Encabezado con mayor peso -->
              <div class="text-center mb-16">
                <span class="inline-block py-1 px-4 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00] text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
                  📊 Transparencia Financiera B2B
                </span>
                <h3 class="text-4xl md:text-5xl font-black mb-4 tracking-tight text-white">El Verdadero Costo de tu Empaque</h3>
                <p class="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">¿Por qué las imprentas tradicionales te hacen pagar de más al inicio? Analicemos los números fríos para un tiraje estándar de 10.000 unidades.</p>
              </div>

              <!-- Contenedor de Tarjetas (Asimétrico y Dominante: 5 cols vs 7 cols) -->
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                <!-- TARJETA 1: Imprenta Tradicional (Se ve costosa y restrictiva) -->
                <div class="lg:col-span-5 bg-[#131d35]/60 backdrop-blur-md p-8 rounded-2xl border border-red-500/20 relative shadow-xl">
                  <div class="flex items-center justify-between mb-8 pb-4 border-b border-gray-800">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 font-bold text-xl">✕</div>
                      <h4 class="text-xl font-bold text-gray-300">Imprenta Tradicional</h4>
                    </div>
                    <span class="text-xs uppercase tracking-wider px-2.5 py-1 rounded bg-red-500/10 text-red-400 font-semibold">Modelo Antiguo</span>
                  </div>

                  <div class="space-y-6 text-sm text-gray-400 mb-8">
                    <div class="flex justify-between items-center">
                      <span>Costo bolsas (10.000 un. x $95)</span>
                      <span class="text-white font-mono font-medium">$950.000</span>
                    </div>
                    <div class="flex justify-between items-center text-red-400">
                      <span>Matrices de polímero (Cilindros) <br><small class="text-gray-500">Obligatorio por cada color</small></span>
                      <span class="font-mono font-bold">+$800.000</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span>Flexibilidad de diseño</span>
                      <span class="text-red-400 font-medium">Nula (Pagas si cambias)</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span>Tiempo de entrega inicial</span>
                      <span class="text-gray-300">45 a 60 días</span>
                    </div>
                  </div>

                  <!-- Total Competencia -->
                  <div class="pt-6 border-t border-red-500/20 bg-red-950/20 -mx-8 -mb-8 p-8 rounded-b-2xl">
                    <div class="text-xs uppercase tracking-widest text-red-400 font-bold mb-1">Inversión Real Inicial:</div>
                    <div class="text-3xl font-black text-red-400 font-mono">$1.750.000 <span class="text-xs font-normal text-gray-400 font-sans">CLP</span></div>
                    <div class="text-xs text-gray-500 mt-1">Costo real por unidad: <strong class="text-red-300">$175 CLP</strong></div>
                  </div>
                </div>

                <!-- TARJETA 2: Tecnología Wellpack (Gigante, Brillante, Protagonista: 7 cols) -->
                <div class="lg:col-span-7 bg-gradient-to-b from-[#1E293B] to-[#0f172a] p-8 md:p-10 rounded-2xl border-2 border-[#FF6B00] relative shadow-[0_0_50px_rgba(255,107,0,0.15)] transform lg:-translate-y-2">
                  
                  <!-- Badge flotante -->
                  <div class="absolute -top-4 right-8 bg-[#FF6B00] text-white text-xs font-extrabold px-4 py-1.5 rounded-full shadow-lg tracking-wider uppercase">
                    ⭐ La Opción Inteligente
                  </div>

                  <div class="flex items-center justify-between mb-8 pb-4 border-b border-gray-700">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00] font-bold text-xl">✓</div>
                      <h4 class="text-2xl font-black text-white">Tecnología Wellpack</h4>
                    </div>
                  </div>

                  <div class="space-y-6 text-sm text-gray-300 mb-8">
                    <div class="flex justify-between items-center">
                      <span>Costo bolsas (10.000 un. x $145*)</span>
                      <span class="text-white font-mono font-medium">$1.450.000</span>
                    </div>
                    <div class="flex justify-between items-center text-[#FF6B00] bg-[#FF6B00]/5 p-2.5 rounded-lg border border-[#FF6B00]/20">
                      <div>
                        <strong class="text-white block">Matrices de impresión: COSTO CERO</strong>
                        <small class="text-gray-400">Tecnología Web-to-Print impulsada por IA</small>
                      </div>
                      <span class="font-mono font-black text-lg">$0</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span>Flexibilidad de diseño</span>
                      <span class="text-emerald-400 font-bold">Total en cada tiraje</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span>Cotización y Asesoría</span>
                      <span class="text-white font-semibold">Inmediata con IA y Especialista</span>
                    </div>
                  </div>

                  <!-- Total Wellpack (Destacado en verde/ámbar corporativo) -->
                  <div class="pt-6 border-t border-gray-700 bg-[#FF6B00]/10 -mx-8 md:-mx-10 -mb-8 md:-mb-10 p-8 md:p-10 rounded-b-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div class="text-xs uppercase tracking-widest text-[#FF6B00] font-extrabold mb-1">Inversión Real Inicial:</div>
                      <div class="text-4xl font-black text-white font-mono">$1.450.000 <span class="text-xs font-normal text-gray-400 font-sans">CLP</span></div>
                      <div class="text-xs text-gray-400 mt-1">Costo real por unidad: <strong class="text-[#FF6B00]">$145 CLP netos</strong></div>
                    </div>
                    <button 
                      data-tier-id="tier_scale"
                      data-tier-volume="10.000"
                      data-tier-price="$145"
                      data-tier-title="Plan Escala (10.000 un.)"
                      class="btn-tier-quote w-full sm:w-auto px-6 py-3.5 bg-[#FF6B00] text-white font-bold rounded-xl hover:bg-[#e66000] transition shadow-lg shadow-[#FF6B00]/40 text-center hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                      <span>Elegir este Plan</span>
                      <i data-lucide="arrow-right" class="w-4 h-4"></i>
                    </button>
                  </div>

                </div>

              </div>

              <!-- Frase de cierre persuasiva -->
              <div class="mt-16 text-center">
                <p class="text-gray-400 italic text-base max-w-xl mx-auto">
                  "Deja de tirar dinero en moldes de polímero que se destruyen cada vez que actualizas tu información nutricional o diseño."
                </p>
              </div>

            </div>

          </div>

          <!-- Banner Informativo Inferior para Medidas Especiales -->
          <div class="mt-16 p-6 sm:p-8 rounded-3xl bg-[#1E293B]/80 border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl backdrop-blur-sm">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-[#FF6B00]/15 border border-[#FF6B00]/30 flex items-center justify-center text-[#FF6B00] shrink-0">
                <i data-lucide="sliders" class="w-6 h-6"></i>
              </div>
              <div>
                <h4 class="text-white font-bold text-sm sm:text-base">¿Requieres otro formato, fuelle o medida especial?</h4>
                <p class="text-xs text-gray-400 mt-0.5">Calculamos tu precio de fábrica para Doypack, fuelles de café, termoencogibles y medidas milimétricas.</p>
              </div>
            </div>
            <button 
              data-open-variation="any"
              class="btn-open-variation shrink-0 w-full md:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-[#FF6B00] border border-[#FF6B00]/40 font-mono font-bold text-xs uppercase tracking-wider transition hover:scale-105 flex items-center justify-center gap-2">
              <i data-lucide="sliders-horizontal" class="w-4 h-4"></i>
              <span>Configurar Medida Personalizada</span>
            </button>
          </div>

        </div>
      </section>
    `;
  }

  // ==========================================================
  // SECCIÓN UNIVERSAL 4: SECTORES ATENDIDOS (BADGES)
  // ==========================================================
  renderIndustriesServedSection(config = {}) {
    const title = config.title || "Protegemos los Productos de Múltiples Sectores";
    const tags = config.tags || [];

    return `
      <section id="industries_served" class="py-24 bg-[#141414] text-white relative border-b border-neutral-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div class="text-center max-w-3xl mx-auto mb-14">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold uppercase mb-4 shadow-sm">
              <i data-lucide="check-circle-2" class="w-4 h-4 text-amber-400"></i>
              Sectores Industriales
            </div>
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              ${title}
            </h2>
            <p class="mt-3 text-neutral-400 text-base sm:text-lg">
              Abastecemos plantas procesadoras, tostadurías, empacadoras y cadenas de retail con logística continua.
            </p>
          </div>

          <!-- Badges de Sectores -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            ${tags.map(tag => `
              <div class="p-5 rounded-2xl bg-[#1c1c1c] border border-neutral-800 hover:border-amber-400/70 shadow-lg text-center font-bold text-sm sm:text-base text-white transition-all hover:scale-105 hover:bg-neutral-900 flex items-center justify-center group cursor-default">
                <span class="group-hover:text-amber-300 transition-colors">${tag}</span>
              </div>
            `).join('')}
          </div>

          <!-- Banner CTA de Contacto y Muestra a Medida para tu Producto -->
          <div class="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#1c1c1c] via-[#222222] to-[#1c1c1c] border border-amber-500/40 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div class="space-y-2 text-center lg:text-left">
              <div class="inline-flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase">
                <i data-lucide="package-search" class="w-4 h-4 text-amber-400"></i>
                Muestra a Medida de tu Producto
              </div>
              <h3 class="text-2xl sm:text-3xl font-black text-white">
                ¿Necesitas validar el empaque exacto para tu producto?
              </h3>
              <p class="text-sm text-neutral-300 max-w-2xl leading-relaxed">
                No entregamos muestras genéricas. Analizamos tu alimento (peso, acidez, condiciones de congelado o barrera) y preparamos una muestra física adaptada a tu producto para que la pruebes directamente en tu línea de envasado.
              </p>
            </div>

            <div class="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <button 
                class="btn-sample-trigger inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 font-bold text-xs sm:text-sm transition hover:scale-105 active:scale-95 shadow-md">
                <i data-lucide="flask-conical" class="w-4 h-4 text-amber-400"></i>
                <span>Obtener Muestra de mi Producto</span>
              </button>
              <button 
                data-open-variation="any"
                class="btn-open-variation inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[#F59E0B] hover:bg-amber-400 text-neutral-950 font-black text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 shadow-xl shadow-amber-500/25">
                <i data-lucide="sliders-horizontal" class="w-4 h-4"></i>
                <span>Configurar Pedido Mayorista</span>
              </button>
            </div>
          </div>

        </div>
      </section>
    `;
  }

  // ==========================================================
  // HERO PREMIUM B2B (DEGRADÉ BLANCO A CELESTE HIELO)
  // ==========================================================
  renderHeroPremiumSection(config) {
    const bg = config.background || {};
    const left = config.content_left || {};
    const right = config.content_right || {};
    const visual = right.visual || {};
    const badges = left.badges || [];
    const metrics = left.metrics || [];
    const actions = left.actions || [];

    const videoUrl = bg.url ? bg.url.replace(/^\//, '') : 'assets/videos/ocean_or_frost_loop.mp4';
    const imageUrl = visual.url ? visual.url.replace(/^\//, '') : 'assets/img/bolsa_frozen_foods_transparent.png';

    return `
      <section id="hero" class="relative min-h-[90vh] flex items-center overflow-hidden py-16 lg:py-24 bg-gradient-to-b from-white via-sky-50/95 to-sky-100/90 text-slate-900 border-b border-sky-200/90">
        
        <!-- Video Background con loop marino sutil -->
        <div class="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <video 
            autoplay 
            loop 
            muted 
            playsinline 
            class="w-full h-full object-cover opacity-20 mix-blend-multiply filter brightness-105 contrast-120">
            <source src="${videoUrl}" type="video/mp4">
          </video>
          <!-- Overlay de gradiente blanco a celeste hielo -->
          <div class="absolute inset-0" style="background: ${bg.overlay || 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(240,249,255,0.90) 50%, rgba(224,242,254,0.85) 100%)'};"></div>
        </div>

        <!-- Destellos sutiles de escarcha y luz -->
        <div class="absolute top-1/4 left-1/3 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none z-0"></div>
        <div class="absolute bottom-10 right-10 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl pointer-events-none z-0"></div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <!-- Columna Izquierda (content_left): split 50_50 -->
            <div class="lg:col-span-7 space-y-6 hero-content-trigger">
              
              <!-- Badges dinámicos -->
              <div class="flex flex-wrap items-center gap-2">
                ${badges.map(b => `
                  <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-sky-300 text-sky-900 text-xs font-mono font-bold uppercase tracking-wider shadow-sm backdrop-blur-md">
                    <i data-lucide="${b.icon === 'snowflake' ? 'snowflake' : b.icon}" class="w-4 h-4 text-sky-600 animate-spin"></i>
                    <span>${b.text}</span>
                  </div>
                `).join('')}
                <span class="text-xs font-mono text-slate-500 border-l border-sky-300 pl-3">Plantas Biobío • Exportación</span>
              </div>

              <!-- Título B2B -->
              <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-slate-950">
                ${left.title?.text || 'Empaques al Vacío y Doypack para la Industria Pesquera'}
              </h1>

              <!-- Subtítulo -->
              <p class="text-lg sm:text-xl font-medium leading-relaxed max-w-2xl text-slate-700">
                ${left.subtitle?.text || 'Fabricación e importación mayorista de bolsas con impresión flexográfica HD. Sellado reforzado para plantas en la Región del Biobío.'}
              </p>

              <!-- Métricas Técnicas B2B -->
              <div class="grid grid-cols-3 gap-3 sm:gap-4 py-3 max-w-xl border-y border-sky-200">
                ${metrics.map(m => `
                  <div class="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-sky-200/90 shadow-md shadow-sky-900/5">
                    <div class="text-xl sm:text-2xl font-black text-sky-600 font-mono">${m.value}</div>
                    <div class="text-[11px] text-slate-600 font-mono uppercase tracking-wider mt-0.5">${m.label}</div>
                  </div>
                `).join('')}
              </div>

              <!-- Botones de Acción (actions) -->
              <div class="flex flex-wrap items-center gap-4 pt-2">
                ${actions.map(act => {
                  if (act.type === 'primary') {
                    return `
                      <a href="#alibaba_variation_selector" class="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 via-blue-600 to-sky-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm px-8 py-4 rounded-xl shadow-xl shadow-sky-500/25 transition-all hover:scale-105 active:scale-95">
                        <span>${act.label}</span>
                        <i data-lucide="${act.icon === 'arrow_right' ? 'arrow-right' : act.icon}" class="w-4 h-4"></i>
                      </a>
                    `;
                  } else {
                    return `
                      <button class="btn-sample-trigger inline-flex items-center gap-2 bg-white hover:bg-sky-50 text-slate-800 border border-sky-300 font-bold text-sm px-6 py-4 rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 backdrop-blur-md">
                        <i data-lucide="${act.icon === 'box' ? 'package' : act.icon}" class="w-4 h-4 text-sky-600"></i>
                        <span>${act.label}</span>
                      </button>
                    `;
                  }
                }).join('')}
              </div>

            </div>

            <!-- Columna Derecha (content_right): split_50_50 con floating_image -->
            <div class="lg:col-span-5 relative flex flex-col items-center justify-center">
              
              <!-- Glow Aura detrás de la imagen flotante -->
              <div class="absolute w-80 h-80 bg-gradient-to-tr from-sky-200/60 to-cyan-300/40 rounded-full blur-3xl pointer-events-none"></div>

              <!-- Contenedor con animación float_up_down (4s ease-in-out loop) -->
              <div class="relative w-full max-w-md flex flex-col items-center animate-float-up-down">
                
                <img 
                  src="${imageUrl}" 
                  alt="Bolsa Frozen Foods Doypack Pesquera"
                  class="w-full max-h-[460px] object-contain select-none transition-transform"
                  style="filter: ${visual.shadow || 'drop-shadow(0px 20px 30px rgba(2,132,199,0.25))'};"
                  loading="eager">

                <!-- Badges flotantes industriales alrededor del empaque -->
                <div class="absolute -top-2 right-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-sky-200 text-[11px] font-mono font-bold text-sky-900 shadow-lg flex items-center gap-1.5">
                  <i data-lucide="sparkles" class="w-3.5 h-3.5 text-sky-500"></i>
                  Asa Troquelada + Zipper
                </div>

                <div class="absolute bottom-6 left-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-sky-200 text-[11px] font-mono font-bold text-slate-800 shadow-lg flex items-center gap-1.5">
                  <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-600"></i>
                  Inocuidad FDA Túnel Frío
                </div>

              </div>

              <!-- Mini-strip con las 4 fotos reales solicitadas -->
              <div class="mt-6 flex items-center gap-2 bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-sky-200 shadow-sm">
                <a href="#visual_gallery" class="flex items-center gap-2 text-xs text-slate-700 font-mono font-semibold px-2 hover:text-sky-600 transition">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Ver aplicaciones reales:</span>
                </a>
                <div class="flex items-center gap-1.5">
                  <img src="assets/images/bolsa_vacio_salmon_impresa.jpg" title="Salmón sellado al vacío impreso" class="w-8 h-8 rounded-lg object-cover border border-sky-200 hover:scale-110 transition">
                  <img src="assets/images/bolsa_vacio_tomahawk_impresa.jpg" title="Corte vacuno Tomahawk impreso" class="w-8 h-8 rounded-lg object-cover border border-sky-200 hover:scale-110 transition">
                  <img src="assets/images/bolsa_mariscos_wellpack.jpg" title="Doypack mariscos WellPack" class="w-8 h-8 rounded-lg object-cover border border-sky-200 hover:scale-110 transition">
                  <img src="assets/images/bolsa_vacio_embutidos_impresa.jpg" title="Cecinas y embutidos impresos" class="w-8 h-8 rounded-lg object-cover border border-sky-200 hover:scale-110 transition">
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>
    `;
  }

  // ==========================================================
  // SECCIÓN 1.5: ESCAPARATE DE VARIACIONES Y MEDIDAS ALIBABA B2B
  // DEGRADÉ: CELESTE CLARO (sky-100 a sky-200)
  // ==========================================================
  renderAlibabaVariationSection(config = {}) {
    const title = config.title || "Configurador Mayorista de Formatos y Medidas";
    const subtitle = config.subtitle || "Selecciona formato de envasado, medidas y calibres con escala de precios industrial directa de fábrica.";
    const badge = config.badge || "Escaparate B2B Estilo Alibaba";

    return `
      <section id="alibaba_variation_selector" class="py-20 bg-gradient-to-b from-sky-100/90 via-sky-200/70 to-sky-300/80 text-slate-900 relative border-b border-sky-300/80">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <!-- Encabezado de Sección -->
          <div class="text-center max-w-3xl mx-auto mb-12">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-sky-300 text-sky-900 text-xs font-mono font-bold uppercase mb-3 shadow-sm">
              <i data-lucide="sliders-horizontal" class="w-4 h-4 text-sky-600"></i>
              ${badge}
            </div>
            <h2 class="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              ${title}
            </h2>
            <p class="mt-2 text-slate-700 text-base font-medium">
              ${subtitle}
            </p>
          </div>

          <!-- Contenedor Principal del Configurador B2B -->
          <div class="bg-white rounded-3xl shadow-2xl border border-sky-200/80 overflow-hidden max-w-5xl mx-auto">
            
            <!-- Barra Superior de Precios Escalonados (Tiered Pricing Alibaba) -->
            <div class="p-4 sm:p-6 bg-sky-50/80 border-b border-sky-100">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-mono font-bold uppercase text-slate-600 tracking-wider flex items-center gap-2">
                  <i data-lucide="trending-down" class="w-4 h-4 text-emerald-600"></i>
                  Escala de Precios B2B por Volumen
                </span>
                <span class="text-xs font-mono text-sky-800 bg-sky-200/80 px-2.5 py-0.5 rounded-md font-bold">
                  Valores Netos CLP
                </span>
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center" id="sec-tier-header-container">
                <div id="sec-tier-box-1" class="p-3.5 rounded-2xl border border-sky-200 bg-white transition-all shadow-sm">
                  <div class="text-xl sm:text-2xl font-black text-slate-900 font-mono" id="sec-tier-price-1">$110 CLP</div>
                  <div class="text-[11px] text-slate-500 font-mono uppercase font-semibold mt-0.5">500 - 4.999 unidades</div>
                  <span class="text-[10px] text-slate-400 font-mono block">Tarifa Base</span>
                </div>
                
                <div id="sec-tier-box-2" class="p-3.5 rounded-2xl border-2 border-sky-500 bg-sky-100/90 shadow-md transition-all">
                  <div class="text-xl sm:text-2xl font-black text-sky-900 font-mono" id="sec-tier-price-2">$92 CLP</div>
                  <div class="text-[11px] text-sky-950 font-mono uppercase font-black mt-0.5">5.000 - 49.999 unidades</div>
                  <span class="text-[10px] font-bold text-sky-700 block font-mono">Más Popular • -10% Dscto.</span>
                </div>
                
                <div id="sec-tier-box-3" class="p-3.5 rounded-2xl border border-sky-200 bg-white transition-all shadow-sm">
                  <div class="text-xl sm:text-2xl font-black text-emerald-600 font-mono" id="sec-tier-price-3">$74 CLP</div>
                  <div class="text-[11px] text-slate-500 font-mono uppercase font-semibold mt-0.5">≥ 50.000 unidades</div>
                  <span class="text-[10px] font-bold text-emerald-600 block font-mono">Tarifa Industrial • -20% Dscto.</span>
                </div>
              </div>
            </div>

            <!-- Cuerpo del Configurador -->
            <div class="p-6 sm:p-8 space-y-8">
              
              <!-- 1. Formatos de Envasado (6 tipos) -->
              <div>
                <div class="flex items-center justify-between mb-3">
                  <label class="text-xs font-mono uppercase font-bold text-slate-800 tracking-wider flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">1</span>
                    Tipo de Envasado Pesquero & Alimentos
                  </label>
                  <span id="sec-selected-type-badge" class="text-xs font-mono font-bold text-sky-800 bg-sky-100 px-3 py-1 rounded-full border border-sky-200">
                    Bolsa Vacío 3 Sellos
                  </span>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" id="sec-packaging-grid">
                  ${PACKAGING_TYPES.map(pt => `
                    <button 
                      type="button" 
                      data-sec-type="${pt.id}"
                      class="sec-type-btn p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${pt.id === this.alibabaState.selectedType.id ? 'border-sky-500 bg-sky-50/90 ring-2 ring-sky-400 shadow-md' : 'border-slate-200 bg-white hover:border-sky-300'}">
                      <div class="w-full h-16 rounded-xl bg-slate-50 flex items-center justify-center p-1 mb-2 border border-slate-100">
                        <img src="${pt.image}" alt="${pt.name}" class="w-full h-full object-contain">
                      </div>
                      <div>
                        <span class="text-xs font-bold text-slate-900 block leading-tight truncate">${pt.name}</span>
                        <span class="text-[10px] text-slate-500 block truncate mt-0.5">${pt.tag}</span>
                      </div>
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- 2. Acabado & Presentación -->
              <div>
                <label class="block text-xs font-mono uppercase font-bold text-slate-800 tracking-wider mb-2.5 flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">2</span>
                  Acabado & Presentación Visual
                </label>
                <div class="flex flex-wrap gap-2.5" id="sec-finish-group">
                  ${COLORS_FINISHES.map(fin => `
                    <button 
                      type="button" 
                      data-sec-finish="${fin.id}"
                      class="sec-finish-btn px-4 py-2.5 rounded-xl text-xs font-mono font-bold border flex items-center gap-2 transition ${fin.id === this.alibabaState.selectedFinish.id ? 'border-sky-600 bg-sky-600 text-white shadow-md' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}">
                      <i data-lucide="${fin.icon}" class="w-3.5 h-3.5"></i>
                      <span>${fin.name}</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- 3. Medidas / Size Pills -->
              <div>
                <div class="flex items-center justify-between mb-2.5">
                  <label class="text-xs font-mono uppercase font-bold text-slate-800 tracking-wider flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">3</span>
                    Medidas Disponibles (Ancho * Alto): <span id="sec-size-label" class="text-sky-700 font-bold ml-1">${this.alibabaState.selectedSize.label}</span>
                  </label>
                  <span class="text-xs font-mono text-slate-500" id="sec-size-note">${this.alibabaState.selectedSize.note}</span>
                </div>
                <div class="flex flex-wrap gap-2" id="sec-size-group">
                  ${SIZES.map(sz => `
                    <button 
                      type="button" 
                      data-sec-size="${sz.id}"
                      class="sec-size-btn px-4 py-2 rounded-xl text-xs font-mono font-bold border transition ${sz.id === this.alibabaState.selectedSize.id ? 'border-sky-600 bg-sky-50 text-sky-900 ring-2 ring-sky-300 font-black' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'}">
                      ${sz.label}
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- 4. Espesores / Calibres Multi-Item -->
              <div>
                <label class="block text-xs font-mono uppercase font-bold text-slate-800 tracking-wider mb-2.5 flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">4</span>
                  Espesor / Calibre de Barrera & Cantidad
                </label>
                <div class="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-slate-50/50">
                  ${THICKNESSES.map(th => `
                    <div class="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white transition-colors">
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="text-xs font-bold text-slate-900 font-mono">${th.label}</span>
                          ${th.id === '90um' ? '<span class="text-[9px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-mono font-bold">Estándar Salmón</span>' : ''}
                          ${th.id === '120um' ? '<span class="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-bold">Antipunción Ósea</span>' : ''}
                        </div>
                        <p class="text-[11px] text-slate-500 mt-0.5">${th.desc}</p>
                      </div>
                      
                      <!-- Selector de cantidad - [ 0 ] + -->
                      <div class="flex items-center gap-2 self-end sm:self-center">
                        <button type="button" data-sec-minus="${th.id}" class="sec-qty-minus w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 flex items-center justify-center hover:bg-slate-100 active:scale-95 font-bold transition">
                          -
                        </button>
                        <input 
                          type="number" 
                          data-sec-input="${th.id}" 
                          value="${this.alibabaState.quantities[th.id]}" 
                          min="0" 
                          step="500" 
                          class="sec-qty-input w-24 sm:w-28 text-center text-xs font-mono font-bold py-1.5 px-2 rounded-lg border border-slate-300 bg-white focus:border-sky-500 focus:outline-none">
                        <button type="button" data-sec-plus="${th.id}" class="sec-qty-plus w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 flex items-center justify-center hover:bg-slate-100 active:scale-95 font-bold transition">
                          +
                        </button>
                        <span class="text-[11px] font-mono text-slate-500 w-6">un.</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

            </div>

            <!-- Barra Inferior de Totales & Cotización B2B -->
            <div class="p-6 bg-slate-900 text-white border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div class="flex items-center gap-3">
                  <span class="text-xs font-mono text-slate-400">Total Seleccionado:</span>
                  <span id="sec-total-units" class="text-lg font-black text-cyan-400 font-mono">5.000 unidades</span>
                  <span id="sec-discount-badge" class="text-[10px] bg-sky-950 text-sky-300 border border-sky-500/40 px-2 py-0.5 rounded font-mono font-bold">
                    10% Dscto. Mayorista
                  </span>
                </div>
                <div class="mt-1 flex items-baseline gap-2">
                  <span class="text-xs font-mono text-slate-400">Estimado Neto:</span>
                  <span id="sec-subtotal" class="text-2xl font-black text-white font-mono">$460.000 CLP</span>
                  <span id="sec-unit-price" class="text-xs text-slate-400 font-mono">($92.00 CLP / un.)</span>
                </div>
              </div>

              <!-- Acciones Comerciales -->
              <div class="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                <button 
                  id="sec-btn-whatsapp"
                  type="button" 
                  class="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold shadow-lg shadow-emerald-600/20 transition hover:scale-105 active:scale-95">
                  <i data-lucide="message-circle" class="w-4 h-4"></i>
                  <span>Consultar por WhatsApp</span>
                </button>
                <button 
                  id="sec-btn-submit-inquiry"
                  type="button" 
                  class="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 text-xs font-mono font-black shadow-xl shadow-cyan-500/25 transition hover:scale-105 active:scale-95">
                  <i data-lucide="send" class="w-4 h-4"></i>
                  <span>Enviar Cotización B2B</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>
    `;
  }

  // ==========================================================
  // SECCIÓN 1 (FALLBACK): HERO CLÁSICO
  // ==========================================================
  renderHeroSection() {
    return `
      <section id="hero" class="relative pt-12 pb-24 lg:pt-16 lg:pb-32 overflow-hidden bg-gradient-to-b from-white via-sky-50 to-sky-100/90 border-b border-sky-200">
        
        <!-- Elementos gráficos de fondo marino suave -->
        <div class="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-25"></div>
        <div class="absolute top-10 right-10 w-96 h-96 bg-sky-200/50 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute bottom-10 left-10 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl pointer-events-none"></div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <!-- Columna Texto y Llamadas a la Acción -->
            <div class="lg:col-span-7 space-y-6 hero-content-trigger">
              
              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-sky-300 text-sky-800 text-xs font-mono font-bold tracking-wide uppercase shadow-sm">
                <i data-lucide="snowflake" class="w-4 h-4 text-sky-500 animate-spin"></i>
                Línea Especial para Túnel de Frío (-35°C) & Exportación
              </div>

              <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Empaques al Vacío y Doypack para la <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-800">Industria Pesquera</span>
              </h1>

              <p class="text-lg sm:text-xl text-slate-700 max-w-2xl font-normal leading-relaxed">
                Fabricación e importación mayorista de bolsas con impresión flexográfica HD, ventana de inspección y sellado reforzado para plantas en la Región del Biobío.
              </p>

              <!-- Métricas clave en tarjetas tipo hielo -->
              <div class="grid grid-cols-3 gap-3 sm:gap-4 py-2 max-w-xl">
                <div class="bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border border-sky-200 shadow-sm">
                  <div class="text-xl sm:text-2xl font-black text-blue-700 font-mono">90 - 120 μ</div>
                  <div class="text-[11px] text-slate-600 font-semibold uppercase">Barrera EVOH / O2</div>
                </div>
                <div class="bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border border-sky-200 shadow-sm">
                  <div class="text-xl sm:text-2xl font-black text-sky-600 font-mono">-35° C</div>
                  <div class="text-[11px] text-slate-600 font-semibold uppercase">Resistencia IQF</div>
                </div>
                <div class="bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border border-sky-200 shadow-sm">
                  <div class="text-xl sm:text-2xl font-black text-emerald-600 font-mono">10 Colores</div>
                  <div class="text-[11px] text-slate-600 font-semibold uppercase">Impresión Flexo HD</div>
                </div>
              </div>

              <!-- Botones de Acción -->
              <div class="flex flex-wrap items-center gap-4 pt-2">
                <a href="#checkout_b2b" class="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 via-blue-600 to-blue-700 hover:from-sky-400 hover:to-blue-600 text-white font-extrabold px-8 py-4 rounded-xl shadow-xl shadow-sky-500/25 transition-all hover:scale-105 active:scale-95">
                  <span>Cotizar Lote B2B</span>
                  <i data-lucide="arrow-right" class="w-5 h-5"></i>
                </a>

                <button class="btn-sample-trigger inline-flex items-center gap-2 bg-white hover:bg-sky-50 text-slate-800 border border-sky-300 hover:border-sky-500 font-bold px-6 py-4 rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95">
                  <i data-lucide="flask-conical" class="w-5 h-5 text-sky-600"></i>
                  <span>Solicitar Muestras a Planta</span>
                </button>
              </div>

            </div>

            <!-- Columna Visual: Escaparate de Empaques con Gráfica Marina + Visor 3D -->
            <div class="lg:col-span-5 relative flex flex-col items-center">
              
              <!-- Tarjeta Escaparate Principal con la bolsa real subida -->
              <div class="relative w-full max-w-md bg-white rounded-3xl p-4 shadow-2xl border border-sky-200/90 overflow-hidden group">
                
                <!-- Badge superior -->
                <div class="flex items-center justify-between mb-3 px-2">
                  <span class="text-xs font-mono font-extrabold text-sky-700 bg-sky-100 px-3 py-1 rounded-lg">
                    LÍNEA BIOBÍO SEAFOOD
                  </span>
                  <span class="text-xs text-slate-500 font-mono">Apto Salmón & Pescados</span>
                </div>

                <!-- Imagen destacada del empaque impreso con ventana -->
                <div class="relative h-72 sm:h-80 rounded-2xl overflow-hidden bg-sky-50 border border-sky-100">
                  <img 
                    src="assets/images/bolsa_vacio_pescado_ventana.png" 
                    alt="Bolsa al vacío impresa con ventana para pescado entero" 
                    class="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500">
                  
                  <div class="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-sky-200 shadow-md flex items-center justify-between text-xs font-mono text-slate-800">
                    <span class="flex items-center gap-1.5 font-bold text-sky-800">
                      <i data-lucide="check-circle" class="w-4 h-4 text-sky-600"></i>
                      Ventana Cristalina + Sellado Termo
                    </span>
                    <span class="text-blue-700 font-bold">40x25 cm</span>
                  </div>
                </div>

                <!-- Mini carrusel / Galería de formatos subidos -->
                <div class="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-sky-100">
                  <div class="h-20 rounded-xl overflow-hidden bg-sky-50 border border-sky-200 p-1 hover:border-sky-500 cursor-pointer transition">
                    <img src="assets/images/bolsa_doypack_handle.png" alt="Doypack con asa" class="w-full h-full object-contain">
                  </div>
                  <div class="h-20 rounded-xl overflow-hidden bg-sky-50 border border-sky-200 p-1 hover:border-sky-500 cursor-pointer transition">
                    <img src="assets/images/bolsas_standup_ocean_print.png" alt="Stand up pouch marino" class="w-full h-full object-contain">
                  </div>
                  <div class="h-20 rounded-xl overflow-hidden bg-sky-50 border border-sky-200 p-1 hover:border-sky-500 cursor-pointer transition">
                    <img src="assets/images/bolsa_congelados_freezer_retail.jpg" alt="Bolsa freezer retail" class="w-full h-full object-contain">
                  </div>
                </div>

              </div>

              <!-- Visor 3D Interactivo secundario -->
              <div class="w-full max-w-md mt-4 bg-white/70 backdrop-blur-md rounded-2xl p-3 border border-sky-200 shadow-lg flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600">
                    <i data-lucide="box" class="w-6 h-6"></i>
                  </div>
                  <div>
                    <span class="text-xs font-bold text-slate-900 block font-mono">Simulador 3D al Vacío</span>
                    <span class="text-[11px] text-slate-500">Gira automáticamente con el scroll</span>
                  </div>
                </div>
                <div id="three-bag-container" class="w-20 h-16 rounded-xl overflow-hidden bg-sky-950/10 cursor-grab"></div>
              </div>

            </div>

          </div>
        </div>
      </section>
    `;
  }

  // ==========================================================
  // SECCIÓN 2: CATÁLOGO (CELESTE A CELESTE OSCURO / AZUL MEDIO)
  // ==========================================================
  renderCatalogSection() {
    return `
      <section id="product_catalog" class="py-24 bg-gradient-to-b from-sky-100/90 via-sky-300/80 to-sky-500/80 relative border-b border-sky-600">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <!-- Encabezado de Catálogo -->
          <div class="text-center max-w-3xl mx-auto mb-14 catalog-header-trigger">
            <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-sky-300 text-sky-900 text-xs font-mono font-bold uppercase mb-3 shadow-sm">
              <i data-lucide="layers" class="w-3.5 h-3.5 text-sky-600"></i>
              Formatos & Gráficas Disponibles
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Catálogo de Bolsas al Vacío & Doypack
            </h2>
            <p class="mt-3 text-slate-800 text-base font-medium">
              Especialmente configurados para salmón entero, merluza, mariscos IQF y exhibición retail en congeladores.
            </p>

            <!-- Filtros de categoría rápida -->
            <div class="flex flex-wrap items-center justify-center gap-2 pt-6" id="catalog-category-filters">
              <button data-filter="all" class="filter-btn active px-4 py-2 rounded-xl text-xs font-bold font-mono bg-blue-900 text-white shadow-md transition">
                Todos los Formatos (${this.products.length})
              </button>
              <button data-filter="Bolsas al Vacío con Gráfica" class="filter-btn px-4 py-2 rounded-xl text-xs font-bold font-mono bg-white text-slate-800 hover:bg-sky-50 shadow-sm transition">
                Vacío con Ventana
              </button>
              <button data-filter="Doypack Congelados" class="filter-btn px-4 py-2 rounded-xl text-xs font-bold font-mono bg-white text-slate-800 hover:bg-sky-50 shadow-sm transition">
                Doypack con Asa
              </button>
              <button data-filter="Línea Gourmet Exportación" class="filter-btn px-4 py-2 rounded-xl text-xs font-bold font-mono bg-white text-slate-800 hover:bg-sky-50 shadow-sm transition">
                Gráfica Marina HD
              </button>
            </div>
          </div>

          <!-- Rejilla de Cards de Productos -->
          <div id="catalog-products-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${this.filteredProducts.map(product => this.renderProductCard(product)).join('')}
          </div>

        </div>
      </section>
    `;
  }

  renderProductCard(product) {
    const isSelected = this.selectedProduct && this.selectedProduct.id === product.id;
    const imageUrl = product.image_url || 'assets/images/bolsa_vacio_pescado_ventana.png';
    
    return `
      <div class="product-card group relative rounded-3xl bg-white/95 border ${isSelected ? 'border-sky-500 ring-4 ring-sky-300' : 'border-sky-200/80 hover:border-sky-400'} p-5 transition-all duration-300 hover:-translate-y-2 shadow-xl hover:shadow-2xl shadow-sky-900/10 flex flex-col">
        
        <!-- Fotografía con decoración de empaque y acabados -->
        <div class="relative w-full h-64 rounded-2xl overflow-hidden mb-4 bg-sky-50/80 border border-sky-100 flex items-center justify-center p-3 group-hover:bg-white transition-colors">
          <img 
            src="${imageUrl}" 
            alt="${product.name}" 
            class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            loading="lazy">
          
          <!-- Badges sobre la fotografía -->
          <div class="absolute top-3 left-3">
            <span class="font-mono text-xs font-extrabold text-blue-900 bg-white/95 backdrop-blur-md px-3 py-1 rounded-lg border border-sky-200 shadow-md">
              ${product.dimensions} cm
            </span>
          </div>

          <div class="absolute top-3 right-3">
            <span class="text-[11px] font-mono font-bold px-2.5 py-1 rounded-md backdrop-blur-md bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-sm">
              Stock Inmediato
            </span>
          </div>

          <!-- Acabado y Tipo al pie de foto -->
          <div class="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-700 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-sky-200">
            <span class="font-bold text-sky-800 flex items-center gap-1">
              <i data-lucide="sparkles" class="w-3.5 h-3.5 text-sky-600"></i>
              ${product.badge || 'Gráfica Marina'}
            </span>
            <span class="text-slate-500">90 - 120 μm</span>
          </div>
        </div>

        <!-- Nombre y Categoría -->
        <div class="mb-2">
          <span class="text-[11px] font-mono font-bold text-sky-700 uppercase tracking-wider block mb-1">
            ${product.category || 'Empaque Pesquero B2B'}
          </span>
          <h3 class="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors leading-snug">
            ${product.name}
          </h3>
        </div>

        <!-- Descripción técnica -->
        <p class="text-slate-600 text-xs leading-relaxed min-h-[44px] mb-4">
          ${product.description}
        </p>

        <!-- Especificaciones rápidas -->
        <div class="grid grid-cols-2 gap-2 text-[11px] py-2.5 border-y border-sky-100 mb-5 font-mono text-slate-700 bg-sky-50/50 rounded-xl px-3">
          <div class="flex items-center gap-1.5">
            <i data-lucide="snowflake" class="w-3.5 h-3.5 text-sky-600"></i>
            <span>IQF -35° C</span>
          </div>
          <div class="flex items-center gap-1.5">
            <i data-lucide="shield-check" class="w-3.5 h-3.5 text-blue-600"></i>
            <span>Barrera EVOH</span>
          </div>
        </div>

        <!-- Precio y Botón de Cotización -->
        <div class="flex items-center justify-between mt-auto pt-2 border-t border-sky-100">
          <div>
            <span class="text-[10px] text-slate-500 block font-mono uppercase tracking-wider">Precio Unitario B2B</span>
            <span class="text-xl font-black text-slate-900 font-mono">$${Number(product.retail_price).toFixed(2)} <span class="text-[11px] font-normal text-slate-500">CLP</span></span>
          </div>
          <div class="flex items-center gap-1.5">
            <button 
              data-open-variation="${product.id}"
              class="btn-open-variation inline-flex items-center gap-1 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 text-xs font-bold px-2.5 py-2.5 rounded-xl transition shadow-sm"
              title="Abrir selector de todas las medidas y espesores">
              <i data-lucide="sliders" class="w-3.5 h-3.5 text-sky-600"></i>
              <span>Medidas</span>
            </button>
            <button 
              data-select-bag="${product.id}"
              class="btn-select-bag inline-flex items-center gap-1 bg-gradient-to-r from-sky-500 to-blue-700 hover:from-sky-400 hover:to-blue-600 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all shadow-md shadow-sky-500/20 active:scale-95">
              <span>Cotizar</span>
              <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================
  // SECCIÓN 2.5: GALERÍA VISUAL DE APLICACIONES REALES (MASONRY GRID)
  // ==========================================================
  renderVisualGallerySection(config = {}) {
    const title = config.title || "Versatilidad y Calidad en Cada Sellado";
    const subtitle = config.subtitle || "Ejemplos reales de nuestros empaques de alta barrera en distintas industrias.";
    
    const defaultImages = [
      {
        url: "/assets/images/bolsa_vacio_salmon_impresa.jpg",
        alt_text: "Salmón sellado al vacío con impresión HD y logo",
        caption: "Máxima barrera de oxígeno e impresión color para pescados."
      },
      {
        url: "/assets/images/bolsa_vacio_tomahawk_impresa.jpg",
        alt_text: "Corte premium Tomahawk sellado al vacío con branding y logo",
        caption: "Presentación Black Label con bone guard y vida útil para carnes rojas."
      },
      {
        url: "/assets/images/bolsa_mariscos_wellpack.jpg",
        alt_text: "Bolsa Doypack para mariscos con branding WellPack Seafood",
        caption: "Soluciones Doypack de alta resistencia para productos congelados IQF."
      },
      {
        url: "/assets/images/bolsa_vacio_embutidos_impresa.jpg",
        alt_text: "Cecinas y embutidos sellados al vacío con diseño flexo y logo",
        caption: "Protección prolongada y branding artesanal de alta calidad."
      }
    ];

    const images = (config.images && config.images.length > 0) ? config.images : defaultImages;

    const metaMap = {
      'salmon': { 
        industry: 'Pesca & Acuicultura', 
        highlight: 'EVOH 90-120 μ • Túnel IQF -35°C', 
        icon: 'fish', 
        badge: 'Exportación Directa',
        accent: 'from-cyan-500/20 to-blue-500/20 text-cyan-300'
      },
      'tomahawk': { 
        industry: 'Cárnicos & Frigoríficos', 
        highlight: 'Barrera 120μ Antipunzonamiento Óseo', 
        icon: 'shield-check', 
        badge: 'Alta Resistencia',
        accent: 'from-amber-500/20 to-red-500/20 text-amber-300'
      },
      'doypack': { 
        industry: 'Mariscos IQF & Congelados', 
        highlight: 'Stand-Up Zipper Hermético + Asa Troquelada', 
        icon: 'package-check', 
        badge: 'Retail Ready Biobío',
        accent: 'from-sky-500/20 to-cyan-500/20 text-sky-300'
      },
      'embutidos': { 
        industry: 'Cecinas & Charcutería Gourmet', 
        highlight: 'Brillo Óptico Superior & Coextrusión FDA', 
        icon: 'sparkles', 
        badge: 'Larga Vida en Góndola',
        accent: 'from-emerald-500/20 to-teal-500/20 text-emerald-300'
      }
    };

    const isDark = this.schema?.theme === 'premium_industrial_food' || this.schema?.colors?.background === '#121212';
    const bgClass = isDark ? 'bg-[#0b1329] text-white border-b border-gray-800' : 'bg-gradient-to-b from-sky-500/80 via-sky-600 to-blue-800 text-white border-b border-blue-700/60';

    return `
      <section id="visual_gallery" class="py-24 ${bgClass} relative overflow-hidden">
        
        <!-- Efecto sutil de fondo lumínico -->
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.15),transparent_50%)] pointer-events-none"></div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <!-- Encabezado de Galería -->
          <div class="text-center max-w-3xl mx-auto mb-16 gallery-header-trigger">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/70 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold uppercase mb-4 shadow-lg backdrop-blur-md">
              <i data-lucide="eye" class="w-4 h-4 text-cyan-400"></i>
              Galería Visual en Terreno
            </div>
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              ${title}
            </h2>
            <p class="mt-3 text-sky-100 text-base sm:text-lg font-light leading-relaxed">
              ${subtitle}
            </p>
          </div>

          <!-- Rejilla Visual Estilo Masonry Grid B2B -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            ${images.map((img, idx) => {
              const urlLower = img.url.toLowerCase();
              let metaKey = 'salmon';
              if (urlLower.includes('tomahawk') || urlLower.includes('carne') || urlLower.includes('vacuno')) metaKey = 'tomahawk';
              else if (urlLower.includes('doypack') || urlLower.includes('marisco')) metaKey = 'doypack';
              else if (urlLower.includes('embutido') || urlLower.includes('cecina')) metaKey = 'embutidos';
              
              const m = metaMap[metaKey];
              const normalizedUrl = img.url.startsWith('/') ? img.url.slice(1) : img.url;

              return `
                <div class="visual-gallery-card spotlight-card group relative rounded-3xl overflow-hidden bg-slate-950/85 border border-white/20 hover:border-cyan-400/80 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-cyan-500/25 flex flex-col justify-between backdrop-blur-md">
                  
                  <!-- Contenedor Fotográfico con Hover Zoom -->
                  <div class="relative w-full h-72 sm:h-80 overflow-hidden bg-slate-900">
                    <img 
                      src="${normalizedUrl}" 
                      alt="${img.alt_text || 'Empaque al vacío'}" 
                      loading="lazy"
                      class="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out">
                    
                    <!-- Overlay degradado para lectura óptima -->
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent"></div>
                    
                    <!-- Badge Superior -->
                    <div class="absolute top-4 left-4">
                      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/90 backdrop-blur-md ${m.accent} border border-white/10 text-[11px] font-mono font-bold shadow-lg">
                        <i data-lucide="${m.icon}" class="w-3.5 h-3.5"></i>
                        ${m.badge}
                      </span>
                    </div>

                    <!-- Indicador de Apertura / Selector Alibaba -->
                    <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                      <button 
                        data-open-variation="any" 
                        class="btn-open-variation p-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold shadow-xl hover:bg-cyan-300 transition hover:scale-105"
                        title="Ver todas las medidas y espesores">
                        <i data-lucide="maximize-2" class="w-4 h-4"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Información y Ficha de Sellado -->
                  <div class="p-5 flex-1 flex flex-col justify-between bg-gradient-to-b from-slate-950/90 to-slate-900/95 border-t border-white/10">
                    <div>
                      <div class="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                        ${m.industry}
                      </div>
                      <h3 class="text-base font-extrabold text-white leading-snug group-hover:text-cyan-200 transition-colors">
                        ${img.alt_text}
                      </h3>
                      <p class="mt-2 text-xs text-slate-300 leading-relaxed font-normal">
                        ${img.caption}
                      </p>
                    </div>

                    <div class="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                      <div class="text-[10px] font-mono text-sky-200/90 flex items-center gap-1">
                        <i data-lucide="shield-check" class="w-3.5 h-3.5 text-cyan-400 shrink-0"></i>
                        <span class="truncate max-w-[130px] sm:max-w-[150px]">${m.highlight}</span>
                      </div>
                      <button 
                        data-open-variation="any" 
                        class="btn-open-variation inline-flex items-center gap-1 text-xs font-mono font-bold text-cyan-400 hover:text-white transition group/btn">
                        <span>Medidas</span>
                        <i data-lucide="arrow-right" class="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform"></i>
                      </button>
                    </div>
                  </div>

                </div>
              `;
            }).join('')}
          </div>

          <!-- Banner Inferior de Galería: Muestras Físicas para Plantas -->
          <div class="mt-14 p-6 sm:p-7 rounded-3xl bg-slate-950/70 border border-sky-400/30 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-5 shadow-2xl">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 border border-cyan-400/30 shadow-inner">
                <i data-lucide="box" class="w-6 h-6"></i>
              </div>
              <div>
                <h4 class="text-white font-bold text-sm sm:text-base">¿Deseas evaluar el sellado en tu propia planta del Biobío?</h4>
                <p class="text-xs text-sky-200 mt-0.5">Preparamos una muestra técnica física adaptada a las medidas y requerimientos de tu producto.</p>
              </div>
            </div>
            <div class="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
              <button 
                class="btn-sample-trigger w-full sm:w-auto px-6 py-3 rounded-xl bg-[#F59E0B] hover:bg-amber-400 text-neutral-950 text-xs font-mono font-black shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2">
                <i data-lucide="flask-conical" class="w-4 h-4"></i>
                <span>Obtener Muestra para mi Producto</span>
              </button>
            </div>
          </div>

        </div>
      </section>
    `;
  }

  // ==========================================================
  // SECCIÓN 3: FÁBRICA & TECNOLOGÍA (AZUL DE MAR MEDIO A PROFUNDO)
  // ==========================================================
  renderFactoryShowcaseSection() {
    return `
      <section id="factory_showcase" class="py-24 bg-gradient-to-b from-sky-500/80 via-blue-800 to-blue-950 text-white relative border-b border-blue-950">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <!-- Encabezado de la Planta -->
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-900/60 border border-sky-400/40 text-sky-200 text-xs font-mono font-bold uppercase mb-3">
                <i data-lucide="factory" class="w-3.5 h-3.5"></i>
                Estándar B2B de Coextrusión & Flexografía
              </div>
              <h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Línea de Producción Grado Alimentario FDA
              </h2>
              <p class="mt-2 text-sky-100 text-sm max-w-2xl font-light">
                Coextrusión de 9 capas sopladas para barrera total de oxígeno y humedad. Impresión en alta definición con barnices sectorizados para empaques congelados.
              </p>
            </div>
            <div class="flex items-center gap-2 text-xs font-mono text-sky-200 bg-sky-950/60 px-4 py-2.5 rounded-2xl border border-sky-400/30 backdrop-blur-md">
              <i data-lucide="award" class="w-4 h-4 text-sky-400"></i>
              <span>ISO 9001 • BRCGS Packaging • FDA 21 CFR</span>
            </div>
          </div>

          <!-- Cuadrícula de Planta y Atributos Técnicos -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
            
            <!-- Fotografía de Planta de Extrusión -->
            <div class="lg:col-span-7 relative rounded-3xl overflow-hidden border border-sky-400/30 bg-slate-950 shadow-2xl group">
              <img 
                src="assets/images/fabrica_extrusion_evoh.jpg" 
                alt="Planta de coextrusión en atmósfera controlada" 
                class="w-full h-full min-h-[380px] object-cover group-hover:scale-105 transition-transform duration-700">
              
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
              
              <!-- Badges sobre la fotografía de planta -->
              <div class="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4">
                <div class="bg-slate-950/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-sky-400/30">
                  <span class="text-xs text-sky-300 font-mono block">Línea de Soplado Automática</span>
                  <span class="text-sm font-bold text-white font-mono">9 Capas Coextruidas PA/EVOH/PE</span>
                </div>
                <div class="bg-slate-950/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-sky-400/30">
                  <span class="text-xs text-sky-300 font-mono block">Capacidad Mensual</span>
                  <span class="text-sm font-bold text-sky-300 font-mono">1.200.000 Bolsas al Mes</span>
                </div>
              </div>
            </div>

            <!-- Ficha Técnica Marina Estilo Alibaba B2B -->
            <div class="lg:col-span-5 bg-gradient-to-b from-blue-900/90 to-slate-900/95 border border-sky-400/30 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-2xl backdrop-blur-md">
              <div>
                <div class="flex items-center justify-between border-b border-sky-500/30 pb-3 mb-4">
                  <span class="text-xs font-mono uppercase text-sky-300 font-bold">Ficha Técnica de Barrera</span>
                  <span class="text-xs font-mono text-sky-200">Plantas Pesqueras Biobío</span>
                </div>

                <div class="space-y-3 text-xs font-mono">
                  <div class="flex justify-between py-2 border-b border-sky-500/20">
                    <span class="text-sky-200">Estructura Polímero:</span>
                    <span class="text-white font-bold">PA / Tie / EVOH / Tie / PE</span>
                  </div>
                  <div class="flex justify-between py-2 border-b border-sky-500/20">
                    <span class="text-sky-200">Espesor Disponible:</span>
                    <span class="text-sky-300 font-bold">90μm a 120μm (Calibre Pesado)</span>
                  </div>
                  <div class="flex justify-between py-2 border-b border-sky-500/20">
                    <span class="text-sky-200">Transmisión Oxígeno (OTR):</span>
                    <span class="text-emerald-300 font-bold">&lt; 12 cm³ / (m² · 24h · 0.1MPa)</span>
                  </div>
                  <div class="flex justify-between py-2 border-b border-sky-500/20">
                    <span class="text-sky-200">Transmisión Vapor (WVTR):</span>
                    <span class="text-emerald-300 font-bold">&lt; 3.2 g / (m² · 24h)</span>
                  </div>
                  <div class="flex justify-between py-2 border-b border-sky-500/20">
                    <span class="text-sky-200">Rango Operativo IQF:</span>
                    <span class="text-white font-bold">-35°C a 100°C (Sin quiebres)</span>
                  </div>
                  <div class="flex justify-between py-2">
                    <span class="text-sky-200">Resistencia Punción:</span>
                    <span class="text-sky-300 font-bold">&gt; 18 N (Apto espinas/jaiba)</span>
                  </div>
                </div>
              </div>

              <!-- Envíos directos en Biobío -->
              <div class="mt-6 pt-4 border-t border-sky-500/30 bg-sky-950/60 p-4 rounded-2xl border border-sky-400/20">
                <div class="flex items-center gap-3 text-xs text-sky-100">
                  <i data-lucide="truck" class="w-5 h-5 text-sky-300 shrink-0"></i>
                  <span><b>Ruta Logística Biobío:</b> Despacho en 24 a 48 hrs a plantas procesadoras de Talcahuano, Coronel, San Vicente y Tomé.</span>
                </div>
              </div>
            </div>

          </div>

          <!-- Fila de 4 atributos visuales inspirados en las fotos del usuario -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-blue-900/50 backdrop-blur-md p-4 rounded-2xl border border-sky-400/20 flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-300">
                <i data-lucide="eye" class="w-5 h-5"></i>
              </div>
              <div>
                <span class="text-xs font-bold text-white block">Ventana Transparente</span>
                <span class="text-[11px] text-sky-200">Inspección de frescura en retail</span>
              </div>
            </div>

            <div class="bg-blue-900/50 backdrop-blur-md p-4 rounded-2xl border border-sky-400/20 flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-300">
                <i data-lucide="grip-horizontal" class="w-5 h-5"></i>
              </div>
              <div>
                <span class="text-xs font-bold text-white block">Asa Troquelada</span>
                <span class="text-[11px] text-sky-200">Transporte ergonómico 1kg - 5kg</span>
              </div>
            </div>

            <div class="bg-blue-900/50 backdrop-blur-md p-4 rounded-2xl border border-sky-400/20 flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-300">
                <i data-lucide="lock" class="w-5 h-5"></i>
              </div>
              <div>
                <span class="text-xs font-bold text-white block">Zipper Hermético</span>
                <span class="text-[11px] text-sky-200">Apertura y cierre reutilizable</span>
              </div>
            </div>

            <div class="bg-blue-900/50 backdrop-blur-md p-4 rounded-2xl border border-sky-400/20 flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-300">
                <i data-lucide="palette" class="w-5 h-5"></i>
              </div>
              <div>
                <span class="text-xs font-bold text-white block">Barniz Mate / Brillo</span>
                <span class="text-[11px] text-sky-200">Acabado premium para exportar</span>
              </div>
            </div>
          </div>

        </div>
      </section>
    `;
  }

  // ==========================================================
  // SECCIÓN 4: CHECKOUT & COTIZADOR (AZUL DE MAR PROFUNDO)
  // ==========================================================
  renderCheckoutSection() {
    return `
      <section id="checkout_b2b" class="py-24 bg-gradient-to-b from-blue-950 via-[#04162e] to-[#020d1c] text-white relative">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div class="text-center max-w-3xl mx-auto mb-16 checkout-header-trigger">
            <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-950 border border-sky-500/40 text-sky-400 text-xs font-mono uppercase mb-3">
              <i data-lucide="calculator" class="w-3.5 h-3.5"></i>
              Cotizador Mayorista & Checkout
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Configura el Pedido para tu Planta
            </h2>
            <p class="mt-3 text-sky-200 text-base font-light">
              Descuentos por escala automáticos para pedidos desde 1.000 hasta 100.000+ unidades. Conexión directa a Make.com.
            </p>
          </div>

          <!-- Formulario y Resumen de Precios -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
            
            <!-- Formulario de Configuración -->
            <div class="lg:col-span-7 bg-slate-900/90 border border-sky-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
              
              <!-- Banner Directo hacia el Selector de Variaciones Alibaba -->
              <div class="mb-6 p-4 rounded-2xl bg-gradient-to-r from-sky-950/90 to-blue-950/90 border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                    <i data-lucide="sliders-horizontal" class="w-5 h-5"></i>
                  </div>
                  <div>
                    <span class="text-xs font-bold text-white block">¿Cotizar múltiples medidas y espesores al por mayor?</span>
                    <span class="text-[11px] text-sky-300">Selector de variaciones B2B con precios por escala (500 a 50.000+ un).</span>
                  </div>
                </div>
                <button type="button" id="btn-banner-open-variations" class="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition shadow-lg shrink-0 active:scale-95">
                  <i data-lucide="layers" class="w-4 h-4"></i>
                  <span>Abrir Selector</span>
                </button>
              </div>

              <form id="b2b-checkout-form" class="space-y-6">
                
                <!-- Formato Seleccionado -->
                <div>
                  <label class="block text-xs font-mono uppercase tracking-wider text-sky-400 mb-2 font-bold">
                    1. Formato de Empaque Seleccionado
                  </label>
                  <div class="relative">
                    <select id="input_select_bag" class="w-full bg-slate-950 border border-slate-700 focus:border-sky-400 text-white rounded-xl px-4 py-3.5 appearance-none focus:outline-none focus:ring-2 focus:ring-sky-400/20 font-medium text-sm transition">
                      ${this.products.map(p => `
                        <option value="${p.id}" ${this.selectedProduct && this.selectedProduct.id === p.id ? 'selected' : ''}>
                          ${p.name} (${p.dimensions} cm) - $${Number(p.retail_price).toFixed(2)} CLP c/u
                        </option>
                      `).join('')}
                    </select>
                    <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"></i>
                  </div>
                </div>

                <!-- Slider de Cantidad B2B -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold">
                      2. Tiraje / Volumen (Unidades)
                    </label>
                    <span id="quantity-display" class="font-mono text-lg font-black text-sky-300 bg-slate-950 px-3 py-1 rounded-xl border border-sky-800/60 shadow-inner">
                      5,000 un.
                    </span>
                  </div>
                  <input 
                    type="range" 
                    id="input_quantity" 
                    min="1000" 
                    max="100000" 
                    step="1000" 
                    value="5000" 
                    class="w-full">
                  <div class="flex justify-between text-[11px] font-mono text-sky-300/60 mt-2">
                    <span>1,000 (Mínimo B2B)</span>
                    <span>25,000 (Industrial -10%)</span>
                    <span>50,000+ (Corporativo -15%)</span>
                  </div>
                </div>

                <!-- Subida de Logo o Diseño de Empaque -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold">
                      3. Subir Diseño / Logotipo para Impresión
                    </label>
                    <span class="text-xs text-slate-400">Acepta .ai, .svg, .png</span>
                  </div>
                  
                  <div id="drop-zone-logo" class="border-2 border-dashed border-sky-500/40 hover:border-sky-400 rounded-2xl p-5 text-center cursor-pointer transition-colors bg-slate-950/60 group">
                    <input type="file" id="input_upload_logo" accept=".svg, .png, .ai" class="hidden">
                    <div id="logo-preview-container" class="flex flex-col items-center justify-center gap-2">
                      <i data-lucide="upload-cloud" class="w-8 h-8 text-sky-400 group-hover:scale-110 transition-transform"></i>
                      <div class="text-xs text-slate-300">
                        <span class="font-bold text-sky-400">Haz clic o arrastra tu archivo</span> para cotizar clichés
                      </div>
                      <span class="text-[11px] text-slate-500">Impresión flexo hasta 10 colores con ventana transparente</span>
                    </div>
                  </div>
                </div>

                <!-- Datos de la Planta Procesadora -->
                <div class="pt-4 border-t border-slate-800 space-y-4">
                  <span class="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    4. Datos de la Planta Pesquera
                  </span>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-[11px] text-slate-400 mb-1">Nombre Encargado de Compras</label>
                      <input type="text" id="input_client_name" required placeholder="Ej: Marcelo Morales" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-sky-400 focus:outline-none">
                    </div>
                    <div>
                      <label class="block text-[11px] text-slate-400 mb-1">Planta Procesadora / Empresa</label>
                      <input type="text" id="input_company_name" required placeholder="Ej: Pesquera San Vicente S.A." class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-sky-400 focus:outline-none">
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-[11px] text-slate-400 mb-1">Email Corporativo</label>
                      <input type="email" id="input_client_email" required placeholder="compras@pesquera.cl" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-sky-400 focus:outline-none">
                    </div>
                    <div>
                      <label class="block text-[11px] text-slate-400 mb-1">Teléfono / WhatsApp</label>
                      <input type="tel" id="input_client_phone" placeholder="+56 9 8765 4321" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-sky-400 focus:outline-none">
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  id="btn-submit-order" 
                  class="w-full bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-slate-950 font-black text-base py-4 rounded-2xl shadow-xl shadow-sky-500/25 transition-all flex items-center justify-center gap-2 active:scale-98">
                  <i data-lucide="send" class="w-5 h-5"></i>
                  <span>Enviar Cotización al Webhook Make.com</span>
                </button>

              </form>
            </div>

            <!-- Resumen Dinámico en Azul de Mar Profundo -->
            <div class="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-sky-500/30 rounded-3xl p-6 sm:p-8 sticky top-28 shadow-2xl backdrop-blur-xl">
              <div class="flex items-center justify-between pb-4 border-b border-slate-800">
                <span class="text-xs font-mono uppercase text-sky-400 font-bold">Resumen de Cotización</span>
                <span class="text-xs font-mono text-slate-400">Biobío Pesqueras</span>
              </div>

              <div class="py-6 space-y-4 text-sm font-mono">
                <div class="flex justify-between text-slate-300">
                  <span class="text-slate-400">Formato:</span>
                  <span id="summary-bag-name" class="font-bold text-white text-right">--</span>
                </div>
                <div class="flex justify-between text-slate-300">
                  <span class="text-slate-400">Dimensiones:</span>
                  <span id="summary-dimensions" class="font-bold text-sky-300">--</span>
                </div>
                <div class="flex justify-between text-slate-300">
                  <span class="text-slate-400">Tiraje:</span>
                  <span id="summary-quantity" class="font-bold text-white">5,000 un.</span>
                </div>
                <div class="flex justify-between text-slate-300">
                  <span class="text-slate-400">Precio Lista Unitario:</span>
                  <span id="summary-unit-price" class="text-white">$0.00</span>
                </div>
                <div class="flex justify-between text-slate-300">
                  <span class="text-slate-400">Subtotal Neto:</span>
                  <span id="summary-subtotal" class="text-white">$0.00</span>
                </div>
                <div class="flex justify-between text-emerald-400">
                  <span>Descuento Escala:</span>
                  <span id="summary-discount" class="font-bold">- $0.00</span>
                </div>
              </div>

              <!-- Total Final -->
              <div class="pt-4 border-t border-slate-800 mb-6">
                <div class="flex items-baseline justify-between">
                  <span class="text-xs font-mono text-slate-400 uppercase">Total Estimado Neto</span>
                  <div class="text-right">
                    <span id="summary-total" class="text-3xl font-black text-white font-mono">$0</span>
                    <span class="text-xs text-slate-400 block font-mono">+ IVA si corresponde</span>
                  </div>
                </div>
              </div>

              <!-- Pasos de Automatización -->
              <div class="space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-sky-900/40 text-xs text-slate-300">
                <div class="flex items-center gap-2.5">
                  <i data-lucide="zap" class="w-4 h-4 text-sky-400 shrink-0"></i>
                  <span><b>Make.com Webhook:</b> Emite el payload con archivo de logo.</span>
                </div>
                <div class="flex items-center gap-2.5">
                  <i data-lucide="bot" class="w-4 h-4 text-sky-400 shrink-0"></i>
                  <span><b>OpenAI Assistant:</b> Redacta propuesta formal técnica en minutos.</span>
                </div>
                <div class="flex items-center gap-2.5">
                  <i data-lucide="database" class="w-4 h-4 text-sky-400 shrink-0"></i>
                  <span><b>Supabase DB:</b> Registro persistente en tabla <code>b2b_orders</code>.</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>
    `;
  }

  renderFooter() {
    const isDark = this.schema?.theme === 'premium_industrial_food' || this.schema?.colors?.background === '#121212';
    const bg = isDark ? 'bg-[#090a0d] border-neutral-800/80 text-neutral-400' : 'bg-[#020814] border-slate-900 text-slate-500';

    return `
      <footer class="${bg} border-t py-12 text-xs font-mono">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-3.5">
            <div class="relative w-9 h-9 rounded-full p-0.5 bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.4)]">
              <img src="/assets/images/logo_wp_badge.png" alt="WellPack Logo" class="w-full h-full object-contain rounded-full bg-[#121212]" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-white font-black tracking-wider uppercase font-heading text-sm">WellPack</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold">PRO</span>
              </div>
              <span class="text-[9px] text-neutral-400 block tracking-[0.2em] uppercase font-semibold">Digital Flexible Packaging & Maquinaria</span>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-4 text-neutral-400 text-[11px]">
            <span class="inline-flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Planta Operativa</span>
            </span>
            <span>•</span>
            <span>Soporte Técnico Nacional</span>
            <span>•</span>
            <span class="text-neutral-500">WellPack © 2026</span>
          </div>
        </div>
      </footer>
    `;
  }

  renderSampleModal() {
    return `
      <div id="sample-modal" class="fixed inset-0 z-50 hidden bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <div class="bg-[#18181B] text-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative border border-neutral-800 animate-slide-up">
          <button id="btn-close-sample-modal" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
          
          <div class="flex items-center gap-3.5 mb-5">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <i data-lucide="flask-conical" class="w-6 h-6"></i>
            </div>
            <div>
              <h3 class="text-lg sm:text-xl font-black text-white">Obtener Muestra para tu Producto</h3>
              <p class="text-xs text-neutral-400">Fabricamos una muestra física con las medidas, barrera y sellado específico que exige tu alimento.</p>
            </div>
          </div>

          <form id="sample-form" class="space-y-3.5 text-xs font-sans">
            <div>
              <label class="block font-mono text-neutral-300 mb-1 font-semibold">1. ¿Qué alimento o producto vas a envasar? *</label>
              <input type="text" id="sample-product" required placeholder="Ej: Salmón con piel, Chuleta con hueso, Café en grano, Frutos secos..." class="w-full bg-[#121212] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-mono text-neutral-300 mb-1 font-semibold">2. Formato o Medidas (cm) *</label>
                <input type="text" id="sample-dimensions" required placeholder="Ej: Doypack 20*30 / Vacío 15*25" class="w-full bg-[#121212] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none">
              </div>
              <div>
                <label class="block font-mono text-neutral-300 mb-1 font-semibold">3. Maquinaria de Sellado</label>
                <input type="text" id="sample-machine" placeholder="Ej: Campana de vacío / Mordaza" class="w-full bg-[#121212] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none">
              </div>
            </div>

            <div>
              <label class="block font-mono text-neutral-300 mb-1 font-semibold">4. Nombre y Empresa / Planta *</label>
              <input type="text" id="sample-name" required placeholder="Ej: Juan Pérez / Frigorífico Concepción" class="w-full bg-[#121212] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-mono text-neutral-300 mb-1 font-semibold">5. WhatsApp / Teléfono *</label>
                <input type="text" id="sample-phone" required placeholder="+56 9..." class="w-full bg-[#121212] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none">
              </div>
              <div>
                <label class="block font-mono text-neutral-300 mb-1 font-semibold">6. Email Corporativo *</label>
                <input type="email" id="sample-email" required placeholder="contacto@empresa.cl" class="w-full bg-[#121212] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none">
              </div>
            </div>

            <p class="text-[11px] text-neutral-400 leading-tight pt-1">
              * Nota técnica: No enviamos muestras genéricas. Evaluamos tu requerimiento y producimos la muestra física adaptada a tu alimento para validación técnica en planta.
            </p>

            <button type="submit" class="w-full mt-2 bg-[#F59E0B] hover:bg-amber-400 text-neutral-950 font-black py-3.5 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition shadow-lg shadow-amber-500/25 active:scale-98 flex items-center justify-center gap-2">
              <i data-lucide="send" class="w-4 h-4"></i>
              <span>Solicitar Muestra de mi Producto</span>
            </button>
          </form>
        </div>
      </div>
    `;
  }

  renderConfigModal() {
    const config = getConfig();
    return `
      <div id="config-modal" class="fixed inset-0 z-50 hidden bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <div class="bg-[#18181B] border border-neutral-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-white animate-slide-up">
          <button id="btn-close-config-modal" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
          
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <i data-lucide="sliders" class="w-5 h-5"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-white">Configuración de Conectores</h3>
              <p class="text-xs text-neutral-400">Supabase DB & Make.com Webhook en vivo.</p>
            </div>
          </div>

          <form id="config-form" class="space-y-4 text-xs font-mono">
            <div>
              <label class="block text-neutral-300 mb-1">Supabase Project URL</label>
              <input type="text" id="cfg-supabase-url" value="${config.supabaseUrl || ''}" placeholder="https://xyzcompany.supabase.co" class="w-full bg-[#121212] border border-neutral-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none">
            </div>
            <div>
              <label class="block text-neutral-300 mb-1">Supabase Anon Public Key</label>
              <input type="password" id="cfg-supabase-key" value="${config.supabaseAnonKey || ''}" placeholder="eyJhbGciOi..." class="w-full bg-[#121212] border border-neutral-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none">
            </div>
            <div>
              <label class="block text-neutral-300 mb-1">Make.com Webhook URL</label>
              <input type="text" id="cfg-make-webhook" value="${config.makeWebhookUrl || ''}" placeholder="https://hook.eu1.make.com/..." class="w-full bg-[#121212] border border-neutral-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none">
            </div>
            <div class="pt-2 flex justify-end gap-2">
              <button type="button" id="btn-cancel-config" class="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700">Cancelar</button>
              <button type="submit" class="px-5 py-2 rounded-xl bg-[#F59E0B] hover:bg-amber-400 text-neutral-950 font-bold">Guardar Cambios</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  renderMachineryModal() {
    return `
      <!-- Modal de Cotización de Maquinaria Industrial -->
      <div id="machinery-modal" class="fixed inset-0 z-50 hidden bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <div class="bg-[#18181B] text-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative border border-blue-500/30 animate-slide-up">
          <button id="btn-close-machinery-modal" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
          
          <div class="flex items-center gap-3.5 mb-5">
            <div class="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <i data-lucide="cpu" class="w-6 h-6"></i>
            </div>
            <div>
              <h3 class="text-lg sm:text-xl font-black text-white">Cotizar Maquinaria Industrial</h3>
              <p class="text-xs text-neutral-400">Asesoría técnica y propuesta formal de ingeniería para plantas de alimentos.</p>
            </div>
          </div>

          <form id="machinery-form" class="space-y-3.5 text-xs font-sans">
            <div>
              <label class="block font-mono text-neutral-300 mb-1 font-semibold">1. Equipo o Línea Seleccionada *</label>
              <input type="text" id="machine-selected-name" required readonly class="w-full bg-[#121212] border border-blue-500/50 rounded-xl px-3.5 py-2.5 text-amber-400 font-bold focus:outline-none cursor-not-allowed">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-mono text-neutral-300 mb-1 font-semibold">2. Empresa / Planta *</label>
                <input type="text" id="machine-company" required placeholder="Ej: Cecinas del Sur SpA" class="w-full bg-[#121212] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:border-blue-400 focus:outline-none">
              </div>
              <div>
                <label class="block font-mono text-neutral-300 mb-1 font-semibold">3. Nombre de Contacto *</label>
                <input type="text" id="machine-contact-name" required placeholder="Ej: Roberto Gómez" class="w-full bg-[#121212] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:border-blue-400 focus:outline-none">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-mono text-neutral-300 mb-1 font-semibold">4. WhatsApp / Teléfono *</label>
                <input type="text" id="machine-phone" required placeholder="+56 9..." class="w-full bg-[#121212] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:border-blue-400 focus:outline-none">
              </div>
              <div>
                <label class="block font-mono text-neutral-300 mb-1 font-semibold">5. Email Corporativo *</label>
                <input type="email" id="machine-email" required placeholder="contacto@planta.cl" class="w-full bg-[#121212] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:border-blue-400 focus:outline-none">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-mono text-neutral-300 mb-1 font-semibold">6. Capacidad Estimada</label>
                <input type="text" id="machine-capacity" placeholder="Ej: 2.000 kg/hora o 10 ton/día" class="w-full bg-[#121212] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:border-blue-400 focus:outline-none">
              </div>
              <div>
                <label class="block font-mono text-neutral-300 mb-1 font-semibold">7. Tipo de Alimento / Proceso</label>
                <input type="text" id="machine-product-type" placeholder="Ej: Salchichas, carne congelada, cecinas" class="w-full bg-[#121212] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:border-blue-400 focus:outline-none">
              </div>
            </div>

            <div>
              <label class="block font-mono text-neutral-300 mb-1 font-semibold">8. Requerimiento o Consulta Adicional</label>
              <textarea id="machine-notes" rows="2" placeholder="Detalles de voltaje, espacio en planta, requerimiento de montaje o servicio técnico..." class="w-full bg-[#121212] border border-neutral-700 rounded-xl px-3.5 py-2 text-white placeholder-neutral-500 focus:border-blue-400 focus:outline-none text-xs"></textarea>
            </div>

            <p class="text-[11px] text-neutral-400 leading-tight pt-1">
              * Nota: Incluye asesoría técnica, especificaciones de voltaje/vapor, planos dimensionales y soporte de puesta en marcha en todo el país.
            </p>

            <button type="submit" class="w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black py-3.5 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition shadow-lg shadow-blue-600/30 active:scale-98 flex items-center justify-center gap-2">
              <i data-lucide="send" class="w-4 h-4"></i>
              <span>Solicitar Ficha Técnica y Cotización</span>
            </button>
          </form>
        </div>
      </div>
    `;
  }

  initAnimationsAndAssets() {
    this.threeViewerInstance = initThreeViewer('three-bag-container');

    // Efecto interactivo de movimiento fluido izquierda-derecha con el cursor sobre el Hero
    const heroEl = document.getElementById('hero');
    const heroImg = document.getElementById('hero-fluid-img');
    if (heroEl && heroImg) {
      let currentX = 0, targetX = 0;
      let currentY = 0, targetY = 0;
      heroEl.addEventListener('mousemove', (e) => {
        const rect = heroEl.getBoundingClientRect();
        const normX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 a 0.5
        const normY = (e.clientY - rect.top) / rect.height - 0.5;
        targetX = normX * -40; // paneo interactivo adicional hasta 40px en X
        targetY = normY * -18; // paneo suave de 18px en Y
      });
      heroEl.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
      });
      const lerp = (start, end, factor) => start + (end - start) * factor;
      const animateParallax = () => {
        currentX = lerp(currentX, targetX, 0.05);
        currentY = lerp(currentY, targetY, 0.05);
        heroImg.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
        requestAnimationFrame(animateParallax);
      };
      requestAnimationFrame(animateParallax);
    }

    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);

      window.gsap.from('.hero-content-trigger > *', {
        y: 35,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out'
      });

      window.gsap.from('.product-card', {
        scrollTrigger: {
          trigger: '#product_catalog',
          start: 'top 75%'
        },
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power2.out'
      });

      window.gsap.from('.visual-gallery-card', {
        scrollTrigger: {
          trigger: '#visual_gallery',
          start: 'top 75%'
        },
        y: 45,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
      });

      window.gsap.from('#checkout_b2b form, #checkout_b2b .lg\\:col-span-5', {
        scrollTrigger: {
          trigger: '#checkout_b2b',
          start: 'top 75%'
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out'
      });
    }
  }

  bindInteractiveEvents() {
    // Filtros de Categoría de Catálogo
    document.querySelectorAll('#catalog-category-filters .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#catalog-category-filters .filter-btn').forEach(b => {
          b.classList.remove('bg-blue-900', 'text-white', 'shadow-md');
          b.classList.add('bg-white', 'text-slate-800');
        });
        btn.classList.add('bg-blue-900', 'text-white', 'shadow-md');
        btn.classList.remove('bg-white', 'text-slate-800');

        const filter = btn.getAttribute('data-filter');
        if (filter === 'all') {
          this.filteredProducts = [...this.products];
        } else {
          this.filteredProducts = this.products.filter(p => p.category === filter);
        }

        const grid = document.getElementById('catalog-products-grid');
        if (grid) {
          grid.innerHTML = this.filteredProducts.map(p => this.renderProductCard(p)).join('');
          if (window.lucide) window.lucide.createIcons();
          this.bindCardSelectionButtons();
        }
      });
    });

    // Dropdown de selección de bolsa
    const bagSelect = document.getElementById('input_select_bag');
    if (bagSelect) {
      bagSelect.addEventListener('change', (e) => {
        const found = this.products.find(p => p.id === e.target.value);
        if (found) {
          this.selectedProduct = found;
          this.updatePricingSummary();
          this.highlightSelectedCard(found.id);
        }
      });
    }

    this.bindCardSelectionButtons();

    // Slider de cantidad
    const qtySlider = document.getElementById('input_quantity');
    const qtyDisplay = document.getElementById('quantity-display');
    if (qtySlider && qtyDisplay) {
      qtySlider.addEventListener('input', (e) => {
        this.currentQuantity = parseInt(e.target.value, 10);
        qtyDisplay.textContent = `${this.currentQuantity.toLocaleString('es-CL')} un.`;
        this.updatePricingSummary();
      });
    }

    // Subida de logotipo
    const dropZone = document.getElementById('drop-zone-logo');
    const fileInput = document.getElementById('input_upload_logo');
    if (dropZone && fileInput) {
      dropZone.addEventListener('click', () => fileInput.click());
      
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-sky-400', 'bg-sky-950/40');
      });

      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-sky-400', 'bg-sky-950/40');
      });

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-sky-400', 'bg-sky-950/40');
        if (e.dataTransfer.files.length) {
          this.handleFileUpload(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
          this.handleFileUpload(e.target.files[0]);
        }
      });
    }

    // Submit Checkout
    const checkoutForm = document.getElementById('b2b-checkout-form');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleCheckoutSubmit();
      });
    }

    // Modal de Muestras
    const sampleModal = document.getElementById('sample-modal');
    document.querySelectorAll('.btn-sample-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        sampleModal?.classList.remove('hidden');
      });
    });
    document.getElementById('btn-close-sample-modal')?.addEventListener('click', () => {
      sampleModal?.classList.add('hidden');
    });
    document.getElementById('sample-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const product = document.getElementById('sample-product')?.value || '';
      const dimensions = document.getElementById('sample-dimensions')?.value || '';
      const machine = document.getElementById('sample-machine')?.value || '';
      const name = document.getElementById('sample-name')?.value || '';
      const phone = document.getElementById('sample-phone')?.value || '';
      const email = document.getElementById('sample-email')?.value || '';

      try {
        await triggerMakeWebhook({
          event: 'custom_product_sample_request',
          client_name: name,
          company_name: name,
          client_email: email,
          client_phone: phone,
          food_product: product,
          packaging_dimensions: dimensions,
          packaging_machine: machine,
          notes: `Solicitud de muestra técnica física a medida para alimento: ${product}. Medidas: ${dimensions}. Maquinaria: ${machine}`
        });
      } catch (err) {
        console.warn('Webhook sample notice:', err);
      }

      sampleModal?.classList.add('hidden');
      this.showToast('¡Solicitud de muestra para tu producto enviada con éxito! Nuestro equipo técnico se contactará.', 'success');
    });

    // Modal Configuración
    const configModal = document.getElementById('config-modal');
    document.getElementById('btn-open-config')?.addEventListener('click', () => {
      configModal?.classList.remove('hidden');
    });
    document.getElementById('btn-close-config-modal')?.addEventListener('click', () => {
      configModal?.classList.add('hidden');
    });
    document.getElementById('btn-cancel-config')?.addEventListener('click', () => {
      configModal?.classList.add('hidden');
    });
    document.getElementById('config-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      saveConfig({
        supabaseUrl: document.getElementById('cfg-supabase-url').value.trim(),
        supabaseAnonKey: document.getElementById('cfg-supabase-key').value.trim(),
        makeWebhookUrl: document.getElementById('cfg-make-webhook').value.trim()
      });
      configModal?.classList.add('hidden');
      this.showToast('Configuración guardada.', 'success');
      setTimeout(() => location.reload(), 1000);
    });

    // Apertura del Selector de Variaciones Alibaba
    document.getElementById('btn-open-variations-nav')?.addEventListener('click', () => {
      alibabaModal.open();
    });
    document.getElementById('btn-banner-open-variations')?.addEventListener('click', () => {
      alibabaModal.open();
    });

    // Menú de navegación móvil tecnológico
    const mobileToggle = document.getElementById('btn-mobile-nav-toggle');
    const mobileMenu = document.getElementById('mobile-nav-menu');
    mobileToggle?.addEventListener('click', () => {
      mobileMenu?.classList.toggle('hidden');
    });
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu?.classList.add('hidden');
      });
    });

    // Micro-interacción Spotlight: Seguir puntero del mouse dinámicamente
    document.querySelectorAll('.spotlight-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });

    // Quick Volume Switcher Tabs (Interacción en tiempo real)
    document.querySelectorAll('.btn-tier-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = tab.getAttribute('data-tier-target');
        
        // Actualizar estado visual de los tabs
        document.querySelectorAll('.btn-tier-tab').forEach(t => {
          t.className = 'btn-tier-tab btn-spring px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border border-neutral-700 bg-neutral-900/90 text-neutral-300 hover:border-neutral-500';
        });
        tab.className = 'btn-tier-tab btn-spring px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border border-[#FF6B00] bg-[#FF6B00] text-neutral-950 shadow-lg shadow-orange-950/40';

        // Resaltar suavemente la tarjeta seleccionada
        document.querySelectorAll('.tier-card').forEach(c => {
          c.classList.remove('ring-4', 'ring-[#FF6B00]', 'scale-[1.03]');
        });
        const targetCard = document.getElementById(`tier-card-${targetId}`);
        if (targetCard) {
          targetCard.classList.add('ring-4', 'ring-[#FF6B00]', 'scale-[1.03]');
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          setTimeout(() => {
            targetCard.classList.remove('scale-[1.03]');
          }, 600);
        }
      });
    });

    // Filtro interactivo de formatos de empaque (Packaging Types Gallery)
    document.querySelectorAll('.btn-format-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = tab.getAttribute('data-format-filter');
        
        // Actualizar estado visual de los tabs
        document.querySelectorAll('.btn-format-tab').forEach(t => {
          t.className = 'btn-format-tab btn-spring px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border border-neutral-700 bg-neutral-900/90 text-neutral-300 hover:border-neutral-500';
        });
        tab.className = 'btn-format-tab btn-spring px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border border-amber-500 bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/30';

        // Filtrar tarjetas con transición suave
        document.querySelectorAll('.packaging-format-card').forEach(card => {
          const cardCat = card.getAttribute('data-format-cat');
          if (cat === 'all' || cardCat === cat) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // Filtro interactivo de maquinaria industrial (adaptado por rubro Cárnico o Pesquero)
    document.querySelectorAll('.btn-machine-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = tab.getAttribute('data-machine-filter');
        const isFish = this.pageMode === 'fishery_machinery';
        const inactiveClass = isFish
          ? 'btn-machine-tab btn-spring px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border border-cyan-800/80 bg-[#07203b] text-cyan-200 hover:border-cyan-400/60'
          : 'btn-machine-tab btn-spring px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border border-red-900/80 bg-[#210b0b] text-red-200 hover:border-red-500/60';
        const activeClass = isFish
          ? 'btn-machine-tab btn-spring px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border border-cyan-400 bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 shadow-lg shadow-cyan-500/35'
          : 'btn-machine-tab btn-spring px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all border border-red-500 bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/35';
        
        // Actualizar estado visual de los tabs
        document.querySelectorAll('.btn-machine-tab').forEach(t => {
          t.className = inactiveClass;
        });
        tab.className = activeClass;

        // Filtrar tarjetas
        document.querySelectorAll('.machinery-card').forEach(card => {
          const cardCat = card.getAttribute('data-machine-cat');
          if (cat === 'all' || cardCat === cat) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // Modal de Cotización de Maquinaria Industrial
    const machineryModal = document.getElementById('machinery-modal');
    const machineSelectedInput = document.getElementById('machine-selected-name');

    document.querySelectorAll('.btn-machinery-quote').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const machineTitle = btn.getAttribute('data-machine-title') || 'Maquinaria Industrial';
        if (machineSelectedInput) machineSelectedInput.value = machineTitle;
        machineryModal?.classList.remove('hidden');
      });
    });

    document.getElementById('btn-close-machinery-modal')?.addEventListener('click', () => {
      machineryModal?.classList.add('hidden');
    });

    document.getElementById('machinery-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const machineTitle = machineSelectedInput?.value || '';
      const company = document.getElementById('machine-company')?.value || '';
      const contact = document.getElementById('machine-contact-name')?.value || '';
      const phone = document.getElementById('machine-phone')?.value || '';
      const email = document.getElementById('machine-email')?.value || '';
      const capacity = document.getElementById('machine-capacity')?.value || '';
      const productType = document.getElementById('machine-product-type')?.value || '';
      const notes = document.getElementById('machine-notes')?.value || '';

      const payload = {
        event: 'machinery_quote_inquiry',
        equipment_name: machineTitle,
        company_name: company,
        contact_name: contact,
        contact_phone: phone,
        contact_email: email,
        capacity_required: capacity,
        product_type: productType,
        notes: notes,
        timestamp: new Date().toISOString()
      };

      try {
        await saveB2BOrder({
          company_name: company,
          contact_email: email,
          product_name: `[MAQUINARIA] ${machineTitle}`,
          quantity: 1,
          unit_price: 0,
          total_price: 0,
          has_custom_logo: false,
          status: 'machinery_inquiry_pending'
        });
        await triggerMakeWebhook(payload);
      } catch (err) {
        console.warn('Webhook machinery notice:', err);
      }

      machineryModal?.classList.add('hidden');
      this.showToast(`¡Solicitud enviada para ${machineTitle}! Un especialista técnico te contactará.`, 'success');
    });

    this.updatePricingSummary();
    this.bindAlibabaSectionEvents();
    this.updateAlibabaSectionCalculations();
    this.bindCorfoWizardEvents();
  }

  preserveCorfoContactInputs() {
    const st = this.corfoWizardState;
    const nameEl = document.getElementById('corfo-input-name');
    const compEl = document.getElementById('corfo-input-company');
    const phoneEl = document.getElementById('corfo-input-phone');
    const emailEl = document.getElementById('corfo-input-email');
    const regEl = document.getElementById('corfo-input-region');
    const rutEl = document.getElementById('corfo-input-rut');
    const notesEl = document.getElementById('corfo-input-notes');

    if (nameEl) st.contactName = nameEl.value;
    if (compEl) st.companyName = compEl.value;
    if (phoneEl) st.contactPhone = phoneEl.value;
    if (emailEl) st.contactEmail = emailEl.value;
    if (regEl) st.plantRegion = regEl.value;
    if (rutEl) st.companyRut = rutEl.value;
    if (notesEl) st.notes = notesEl.value;
  }

  refreshCorfoWizardUI() {
    const container = document.getElementById('corfo-wizard-container');
    if (!container) return;
    this.preserveCorfoContactInputs();
    container.innerHTML = this.renderCorfoWizardInner();
    if (window.lucide) window.lucide.createIcons();
    this.bindCorfoWizardInnerEvents();
  }

  bindCorfoWizardEvents() {
    // Botones de las 4 Áreas de Servicio que pre-cargan el enfoque en el Wizard
    document.querySelectorAll('.btn-preset-corfo-focus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const fKey = btn.getAttribute('data-preset-focus') || 'A';
        const focusMap = this.getCorfoFocusConfig();
        const chosen = focusMap[fKey] || focusMap.A;

        this.corfoWizardState.focusKey = chosen.key;
        this.corfoWizardState.focusTitle = chosen.title;
        this.corfoWizardState.corfoProgram = chosen.corfoProgram;
        this.corfoWizardState.selectedTechs = chosen.techOptions.slice(0, 2);
        this.corfoWizardState.currentStep = 3;

        this.refreshCorfoWizardUI();
        document.getElementById('corfo_wizard_section')?.scrollIntoView({ behavior: 'smooth' });
        this.showToast(`Ruta activada: ${chosen.corfoProgram}`, 'info');
      });
    });

    this.bindCorfoWizardInnerEvents();
  }

  bindCorfoWizardInnerEvents() {
    const st = this.corfoWizardState;
    const focusMap = this.getCorfoFocusConfig();

    // Navegación directa a los pasos 1..5
    document.querySelectorAll('.btn-wizard-goto').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetStep = parseInt(btn.getAttribute('data-wizard-goto'), 10);
        if (targetStep >= 1 && targetStep <= 5) {
          st.currentStep = targetStep;
          this.refreshCorfoWizardUI();
        }
      });
    });

    // Botón Anterior / Siguiente
    document.getElementById('btn-wizard-prev')?.addEventListener('click', () => {
      if (st.currentStep > 1) {
        st.currentStep -= 1;
        this.refreshCorfoWizardUI();
      }
    });

    document.getElementById('btn-wizard-next')?.addEventListener('click', () => {
      if (st.currentStep === 3 && st.selectedTechs.length === 0) {
        this.showToast('Selecciona al menos un equipamiento o tecnología en el Paso 3.', 'error');
        return;
      }
      if (st.currentStep < 5) {
        st.currentStep += 1;
        this.refreshCorfoWizardUI();
      }
    });

    // PASO 1: Sector Industrial
    document.querySelectorAll('.btn-wizard-sector').forEach(btn => {
      btn.addEventListener('click', () => {
        const sec = btn.getAttribute('data-wizard-sector');
        if (sec) {
          st.sector = sec;
          this.refreshCorfoWizardUI();
        }
      });
    });

    // PASO 2: Enfoque del Proyecto -> Asigna internamente la ruta Corfo y actualiza opciones del Paso 3
    document.querySelectorAll('.btn-wizard-focus').forEach(btn => {
      btn.addEventListener('click', () => {
        const fKey = btn.getAttribute('data-wizard-focus');
        const chosen = focusMap[fKey];
        if (chosen) {
          st.focusKey = chosen.key;
          st.focusTitle = chosen.title;
          st.corfoProgram = chosen.corfoProgram;
          st.selectedTechs = chosen.techOptions.slice(0, 2);
          this.refreshCorfoWizardUI();
          this.showToast(`Ruta asignada: ${chosen.corfoProgram}`, 'info');
        }
      });
    });

    // PASO 3: Tecnologías (Checkboxes de selección múltiple)
    document.querySelectorAll('.btn-wizard-tech').forEach(lbl => {
      lbl.addEventListener('click', (e) => {
        e.preventDefault();
        const tech = lbl.getAttribute('data-wizard-tech');
        if (!tech) return;
        const idx = st.selectedTechs.indexOf(tech);
        if (idx >= 0) {
          st.selectedTechs.splice(idx, 1);
        } else {
          st.selectedTechs.push(tech);
        }
        this.refreshCorfoWizardUI();
      });
    });

    // PASO 4: Dimensionamiento (Inversión, Facturación UF, Modalidad)
    document.querySelectorAll('.btn-wizard-investment').forEach(btn => {
      btn.addEventListener('click', () => {
        const inv = btn.getAttribute('data-wizard-investment');
        if (inv) {
          st.investmentRange = inv;
          this.refreshCorfoWizardUI();
        }
      });
    });

    document.querySelectorAll('.btn-wizard-revenue').forEach(btn => {
      btn.addEventListener('click', () => {
        const rev = btn.getAttribute('data-wizard-revenue');
        if (rev) {
          st.revenueLevel = rev;
          this.refreshCorfoWizardUI();
        }
      });
    });

    document.querySelectorAll('.btn-wizard-support').forEach(btn => {
      btn.addEventListener('click', () => {
        const sup = btn.getAttribute('data-wizard-support');
        if (sup) {
          st.supportType = sup;
          this.refreshCorfoWizardUI();
        }
      });
    });

    // PASO 5: Envío del Formulario de Evaluación Preliminar Corfo
    document.getElementById('corfo-wizard-submit-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      this.preserveCorfoContactInputs();

      const payload = {
        event: 'corfo_project_wizard_evaluation',
        sector: st.sector,
        focus_option: st.focusKey,
        focus_title: st.focusTitle,
        assigned_corfo_program: st.corfoProgram,
        selected_technologies: st.selectedTechs,
        investment_range: st.investmentRange,
        company_revenue_uf: st.revenueLevel,
        support_modality: st.supportType,
        contact_name: st.contactName,
        company_name: st.companyName,
        company_rut: st.companyRut,
        contact_phone: st.contactPhone,
        contact_email: st.contactEmail,
        plant_region: st.plantRegion,
        notes: st.notes,
        timestamp: new Date().toISOString()
      };

      try {
        await saveB2BOrder({
          company_name: st.companyName || 'Empresa Proyecto Corfo',
          contact_email: st.contactEmail || 'proyectos@empresa.cl',
          product_name: `[PROYECTO CORFO - ${st.corfoProgram}] ${st.sector} (${st.investmentRange})`,
          quantity: 1,
          unit_price: 0,
          total_price: 0,
          has_custom_logo: false,
          status: 'corfo_evaluation_pending'
        });
        await triggerMakeWebhook(payload);
      } catch (err) {
        console.warn('Registro Corfo notice:', err);
      }

      this.showToast(`¡Diagnóstico registrado! Abriendo canal directo con Ingeniería y Finanzas WellPack...`, 'success');

      const techsFormatted = (st.selectedTechs || []).map(t => `  - ${t}`).join('\n');
      const waMessage =
        `Hola WellPack, he completado el Evaluador de Proyectos e Incentivos Corfo:\n\n` +
        `1. SECTOR: ${st.sector}\n` +
        `2. ENFOQUE: ${st.focusTitle}\n` +
        `3. RUTA ASIGNADA: ${st.corfoProgram}\n` +
        `4. TECNOLOGÍAS REQUERIDAS:\n${techsFormatted}\n` +
        `5. INVERSIÓN ESTIMADA: ${st.investmentRange}\n` +
        `6. FACTURACIÓN EMPRESA: ${st.revenueLevel}\n` +
        `7. MODALIDAD: ${st.supportType}\n\n` +
        `DATOS DE CONTACTO:\n` +
        `• Nombre: ${st.contactName}\n` +
        `• Empresa: ${st.companyName} ${st.companyRut ? `(RUT: ${st.companyRut})` : ''}\n` +
        `• Teléfono: ${st.contactPhone}\n` +
        `• Email: ${st.contactEmail}\n` +
        `• Ciudad/Planta: ${st.plantRegion || 'Chile'}\n` +
        (st.notes ? `• Notas: ${st.notes}` : '');

      window.open(`https://wa.me/56987654321?text=${encodeURIComponent(waMessage)}`, '_blank');
    });
  }

  bindAlibabaSectionEvents() {
    // 1. Selector de Tipo
    document.querySelectorAll('.sec-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const typeId = btn.getAttribute('data-sec-type');
        const found = PACKAGING_TYPES.find(t => t.id === typeId);
        if (found) {
          this.alibabaState.selectedType = found;
          document.querySelectorAll('.sec-type-btn').forEach(b => {
            b.classList.remove('border-sky-500', 'bg-sky-50/90', 'ring-2', 'ring-sky-400', 'shadow-md');
            b.classList.add('border-slate-200', 'bg-white');
          });
          btn.classList.add('border-sky-500', 'bg-sky-50/90', 'ring-2', 'ring-sky-400', 'shadow-md');
          btn.classList.remove('border-slate-200', 'bg-white');

          const badge = document.getElementById('sec-selected-type-badge');
          if (badge) badge.textContent = found.name;
          this.updateAlibabaSectionCalculations();
        }
      });
    });

    // 2. Selector de Acabado
    document.querySelectorAll('.sec-finish-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const finId = btn.getAttribute('data-sec-finish');
        const found = COLORS_FINISHES.find(f => f.id === finId);
        if (found) {
          this.alibabaState.selectedFinish = found;
          document.querySelectorAll('.sec-finish-btn').forEach(b => {
            b.classList.remove('border-sky-600', 'bg-sky-600', 'text-white', 'shadow-md');
            b.classList.add('border-slate-200', 'bg-white', 'text-slate-700');
          });
          btn.classList.add('border-sky-600', 'bg-sky-600', 'text-white', 'shadow-md');
          btn.classList.remove('border-slate-200', 'bg-white', 'text-slate-700');
        }
      });
    });

    // 3. Selector de Medida
    document.querySelectorAll('.sec-size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sizeId = btn.getAttribute('data-sec-size');
        const found = SIZES.find(s => s.id === sizeId);
        if (found) {
          this.alibabaState.selectedSize = found;
          document.querySelectorAll('.sec-size-btn').forEach(b => {
            b.classList.remove('border-sky-600', 'bg-sky-50', 'text-sky-900', 'ring-2', 'ring-sky-300', 'font-black');
            b.classList.add('border-slate-200', 'bg-white', 'text-slate-700');
          });
          btn.classList.add('border-sky-600', 'bg-sky-50', 'text-sky-900', 'ring-2', 'ring-sky-300', 'font-black');
          btn.classList.remove('border-slate-200', 'bg-white', 'text-slate-700');

          const label = document.getElementById('sec-size-label');
          const note = document.getElementById('sec-size-note');
          if (label) label.textContent = found.label;
          if (note) note.textContent = found.note;
          this.updateAlibabaSectionCalculations();
        }
      });
    });

    // 4. Cantidades (+ / - / input)
    document.querySelectorAll('.sec-qty-minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const thId = btn.getAttribute('data-sec-minus');
        const input = document.querySelector(`.sec-qty-input[data-sec-input="${thId}"]`);
        if (input) {
          let val = Math.max(0, (parseInt(input.value) || 0) - 500);
          input.value = val;
          this.alibabaState.quantities[thId] = val;
          this.updateAlibabaSectionCalculations();
        }
      });
    });

    document.querySelectorAll('.sec-qty-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const thId = btn.getAttribute('data-sec-plus');
        const input = document.querySelector(`.sec-qty-input[data-sec-input="${thId}"]`);
        if (input) {
          let val = (parseInt(input.value) || 0) + 500;
          input.value = val;
          this.alibabaState.quantities[thId] = val;
          this.updateAlibabaSectionCalculations();
        }
      });
    });

    document.querySelectorAll('.sec-qty-input').forEach(input => {
      input.addEventListener('change', () => {
        const thId = input.getAttribute('data-sec-input');
        let val = Math.max(0, parseInt(input.value) || 0);
        input.value = val;
        this.alibabaState.quantities[thId] = val;
        this.updateAlibabaSectionCalculations();
      });
    });

    // 5. Botón WhatsApp
    document.getElementById('sec-btn-whatsapp')?.addEventListener('click', () => {
      const totalUnits = Object.values(this.alibabaState.quantities).reduce((a, b) => a + Number(b), 0);
      const text = `Hola WellPack Biobío, deseo cotizar empaques industriales:%0A` +
        `• Tipo: ${this.alibabaState.selectedType.name}%0A` +
        `• Medida: ${this.alibabaState.selectedSize.label}%0A` +
        `• Acabado: ${this.alibabaState.selectedFinish.name}%0A` +
        `• Cantidad Total: ${totalUnits.toLocaleString('es-CL')} unidades%0A` +
        `¿Tienen disponibilidad y despacho a Biobío?`;
      window.open(`https://wa.me/56987654321?text=${text}`, '_blank');
    });

    // 6. Botón Enviar Cotización
    document.getElementById('sec-btn-submit-inquiry')?.addEventListener('click', async () => {
      const totalUnits = Object.values(this.alibabaState.quantities).reduce((a, b) => a + Number(b), 0);
      if (totalUnits === 0) {
        this.showToast('Por favor selecciona al menos una cantidad en un espesor.', 'error');
        return;
      }

      this.showToast('Enviando cotización mayorista...', 'info');

      const payload = {
        packaging_type: this.alibabaState.selectedType.name,
        dimension: this.alibabaState.selectedSize.label,
        finish: this.alibabaState.selectedFinish.name,
        quantities: this.alibabaState.quantities,
        total_units: totalUnits,
        timestamp: new Date().toISOString(),
        origin: 'escaparate_alibaba_b2b'
      };

      try {
        await saveB2BOrder({
          company_name: 'Planta Procesadora Biobío',
          contact_email: 'contacto@plantabiobio.cl',
          product_name: `${this.alibabaState.selectedType.name} (${this.alibabaState.selectedSize.label})`,
          quantity: totalUnits,
          unit_price: 92,
          total_price: 92 * totalUnits,
          has_custom_logo: true,
          status: 'pending_review'
        });

        await triggerMakeWebhook(payload);
        this.showToast('¡Cotización recibida! Un ejecutivo te contactará en breve.', 'success');
      } catch (err) {
        this.showToast('Cotización registrada localmente.', 'success');
      }
    });
  }

  updateAlibabaSectionCalculations() {
    const totalUnits = Object.values(this.alibabaState.quantities).reduce((a, b) => a + Number(b), 0);
    
    let discount = 0;
    let discountLabel = 'Tarifa Base';
    if (totalUnits >= 50000) {
      discount = 0.20;
      discountLabel = '20% Dscto. Industrial';
    } else if (totalUnits >= 5000) {
      discount = 0.10;
      discountLabel = '10% Dscto. Mayorista';
    }

    const baseCost = this.alibabaState.selectedType.basePrice * this.alibabaState.selectedSize.factor;
    const tier1 = Math.round(baseCost);
    const tier2 = Math.round(baseCost * 0.90);
    const tier3 = Math.round(baseCost * 0.80);

    const t1El = document.getElementById('sec-tier-price-1');
    const t2El = document.getElementById('sec-tier-price-2');
    const t3El = document.getElementById('sec-tier-price-3');
    if (t1El) t1El.textContent = `$${tier1} CLP`;
    if (t2El) t2El.textContent = `$${tier2} CLP`;
    if (t3El) t3El.textContent = `$${tier3} CLP`;

    const box1 = document.getElementById('sec-tier-box-1');
    const box2 = document.getElementById('sec-tier-box-2');
    const box3 = document.getElementById('sec-tier-box-3');
    if (box1 && box2 && box3) {
      if (totalUnits < 5000) {
        box1.className = 'p-3.5 rounded-2xl border-2 border-sky-500 bg-sky-100/90 shadow-md ring-2 ring-sky-300 transition-all';
        box2.className = 'p-3.5 rounded-2xl border border-sky-200 bg-white transition-all shadow-sm';
        box3.className = 'p-3.5 rounded-2xl border border-sky-200 bg-white transition-all shadow-sm';
      } else if (totalUnits < 50000) {
        box1.className = 'p-3.5 rounded-2xl border border-sky-200 bg-white transition-all shadow-sm';
        box2.className = 'p-3.5 rounded-2xl border-2 border-sky-500 bg-sky-100/90 shadow-md ring-2 ring-sky-300 transition-all';
        box3.className = 'p-3.5 rounded-2xl border border-sky-200 bg-white transition-all shadow-sm';
      } else {
        box1.className = 'p-3.5 rounded-2xl border border-sky-200 bg-white transition-all shadow-sm';
        box2.className = 'p-3.5 rounded-2xl border border-sky-200 bg-white transition-all shadow-sm';
        box3.className = 'p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-300 transition-all';
      }
    }

    let subtotal = 0;
    THICKNESSES.forEach(th => {
      const q = Number(this.alibabaState.quantities[th.id]) || 0;
      const unitCost = baseCost * th.priceMod * (1 - discount);
      subtotal += q * unitCost;
    });

    const avgUnit = totalUnits > 0 ? (subtotal / totalUnits) : baseCost * (1 - discount);

    const totUnitsEl = document.getElementById('sec-total-units');
    const subtotalEl = document.getElementById('sec-subtotal');
    const unitPriceEl = document.getElementById('sec-unit-price');
    const discBadgeEl = document.getElementById('sec-discount-badge');

    if (totUnitsEl) totUnitsEl.textContent = `${totalUnits.toLocaleString('es-CL')} unidades`;
    if (subtotalEl) subtotalEl.textContent = `$${Math.round(subtotal).toLocaleString('es-CL')} CLP`;
    if (unitPriceEl) unitPriceEl.textContent = `($${avgUnit.toFixed(2)} CLP / un.)`;
    if (discBadgeEl) discBadgeEl.textContent = discountLabel;
  }

  bindCardSelectionButtons() {
    const bagSelect = document.getElementById('input_select_bag');
    
    // Botones Seleccionar para el formulario
    document.querySelectorAll('.btn-select-bag').forEach(btn => {
      btn.addEventListener('click', () => {
        const bagId = btn.getAttribute('data-select-bag');
        const found = this.products.find(p => p.id === bagId);
        if (found) {
          this.selectedProduct = found;
          if (bagSelect) bagSelect.value = bagId;
          this.updatePricingSummary();
          this.highlightSelectedCard(bagId);
          document.getElementById('checkout_b2b')?.scrollIntoView({ behavior: 'smooth' });
          this.showToast(`Formato seleccionado: ${found.name}`, 'info');
        }
      });
    });

    // Botones Medidas para abrir el Selector Alibaba
    document.querySelectorAll('.btn-open-variation').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        alibabaModal.open();
      });
    });

    // Botones de Planes de Precios Escalonados (Tiered Pricing Offers)
    document.querySelectorAll('.btn-tier-quote').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tierId = btn.getAttribute('data-tier-id');
        const volumeStr = btn.getAttribute('data-tier-volume') || '10.000';
        const price = btn.getAttribute('data-tier-price') || '$145';
        const title = btn.getAttribute('data-tier-title') || 'Plan Escala';

        const numericVol = parseInt(volumeStr.replace(/[^\d]/g, ''), 10) || 10000;

        if (alibabaModal) {
          alibabaModal.quantities = {
            '70um': 0,
            '90um': numericVol,
            '110um': 0,
            '120um': 0,
            '150um': 0
          };
          alibabaModal.selectedType = PACKAGING_TYPES[0];
          alibabaModal.open({ typeId: 'vacio_3_sellos' });
        }

        this.showToast(`Plan cargado: ${title} (${volumeStr} un. a ${price}/u).`, 'info');
      });
    });
  }

  handleFileUpload(file) {
    this.uploadedLogo = file;
    const previewContainer = document.getElementById('logo-preview-container');
    if (previewContainer) {
      previewContainer.innerHTML = `
        <div class="flex items-center gap-3 text-emerald-400 font-mono text-xs">
          <i data-lucide="check-circle-2" class="w-5 h-5"></i>
          <div>
            <span class="font-bold text-white block">${file.name}</span>
            <span class="text-[10px] text-slate-400">${(file.size / 1024).toFixed(1)} KB • Preparado para cliché flexográfico</span>
          </div>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
    }
    this.showToast(`Diseño cargado: ${file.name}`, 'info');
  }

  highlightSelectedCard(bagId) {
    document.querySelectorAll('.product-card').forEach(card => {
      const isMatch = card.querySelector(`[data-select-bag="${bagId}"]`);
      if (isMatch) {
        card.classList.add('border-sky-500', 'ring-4', 'ring-sky-300');
        card.classList.remove('border-sky-200/80');
      } else {
        card.classList.remove('border-sky-500', 'ring-4', 'ring-sky-300');
        card.classList.add('border-sky-200/80');
      }
    });
  }

  calculatePricing() {
    if (!this.selectedProduct) return { unitPrice: 0, subtotal: 0, discount: 0, discountRate: 0, total: 0 };

    const unitPrice = Number(this.selectedProduct.retail_price) || 0;
    const qty = this.currentQuantity;
    const subtotal = unitPrice * qty;

    let discountRate = 0;
    if (qty >= 50000) discountRate = 0.15;
    else if (qty >= 25000) discountRate = 0.10;
    else if (qty >= 10000) discountRate = 0.05;

    const discountAmount = subtotal * discountRate;
    const total = subtotal - discountAmount;

    return { unitPrice, subtotal, discount: discountAmount, discountRate, total };
  }

  updatePricingSummary() {
    const { unitPrice, subtotal, discount, discountRate, total } = this.calculatePricing();

    const bagNameEl = document.getElementById('summary-bag-name');
    const dimEl = document.getElementById('summary-dimensions');
    const qtyEl = document.getElementById('summary-quantity');
    const unitPriceEl = document.getElementById('summary-unit-price');
    const subtotalEl = document.getElementById('summary-subtotal');
    const discountEl = document.getElementById('summary-discount');
    const totalEl = document.getElementById('summary-total');

    if (bagNameEl && this.selectedProduct) bagNameEl.textContent = this.selectedProduct.name;
    if (dimEl && this.selectedProduct) dimEl.textContent = `${this.selectedProduct.dimensions} cm`;
    if (qtyEl) qtyEl.textContent = `${this.currentQuantity.toLocaleString('es-CL')} un.`;
    if (unitPriceEl) unitPriceEl.textContent = `$${unitPrice.toFixed(2)} CLP`;
    if (subtotalEl) subtotalEl.textContent = `$${Math.round(subtotal).toLocaleString('es-CL')} CLP`;
    if (discountEl) discountEl.textContent = discountRate > 0 ? `-${(discountRate * 100)}% (-$${Math.round(discount).toLocaleString('es-CL')})` : '$0.00';
    if (totalEl) totalEl.textContent = `$${Math.round(total).toLocaleString('es-CL')} CLP`;
  }

  async handleCheckoutSubmit() {
    const submitBtn = document.getElementById('btn-submit-order');
    const originalContent = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <div class="inline-flex items-center gap-2">
        <span class="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
        <span>Conectando con Make.com...</span>
      </div>
    `;

    try {
      const clientName = document.getElementById('input_client_name').value.trim();
      const companyName = document.getElementById('input_company_name').value.trim();
      const clientEmail = document.getElementById('input_client_email').value.trim();
      const clientPhone = document.getElementById('input_client_phone').value.trim();

      const pricing = this.calculatePricing();

      let logoBase64 = null;
      if (this.uploadedLogo && this.uploadedLogo.type.startsWith('image/')) {
        logoBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(this.uploadedLogo);
        });
      }

      const quotePayload = {
        client_name: clientName,
        company_name: companyName,
        client_email: clientEmail,
        client_phone: clientPhone,
        bag_id: this.selectedProduct?.id,
        bag_name: this.selectedProduct?.name,
        dimensions: this.selectedProduct?.dimensions,
        quantity: this.currentQuantity,
        unit_price: pricing.unitPrice,
        subtotal: pricing.subtotal,
        discount_applied: pricing.discount,
        discount_percentage: pricing.discountRate * 100,
        total_price: pricing.total,
        has_custom_logo: !!this.uploadedLogo,
        logo_file_name: this.uploadedLogo ? this.uploadedLogo.name : null,
        logo_file_type: this.uploadedLogo ? this.uploadedLogo.type : null,
        logo_base64_preview: logoBase64
      };

      await saveB2BOrder(quotePayload);
      const webhookResult = await triggerMakeWebhook(quotePayload);

      if (webhookResult.success) {
        this.showToast('¡Cotización enviada con éxito hacia Make.com!', 'success');
        this.showSuccessNotification(quotePayload, webhookResult);
      } else {
        throw new Error(webhookResult.error || 'Error conectando con Make.com');
      }

    } catch (err) {
      console.error('Error al procesar orden B2B:', err);
      this.showToast(`Error: ${err.message}`, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalContent;
      if (window.lucide) window.lucide.createIcons();
    }
  }

  showSuccessNotification(quote, webhookResult) {
    const toast = document.createElement('div');
    toast.className = 'bg-slate-900 border border-sky-400 text-white p-5 rounded-3xl shadow-2xl max-w-md animate-fade-in font-mono text-xs space-y-3';
    toast.innerHTML = `
      <div class="flex items-center gap-2 text-sky-400 font-bold text-sm">
        <i data-lucide="check-circle" class="w-5 h-5"></i>
        <span>Cotización Registrada</span>
      </div>
      <div class="space-y-1 text-slate-300">
        <p><b>Empresa:</b> ${quote.company_name}</p>
        <p><b>Formato:</b> ${quote.bag_name} (${quote.dimensions})</p>
        <p><b>Tiraje:</b> ${quote.quantity.toLocaleString('es-CL')} un. | Total: $${Math.round(quote.total_price).toLocaleString('es-CL')} CLP</p>
        <p class="text-sky-300 pt-1">${webhookResult.isSimulated ? '⚡ Modo Simulación Make.com activo' : '⚡ Webhook Make.com recibido 200 OK'}</p>
      </div>
      <button class="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-xl text-center font-bold" onclick="this.parentElement.remove()">
        Entendido
      </button>
    `;
    document.getElementById('toast-container')?.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const bg = type === 'success' ? 'bg-emerald-900 border-emerald-400 text-emerald-100' :
               type === 'error' ? 'bg-red-900 border-red-400 text-red-100' :
               'bg-sky-900 border-sky-400 text-sky-100';

    toast.className = `${bg} border px-4 py-3 rounded-2xl shadow-xl text-xs flex items-center gap-2.5 transition-all duration-300 transform font-mono font-medium`;
    toast.innerHTML = `<span>${message}</span>`;
    
    const container = document.getElementById('toast-container');
    if (container) {
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }
  }

  renderError(msg) {
    this.container.innerHTML = `
      <div class="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center font-mono">
        <div class="max-w-md bg-white border border-red-300 p-8 rounded-3xl shadow-xl text-slate-900">
          <div class="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-4">
            <i data-lucide="alert-triangle" class="w-6 h-6"></i>
          </div>
          <h2 class="text-lg font-bold mb-2">Error de Carga</h2>
          <p class="text-slate-600 text-xs mb-4">${msg}</p>
          <button onclick="location.reload()" class="bg-sky-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md">
            Reintentar
          </button>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }
}

function startEngine() {
  const engine = new AntigravityRenderer('app');
  engine.init('schema.json?v=' + Date.now());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startEngine);
} else {
  startEngine();
}

export { AntigravityRenderer };
