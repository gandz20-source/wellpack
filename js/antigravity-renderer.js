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
  }

  async init(schemaUrl = 'schema.json') {
    try {
      const res = await fetch(schemaUrl);
      if (!res.ok) throw new Error(`No se pudo cargar el schema JSON: ${res.statusText}`);
      this.schema = await res.json();
      
      if (this.schema.meta) {
        document.title = this.schema.meta.title || document.title;
      }

      // Cargar productos de Supabase
      const { data } = await fetchVacuumBags();
      this.products = data || [];
      this.filteredProducts = [...this.products];
      this.selectedProduct = this.products[0] || null;

      // Inicializar Selector de Variaciones Estilo Alibaba
      alibabaModal.init();

      // Renderizar vistas dinámicas
      this.renderApp();

      // Inicializar animaciones GSAP y Three.js
      this.initAnimationsAndAssets();

      // Enlazar interactividad del cotizador y filtros
      this.bindInteractiveEvents();

      console.log('🌊 Antigravity Engine: Interfaz oceánica renderizada con éxito');
    } catch (err) {
      console.error('Error inicializando AntigravityRenderer:', err);
      this.renderError(err.message);
    }
  }

  renderApp() {
    const isDark = this.schema?.theme === 'premium_industrial_food' || this.schema?.colors?.background === '#121212';
    if (isDark) {
      document.body.style.backgroundColor = '#121212';
      document.body.style.color = '#FFFFFF';
      this.container.className = 'relative bg-[#121212] text-white min-h-screen';
    } else {
      this.container.className = 'relative ocean-gradient-canvas min-h-screen';
    }

    this.container.innerHTML = `
      <!-- 1. Barra de Navegación Industrial -->
      ${this.renderNavbar()}

      <!-- 2. Contenedor de Secciones Dinámicas -->
      <main class="relative z-10 w-full overflow-hidden">
        ${this.schema && this.schema.layout ? this.schema.layout.map(section => this.renderSection(section)).join('') : `
          ${this.renderHeroSection()}
          ${this.renderCatalogSection()}
          ${this.renderFactoryShowcaseSection()}
          ${this.renderCheckoutSection()}
        `}
      </main>

      <!-- 3. Pie de Página -->
      ${this.renderFooter()}

      <!-- 4. Floating Action Dock B2B (Acción Rápida & Micro-interacciones) -->
      ${this.renderFloatingActionDock()}

      <!-- 5. Modales y Notificaciones -->
      ${this.renderSampleModal()}
      ${this.renderConfigModal()}
      <div id="toast-container" class="fixed bottom-6 right-6 z-50 flex flex-col gap-3"></div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  renderFloatingActionDock() {
    return `
      <!-- Floating B2B Action Dock (Micro-interacción & Conversión Inmediata) -->
      <aside id="floating-b2b-dock" aria-label="Acciones rápidas WellPack" class="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-xl transition-all duration-300">
        <div class="bg-neutral-900/90 backdrop-blur-xl border border-neutral-700/70 p-2 sm:p-2.5 rounded-2xl shadow-2xl shadow-black/80 flex items-center justify-between gap-2.5 sm:gap-4 ring-1 ring-white/10 hover:border-amber-500/50 transition-all">
          
          <!-- Indicador Operacional Planta Flexográfica -->
          <div class="flex items-center gap-2.5 pl-2 sm:pl-3">
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div class="leading-none hidden xs:block sm:block">
              <span class="text-[11px] font-mono font-bold text-white tracking-wider uppercase block">Línea Flexo Activa</span>
              <span class="text-[9px] text-neutral-400 font-mono">Tirajes desde 10.000 un.</span>
            </div>
          </div>

          <!-- Acciones Rápidas -->
          <div class="flex items-center gap-2">
            <!-- Botón WhatsApp Directo -->
            <a 
              href="https://wa.me/56987654321?text=Hola%20WellPack%2C%20quisiera%20asesor%C3%ADa%20r%C3%A1pida%20para%20cotizar%20empaques%20industriales" 
              target="_blank" 
              rel="noopener noreferrer"
              class="btn-spring inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
              <i data-lucide="message-circle" class="w-4 h-4"></i>
              <span class="hidden sm:inline">WhatsApp</span>
            </a>

            <!-- Botón Cotizar Inmediato (Abre Alibaba Modal) -->
            <button 
              data-open-variation="any" 
              class="btn-open-variation btn-spring inline-flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#FF6B00] text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25">
              <i data-lucide="sliders-horizontal" class="w-3.5 h-3.5 text-neutral-950"></i>
              <span>Cotizar Ahora</span>
            </button>
          </div>

        </div>
      </aside>
    `;
  }

  renderNavbar() {
    const config = getConfig();
    const isConfigured = config.supabaseUrl && !config.supabaseUrl.includes('xyzcompany');
    const isDark = this.schema?.theme === 'premium_industrial_food' || this.schema?.colors?.background === '#121212';

    if (isDark) {
      return `
        <header class="sticky top-0 z-40 backdrop-blur-xl bg-[#121212]/90 border-b border-neutral-800 shadow-2xl transition-all">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            
            <!-- Logo WellPack Universal -->
            <a href="#hero" class="flex items-center gap-3 group">
              <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/40 group-hover:scale-105 transition-transform">
                <i data-lucide="package" class="w-6 h-6 text-neutral-950 font-black"></i>
              </div>
              <div>
                <span class="text-xl font-extrabold tracking-wider text-white font-mono uppercase">WellPack</span>
                <span class="text-[10px] block text-amber-400 font-mono tracking-widest font-bold uppercase">EMPAQUES INDUSTRIALES ALIMENTARIOS</span>
              </div>
            </a>

            <!-- Enlaces de navegación -->
            <nav class="hidden md:flex items-center gap-7 text-sm font-semibold text-neutral-300">
              <a href="#hero" class="hover:text-amber-400 transition-colors">Inicio</a>
              <a href="#service_customization" class="hover:text-amber-400 transition-colors">Personalización</a>
              <a href="#packaging_types_gallery" class="hover:text-amber-400 transition-colors">Formatos</a>
              <a href="#tiered_pricing_offers" class="hover:text-amber-400 transition-colors">Precios & Planes</a>
              <a href="#industries_served" class="hover:text-amber-400 transition-colors">Sectores</a>
              
              <span class="text-xs bg-neutral-900 text-amber-300 px-3 py-1 rounded-full border border-neutral-700 flex items-center gap-1.5 font-mono font-medium">
                <span class="w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}"></span>
                ${isConfigured ? 'Supabase Conectado' : 'Catálogo Activo'}
              </span>
            </nav>

            <!-- Acciones de Cabecera -->
            <div class="flex items-center gap-2.5">
              <button id="btn-open-config" title="Configurar Supabase y Make" class="p-2.5 rounded-xl bg-neutral-900 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 border border-neutral-800 transition shadow-sm">
                <i data-lucide="settings" class="w-4 h-4"></i>
              </button>
              <button id="btn-open-variations-nav" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold transition shadow-sm">
                <i data-lucide="sliders-horizontal" class="w-3.5 h-3.5 text-amber-400"></i>
                <span class="hidden sm:inline">Variaciones</span>
              </button>
              <button 
                data-open-variation="any"
                class="btn-open-variation inline-flex items-center gap-2 bg-[#F59E0B] hover:bg-amber-400 text-neutral-950 font-black text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.03] active:scale-95">
                <i data-lucide="file-text" class="w-4 h-4"></i>
                <span>Cotizar Empaque</span>
              </button>
            </div>
          </div>
        </header>
      `;
    }

    return `
      <header class="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/85 border-b border-sky-900/50 shadow-md transition-all">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <!-- Logo WellPack Biobío -->
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/25 ring-2 ring-sky-400/40">
              <i data-lucide="package" class="w-6 h-6 text-white"></i>
            </div>
            <div>
              <span class="text-xl font-extrabold tracking-wider text-white font-mono uppercase">WellPack</span>
              <span class="text-[11px] block text-cyan-400 font-mono tracking-widest font-bold">BIOBÍO • PESQUEROS & MARISCOS</span>
            </div>
          </div>

          <!-- Enlaces de navegación -->
          <nav class="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-300">
            <a href="#hero" class="hover:text-cyan-400 transition-colors">Inicio</a>
            <a href="#alibaba_variation_selector" class="hover:text-cyan-400 transition-colors">Variaciones B2B</a>
            <a href="#product_catalog" class="hover:text-cyan-400 transition-colors">Catálogo Impreso</a>
            <a href="#visual_gallery" class="hover:text-cyan-400 transition-colors">Aplicaciones Reales</a>
            <a href="#factory_showcase" class="hover:text-cyan-400 transition-colors">Tecnología de Planta</a>
            <a href="#checkout_b2b" class="hover:text-cyan-400 transition-colors">Cotizador B2B</a>
            
            <span class="text-xs bg-cyan-950/80 text-cyan-300 px-3 py-1 rounded-full border border-cyan-800/60 flex items-center gap-1.5 font-mono font-medium">
              <span class="w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}"></span>
              ${isConfigured ? 'Supabase Conectado' : 'Catálogo Biobío Activo'}
            </span>
          </nav>

          <!-- Acciones de Cabecera -->
          <div class="flex items-center gap-2.5">
            <button id="btn-open-config" title="Configurar Supabase y Make" class="p-2.5 rounded-xl bg-slate-900 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 border border-slate-800 transition shadow-sm">
              <i data-lucide="settings" class="w-4 h-4"></i>
            </button>
            <a href="#alibaba_variation_selector" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-950/80 hover:bg-sky-900 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition shadow-sm">
              <i data-lucide="sliders-horizontal" class="w-3.5 h-3.5 text-cyan-400"></i>
              <span class="hidden sm:inline">Variaciones</span>
            </a>
            <a href="#checkout_b2b" class="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.03] active:scale-95">
              <i data-lucide="file-text" class="w-4 h-4"></i>
              <span>Cotizar Lote</span>
            </a>
          </div>
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
  // SECCIÓN UNIVERSAL 1: HERO CENTRADO MULTI-ALIMENTOS
  // ==========================================================
  renderHeroUniversalSection(config = {}) {
    const title = config.title?.text || "Empaques de Alta Barrera Personalizados para tu Industria";
    const subtitle = config.subtitle?.text || "Desde bolsas al vacío hasta formatos Doypack. Importamos y fabricamos el envase exacto con la identidad visual de tu marca para el sector cárnico, pesquero, agrícola y retail.";
    const actions = config.actions || [{ label: "Cotizar Empaque a Medida", type: "primary", bg_color: "#F59E0B" }];
    const bgImg = config.background_image?.url || "assets/img/hero-fondo-impresion-hd.jpg";
    const normalizedBg = bgImg.startsWith('/') ? bgImg.slice(1) : bgImg;
    const overlay = config.background_image?.overlay || "rgba(18, 18, 18, 0.35)";

    return `
      <section id="hero" class="relative min-h-[95vh] flex items-center justify-center overflow-hidden py-20 lg:py-28 bg-[#121212] text-white border-b border-neutral-800">
        <!-- Contenedor del Fondo Panorámico en Movimiento Fluido (Izquierda <-> Derecha) -->
        <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          
          <!-- Track móvil con animación continua de paneo cinematográfico -->
          <div id="hero-fluid-track" class="absolute -top-[5%] -left-[18%] w-[136%] h-[110%] animate-hero-pan will-change-transform">
            <img 
              id="hero-fluid-img"
              src="${normalizedBg}" 
              alt="Variedad de empaques para alimentos WellPack" 
              class="w-full h-full object-cover object-center filter brightness-[1.08] contrast-[1.12] saturate-[1.18] transition-transform duration-500 ease-out">
          </div>

          <!-- Efecto de brillo/destello de luz sobre envases plásticos que viaja suavemente -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/[0.08] to-transparent -skew-x-12 animate-light-sweep pointer-events-none"></div>

          <!-- Gradiente Radial Foco: Centro sutilmente atenuado para legibilidad, dejando los alimentos de los costados y centro con máximo brillo y nitidez -->
          <div class="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(18,18,18,0.48)_0%,rgba(18,18,18,0.22)_60%,rgba(18,18,18,0.78)_100%)]"></div>

          <!-- Viñetas superior e inferior que funden suavemente con navbar y siguiente sección -->
          <div class="absolute inset-0 bg-gradient-to-b from-[#121212]/80 via-transparent to-[#121212]"></div>
        </div>

        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8 hero-content-trigger">
          <div class="p-6 sm:p-10 rounded-3xl bg-[#121212]/40 backdrop-blur-[3px] border border-white/10 shadow-2xl shadow-black/80 space-y-7">
            
            <!-- Badge superior -->
            <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-neutral-900/90 border border-amber-500/50 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider shadow-lg shadow-black/60 backdrop-blur-md">
              <i data-lucide="award" class="w-4 h-4 text-amber-400"></i>
              <span>Fabricación e Importación Mayorista B2B</span>
            </div>

            <!-- Título Centrado Principal -->
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white drop-shadow-lg">
              ${title}
            </h1>

            <!-- Subtítulo -->
            <p class="text-base sm:text-lg lg:text-xl text-neutral-200 max-w-3xl mx-auto font-normal leading-relaxed drop-shadow">
              ${subtitle}
            </p>

            <!-- Botones de Acción -->
            <div class="flex flex-wrap items-center justify-center gap-4 pt-2">
              ${actions.map(act => `
                <button 
                  data-open-variation="any"
                  class="btn-open-variation inline-flex items-center gap-2.5 bg-[#F59E0B] hover:bg-amber-400 text-neutral-950 font-black text-sm sm:text-base px-8 py-4 rounded-2xl shadow-xl shadow-amber-500/30 transition-all hover:scale-105 active:scale-95">
                  <i data-lucide="calculator" class="w-5 h-5 text-neutral-950"></i>
                  <span>${act.label}</span>
                  <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </button>
              `).join('')}

              <a 
                href="#packaging_types_gallery" 
                class="inline-flex items-center gap-2 bg-neutral-900/85 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 hover:border-amber-400/70 font-bold text-sm sm:text-base px-7 py-4 rounded-2xl transition-all hover:scale-105 backdrop-blur-md shadow-lg">
                <i data-lucide="package" class="w-5 h-5 text-amber-400"></i>
                <span>Ver Formatos</span>
              </a>
            </div>

            <!-- Barra de Especificaciones Rápidas -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-6 border-t border-neutral-800/90 text-left max-w-4xl mx-auto">
              <div class="bg-neutral-900/75 backdrop-blur-md p-3.5 rounded-2xl border border-neutral-700/60 shadow-lg">
                <div class="text-lg font-black text-amber-400 font-mono">EVOH / PE</div>
                <div class="text-[11px] text-neutral-300 font-mono uppercase mt-0.5">Barrera de Oxígeno</div>
              </div>
              <div class="bg-neutral-900/75 backdrop-blur-md p-3.5 rounded-2xl border border-neutral-700/60 shadow-lg">
                <div class="text-lg font-black text-amber-400 font-mono">-35° C IQF</div>
                <div class="text-[11px] text-neutral-300 font-mono uppercase mt-0.5">Túneles de Congelado</div>
              </div>
              <div class="bg-neutral-900/75 backdrop-blur-md p-3.5 rounded-2xl border border-neutral-700/60 shadow-lg">
                <div class="text-lg font-black text-amber-400 font-mono">10 Colores</div>
                <div class="text-[11px] text-neutral-300 font-mono uppercase mt-0.5">Flexografía HD</div>
              </div>
              <div class="bg-neutral-900/75 backdrop-blur-md p-3.5 rounded-2xl border border-neutral-700/60 shadow-lg">
                <div class="text-lg font-black text-amber-400 font-mono">FDA 21 CFR</div>
                <div class="text-[11px] text-neutral-300 font-mono uppercase mt-0.5">Inocuidad Alimentaria</div>
              </div>
            </div>

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
                  <img src="assets/img/salmon-vacio-premium.jpg" title="Salmón sellado al vacío" class="w-8 h-8 rounded-lg object-cover border border-sky-200 hover:scale-110 transition">
                  <img src="assets/img/corte-vacuno-tomahawk.jpg" title="Corte vacuno Tomahawk" class="w-8 h-8 rounded-lg object-cover border border-sky-200 hover:scale-110 transition">
                  <img src="assets/img/doypack-mariscos.jpg" title="Doypack mariscos" class="w-8 h-8 rounded-lg object-cover border border-sky-200 hover:scale-110 transition">
                  <img src="assets/img/embutidos-vacio.jpg" title="Cecinas y embutidos" class="w-8 h-8 rounded-lg object-cover border border-sky-200 hover:scale-110 transition">
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
        url: "/assets/img/salmon-vacio-premium.jpg",
        alt_text: "Salmón sellado al vacío",
        caption: "Máxima barrera de oxígeno para pescados."
      },
      {
        url: "/assets/img/corte-vacuno-tomahawk.jpg",
        alt_text: "Corte premium de carne de vacuno sellado al vacío",
        caption: "Presentación y vida útil para carnes rojas."
      },
      {
        url: "/assets/img/doypack-mariscos.jpg",
        alt_text: "Bolsa Doypack con mariscos mixtos",
        caption: "Soluciones Doypack para productos procesados."
      },
      {
        url: "/assets/img/embutidos-vacio.jpg",
        alt_text: "Cecinas y embutidos sellados al vacío",
        caption: "Protección prolongada y brillo estético."
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
    const bg = isDark ? 'bg-[#0a0a0a] border-neutral-800 text-neutral-400' : 'bg-[#020814] border-slate-900 text-slate-500';
    const dot = isDark ? 'bg-amber-400 shadow-sm shadow-amber-400/50' : 'bg-sky-400';
    const subtitle = isDark ? '• Empaques de Alta Barrera para la Industria Alimentaria Nacional' : '• Importación & Venta Mayorista de Bolsas al Vacío y Doypack';

    return `
      <footer class="${bg} border-t py-12 text-xs font-mono">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full ${dot}"></span>
            <span class="text-white font-bold uppercase tracking-wider">WellPack</span>
            <span>${subtitle}</span>
          </div>
          <div>
            <span class="text-neutral-500">Desarrollado con Google Antigravity • Supabase • Make.com</span>
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

    this.updatePricingSummary();
    this.bindAlibabaSectionEvents();
    this.updateAlibabaSectionCalculations();
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
