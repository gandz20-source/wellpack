// ============================================================================
// WELLPACK CHILE — MÓDULO INTERACTIVO DE INGENIERÍA EN BIOGÁS Y VALORIZACIÓN
// Planos CAD 2D en Planta (SVG), Calculadora Reactiva de Retorno y Conexión Corfo
// ============================================================================

export const BIOGAS_PROPOSALS = {
  1: {
    id: 1,
    tabCode: '01 · MICRO-PLANTA 3,5 m³',
    shortTitle: 'Propuesta 1 — Micro-Planta / Piloto Solar (3,5 m³)',
    badge: 'INSTALACIÓN EN 2 HORAS · SIN EXCAVACIÓN',
    profile: 'Caletas, pesqueras artesanales, casinos industriales o validación piloto.',
    loadCapacity: '25 kg/día de residuos orgánicos.',
    biogasOutput: '2,1 m³/día de biogás (63 m³/mes) | 3,4 kWh/día (102 kWh/mes).',
    monthlyReturn: 'Autoconsumo térmico/eléctrico piloto + eliminación de retiro de orgánicos en casino/caleta.',
    spaceTotal: '8 m² totales (4,0 m × 2,0 m)',
    netFootprint: 'Huella neta del equipo: 1,87 m² (1,95 m × 0,98 m × 1,85 m alto).',
    equipment: [
      'Biodigestor integrado de 3,5 m³ con invernadero térmico solar pasivo.',
      'Triturador de entrada de acero inoxidable (Crusher compacto).',
      'Bomba de alimentación y sistema agitador integrado.',
      'Instalación rápida en 2 horas sobre superficie nivelada sin excavación.'
    ],
    corfoProgram: 'Sercotec Crece / Crédito Corfo MiPyme',
    blueprintTitle: 'PLANO DE PLANTA CAD-01 · MICRO-PLANTA SOLAR 3,5 m³',
    blueprintScale: 'Escala 1:25 · Superficie Total: 8,0 m² (4,0 m × 2,0 m)'
  },
  2: {
    id: 2,
    tabCode: '02 · MODULAR ECPC 100 m³',
    shortTitle: 'Propuesta 2 — Planta Modular Pequeña ECPC (100 m³)',
    badge: 'RETORNO ~$1,78M CLP/MES',
    profile: 'Plantas de proceso pequeñas con descartes diarios moderados.',
    loadCapacity: '1,2 Toneladas/día de residuos orgánicos + RILES.',
    biogasOutput: '100 m³/día de biogás (3.000 m³/mes) | 4.860 kWh/mes de electricidad.',
    monthlyReturn: '~$705.000 CLP/mes en ahorro eléctrico + ~$1.080.000 CLP/mes de ahorro en vertedero = ~$1.785.000 CLP/mes.',
    spaceTotal: '96 m² totales (12,0 m × 8,0 m)',
    netFootprint: 'Reactor ECPC Diámetro 5,2 m + Foso recepción + Skid purificación + Generador.',
    equipment: [
      'Foso de recepción, trituración (Crusher) y homogeneización (2,5 m × 2,5 m).',
      'Reactor anaeróbico ECPC de 100 m³ con domo acumulador integrado en techo (Diám. 5,2 m).',
      'Skid de deshidratación y desulfuración de H₂S (2,5 m × 1,5 m).',
      'Grupo electrógeno a biogás insonorizado (3,0 m × 1,8 m) con tablero de control.'
    ],
    corfoProgram: 'Crédito Corfo MiPyme (Leasing) / Crédito Verde',
    blueprintTitle: 'PLANO DE PLANTA CAD-02 · PLANTA MODULAR ECPC 100 m³',
    blueprintScale: 'Escala 1:75 · Superficie Total: 96,0 m² (12,0 m × 8,0 m)'
  },
  3: {
    id: 3,
    tabCode: '03 · COMPACTA 1.000 m³ (DOMO TECHO)',
    shortTitle: 'Propuesta 3 — Planta Industrial Compacta 1.000 m³ (Domo en Techo)',
    badge: 'RETORNO ~$16,04M CLP/MES · PATIO REDUCIDO',
    profile: 'Planta pesquera o frigorífico mediano/grande en recinto portuario con poco patio disponible.',
    loadCapacity: '10 a 12 Toneladas/día de descartes sólidos + 25 m³/día de agua residual (RILES).',
    biogasOutput: '1.000 m³/día de biogás (30.000 m³/mes) | 1.620 kWh/día (48.600 kWh/mes, generador continuo de ~68 kW).',
    monthlyReturn: '$7.047.000 CLP/mes en ahorro eléctrico directo (a $145/kWh) + ~$9.000.000 CLP/mes de ahorro por no enviar 300 ton/mes a vertedero = ~$16.047.000 CLP/mes + agua caliente sanitaria gratis.',
    spaceTotal: '252 m² totales (18,0 m × 14,0 m)',
    netFootprint: 'Tanque ECPC 1.000 m³ (Diám. 11,0 m = 95 m²) con cúpula de doble membrana integrada en techo.',
    equipment: [
      'Tanque Reactor ECPC 1.000 m³ con chaqueta aislante térmica y cúpula de gas PVDF integrada en techo.',
      'Deshidratador industrial Modelo-1000 y torres desulfuradoras para 1.000 m³/día.',
      'Antorcha de seguridad automática (3,0 m × 3,0 m).',
      'Grupo electrógeno CHP de 68 kW continuos + recuperación de agua caliente + Tablero PLC Siemens.'
    ],
    corfoProgram: 'Crédito Verde Corfo + Ley Incentivo Tributario I+D (35%)',
    blueprintTitle: 'PLANO DE PLANTA CAD-03 · INDUSTRIAL COMPACTA 1.000 m³ (DOMO EN TECHO)',
    blueprintScale: 'Escala 1:100 · Superficie Total: 252,0 m² (18,0 m × 14,0 m)'
  },
  4: {
    id: 4,
    tabCode: '04 · EXTENDIDA 1.000 m³ + DOMO 500 m³',
    shortTitle: 'Propuesta 4 — Planta Industrial Extendida 1.000 m³ + Domo en Suelo 500 m³',
    badge: 'PULMÓN PRESURIZADO PARA HORAS PUNTA Y CALDERAS',
    profile: 'Planta industrial con patio holgado que requiere mayor pulmón de almacenamiento de gas para cubrir horas punta eléctricas y calderas de vapor.',
    loadCapacity: '10 a 12 Toneladas/día de descartes orgánicos + RILES.',
    biogasOutput: '1.000 m³/día de biogás (30.000 m³/mes) + 500 m³ de pulmón presurizado en domo independiente | 48.600 kWh/mes.',
    monthlyReturn: '$16.047.000 CLP/mes en ahorro combinado (electricidad + eliminación de vertedero) + máxima flexibilidad en horas punta.',
    spaceTotal: '396 m² totales (22,0 m × 18,0 m)',
    netFootprint: 'Reactor ECPC 1.000 m³ (95 m²) + Gasómetro independiente de Doble Membrana 500 m³ (80 m²).',
    equipment: [
      'Unidad de Recepción, Trituración y Pre-Mezcla (5,0 m × 4,0 m = 20 m²).',
      'Reactor Anaeróbico ECPC 1.000 m³ (Diám. 11,0 m = 95 m²) con calefacción interna 35°C–38°C.',
      'Gasómetro en suelo de Doble Membrana PVDF/PVC de 500 m³ (Diám. 10,0 m = 80 m²).',
      'Separador sólido-líquido de Biofertilizante (4,0 m × 3,0 m) + Skid Desulfuración 1.000 m³ (5,0 m × 3,0 m).',
      'Contenedor Generador CHP + Conexión Caldera + Tablero PLC Siemens (8,0 m × 2,5 m = 20 m²).'
    ],
    corfoProgram: 'Crédito Verde Corfo + Ley Incentivo Tributario I+D (35%)',
    blueprintTitle: 'PLANO DE PLANTA CAD-04 · INDUSTRIAL EXTENDIDA 1.000 m³ + DOMO 500 m³',
    blueprintScale: 'Escala 1:125 · Superficie Total: 396,0 m² (22,0 m × 18,0 m)'
  },
  '5A': {
    id: '5A',
    tabCode: '05 · MEGA-PLANTA 6.000 m³ / JCNCS',
    shortTitle: 'Propuesta 5A — Batería Mayor Biogás 6.000 m³ (2×3.000 m³ + 2 Domos 600 m³)',
    badge: 'FLUJO POSITIVO ~$52,6M CLP/MES · GRAN ESCALA',
    profile: 'Grandes complejos pesqueros, salmoneros, frigoríficos de exportación o plantas agroindustriales.',
    loadCapacity: '35 a 40 Toneladas/día de descartes orgánicos industriales + RILES.',
    biogasOutput: '3.000 m³/día de biogás (90.000 m³/mes) → 145.800 kWh/mes de energía eléctrica limpia.',
    monthlyReturn: '$21.141.000 CLP/mes en ahorro de electricidad + $31.500.000 CLP/mes en ahorro de vertedero = $52.641.000 CLP/mes totales.',
    spaceTotal: '1.200 m² totales (40,0 m × 30,0 m)',
    netFootprint: '2 Reactores ECPC de 3.000 m³ c/u + 2 Domos de Doble Membrana de 600 m³ c/u + Tren CHP.',
    equipment: [
      '2 Reactores Anaeróbicos ECPC de 3.000 m³ cada uno (6.000 m³ totales de digestión).',
      '2 Gasómetros independientes de Doble Membrana PVDF de 600 m³ cada uno (1.200 m³ de pulmón).',
      'Planta automatizada de recepción, trituración pesada y bombeo de RILES.',
      'Tren industrial de deshidratación, desulfuración biológica/química y antorcha de emergencia.',
      'Central de Cogeneración (CHP) paralela + Subestación 380V + SCADA PLC Siemens.'
    ],
    corfoProgram: 'Crédito Verde Corfo Corporativo + Ley I+D (35%) + Excepción Rentas Pasivas',
    blueprintTitle: 'PLANO DE PLANTA CAD-05A · BATERÍA MAYOR 6.000 m³ (2×3.000 m³ + 2 DOMOS 600 m³)',
    blueprintScale: 'Escala 1:250 · Superficie Total: 1.200,0 m² (40,0 m × 30,0 m)'
  },
  '5B': {
    id: '5B',
    tabCode: '05 · MEGA-PLANTA 6.000 m³ / JCNCS',
    shortTitle: 'Propuesta 5B — Valorización Sólida sin Gas: Compostaje Nanomembrana e-PTFE (JCNCS) / Contenedor 24 m³',
    badge: ' BIOFERTILIZANTE COMERCIAL EN 20–25 DÍAS · 0% OLOR',
    profile: 'Plantas pesqueras o cárnicas que buscan transformar descartes sólidos directamente en biofertilizante comercial sin línea de gas.',
    loadCapacity: 'Hasta 3.000 Ton/año en Cancha JCNCS o procesamiento modular en Contenedor Cerrado de 24 m³.',
    biogasOutput: 'Proceso aeróbico termofílico a 70°C (Sin biogás; consumo ultra bajo de apenas 50 kWh/día).',
    monthlyReturn: '100% eliminación de costos de vertedero + venta o uso de biofertilizante orgánico higienizado libre de patógenos.',
    spaceTotal: 'Contenedor 24 m³: 50 m² (10,0 m × 5,0 m) | Cancha JCNCS: 240 m² (20,0 m × 12,0 m)',
    netFootprint: 'Tecnología de cubierta microporosa e-PTFE impermeable a lluvia y hermética a olores.',
    equipment: [
      'Opción Compacta (50 m²): Reactor en Contenedor Cerrado de 24 m³ con volteo e inyección de oxígeno.',
      'Opción Cancha JCNCS (240 m²): Sistema de cubierta de Nanomembrana e-PTFE para 3.000 ton/año.',
      'Trincheras de aireación forzada a presión positiva y sondas de temperatura/oxígeno.',
      'Control automático por PLC Siemens y monitoreo remoto desde App móvil (70°C en 20–25 días).'
    ],
    corfoProgram: 'Crédito Verde Corfo Economía Circular + Crédito Corfo MiPyme',
    blueprintTitle: 'PLANO DE PLANTA CAD-05B · NANOMEMBRANA e-PTFE (240 m²) & CONTENEDOR 24 m³ (50 m²)',
    blueprintScale: 'Escala Dual · Cancha JCNCS: 20,0 m × 12,0 m (240 m²) | Contenedor: 10,0 m × 5,0 m (50 m²)'
  }
};

export function renderBlueprintSVG(key) {
  switch (String(key)) {
    case '1':
      return `
        <svg viewBox="0 0 680 420" class="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid1" width="25" height="25" patternUnits="userSpaceOnUse">
              <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#1E293B" stroke-width="1"/>
            </pattern>
            <pattern id="grid1Major" width="100" height="100" patternUnits="userSpaceOnUse">
              <rect width="100" height="100" fill="url(#grid1)"/>
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#334155" stroke-width="1.2"/>
            </pattern>
          </defs>
          <rect width="680" height="420" rx="8" fill="#0F172A"/>
          <rect x="20" y="20" width="640" height="380" fill="url(#grid1Major)" stroke="#38BDF8" stroke-opacity="0.35"/>

          <!-- Cota Superior Horizontal: 4,0 m -->
          <line x1="120" y1="62" x2="560" y2="62" stroke="#38BDF8" stroke-width="1.8"/>
          <line x1="120" y1="52" x2="120" y2="72" stroke="#38BDF8" stroke-width="2"/>
          <line x1="560" y1="52" x2="560" y2="72" stroke="#38BDF8" stroke-width="2"/>
          <rect x="275" y="48" width="130" height="26" rx="4" fill="#0F172A" stroke="#38BDF8" stroke-width="1.4"/>
          <text x="340" y="65" text-anchor="middle" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-size="13" font-weight="700">LARGO: 4,0 m</text>

          <!-- Cota Izquierda Vertical: 2,0 m -->
          <line x1="74" y1="95" x2="74" y2="315" stroke="#38BDF8" stroke-width="1.8"/>
          <line x1="64" y1="95" x2="84" y2="95" stroke="#38BDF8" stroke-width="2"/>
          <line x1="64" y1="315" x2="84" y2="315" stroke="#38BDF8" stroke-width="2"/>
          <rect x="30" y="192" width="88" height="26" rx="4" fill="#0F172A" stroke="#38BDF8" stroke-width="1.4"/>
          <text x="74" y="209" text-anchor="middle" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">2,0 m</text>

          <!-- Perímetro Losa 4,0m x 2,0m (8 m²) -->
          <rect x="120" y="95" width="440" height="220" rx="6" fill="#0B1324" stroke="#38BDF8" stroke-width="2.5" stroke-dasharray="8 4"/>

          <!-- Bloque 1: Triturador + Bomba (0,8m x 0,8m) -->
          <rect x="148" y="122" width="92" height="92" rx="6" fill="#1E293B" stroke="#38BDF8" stroke-width="2.2"/>
          <text x="194" y="158" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800">TRITURADOR</text>
          <text x="194" y="174" text-anchor="middle" fill="#38BDF8" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="700">+ BOMBA</text>
          <text x="194" y="194" text-anchor="middle" fill="#94A3B8" font-family="JetBrains Mono, monospace" font-size="11">0,8 × 0,8 m</text>

          <!-- Línea de Flujo RILES / Orgánico -->
          <line x1="240" y1="168" x2="298" y2="168" stroke="#10B981" stroke-width="4" stroke-dasharray="6 4"/>
          <polygon points="298,168 288,162 288,174" fill="#10B981"/>

          <!-- Bloque 2: Biodigestor Solar 3,5 m³ (1,95m x 0,98m) -->
          <rect x="300" y="114" width="228" height="108" rx="10" fill="#064E3B" fill-opacity="0.55" stroke="#10B981" stroke-width="2.5"/>
          <rect x="312" y="124" width="204" height="88" rx="6" fill="none" stroke="#34D399" stroke-width="1.2" stroke-dasharray="5 3"/>
          <text x="414" y="154" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800">BIODIGESTOR SOLAR 3,5 m³</text>
          <text x="414" y="173" text-anchor="middle" fill="#6EE7B7" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">1,95 m × 0,98 m (Alt. 1,85 m)</text>
          <text x="414" y="192" text-anchor="middle" fill="#A7F3D0" font-family="Inter, sans-serif" font-size="11">Invernadero Solar + Agitador (1,87 m²)</text>

          <!-- Pasillo de Operación (0,8 m) -->
          <rect x="148" y="238" width="380" height="58" rx="4" fill="#0F172A" stroke="#64748B" stroke-width="1.5" stroke-dasharray="4 4"/>
          <text x="338" y="271" text-anchor="middle" fill="#CBD5E1" font-family="JetBrains Mono, monospace" font-size="12" font-weight="600">PASILLO DE OPERACIÓN E INSPECCIÓN (ANCHO: 0,8 m)</text>

          <!-- Leyenda Inferior CAD -->
          <rect x="120" y="338" width="440" height="44" rx="4" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
          <circle cx="144" cy="360" r="6" fill="#10B981"/>
          <text x="158" y="364" fill="#E2E8F0" font-family="Inter, sans-serif" font-size="12" font-weight="600">Producción: 2,1 m³/día Biogás (102 kWh/mes)</text>
          <text x="542" y="364" text-anchor="end" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">ÁREA TOTAL: 8,0 m²</text>
        </svg>
      `;

    case '2':
      return `
        <svg viewBox="0 0 680 420" class="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid2" width="25" height="25" patternUnits="userSpaceOnUse">
              <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#1E293B" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="680" height="420" rx="8" fill="#0F172A"/>
          <rect x="20" y="20" width="640" height="380" fill="url(#grid2)" stroke="#38BDF8" stroke-opacity="0.35"/>

          <!-- Cota Superior: 12,0 m -->
          <line x1="115" y1="54" x2="575" y2="54" stroke="#38BDF8" stroke-width="1.8"/>
          <line x1="115" y1="45" x2="115" y2="63" stroke="#38BDF8" stroke-width="2"/>
          <line x1="575" y1="45" x2="575" y2="63" stroke="#38BDF8" stroke-width="2"/>
          <rect x="275" y="40" width="140" height="25" rx="4" fill="#0F172A" stroke="#38BDF8" stroke-width="1.4"/>
          <text x="345" y="57" text-anchor="middle" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-size="13" font-weight="700">LARGO: 12,0 m</text>

          <!-- Cota Izquierda: 8,0 m -->
          <line x1="68" y1="82" x2="68" y2="334" stroke="#38BDF8" stroke-width="1.8"/>
          <line x1="58" y1="82" x2="78" y2="82" stroke="#38BDF8" stroke-width="2"/>
          <line x1="58" y1="334" x2="78" y2="334" stroke="#38BDF8" stroke-width="2"/>
          <rect x="26" y="195" width="84" height="25" rx="4" fill="#0F172A" stroke="#38BDF8" stroke-width="1.4"/>
          <text x="68" y="212" text-anchor="middle" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">8,0 m</text>

          <!-- Perímetro 12,0m x 8,0m (96 m²) -->
          <rect x="115" y="82" width="460" height="252" rx="6" fill="#0B1324" stroke="#38BDF8" stroke-width="2.5" stroke-dasharray="8 4"/>

          <!-- 1. Foso Trituración (2,5 x 2,5 m) -->
          <rect x="138" y="112" width="96" height="96" rx="6" fill="#1E293B" stroke="#38BDF8" stroke-width="2.2"/>
          <text x="186" y="150" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800">FOSO</text>
          <text x="186" y="166" text-anchor="middle" fill="#38BDF8" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="700">TRITURACIÓN</text>
          <text x="186" y="186" text-anchor="middle" fill="#94A3B8" font-family="JetBrains Mono, monospace" font-size="11">2,5 × 2,5 m</text>

          <!-- Tubería a Reactor -->
          <line x1="234" y1="160" x2="268" y2="188" stroke="#10B981" stroke-width="3.5"/>

          <!-- 2. Círculo Reactor ECPC 100 m³ + Domo en Techo (Diám 5,2 m) -->
          <circle cx="338" cy="206" r="84" fill="#064E3B" fill-opacity="0.55" stroke="#10B981" stroke-width="2.8"/>
          <circle cx="338" cy="206" r="68" fill="none" stroke="#34D399" stroke-width="1.4" stroke-dasharray="6 4"/>
          <text x="338" y="192" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800">REACTOR ECPC 100 m³</text>
          <text x="338" y="210" text-anchor="middle" fill="#6EE7B7" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="700">+ DOMO EN TECHO</text>
          <text x="338" y="229" text-anchor="middle" fill="#A7F3D0" font-family="JetBrains Mono, monospace" font-size="11">Diám. 5,2 m (21,2 m²)</text>

          <!-- Línea de Biogás a Purificación -->
          <path d="M 405 154 L 444 134" stroke="#10B981" stroke-width="3.5" stroke-dasharray="5 3"/>

          <!-- 3. Skid Purificación (2,5 x 1,5 m) -->
          <rect x="444" y="104" width="112" height="68" rx="6" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
          <text x="500" y="132" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="11.5" font-weight="800">SKID PURIFICACIÓN</text>
          <text x="500" y="148" text-anchor="middle" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-size="11">Desulfurador H₂S</text>
          <text x="500" y="163" text-anchor="middle" fill="#94A3B8" font-family="JetBrains Mono, monospace" font-size="10.5">2,5 × 1,5 m</text>

          <!-- Línea a Generador -->
          <line x1="500" y1="172" x2="500" y2="218" stroke="#10B981" stroke-width="3.5"/>

          <!-- 4. Generador Biogás (3,0 x 1,8 m) -->
          <rect x="438" y="218" width="120" height="84" rx="6" fill="#0F2942" stroke="#38BDF8" stroke-width="2.4"/>
          <text x="498" y="250" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800">GENERADOR BIOGÁS</text>
          <text x="498" y="267" text-anchor="middle" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">4.860 kWh/mes</text>
          <text x="498" y="285" text-anchor="middle" fill="#94A3B8" font-family="JetBrains Mono, monospace" font-size="11">3,0 × 1,8 m</text>

          <!-- Barra inferior CAD -->
          <rect x="115" y="348" width="460" height="40" rx="4" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
          <circle cx="136" cy="368" r="6" fill="#10B981"/>
          <text x="150" y="372" fill="#E2E8F0" font-family="Inter, sans-serif" font-size="12" font-weight="600">Capacidad: 1,2 Ton/día | Ahorro: ~$1.785.000 CLP/mes</text>
          <text x="560" y="372" text-anchor="end" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">ÁREA: 96,0 m²</text>
        </svg>
      `;

    case '3':
      return `
        <svg viewBox="0 0 680 420" class="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid3" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1E293B" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="680" height="420" rx="8" fill="#0F172A"/>
          <rect x="20" y="20" width="640" height="380" fill="url(#grid3)" stroke="#38BDF8" stroke-opacity="0.35"/>

          <!-- Cota Superior: 18,0 m -->
          <line x1="108" y1="50" x2="588" y2="50" stroke="#38BDF8" stroke-width="1.8"/>
          <line x1="108" y1="41" x2="108" y2="59" stroke="#38BDF8" stroke-width="2"/>
          <line x1="588" y1="41" x2="588" y2="59" stroke="#38BDF8" stroke-width="2"/>
          <rect x="278" y="36" width="140" height="25" rx="4" fill="#0F172A" stroke="#38BDF8" stroke-width="1.4"/>
          <text x="348" y="53" text-anchor="middle" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-size="13" font-weight="700">LARGO: 18,0 m</text>

          <!-- Cota Izquierda: 14,0 m -->
          <line x1="64" y1="76" x2="64" y2="338" stroke="#38BDF8" stroke-width="1.8"/>
          <line x1="54" y1="76" x2="74" y2="76" stroke="#38BDF8" stroke-width="2"/>
          <line x1="54" y1="338" x2="74" y2="338" stroke="#38BDF8" stroke-width="2"/>
          <rect x="20" y="194" width="88" height="25" rx="4" fill="#0F172A" stroke="#38BDF8" stroke-width="1.4"/>
          <text x="64" y="211" text-anchor="middle" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">14,0 m</text>

          <!-- Perímetro 18,0m x 14,0m (252 m²) -->
          <rect x="108" y="76" width="480" height="262" rx="6" fill="#0B1324" stroke="#38BDF8" stroke-width="2.5" stroke-dasharray="8 4"/>

          <!-- 1. Recepción y Pre-Mezcla (4x4m = 16 m²) -->
          <rect x="124" y="96" width="90" height="90" rx="6" fill="#1E293B" stroke="#38BDF8" stroke-width="2.2"/>
          <text x="169" y="130" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="11.5" font-weight="800">RECEPCIÓN Y</text>
          <text x="169" y="146" text-anchor="middle" fill="#38BDF8" font-family="Plus Jakarta Sans, sans-serif" font-size="11.5" font-weight="700">PRE-MEZCLA</text>
          <text x="169" y="166" text-anchor="middle" fill="#94A3B8" font-family="JetBrains Mono, monospace" font-size="10.5">4×4 m (16 m²)</text>

          <!-- Flujo al Reactor -->
          <line x1="214" y1="154" x2="242" y2="176" stroke="#10B981" stroke-width="3.5"/>

          <!-- 2. Círculo Central: Tanque ECPC 1.000 m³ + Domo en Techo (Diám 11,0 m = 95 m²) -->
          <circle cx="328" cy="206" r="98" fill="#064E3B" fill-opacity="0.58" stroke="#10B981" stroke-width="3"/>
          <circle cx="328" cy="206" r="82" fill="none" stroke="#34D399" stroke-width="1.5" stroke-dasharray="6 4"/>
          <circle cx="328" cy="206" r="32" fill="#047857" fill-opacity="0.45" stroke="#6EE7B7" stroke-width="1.2"/>
          <text x="328" y="186" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="13.5" font-weight="800">TANQUE ECPC 1.000 m³</text>
          <text x="328" y="205" text-anchor="middle" fill="#6EE7B7" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700">+ DOMO EN TECHO</text>
          <text x="328" y="224" text-anchor="middle" fill="#A7F3D0" font-family="JetBrains Mono, monospace" font-size="11.5" font-weight="700">Diám. 11,0 m = 95 m²</text>
          <text x="328" y="242" text-anchor="middle" fill="#D1FAE5" font-family="Inter, sans-serif" font-size="10.5">Chaqueta Térmica 35°C–38°C</text>

          <!-- 3. Antorcha Seguridad (3x3m) -->
          <rect x="124" y="244" width="76" height="72" rx="6" fill="#1E293B" stroke="#F59E0B" stroke-width="2"/>
          <circle cx="162" cy="268" r="10" fill="#F59E0B" fill-opacity="0.25" stroke="#F59E0B" stroke-width="1.8"/>
          <text x="162" y="294" text-anchor="middle" fill="#FDE68A" font-family="Plus Jakarta Sans, sans-serif" font-size="10.5" font-weight="800">ANTORCHA</text>
          <text x="162" y="308" text-anchor="middle" fill="#94A3B8" font-family="JetBrains Mono, monospace" font-size="10">3,0 × 3,0 m</text>

          <!-- 4. Skid Purificación (4,5 x 3,0 m) -->
          <rect x="446" y="94" width="124" height="86" rx="6" fill="#1E293B" stroke="#38BDF8" stroke-width="2.2"/>
          <text x="508" y="124" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="11.5" font-weight="800">SKID PURIFICACIÓN</text>
          <text x="508" y="141" text-anchor="middle" fill="#38BDF8" font-family="Inter, sans-serif" font-size="10.5">Deshidratador Mod-1000</text>
          <text x="508" y="156" text-anchor="middle" fill="#6EE7B7" font-family="Inter, sans-serif" font-size="10.5">+ Torres H₂S 1.000 m³/d</text>
          <text x="508" y="172" text-anchor="middle" fill="#94A3B8" font-family="JetBrains Mono, monospace" font-size="10.5">4,5 × 3,0 m</text>

          <!-- Flujo Biogás Reactor -> Skid -> Generador -->
          <path d="M 412 152 L 446 138" stroke="#10B981" stroke-width="3.5" stroke-dasharray="5 3"/>
          <line x1="508" y1="180" x2="508" y2="220" stroke="#10B981" stroke-width="3.5"/>

          <!-- 5. Contenedor Generador 68kW + PLC Siemens (6,0 x 2,5 m = 15 m²) -->
          <rect x="440" y="220" width="132" height="98" rx="6" fill="#0F2942" stroke="#38BDF8" stroke-width="2.4"/>
          <text x="506" y="250" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="11.5" font-weight="800">CONTENEDOR CHP</text>
          <text x="506" y="266" text-anchor="middle" fill="#38BDF8" font-family="Plus Jakarta Sans, sans-serif" font-size="11.5" font-weight="700">68 kW + PLC SIEMENS</text>
          <text x="506" y="284" text-anchor="middle" fill="#6EE7B7" font-family="JetBrains Mono, monospace" font-size="10.5">48.600 kWh/mes</text>
          <text x="506" y="302" text-anchor="middle" fill="#94A3B8" font-family="JetBrains Mono, monospace" font-size="10.5">6,0 × 2,5 m (15 m²)</text>

          <!-- Barra inferior CAD -->
          <rect x="108" y="350" width="480" height="40" rx="4" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
          <circle cx="128" cy="370" r="6" fill="#10B981"/>
          <text x="142" y="374" fill="#E2E8F0" font-family="Inter, sans-serif" font-size="12" font-weight="600">10–12 Ton/día | Retorno: ~$16.047.000 CLP/mes</text>
          <text x="572" y="374" text-anchor="end" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">ÁREA: 252,0 m²</text>
        </svg>
      `;

    case '4':
      return `
        <svg viewBox="0 0 680 420" class="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid4" width="22" height="22" patternUnits="userSpaceOnUse">
              <path d="M 22 0 L 0 0 0 22" fill="none" stroke="#1E293B" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="680" height="420" rx="8" fill="#0F172A"/>
          <rect x="20" y="20" width="640" height="380" fill="url(#grid4)" stroke="#38BDF8" stroke-opacity="0.35"/>

          <!-- Cota Superior: 22,0 m -->
          <line x1="98" y1="48" x2="602" y2="48" stroke="#38BDF8" stroke-width="1.8"/>
          <line x1="98" y1="39" x2="98" y2="57" stroke="#38BDF8" stroke-width="2"/>
          <line x1="602" y1="39" x2="602" y2="57" stroke="#38BDF8" stroke-width="2"/>
          <rect x="280" y="34" width="140" height="25" rx="4" fill="#0F172A" stroke="#38BDF8" stroke-width="1.4"/>
          <text x="350" y="51" text-anchor="middle" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-size="13" font-weight="700">LARGO: 22,0 m</text>

          <!-- Cota Izquierda: 18,0 m -->
          <line x1="58" y1="74" x2="58" y2="338" stroke="#38BDF8" stroke-width="1.8"/>
          <line x1="48" y1="74" x2="68" y2="74" stroke="#38BDF8" stroke-width="2"/>
          <line x1="48" y1="338" x2="68" y2="338" stroke="#38BDF8" stroke-width="2"/>
          <rect x="18" y="194" width="80" height="25" rx="4" fill="#0F172A" stroke="#38BDF8" stroke-width="1.4"/>
          <text x="58" y="211" text-anchor="middle" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">18,0 m</text>

          <!-- Perímetro 22,0m x 18,0m (396 m²) -->
          <rect x="98" y="74" width="504" height="264" rx="6" fill="#0B1324" stroke="#38BDF8" stroke-width="2.5" stroke-dasharray="8 4"/>

          <!-- 1. Recepción y Trituración (5x4m = 20 m²) -->
          <rect x="112" y="92" width="88" height="72" rx="5" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
          <text x="156" y="122" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800">RECEPCIÓN Y</text>
          <text x="156" y="136" text-anchor="middle" fill="#38BDF8" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="700">TRITURACIÓN</text>
          <text x="156" y="152" text-anchor="middle" fill="#94A3B8" font-family="JetBrains Mono, monospace" font-size="10">5×4 m (20 m²)</text>

          <!-- 2. Separador Biofertilizante (4x3m) -->
          <rect x="112" y="246" width="88" height="72" rx="5" fill="#1E293B" stroke="#10B981" stroke-width="2"/>
          <text x="156" y="274" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="10.5" font-weight="800">SEPARADOR</text>
          <text x="156" y="289" text-anchor="middle" fill="#6EE7B7" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="700">BIOFERTILIZANTE</text>
          <text x="156" y="305" text-anchor="middle" fill="#94A3B8" font-family="JetBrains Mono, monospace" font-size="10">4,0 × 3,0 m</text>

          <!-- 3. Reactor ECPC 1.000 m³ (Diám 11,0m = 95 m²) -->
          <circle cx="282" cy="186" r="72" fill="#064E3B" fill-opacity="0.6" stroke="#10B981" stroke-width="2.8"/>
          <circle cx="282" cy="186" r="58" fill="none" stroke="#34D399" stroke-width="1.3" stroke-dasharray="5 3"/>
          <text x="282" y="175" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800">REACTOR ECPC</text>
          <text x="282" y="191" text-anchor="middle" fill="#6EE7B7" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800">1.000 m³</text>
          <text x="282" y="208" text-anchor="middle" fill="#A7F3D0" font-family="JetBrains Mono, monospace" font-size="10.5">Diám. 11m (95 m²)</text>

          <!-- 4. Domo Doble Membrana en Suelo 500 m³ (Diám 10,0m = 80 m²) -->
          <circle cx="430" cy="162" r="64" fill="#0C4A6E" fill-opacity="0.65" stroke="#38BDF8" stroke-width="2.6"/>
          <circle cx="430" cy="162" r="50" fill="none" stroke="#7DD3FC" stroke-width="1.3" stroke-dasharray="5 3"/>
          <text x="430" y="150" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="11.5" font-weight="800">DOMO DOBLE</text>
          <text x="430" y="165" text-anchor="middle" fill="#38BDF8" font-family="Plus Jakarta Sans, sans-serif" font-size="11.5" font-weight="800">MEMBRANA 500 m³</text>
          <text x="430" y="182" text-anchor="middle" fill="#BAE6FD" font-family="JetBrains Mono, monospace" font-size="10">Diám. 10m (80 m²)</text>

          <!-- Conexión Reactor -> Skid -> Domo -->
          <line x1="354" y1="175" x2="366" y2="170" stroke="#10B981" stroke-width="3.5"/>

          <!-- 5. Skid Desulfuración 1.000 m³ (5x3m) -->
          <rect x="506" y="92" width="82" height="106" rx="5" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
          <text x="547" y="130" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="10.5" font-weight="800">SKID</text>
          <text x="547" y="145" text-anchor="middle" fill="#38BDF8" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="700">DESULFURACIÓN</text>
          <text x="547" y="161" text-anchor="middle" fill="#6EE7B7" font-family="JetBrains Mono, monospace" font-size="10">1.000 m³/d</text>
          <text x="547" y="177" text-anchor="middle" fill="#94A3B8" font-family="JetBrains Mono, monospace" font-size="10">5,0 × 3,0 m</text>

          <!-- 6. Contenedor Generador + Caldera + PLC (8,0 x 2,5 m = 20 m²) -->
          <rect x="374" y="252" width="214" height="68" rx="6" fill="#0F2942" stroke="#38BDF8" stroke-width="2.4"/>
          <text x="481" y="279" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="11.5" font-weight="800">CONTENEDOR GENERADOR + CALDERA + PLC</text>
          <text x="481" y="296" text-anchor="middle" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">8,0 m × 2,5 m = 20 m² (Horas Punta + Vapor)</text>

          <!-- Barra inferior CAD -->
          <rect x="98" y="350" width="504" height="40" rx="4" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
          <circle cx="118" cy="370" r="6" fill="#10B981"/>
          <text x="132" y="374" fill="#E2E8F0" font-family="Inter, sans-serif" font-size="12" font-weight="600">1.000 m³/día + Pulmón 500 m³ | Retorno: $16.047.000 CLP/mes</text>
          <text x="588" y="374" text-anchor="end" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">ÁREA: 396,0 m²</text>
        </svg>
      `;

    case '5B':
      return `
        <svg viewBox="0 0 680 420" class="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid5b" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1E293B" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="680" height="420" rx="8" fill="#0F172A"/>
          <rect x="20" y="20" width="640" height="380" fill="url(#grid5b)" stroke="#38BDF8" stroke-opacity="0.35"/>

          <!-- LADO IZQUIERDO: CANCHA JCNCS NANOMEMBRANA e-PTFE (20,0m x 12,0m = 240 m²) -->
          <text x="230" y="52" text-anchor="middle" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-size="12.5" font-weight="700">OPCIÓN A: CANCHA JCNCS 20,0 m × 12,0 m (240 m²)</text>
          <rect x="56" y="68" width="348" height="252" rx="6" fill="#0B1324" stroke="#10B981" stroke-width="2.5" stroke-dasharray="8 4"/>

          <!-- 3 Pilas cubiertas con Nanomembrana e-PTFE -->
          <rect x="76" y="88" width="235" height="62" rx="10" fill="#064E3B" fill-opacity="0.65" stroke="#10B981" stroke-width="2.2"/>
          <line x1="90" y1="108" x2="295" y2="108" stroke="#34D399" stroke-width="1.5" stroke-dasharray="6 4"/>
          <line x1="90" y1="130" x2="295" y2="130" stroke="#34D399" stroke-width="1.5" stroke-dasharray="6 4"/>
          <text x="193" y="123" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="11.5" font-weight="800">MÓDULO 1 · NANOMEMBRANA e-PTFE (70°C)</text>

          <rect x="76" y="162" width="235" height="62" rx="10" fill="#064E3B" fill-opacity="0.65" stroke="#10B981" stroke-width="2.2"/>
          <line x1="90" y1="182" x2="295" y2="182" stroke="#34D399" stroke-width="1.5" stroke-dasharray="6 4"/>
          <line x1="90" y1="204" x2="295" y2="204" stroke="#34D399" stroke-width="1.5" stroke-dasharray="6 4"/>
          <text x="193" y="197" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="11.5" font-weight="800">MÓDULO 2 · TRINCHERAS AIREACIÓN FORZADA</text>

          <rect x="76" y="236" width="235" height="62" rx="10" fill="#064E3B" fill-opacity="0.65" stroke="#10B981" stroke-width="2.2"/>
          <text x="193" y="264" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="11.5" font-weight="800">MÓDULO 3 · MADURACIÓN BIOFERTILIZANTE</text>
          <text x="193" y="282" text-anchor="middle" fill="#6EE7B7" font-family="JetBrains Mono, monospace" font-size="10.5">Capacidad: 3.000 Ton/año · Ciclo 20–25 días</text>

          <!-- Sopladores + PLC en Cancha -->
          <rect x="324" y="88" width="64" height="210" rx="5" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
          <text x="356" y="180" text-anchor="middle" fill="#38BDF8" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" transform="rotate(-90 356 180)">SOPLADORES + PLC SIEMENS (50 kWh/d)</text>

          <!-- LADO DERECHO: CONTENEDOR CERRADO 24 m³ (10,0m x 5,0m = 50 m²) -->
          <text x="532" y="52" text-anchor="middle" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">OPCIÓN B: CONTENEDOR (50 m²)</text>
          <rect x="434" y="68" width="196" height="252" rx="6" fill="#0B1324" stroke="#38BDF8" stroke-width="2.5" stroke-dasharray="8 4"/>
          <rect x="456" y="96" width="152" height="145" rx="8" fill="#0F2942" stroke="#38BDF8" stroke-width="2.4"/>
          <text x="532" y="142" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="12.5" font-weight="800">CONTENEDOR</text>
          <text x="532" y="160" text-anchor="middle" fill="#38BDF8" font-family="Plus Jakarta Sans, sans-serif" font-size="12.5" font-weight="800">BIORREACTOR 24 m³</text>
          <text x="532" y="182" text-anchor="middle" fill="#6EE7B7" font-family="JetBrains Mono, monospace" font-size="11">10,0 m × 5,0 m (50 m²)</text>
          <text x="532" y="202" text-anchor="middle" fill="#CBD5E1" font-family="Inter, sans-serif" font-size="10.5">Control App Móvil + PLC</text>
          <rect x="456" y="256" width="152" height="44" rx="5" fill="#1E293B" stroke="#10B981" stroke-width="1.8"/>
          <text x="532" y="282" text-anchor="middle" fill="#6EE7B7" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">DESCARGA ABONO 70°C</text>

          <!-- Barra inferior CAD -->
          <rect x="56" y="344" width="574" height="42" rx="4" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
          <circle cx="78" cy="365" r="6" fill="#10B981"/>
          <text x="92" y="369" fill="#E2E8F0" font-family="Inter, sans-serif" font-size="12" font-weight="600">Valorización Sólida Aeróbica sin Olor | Consumo: solo 50 kWh/día</text>
          <text x="614" y="369" text-anchor="end" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">50 m² / 240 m²</text>
        </svg>
      `;

    case '5A':
    default:
      return `
        <svg viewBox="0 0 680 420" class="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid5a" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1E293B" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="680" height="420" rx="8" fill="#0F172A"/>
          <rect x="20" y="20" width="640" height="380" fill="url(#grid5a)" stroke="#38BDF8" stroke-opacity="0.35"/>

          <!-- Cota Superior: 40,0 m -->
          <line x1="92" y1="46" x2="612" y2="46" stroke="#38BDF8" stroke-width="1.8"/>
          <rect x="278" y="32" width="148" height="24" rx="4" fill="#0F172A" stroke="#38BDF8" stroke-width="1.4"/>
          <text x="352" y="48" text-anchor="middle" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-size="12.5" font-weight="700">LARGO: 40,0 m</text>

          <!-- Cota Izquierda: 30,0 m -->
          <line x1="56" y1="70" x2="56" y2="338" stroke="#38BDF8" stroke-width="1.8"/>
          <rect x="16" y="192" width="80" height="24" rx="4" fill="#0F172A" stroke="#38BDF8" stroke-width="1.4"/>
          <text x="56" y="208" text-anchor="middle" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">30,0 m</text>

          <!-- Perímetro 40,0m x 30,0m (1.200 m²) -->
          <rect x="92" y="70" width="520" height="268" rx="6" fill="#0B1324" stroke="#38BDF8" stroke-width="2.5" stroke-dasharray="8 4"/>

          <!-- Recepción Industrial -->
          <rect x="108" y="88" width="76" height="230" rx="5" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
          <text x="146" y="203" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="11.5" font-weight="800" transform="rotate(-90 146 203)">RECEPCIÓN Y HOMOGENEIZACIÓN (35–40 TON/DÍA)</text>

          <!-- 2 Reactores ECPC de 3.000 m³ c/u -->
          <circle cx="256" cy="142" r="54" fill="#064E3B" fill-opacity="0.62" stroke="#10B981" stroke-width="2.8"/>
          <text x="256" y="138" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800">REACTOR ECPC 1</text>
          <text x="256" y="154" text-anchor="middle" fill="#6EE7B7" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">3.000 m³</text>

          <circle cx="256" cy="264" r="54" fill="#064E3B" fill-opacity="0.62" stroke="#10B981" stroke-width="2.8"/>
          <text x="256" y="260" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800">REACTOR ECPC 2</text>
          <text x="256" y="276" text-anchor="middle" fill="#6EE7B7" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">3.000 m³</text>

          <!-- 2 Domos Doble Membrana de 600 m³ c/u -->
          <circle cx="386" cy="142" r="46" fill="#0C4A6E" fill-opacity="0.65" stroke="#38BDF8" stroke-width="2.5"/>
          <text x="386" y="138" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="10.5" font-weight="800">DOMO GAS 1</text>
          <text x="386" y="153" text-anchor="middle" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="700">600 m³</text>

          <circle cx="386" cy="264" r="46" fill="#0C4A6E" fill-opacity="0.65" stroke="#38BDF8" stroke-width="2.5"/>
          <text x="386" y="260" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="10.5" font-weight="800">DOMO GAS 2</text>
          <text x="386" y="275" text-anchor="middle" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="700">600 m³</text>

          <!-- Tren Desulfuración + Central Cogeneración CHP -->
          <rect x="454" y="88" width="142" height="102" rx="6" fill="#1E293B" stroke="#10B981" stroke-width="2.2"/>
          <text x="525" y="128" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800">TREN DESULFURACIÓN</text>
          <text x="525" y="145" text-anchor="middle" fill="#6EE7B7" font-family="JetBrains Mono, monospace" font-size="10.5">3.000 m³/día Biogás</text>
          <text x="525" y="163" text-anchor="middle" fill="#94A3B8" font-family="Inter, sans-serif" font-size="10">Secado + Torres H₂S + Antorcha</text>

          <rect x="454" y="206" width="142" height="112" rx="6" fill="#0F2942" stroke="#38BDF8" stroke-width="2.4"/>
          <text x="525" y="244" text-anchor="middle" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="11.5" font-weight="800">CENTRAL CHP + PLC</text>
          <text x="525" y="262" text-anchor="middle" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700">145.800 kWh/mes</text>
          <text x="525" y="280" text-anchor="middle" fill="#6EE7B7" font-family="JetBrains Mono, monospace" font-size="10.5">380V + Agua Caliente</text>
          <text x="525" y="298" text-anchor="middle" fill="#94A3B8" font-family="Inter, sans-serif" font-size="10">SCADA Siemens S7</text>

          <!-- Barra inferior CAD -->
          <rect x="92" y="348" width="520" height="40" rx="4" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
          <circle cx="114" cy="368" r="6" fill="#10B981"/>
          <text x="128" y="372" fill="#E2E8F0" font-family="Inter, sans-serif" font-size="12" font-weight="600">Batería 6.000 m³ | Flujo Positivo: ~$52.641.000 CLP/mes</text>
          <text x="596" y="372" text-anchor="end" fill="#38BDF8" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700">ÁREA: 1.200 m²</text>
        </svg>
      `;
  }
}

export function formatCLP(num) {
  return '$' + Math.round(num).toLocaleString('es-CL');
}

export function formatNumber(num) {
  return Math.round(num).toLocaleString('es-CL');
}

export function initBiogasPage() {
  let activeTab = '3'; // Por defecto mostramos la Propuesta 3 (Industrial Compacta 1.000 m³) o Tab 1
  let tab5Variant = '5A';

  // Estado reactivo de la calculadora
  const calcState = {
    tonsPerDay: 10,
    landfillCostPerTon: 30000,
    patioCategory: '250', // '40' (<50m2), '250' (100-280m2), '400' (350-450m2), '1200' (>1000m2)
    recommendedKey: '3'
  };

  function renderProposalPanel(key) {
    const actualKey = key === '5' ? tab5Variant : String(key);
    const prop = BIOGAS_PROPOSALS[actualKey] || BIOGAS_PROPOSALS['3'];

    const detailsContainer = document.getElementById('biogas-proposal-details');
    const blueprintContainer = document.getElementById('biogas-blueprint-canvas');
    const blueprintTitle = document.getElementById('biogas-blueprint-title');
    const blueprintScale = document.getElementById('biogas-blueprint-scale');

    if (blueprintTitle) blueprintTitle.textContent = prop.blueprintTitle;
    if (blueprintScale) blueprintScale.textContent = prop.blueprintScale;
    if (blueprintContainer) blueprintContainer.innerHTML = renderBlueprintSVG(actualKey);

    if (detailsContainer) {
      const variantSelectorHtml = (key === '5' || actualKey === '5A' || actualKey === '5B') ? `
        <div class="mb-5 p-3 rounded-lg bg-slate-900 border border-slate-700">
          <div class="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2">
            Seleccione Variante de Propuesta 5:
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button type="button" data-variant="5A" class="btn-p5-variant px-3 py-2 rounded-md text-xs font-bold text-left border transition-all ${actualKey === '5A' ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'}">
              1. Batería Mayor Biogás 6.000 m³ (1.200 m²)
            </button>
            <button type="button" data-variant="5B" class="btn-p5-variant px-3 py-2 rounded-md text-xs font-bold text-left border transition-all ${actualKey === '5B' ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'}">
              2. Compostaje Nanomembrana e-PTFE / 24 m³
            </button>
          </div>
        </div>
      ` : '';

      detailsContainer.innerHTML = `
        ${variantSelectorHtml}
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 font-mono text-xs font-bold mb-3">
          <span>●</span>
          <span>${prop.badge}</span>
        </div>

        <h3 class="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 mb-2 leading-tight">
          ${prop.shortTitle}
        </h3>
        <p class="text-sm text-slate-600 mb-5 leading-relaxed">
          <strong class="text-slate-800">Perfil Ideal:</strong> ${prop.profile}
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div class="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Capacidad de Carga</div>
            <div class="text-sm font-bold text-slate-900">${prop.loadCapacity}</div>
          </div>
          <div class="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Espacio Requerido en Planta</div>
            <div class="text-sm font-extrabold text-sky-700 font-mono">${prop.spaceTotal}</div>
          </div>
          <div class="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200 sm:col-span-2">
            <div class="text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-1">Producción Energética Continua</div>
            <div class="text-sm font-bold text-emerald-950">${prop.biogasOutput}</div>
          </div>
          <div class="p-3.5 rounded-lg bg-amber-50/80 border border-amber-200 sm:col-span-2">
            <div class="text-[11px] font-bold uppercase tracking-wider text-amber-900 mb-1">Retorno / Ahorro Mensual Estimado</div>
            <div class="text-sm font-bold text-slate-900">${prop.monthlyReturn}</div>
          </div>
        </div>

        <div class="mb-5">
          <div class="text-xs font-heading font-extrabold uppercase tracking-wider text-slate-800 mb-2.5">
            Equipamiento Llave en Mano Incluido:
          </div>
          <ul class="space-y-2">
            ${prop.equipment.map(item => `
              <li class="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                <span class="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                <span>${item}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="p-3.5 rounded-lg bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
          <div>
            <div class="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Ruta de Financiamiento Sugerida</div>
            <div class="text-xs sm:text-sm font-heading font-bold text-white">${prop.corfoProgram}</div>
          </div>
          <a href="#biogas-contact-section" onclick="window.selectProposalForQuote('${prop.shortTitle}')" class="px-4 py-2 rounded-md bg-[#10B981] hover:bg-[#059669] text-slate-950 font-heading font-extrabold text-xs uppercase tracking-wider transition-colors">
            Cotizar Esta Planta ↗
          </a>
        </div>
      `;

      // Bind sub-variant buttons if in Tab 5
      detailsContainer.querySelectorAll('.btn-p5-variant').forEach(btn => {
        btn.addEventListener('click', () => {
          tab5Variant = btn.dataset.variant;
          renderProposalPanel('5');
        });
      });
    }
  }

  // Inicializar Tabs de las 5 Propuestas
  const tabButtons = document.querySelectorAll('.biogas-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      tabButtons.forEach(b => {
        const isCurrent = b.dataset.tab === activeTab;
        b.className = isCurrent
          ? 'biogas-tab-btn px-4 py-3 rounded-lg font-heading font-extrabold text-xs sm:text-sm bg-[#0F172A] text-white border-2 border-[#10B981] shadow-md transition-all text-left'
          : 'biogas-tab-btn px-4 py-3 rounded-lg font-heading font-bold text-xs sm:text-sm bg-white text-slate-700 border border-slate-300 hover:border-slate-400 transition-all text-left';
      });
      renderProposalPanel(activeTab);
    });
  });

  // Exponer función para saltar a un tab desde la calculadora
  window.jumpToBiogasTab = function(tabKey) {
    if (tabKey === '5A' || tabKey === '5B') {
      tab5Variant = tabKey;
      activeTab = '5';
    } else {
      activeTab = String(tabKey);
    }
    tabButtons.forEach(b => {
      const isCurrent = b.dataset.tab === activeTab;
      b.className = isCurrent
        ? 'biogas-tab-btn px-4 py-3 rounded-lg font-heading font-extrabold text-xs sm:text-sm bg-[#0F172A] text-white border-2 border-[#10B981] shadow-md transition-all text-left'
        : 'biogas-tab-btn px-4 py-3 rounded-lg font-heading font-bold text-xs sm:text-sm bg-white text-slate-700 border border-slate-300 hover:border-slate-400 transition-all text-left';
    });
    renderProposalPanel(activeTab);
    const sec = document.getElementById('biogas-proposals-section');
    if (sec) sec.scrollIntoView({ behavior: 'smooth' });
  };

  window.selectProposalForQuote = function(title) {
    const selEl = document.getElementById('form-biogas-proposal');
    if (selEl) selEl.value = title;
    updateWhatsAppLink();
  };

  // ========================================================================
  // CALCULADORA INTERACTIVA DE VIABILIDAD Y RETORNO (3 CONTROLES EN VIVO)
  // ========================================================================
  const sliderTons = document.getElementById('slider-biogas-tons');
  const sliderLandfill = document.getElementById('slider-biogas-landfill');
  const patioRadios = document.querySelectorAll('input[name="biogas-patio-size"]');

  function determineRecommendedProposal(tons, patioCode) {
    const patioArea = Number(patioCode);
    if (tons <= 0.5 && patioArea <= 50) {
      return {
        key: '1',
        name: 'Propuesta 1 — Micro-Planta / Piloto Solar 3,5 m³ (8 m²)',
        reason: 'Ideal para volúmenes piloto y patios muy reducidos (< 50 m²) sin excavación.'
      };
    }
    if (patioArea <= 50 && tons > 0.5) {
      return {
        key: '5B',
        name: 'Propuesta 5B — Contenedor Biorreactor Cerrado 24 m³ (50 m²)',
        reason: 'Como su patio disponible es menor a 50 m², el Contenedor Cerrado de 24 m³ (10×5 m) valoriza sus residuos sin requerir área para reactores de gas.'
      };
    }
    if (tons <= 3.5) {
      return {
        key: '2',
        name: 'Propuesta 2 — Planta Modular Pequeña ECPC 100 m³ (96 m²)',
        reason: 'Dimensionada para 1 a 3,5 Ton/día ocupando apenas 96 m² (12,0 m × 8,0 m).'
      };
    }
    if (tons >= 22 && patioArea >= 1000) {
      return {
        key: '5A',
        name: 'Propuesta 5A — Batería Mayor ECPC 6.000 m³ (1.200 m²)',
        reason: 'Por su alto volumen de descarte (> 22 Ton/día) y disponibilidad de terreno (+1.000 m²), calza con la Batería Industrial de 6.000 m³.'
      };
    }
    if (patioArea >= 350) {
      return {
        key: '4',
        name: 'Propuesta 4 — Planta Extendida ECPC 1.000 m³ + Domo en Suelo 500 m³ (396 m²)',
        reason: 'Su patio disponible (350 a 450+ m²) permite instalar el Domo de Doble Membrana independiente de 500 m³ para cubrir horas punta y calderas.'
      };
    }
    return {
      key: '3',
      name: 'Propuesta 3 — Planta ECPC 1.000 m³ con Domo Integrado en Techo (252 m²)',
      reason: 'Para 4 a 20 Ton/día con patio compacto (100 a 280 m²), el Domo Integrado en el Techo del Reactor ahorra un 36% de superficie ocupando solo 252 m² (18×14 m).'
    };
  }

  function updateCalculator() {
    const tons = parseFloat(sliderTons ? sliderTons.value : 10);
    const landfillCost = parseFloat(sliderLandfill ? sliderLandfill.value : 30000);
    let patioCode = '250';
    patioRadios.forEach(r => {
      if (r.checked) patioCode = r.value;
    });

    calcState.tonsPerDay = tons;
    calcState.landfillCostPerTon = landfillCost;
    calcState.patioCategory = patioCode;

    // Fórmulas Exactas solicitadas
    const dailyBiogas = tons * 90;                    // m³/día
    const monthlyBiogas = dailyBiogas * 30;           // m³/mes
    const monthlyKwh = monthlyBiogas * 1.62;          // kWh/mes
    const monthlyElectricSavings = monthlyKwh * 145;  // $ CLP autoconsumo
    const monthlyGridInjection = monthlyKwh * 85;     // $ CLP inyección a red
    const monthlyLandfillSavings = tons * 30 * landfillCost; // $ CLP ahorro vertedero
    const totalMonthlyPositiveFlow = monthlyElectricSavings + monthlyLandfillSavings;
    const annualPositiveFlow = totalMonthlyPositiveFlow * 12;

    // Actualizar lecturas de controles
    const lblTons = document.getElementById('val-biogas-tons');
    const lblLandfill = document.getElementById('val-biogas-landfill');
    if (lblTons) lblTons.textContent = `${tons.toLocaleString('es-CL')} Ton/día (${formatNumber(tons * 30)} Ton/mes)`;
    if (lblLandfill) lblLandfill.textContent = `${formatCLP(landfillCost)} / Ton`;

    // Actualizar resultados
    const elDailyGas = document.getElementById('res-daily-biogas');
    const elMonthlyGas = document.getElementById('res-monthly-biogas');
    const elMonthlyKwh = document.getElementById('res-monthly-kwh');
    const elElecSavings = document.getElementById('res-electric-savings');
    const elGridIncome = document.getElementById('res-grid-income');
    const elLandfillSavings = document.getElementById('res-landfill-savings');
    const elTotalFlow = document.getElementById('res-total-flow');
    const elAnnualFlow = document.getElementById('res-annual-flow');

    if (elDailyGas) elDailyGas.textContent = `${formatNumber(dailyBiogas)} m³/día`;
    if (elMonthlyGas) elMonthlyGas.textContent = `${formatNumber(monthlyBiogas)} m³/mes`;
    if (elMonthlyKwh) elMonthlyKwh.textContent = `${formatNumber(monthlyKwh)} kWh/mes`;
    if (elElecSavings) elElecSavings.textContent = formatCLP(monthlyElectricSavings);
    if (elGridIncome) elGridIncome.textContent = formatCLP(monthlyGridInjection);
    if (elLandfillSavings) elLandfillSavings.textContent = formatCLP(monthlyLandfillSavings);
    if (elTotalFlow) elTotalFlow.textContent = `${formatCLP(totalMonthlyPositiveFlow)} / mes`;
    if (elAnnualFlow) elAnnualFlow.textContent = `${formatCLP(annualPositiveFlow)} / año`;

    // Recomendación Automática de Planta y Plano
    const rec = determineRecommendedProposal(tons, patioCode);
    calcState.recommendedKey = rec.key;
    const elRecName = document.getElementById('res-recommended-plant');
    const elRecReason = document.getElementById('res-recommended-reason');
    const btnViewRecPlan = document.getElementById('btn-view-recommended-plan');
    if (elRecName) elRecName.textContent = rec.name;
    if (elRecReason) elRecReason.textContent = rec.reason;
    if (btnViewRecPlan) {
      btnViewRecPlan.onclick = () => window.jumpToBiogasTab(rec.key);
    }

    // Sincronizar con el formulario inferior de diagnóstico
    const formTons = document.getElementById('form-biogas-tons');
    const formSpace = document.getElementById('form-biogas-space');
    const formProposal = document.getElementById('form-biogas-proposal');
    if (formTons) formTons.value = `${tons} Ton/día`;
    if (formSpace) {
      const spaceLabels = {
        '40': 'Menos de 50 m²',
        '250': '100 a 280 m²',
        '400': '350 a 450 m²',
        '1200': 'Más de 1.000 m²'
      };
      formSpace.value = spaceLabels[patioCode] || '100 a 280 m²';
    }
    if (formProposal) formProposal.value = rec.name;

    updateWhatsAppLink();
  }

  function updateWhatsAppLink() {
    const name = document.getElementById('form-biogas-name')?.value?.trim() || 'Cliente Industrial';
    const company = document.getElementById('form-biogas-company')?.value?.trim() || 'Por confirmar';
    const sector = document.getElementById('form-biogas-sector')?.value || 'Pesquero';
    const phone = document.getElementById('form-biogas-phone')?.value?.trim() || 'Por confirmar';
    const email = document.getElementById('form-biogas-email')?.value?.trim() || 'Por confirmar';
    const proposal = document.getElementById('form-biogas-proposal')?.value || 'Planta ECPC 1.000 m³';

    const tons = calcState.tonsPerDay;
    const landfillCost = calcState.landfillCostPerTon;
    const dailyGas = tons * 90;
    const monthlyGas = dailyGas * 30;
    const monthlyKwh = monthlyGas * 1.62;
    const elecSavings = monthlyKwh * 145;
    const landfillSavings = tons * 30 * landfillCost;
    const totalFlow = elecSavings + landfillSavings;

    const spaceLabels = {
      '40': 'Menos de 50 m²',
      '250': '100 a 280 m²',
      '400': '350 a 450 m²',
      '1200': 'Más de 1.000 m²'
    };
    const spaceStr = spaceLabels[calcState.patioCategory] || '100 a 280 m²';

    const msg = [
      'Hola Gonzalo (Ingeniería WellPack), solicito evaluación técnica y financiera para un *Proyecto de Biogás / Valorización Orgánica*:',
      '',
      `*1. DATOS DE EMPRESA:*`,
      `• Contacto: ${name}`,
      `• Empresa: ${company}`,
      `• Rubro: ${sector}`,
      `• Teléfono: ${phone}`,
      `• Email: ${email}`,
      '',
      `*2. SIMULACIÓN DE PLANTA:*`,
      `• Descartes orgánicos: ${tons} Ton/día (${formatNumber(tons * 30)} Ton/mes)`,
      `• Costo actual vertedero: ${formatCLP(landfillCost)}/Ton`,
      `• Patio disponible: ${spaceStr}`,
      `• Producción estimada: ${formatNumber(dailyGas)} m³/día (${formatNumber(monthlyKwh)} kWh/mes)`,
      `• Ahorro Eléctrico Autoconsumo: ${formatCLP(elecSavings)}/mes`,
      `• Ahorro Vertedero: ${formatCLP(landfillSavings)}/mes`,
      `• *Flujo Positivo Total:* ${formatCLP(totalFlow)}/mes`,
      '',
      `*3. PLANTA RECOMENDADA:*`,
      `• ${proposal}`,
      `• Financiamiento de interés: Crédito Verde Corfo / MiPyme / Ley I+D`
    ].join('\n');

    const waBtn = document.getElementById('btn-biogas-whatsapp-submit');
    if (waBtn) {
      waBtn.href = `https://wa.me/56974379993?text=${encodeURIComponent(msg)}`;
    }
  }

  if (sliderTons) sliderTons.addEventListener('input', updateCalculator);
  if (sliderLandfill) sliderLandfill.addEventListener('input', updateCalculator);
  patioRadios.forEach(r => r.addEventListener('change', updateCalculator));

  ['form-biogas-name', 'form-biogas-company', 'form-biogas-sector', 'form-biogas-phone', 'form-biogas-email', 'form-biogas-proposal'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateWhatsAppLink);
      el.addEventListener('change', updateWhatsAppLink);
    }
  });

  // ========================================================================
  // ACORDEÓN INTERACTIVO FAQ (SECCIÓN 5.5) Y FILTRO POR CATEGORÍA
  // ========================================================================
  const faqItems = document.querySelectorAll('.biogas-faq-item');
  const faqFilterBtns = document.querySelectorAll('.biogas-faq-filter-btn');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.biogas-faq-trigger');
    const content = item.querySelector('.biogas-faq-content');
    const icon = item.querySelector('.biogas-faq-icon');
    if (!trigger || !content || !icon) return;

    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      const nextExpanded = !isExpanded;
      trigger.setAttribute('aria-expanded', String(nextExpanded));
      content.classList.toggle('hidden', !nextExpanded);
      icon.textContent = nextExpanded ? '−' : '+';

      if (nextExpanded) {
        item.classList.remove('border', 'border-slate-200', 'shadow-sm');
        item.classList.add('border-2', 'border-emerald-500', 'shadow-md');
        icon.classList.remove('bg-slate-100', 'text-slate-700');
        icon.classList.add('bg-emerald-500', 'text-slate-950');
      } else {
        item.classList.remove('border-2', 'border-emerald-500', 'shadow-md');
        item.classList.add('border', 'border-slate-200', 'shadow-sm');
        icon.classList.remove('bg-emerald-500', 'text-slate-950');
        icon.classList.add('bg-slate-100', 'text-slate-700');
      }
    });
  });

  faqFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-faq-filter') || 'all';
      faqFilterBtns.forEach(b => {
        const isCurrent = (b.getAttribute('data-faq-filter') || 'all') === filter;
        b.className = isCurrent
          ? 'biogas-faq-filter-btn px-3.5 py-2 rounded-lg text-xs font-mono font-bold uppercase bg-[#0F172A] text-emerald-400 border border-[#0F172A] shadow-sm transition-all'
          : 'biogas-faq-filter-btn px-3.5 py-2 rounded-lg text-xs font-mono font-bold uppercase bg-white text-slate-700 border border-slate-300 hover:border-slate-400 transition-all';
      });

      faqItems.forEach(item => {
        const group = item.getAttribute('data-faq-group') || '';
        const match = filter === 'all' || group === filter;
        item.classList.toggle('hidden', !match);
      });
    });
  });

  // Render inicial
  renderProposalPanel(activeTab);
  updateCalculator();
}
