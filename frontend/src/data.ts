import { Product, CompanyFact } from './types';

export const COMPANY_FACTS: CompanyFact[] = [
  {
    id: 'business',
    title: 'NATURE OF BUSINESS',
    value: 'Manufacturer',
    label: 'Exporter & Supplier',
    icon: 'Briefcase',
    hoverDetail: 'We design and build industrial-grade infrared lamps, quartz heaters, and thermal processing chambers under rigorous ISO-level testing standards.',
    metricLabel: 'Global Standards',
    metricValue: 'ISO 9001:2015'
  },
  {
    id: 'location',
    title: 'LOCATION',
    value: 'Thane, Maharashtra',
    label: 'Industrial Zone',
    icon: 'MapPin',
    hoverDetail: 'Our modern fabrication plant sits in Thane, Maharashtra, facilitating seamless nationwide road, rail, and air logistics access.',
    metricLabel: 'Plant Area',
    metricValue: '15,000 sq.ft'
  },
  {
    id: 'year',
    title: 'EXPERIENCE',
    value: '13+ Years',
    label: 'Industrial Expertise',
    icon: 'Calendar',
    hoverDetail: 'Since 2013, our 13+ years of industrial experience ensures highly efficient, durable, and custom-tailored elements for key process heating applications.',
    metricLabel: 'Established',
    metricValue: 'Since 2013'
  },
  {
    id: 'employees',
    title: 'EMPLOYEES',
    value: '10+ Members',
    label: 'Technical Specialists',
    icon: 'Users',
    hoverDetail: 'Our dedicated team consists of experienced thermal engineers, high-precision assembly professionals, and certified quality-control specialists.',
    metricLabel: 'Engineering Staff',
    metricValue: 'Specialists'
  },
  {
    id: 'production',
    title: 'PRODUCTION UNITS',
    value: '5 Brands',
    label: 'In-house Assemblies',
    icon: 'Factory',
    hoverDetail: 'Featuring dedicated filament winding stations, specialized gas flushing, high-vacuum ovens, and gold-reflector spray coating chambers.',
    metricLabel: 'Daily Capacity',
    metricValue: '800 elements'
  }
];

export const OTHER_FACTS: CompanyFact[] = [
  {
    id: 'transport',
    title: 'TRANSPORT',
    value: 'Transport',
    label: 'Logistics Partners',
    icon: 'Truck',
    hoverDetail: 'Equipped with heavy cargo courier tie-ups ensuring break-safe container deliveries with customized high-density shock-absorbent foam packaging.',
    metricLabel: 'Transit Damage',
    metricValue: '< 0.05%'
  },
  {
    id: 'gst',
    title: 'GSTIN NUMBER',
    value: '27ASDPK7527M1ZA',
    label: 'Reg. Taxpayer ID',
    icon: 'ReceiptText',
    hoverDetail: 'Authorized and fully compliant registered taxpayer in Thane, Maharashtra (GSTIN: 27ASDPK7527M1ZA), issuing valid corporate standard commercial tax input credit invoices.',
    metricLabel: 'GST Status',
    metricValue: 'Active'
  },
  {
    id: 'payment',
    title: 'PAYMENT',
    value: 'Payment',
    label: 'Flexible Options',
    icon: 'CreditCard',
    hoverDetail: 'Supporting dynamic commercial payment plans, bank telegraphic transfers (T/T), irrevocable Letter of Credit (L/C), UPI, and net banking.',
    metricLabel: 'Terms',
    metricValue: 'Flexible L/C, T/T'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'shortwave-ir',
    name: 'Short Wave Infrared Heaters',
    subtitle: 'High-Velocity Heat Transmission',
    category: 'infrared',
    description: 'Ultra-fast response elements executing maximum heat convergence in under 1 second.',
    longDescription: 'Our Short Wave Infrared Heating lamps utilize tungsten filaments housed in high-purity quartz tubes filled with halogen gas. Designed to reach peak temperatures of over 950°C almost instantaneously, they are optimal for paint curing, plastics heating, and automated paper mills where prompt cool-down and instant-on are vital to prevent material fire hazards in case of conveyor stoppages.',
    specifications: {
      power: '1000W - 6000W per lamp',
      voltage: '110V / 230V / 415V',
      diameter: '10mm / 12mm',
      heatedLength: '200mm - 1200mm',
      maxTemperature: '1100°C',
      wavelength: '0.8 - 1.4 µm (High Penetration)',
      material: 'Clear Quartz with Gold / Ruby Coating'
    },
    features: [
      'Warm-up completed in less than 2 seconds',
      'Option for absolute gold reflector back-coating to focus 90% of heat onward',
      'Dual concentric support rings to prevent filament sag at vertical alignments',
      'Available with lead wires or specialized metal contact caps'
    ],
    applications: [
      'Paint and lacquer drying on automobile body parts',
      'PET bottle blow molding preheating',
      'Paper and textile web tension drying lines',
      'Silicon wafer photovoltaic processing'
    ]
  },
  {
    id: 'quartz-tubes',
    name: 'Quartz Glass Heating Elements',
    subtitle: 'Medium-Wave General Radiators',
    category: 'quartz-tubes',
    description: 'Durable elements inside protective high-grade silica tubes, ensuring uniform heat flux.',
    longDescription: 'Heat One Quartz Glass Tubes feature heavy-gauge nickel-chromium resistance coils safely encased inside clear or frosted high-purity silica sleeves. Characterized by outstanding thermal shock resistance, they operate safely under heavy moisture environments. Their medium-wave emission matches the absorption spectrum of water, plastics, solvents, and adhesives, offering supreme efficiency.',
    specifications: {
      power: '500W - 4000W',
      voltage: '110V / 230V / 415V',
      diameter: '8mm to 22mm custom options',
      heatedLength: '300mm - 1800mm',
      maxTemperature: '800°C',
      wavelength: '1.5 - 3.0 µm',
      material: 'Clear or Translucent Milky Silica Glass'
    },
    features: [
      'Negligible thermal expansion withstanding extreme hot-to-cold splash shocks',
      'Exceptional mechanical stability under repetitive expansion stress cycles',
      'Custom spacing on interior wire coils to allow targeted heat zones',
      'Highly resistant to corrosive chemical fumes and oxidation'
    ],
    applications: [
      'Food warming and commercial canteen plate stacks',
      'Shrink wrap tunnel heaters and packaging seals',
      'Laboratory oven chemical crucible stations',
      'Plastic thermoforming ovens'
    ]
  },
  {
    id: 'twin-tube-ir',
    name: 'Twin Tube Carbon Infrared Heaters',
    subtitle: 'Mechanical Strength with Medium Wave Efficiency',
    category: 'infrared',
    description: 'Double-bored high-density quartz glass shape providing mechanical stiffness and high absorption rates.',
    longDescription: 'Featuring a unique figure-of-eight (23x11mm or 33x15mm) double silica chamber, our Twin Tube designs offer unparalleled mechanical rigidity across lengths of up to 3 meters. Sourced with a carbon fiber filament weave, they run at medium wave frequencies which are highly absorbed by organic compounds, polymers, and water. Gold-plated reflector backs ensure zero loss of thermal radiation on the support frame.',
    specifications: {
      power: '1500W - 8000W',
      voltage: '230V / 400V / 480V',
      diameter: '23mm x 11mm cross section',
      heatedLength: '500mm - 3000mm',
      maxTemperature: '1000°C',
      wavelength: '2.0 - 4.5 µm (Medium Wave)',
      material: 'Figure-8 High-Strength Silica with 24ct Gold plating'
    },
    features: [
      'Twin-bore construction prohibits bowing or bending across extended lengths',
      'Carbon heating element reacts instantly with fast thermal response times',
      'Pure gold back reflector increases heating efficiency by more than 85%',
      'Single-ended electrical connection option saves space and simplifies wiring'
    ],
    applications: [
      'Large scale automotive thermoforming platforms',
      'Plastics bonding, embossing, and adhesive reactivation',
      'Wood panel veneering and high speed lamination presses',
      'Carpet and leather backing cure ovens'
    ]
  },
  {
    id: 'ceramic-panels',
    name: 'Ceramic Infrared Panels',
    subtitle: 'Long Wave Solid Non-Contact Uniform Warmers',
    category: 'ceramic',
    description: 'Fully glazed solid casting heaters ideal for static, thermo-molding, and heavy-duty environments.',
    longDescription: 'Made of professional hollow or curved glazed ceramic bodies, these panels utilize cast-in iron-chrome-aluminum alloy wires, enabling flat surface heat distribution. Perfect for applications requiring gentle, long-wave radiation where mechanical impact risk is present. The chemical glazed surface completely seals the internal coil, protecting it from moisture, acids, and atmospheric oxidation over years of nonstop operation.',
    specifications: {
      power: '150W - 1000W',
      voltage: '230V (standard)',
      diameter: '122mm x 122mm or 245mm x 60mm',
      heatedLength: 'Entire active face',
      maxTemperature: '750°C',
      wavelength: '3.0 - 10 µm (Deep Long Wave)',
      material: 'High Emissivity Glazed Ceramic body'
    },
    features: [
      'Full protective glaze ensures resistance to water splash, splash chemicals, and rust',
      'Uniform surface emission prevents thermal hotspot burn marks on sensitive films',
      'Constructed with custom rear thermal insulation clips to fit standard mounting bars',
      'Optional built-in Type K Thermocouple for precise PID temperature feedback loops'
    ],
    applications: [
      'Heavy plastic vacuum forming and deep-draw pressure molding',
      'Medical warming platforms and infrared saunas',
      'Curing printing pastes and industrial silk screens',
      'Rubber sheet vulcanizing ovens'
    ]
  },
  {
    id: 'industrial-ovens',
    name: 'Infrared Batch & Conveyor Ovens',
    subtitle: 'Engineered Thermal Heat Processing Tunnel Chambers',
    category: 'ovens',
    description: 'Fully pre-wired, multi-zoned electric ovens with optimized heater arrays and control cabinets.',
    longDescription: 'Heat One custom builds efficient batch and tunnel convection/IR ovens incorporating our state-of-the-art quartz and infrared heaters. Every oven is modeled using custom heat loss algorithms, configured with multi-zone digital control panels, SCR thyristor power regulation, fan ventilation, and heavy-duty structural insulation. This integration results in energy savings of up to 45% compared to generic gas or solid rod hot-air convective loops.',
    specifications: {
      power: '15kW - 250kW custom engineered',
      voltage: '415V 3-Phase, 50Hz/60Hz',
      diameter: 'Sized to fit product size',
      heatedLength: '1.5 meters up to 12 meters tunnels',
      maxTemperature: '400°C adjustable',
      wavelength: 'Hybrid Multi-Spectral arrays',
      material: 'Stainless Steel Double-Skin with Mineral wool wrap'
    },
    features: [
      'Zoned temperature control loops with solid-state relay proportioning',
      'Integrated adjustable exhaust fan to remove solvent vapors safely',
      'Emergency safety override, automatic product-unload conveyor lock',
      'Custom pre-fitted heat reflectors minimizing steel panel thermal bleed'
    ],
    applications: [
      'Teflon and powder coat baking on industrial components',
      'Tire tread vulcanizing and rubber seal preheat tunnels',
      'Glass tempering preheating and structural glass bonding',
      'Electric motor varnishing bake loops'
    ]
  }
];
