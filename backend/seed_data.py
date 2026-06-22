# Seed data for Heat One Technology catalog database

SEED_PRODUCTS = [
    # 5 Core Products from data.ts
    {
        "id": "shortwave-ir",
        "name": "Short Wave Infrared Heaters",
        "slug": "short-wave-infrared-heaters",
        "subtitle": "High-Velocity Heat Transmission",
        "category": "infrared",
        "description": "Ultra-fast response elements executing maximum heat convergence in under 1 second.",
        "longDescription": "Our Short Wave Infrared Heating lamps utilize tungsten filaments housed in high-purity quartz tubes filled with halogen gas. Designed to reach peak temperatures of over 950°C almost instantaneously, they are optimal for paint curing, plastics heating, and automated paper mills where prompt cool-down and instant-on are vital to prevent material fire hazards in case of conveyor stoppages.",
        "specifications": {
            "power": "1000W - 6000W per lamp",
            "voltage": "110V / 230V / 415V",
            "diameter": "10mm / 12mm",
            "heatedLength": "200mm - 1200mm",
            "maxTemperature": "1100°C",
            "wavelength": "0.8 - 1.4 µm (High Penetration)",
            "material": "Clear Quartz with Gold / Ruby Coating"
        },
        "features": [
            "Warm-up completed in less than 2 seconds",
            "Option for absolute gold reflector back-coating to focus 90% of heat onward",
            "Dual concentric support rings to prevent filament sag at vertical alignments",
            "Available with lead wires or specialized metal contact caps"
        ],
        "applications": [
            "Paint and lacquer drying on automobile body parts",
            "PET bottle blow molding preheating",
            "Paper and textile web tension drying lines",
            "Silicon wafer photovoltaic processing"
        ],
        "imageUrl": ""
    },
    {
        "id": "quartz-tubes",
        "name": "Quartz Glass Heating Elements",
        "slug": "quartz-glass-heating-elements",
        "subtitle": "Medium-Wave General Radiators",
        "category": "quartz-tubes",
        "description": "Durable elements inside protective high-grade silica tubes, ensuring uniform heat flux.",
        "longDescription": "Heat One Quartz Glass Tubes feature heavy-gauge nickel-chromium resistance coils safely encased inside clear or frosted high-purity silica sleeves. Characterized by outstanding thermal shock resistance, they operate safely under heavy moisture environments. Their medium-wave emission matches the absorption spectrum of water, plastics, solvents, and adhesives, offering supreme efficiency.",
        "specifications": {
            "power": "500W - 4000W",
            "voltage": "110V / 230V / 415V",
            "diameter": "8mm to 22mm custom options",
            "heatedLength": "300mm - 1800mm",
            "maxTemperature": "800°C",
            "wavelength": "1.5 - 3.0 µm",
            "material": "Clear or Translucent Milky Silica Glass"
        },
        "features": [
            "Negligible thermal expansion withstanding extreme hot-to-cold splash shocks",
            "Exceptional mechanical stability under repetitive expansion stress cycles",
            "Custom spacing on interior wire coils to allow targeted heat zones",
            "Highly resistant to corrosive chemical fumes and oxidation"
        ],
        "applications": [
            "Food warming and commercial canteen plate stacks",
            "Shrink wrap tunnel heaters and packaging seals",
            "Laboratory oven chemical crucible stations",
            "Plastic thermoforming ovens"
        ],
        "imageUrl": ""
    },
    {
        "id": "twin-tube-ir",
        "name": "Twin Tube Carbon Infrared Heaters",
        "slug": "twin-tube-carbon-infrared-heaters",
        "subtitle": "Mechanical Strength with Medium Wave Efficiency",
        "category": "infrared",
        "description": "Double-bored high-density quartz glass shape providing mechanical stiffness and high absorption rates.",
        "longDescription": "Featuring a unique figure-of-eight (23x11mm or 33x15mm) double silica chamber, our Twin Tube designs offer unparalleled mechanical rigidity across lengths of up to 3 meters. Sourced with a carbon fiber filament weave, they run at medium wave frequencies which are highly absorbed by organic compounds, polymers, and water. Gold-plated reflector backs ensure zero loss of thermal radiation on the support frame.",
        "specifications": {
            "power": "1500W - 8000W",
            "voltage": "230V / 400V / 480V",
            "diameter": "23mm x 11mm cross section",
            "heatedLength": "500mm - 3000mm",
            "maxTemperature": "1000°C",
            "wavelength": "2.0 - 4.5 µm (Medium Wave)",
            "material": "Figure-8 High-Strength Silica with 24ct Gold plating"
        },
        "features": [
            "Twin-bore construction prohibits bowing or bending across extended lengths",
            "Carbon heating element reacts instantly with fast thermal response times",
            "Pure gold back reflector increases heating efficiency by more than 85%",
            "Single-ended electrical connection option saves space and simplifies wiring"
        ],
        "applications": [
            "Large scale automotive thermoforming platforms",
            "Plastics bonding, embossing, and adhesive reactivation",
            "Wood panel veneering and high speed lamination presses",
            "Carpet and leather backing cure ovens"
        ],
        "imageUrl": ""
    },
    {
        "id": "ceramic-panels",
        "name": "Ceramic Infrared Panels",
        "slug": "ceramic-infrared-panels",
        "subtitle": "Long Wave Solid Non-Contact Uniform Warmers",
        "category": "ceramic",
        "description": "Fully glazed solid casting heaters ideal for static, thermo-molding, and heavy-duty environments.",
        "longDescription": "Made of professional hollow or curved glazed ceramic bodies, these panels utilize cast-in iron-chrome-aluminum alloy wires, enabling flat surface heat distribution. Perfect for applications requiring gentle, long-wave radiation where mechanical impact risk is present. The chemical glazed surface completely seals the internal coil, protecting it from moisture, acids, and atmospheric oxidation over years of nonstop operation.",
        "specifications": {
            "power": "150W - 1000W",
            "voltage": "230V (standard)",
            "diameter": "122mm x 122mm or 245mm x 60mm",
            "heatedLength": "Entire active face",
            "maxTemperature": "750°C",
            "wavelength": "3.0 - 10 µm (Deep Long Wave)",
            "material": "High Emissivity Glazed Ceramic body"
        },
        "features": [
            "Full protective glaze ensures resistance to water splash, splash chemicals, and rust",
            "Uniform surface emission prevents thermal hotspot burn marks on sensitive films",
            "Constructed with custom rear thermal insulation clips to fit standard mounting bars",
            "Optional built-in Type K Thermocouple for precise PID temperature feedback loops"
        ],
        "applications": [
            "Heavy plastic vacuum forming and deep-draw pressure molding",
            "Medical warming platforms and industrial sauna",
            "Curing printing pastes and industrial silk screens",
            "Rubber sheet vulcanizing ovens"
        ],
        "imageUrl": ""
    },
    {
        "id": "industrial-ovens",
        "name": "Infrared Batch & Conveyor Ovens",
        "slug": "infrared-batch-conveyor-ovens",
        "subtitle": "Engineered Thermal Heat Processing Tunnel Chambers",
        "category": "ovens",
        "description": "Fully pre-wired, multi-zoned electric ovens with optimized heater arrays and control cabinets.",
        "longDescription": "Heat One custom builds efficient batch and tunnel convection/IR ovens incorporating our state-of-the-art quartz and infrared heaters. Every oven is modeled using custom heat loss algorithms, configured with multi-zone digital control panels, SCR thyristor power regulation, fan ventilation, and heavy-duty structural insulation. This integration results in energy savings of up to 45% compared to generic gas or solid rod hot-air convective loops.",
        "specifications": {
            "power": "15kW - 250kW custom engineered",
            "voltage": "415V 3-Phase, 50Hz/60Hz",
            "diameter": "Sized to fit product size",
            "heatedLength": "1.5 meters up to 12 meters tunnels",
            "maxTemperature": "400°C adjustable",
            "wavelength": "Hybrid Multi-Spectral arrays",
            "material": "Stainless Steel Double-Skin with Mineral wool wrap"
        },
        "features": [
            "Zoned temperature control loops with solid-state relay proportioning",
            "Integrated adjustable exhaust fan to remove solvent vapors safely",
            "Emergency safety override, automatic product-unload conveyor lock",
            "Custom pre-fitted heat reflectors minimizing steel panel thermal bleed"
        ],
        "applications": [
            "Teflon and powder coat baking on industrial components",
            "Tire tread vulcanizing and rubber seal preheat tunnels",
            "Glass tempering preheating and structural glass bonding",
            "Electric motor varnishing bake loops"
        ],
        "imageUrl": ""
    },
    # 13 Brochure Products from ProductsView.tsx
    {
        "id": "brochure-mica-band",
        "name": "Standard Band Heaters",
        "slug": "standard-band-heaters",
        "subtitle": "Mica insulated wrapped in stainless steel casing | 3-Bolt Clamp",
        "category": "ceramic",
        "description": "Flexible, inexpensive, and durable heaters wrapped in stainless steel casing. Widely engineered to heat molds, dies, nozzles, and cylinders of plastic machines.",
        "longDescription": "Standard Mica band heaters are the optimum solution for heating cylindrical surfaces like nozzles and extruder barrels. They offer high thermal conductivity with excellent dielectric strength. Standard casings are constructed from premium aluminized steel or stainless steel, safeguarding internal high-grade mica core winds. Advanced power conservation options save up to 10% thermal energy.",
        "specifications": {
            "power": "150W - 3500W custom",
            "voltage": "230V / 415V standard",
            "diameter": "25mm - 500mm custom",
            "heatedLength": "20mm - 400mm custom",
            "maxTemperature": "Up to 300°C",
            "material": "Stainless Steel & Mica Core"
        },
        "features": [
            "Rust-resistant aluminized or stainless steel sheath",
            "Premium nickel-chrome ribbon winding for optimal coverage",
            "Flexible design adapts snugly to extruder cylinders",
            "Integrated thermowell brackets available"
        ],
        "applications": [
            "Plastic injection molding nozzle assemblies",
            "Blow molding machinery barrels",
            "Extruder head heating",
            "Container & drum heating systems"
        ],
        "imageUrl": "/src/assets/images/standard_band_ref_1780920054390.webp"
    },
    {
        "id": "brochure-ceramic-band",
        "name": "Ceramic Band Heaters",
        "slug": "ceramic-band-heaters",
        "subtitle": "High Temperature Insulating Bricks | SS Shell",
        "category": "ceramic",
        "description": "Durable mat design built with high-purity ceramic bricks on wire coils. Housing serrations allow mechanical flex to adapt snugly around complex system barrels.",
        "longDescription": "Ceramic band heaters are designed specifically for high-operating temperature applications. Intentionally built with high-frequency ceramic insulator tiles wrapped around computer-wound Ni-Cr resistance wire. This assembly is enclosed in a stainless steel casing lined with a premium fiber insulation layer to prevent rearward radiation heat loss, substantially reducing energy bills.",
        "specifications": {
            "power": "500W - 8000W custom",
            "voltage": "230V / 415V standard",
            "diameter": "50mm - 600mm",
            "heatedLength": "30mm - 450mm",
            "maxTemperature": "Up to 700°C",
            "material": "Serrated Stainless Steel & Ceramic tiles"
        },
        "features": [
            "Rear ceramic fiber insulation reduces energy loss by 25-30%",
            "Snug metal casing with heavy-duty mechanical clamping",
            "Extremely long operational lifetime at highest temperatures",
            "Adapters for different terminal orientations (plug, lead, boxes)"
        ],
        "applications": [
            "High temperature plastic extrusion barrels",
            "Chemical reactor vessels",
            "Metallurgical dies heating",
            "Resin compounding machines"
        ],
        "imageUrl": "/src/assets/images/ceramic_band_ref_1780920035217.webp"
    },
    {
        "id": "brochure-cartridge-heaters",
        "name": "High Density Cartridge Heaters",
        "slug": "high-density-cartridge-heaters",
        "subtitle": "12 W/sq.cm Density | SS304 Sheath | Inbuilt TC",
        "category": "infrared",
        "description": "Precision heating elements swaged to maximum core compaction. Pre-engineered with built-in Type J or K thermocouples for fast PID temperature control diagnostics.",
        "longDescription": "High-density swaged cartridge heaters supply maximum localized heat output in highly compact structures. Built with high-grade MgO powder vibration compacted inside an SS304 sheathing structure. Equipped with optional embedded internal thermocouples, eliminating external probe requirements and improving control loops.",
        "specifications": {
            "power": "100W - 2000W custom",
            "voltage": "12V to 440V configuration",
            "diameter": "6mm - 32mm tolerances <0.05mm",
            "heatedLength": "40mm - 1000mm",
            "maxTemperature": "Up to 750°C",
            "material": "SS304 / Incoloy sheath"
        },
        "features": [
            "Compacted high purity magnesium oxide insulation",
            "Vibration and high impact mechanical endurance",
            "Inbuilt J-type or K-type thermocouple options",
            "TIG-welded hermetic end disk seals prevent oil entry"
        ],
        "applications": [
            "Plastic die core heating plates",
            "Packaging heat-seal jaw bars",
            "Medical test instrument heating blocks",
            "Hot-melt glue nozzle cylinders"
        ],
        "imageUrl": "/src/assets/images/cartridge_heater_1780916136779.webp"
    },
    {
        "id": "brochure-ceramic-strip",
        "name": "Small Immersion Heater Clusters",
        "slug": "small-immersion-heater-clusters",
        "subtitle": "Immersion & Finned Heaters | Brass Thread with Yellow Cap",
        "category": "ceramic",
        "description": "Compact immersion elements pre-engineered with heavy brass threads and fitted with protective yellow plastic terminal caps.",
        "longDescription": "Our Small Immersion Heater Clusters provide dense heat distribution for compact fluid pools, laboratory vessels, and small industrial tanks. Featuring high-durability brass mounting threads and insulating yellow terminal caps to safeguard wire interfaces.",
        "specifications": {
            "power": "500W - 3000W custom",
            "voltage": "230V / 415V standard",
            "diameter": "1/2 inch or 1 inch NPT brass threads",
            "heatedLength": "100mm - 350mm custom",
            "maxTemperature": "Up to 350°C",
            "material": "Copper/Nickel sheathing with Brass Screw base"
        },
        "features": [
            "Fitted with shock-resistant yellow terminal protection caps",
            "Robust threaded fitting prevents high pressure fluid leaks",
            "Double soldered joints ensure prolonged underwater operation",
            "Available in dual or triple element bundles"
        ],
        "applications": [
            "Small commercial water heater boilers",
            "Laboratory sterilizing basins & oil pools",
            "In-line processing fluid heating",
            "Sterilization equipment pools"
        ],
        "imageUrl": "/src/assets/images/immersion_cluster_ref_1780920087508.webp"
    },
    {
        "id": "brochure-tubular-immersion",
        "name": "Multi-Element Immersion Heaters",
        "slug": "multi-element-immersion-heaters",
        "subtitle": "Multi-Element U-Tubes | Brass Screw Plug",
        "category": "tubular-heaters",
        "description": "Robust heating elements bundled in parallel U-bent configurations welded on heavy brass screw flanges to heat large fluid basins.",
        "longDescription": "These Multi-Element Immersion Heaters aggregate multiple bent mineral-insulated heating elements parallel to each other. Securely welded onto a single brass screw head plug, they supply substantial surface load capacities for boiling process oils, industrial basins, and high volume tanks.",
        "specifications": {
            "power": "3kW - 18kW custom",
            "voltage": "230V / 415V Three Phase configurations",
            "diameter": "2 inch or 2.5 inch BSP/NPT threads",
            "heatedLength": "300mm - 1200mm custom",
            "maxTemperature": "Up to 550°C sheathing limit",
            "material": "SS304 / SS316 / Incoloy alloy sheathing"
        },
        "features": [
            "Multi-element configuration multiplies thermal transfer",
            "Superb MgO insulation prevents voltage spikes & leakage",
            "Heavy duty brass screw base fits standard industrial wells",
            "Optional sealed junction boxes for wet environment protection"
        ],
        "applications": [
            "Large industrial crude oil heating reservoirs",
            "Textile processing dye chemical pools",
            "Heavy duty water baths and bulk boilers",
            "High capacity manufacturing washing lines"
        ],
        "imageUrl": "/src/assets/images/multi_immersion_ref_1780920071201.webp"
    },
    {
        "id": "brochure-tubular-fins",
        "name": "Finned Air Heaters",
        "slug": "finned-air-heaters",
        "subtitle": "SS304 Heli-Crimped Fins | Threaded Mounts",
        "category": "tubular-heaters",
        "description": "Steel fins helically wrapped and tightly crimped on a tubular heater base to significantly expand convection surfaces inside dry air ovens.",
        "longDescription": "Designed to provide rapid convective airflow dispersion, these Finned Air Heaters are fitted with helically crimped stainless steel fins. This doubles the visual active surface footprint, protecting the inner element coils from rapid burn-out and speeding drying loops.",
        "specifications": {
            "power": "500W - 6000W standard",
            "voltage": "220V - 440V",
            "diameter": "8mm tubular core with 25mm crimped fin ring",
            "heatedLength": "200mm - 2200mm custom",
            "maxTemperature": "Up to 450°C convective process",
            "material": "SS304 / SS321 stainless steel"
        },
        "features": [
            "Heli-crimped continuous fins maximize heating area by 2.5x",
            "Drastically reduces thermal resistance for safe element longevity",
            "SS304 high heating response supports accurate fast PID loops",
            "Standard brass thread mounting flanges on both terminals"
        ],
        "applications": [
            "Forced ventilation packaging shrink tunnels",
            "Paint curing baking cabinets and draft booths",
            "Industrial food dehydration chambers",
            "Central air ventilation and furnace ducts"
        ],
        "imageUrl": "/src/assets/images/finned_air_ref_1780920106330.webp"
    },
    {
        "id": "brochure-shortwave-ir",
        "name": "Short Wave Infrared Heaters",
        "slug": "standard-short-wave-infrared-heaters",
        "subtitle": "Peak 950°C in < 2 sec | Standard Ceramic Gold/White Coating",
        "category": "infrared",
        "description": "Coiled tungsten filaments inside quartz gas-flushed tubes. Standard ceramic white reflect backing redirects 90% of radiation forward toward active web targets.",
        "longDescription": "Short-wave halogen emitters convey rapid electromagnetic infrared light directly into target pigments. It achieves instantaneous full thermal efficiency on-demand, eliminating slow batch preheating routines.",
        "specifications": {
            "power": "500W - 4000W standard",
            "voltage": "115V / 230V / 415V",
            "diameter": "10mm / 11mm double bore options",
            "heatedLength": "100mm - 1800mm",
            "maxTemperature": "Filament up to 1800°C, Outer 900°C",
            "wavelength": "0.9µm - 1.6µm (Short Wave)",
            "material": "High purity optical clear Quartz Glass"
        },
        "features": [
            "Less than 2 seconds thermal reaction speed",
            "Rear dynamic gold reflector reflects 95% heat forward",
            "Custom gas flushed environment protects tungsten coil",
            "Available in standard round tube or stable twin tube bores"
        ],
        "applications": [
            "Automotive paint drying systems",
            "High speed conveyor film reactivation",
            "Paper mill moisture evaporation grids",
            "PTFE bottle pre-forming stations"
        ],
        "imageUrl": "/src/assets/images/infrared_quartz_heater_1780916164777.webp"
    },
    {
        "id": "brochure-ceramic-ir",
        "name": "Ceramic Infrared Heaters",
        "slug": "ceramic-infrared-heaters",
        "subtitle": "60W - 1000W | Resistant curved & flat elements",
        "category": "ceramic",
        "description": "Glazed cast-in alloy heaters designed for vacuum thermoforming systems. Impervious to aggressive splash moisture, chemical vapor corrosion, or acid vapors.",
        "longDescription": "Cast ceraming long wave emitters are premium industrial space components. These consist of a structured resistance wire completely embedded in an anti-glaze solid ceramic body. It provides complete shielding from industrial splashes, moisture, and acid vapors with standard long wave outputs heavily absorbed by plastic webs.",
        "specifications": {
            "power": "125W / 250W / 500W / 1000W modules",
            "voltage": "230V standard",
            "diameter": "122mm x 122mm or 245mm x 60mm curved plates",
            "heatedLength": "Flat or curved panel modules",
            "maxTemperature": "Up to 720°C surface limit",
            "material": "Glazed high-emissivity Ceramic block"
        },
        "features": [
            "Cast-in alloy element wire is completely airtight",
            "Complete immunity to splash water, chemicals and steam",
            "Standard K-type thermocouple embedded options",
            "Highly uniform planar beam spread layout"
        ],
        "applications": [
            "Plastic thermoforming and compounding ovens",
            "Industrial pre-heating conveyor rigs",
            "Automated packaging heat sealers",
            "Outdoor comfort area systems"
        ],
        "imageUrl": "/src/assets/images/ceramic_ir_ref_1780921664369.webp"
    },
    {
        "id": "brochure-sw-modules",
        "name": "Short Wave IR Modules",
        "slug": "short-wave-ir-modules",
        "subtitle": "Pre-wired array banks | Gold reflectors",
        "category": "ovens",
        "description": "Fully balanced, multi-lamp mechanical blower rigs focusing high-speed heat for automated plastics embossing and packaging film shrink tunnels.",
        "longDescription": "Pre-engineered multi-lamp halogen infrared heating blocks designed for direct mechanical integration. They include custom air blower cooling channels, internal busbars, protective safety grills, and gold reflector backing arrays for peak focusing efficiency.",
        "specifications": {
            "power": "3kW - 60kW bank grids",
            "voltage": "415V Three Phase standard",
            "diameter": "Modular casing: custom sizing",
            "heatedLength": "200mm - 2000mm width ranges",
            "maxTemperature": "Instant adjustable spot up to 950°C",
            "wavelength": "Shortwave halogen emitter lines",
            "material": "Structured aluminum housing with cooling fans"
        },
        "features": [
            "Complete ready-to-run pre-wired electrical terminals",
            "Integrated blowers for sheet cool flow and longevity",
            "Easily linkable in grid configurations",
            "Individual lamp diagnostics on control block"
        ],
        "applications": [
            "Textile processing and continuous fabrics ovens",
            "Paper raw pulp high speed drying belts",
            "Plastic foil thermoforming conveyor zones",
            "Labeling shrink tunnel machines"
        ],
        "imageUrl": "/src/assets/images/infrared_quartz_heater_1780916164777.webp"
    },
    {
        "id": "brochure-mw-modules",
        "name": "Medium Wave IR Heating Modules",
        "slug": "medium-wave-ir-heating-modules",
        "subtitle": "Durable Silica Quartz tubes | Balanced thermal absorption",
        "category": "ovens",
        "description": "Optimized for high-speed continuous line grids, paint ovens, paper pre-heating, moisture evaporation, and surface adhesive reactivation.",
        "longDescription": "These panels use classic medium-wave quartz tube heaters that emit wavelengths perfectly suited for drying water-based coatings, adhesives, and thick polymer substrates, making them highly efficient.",
        "specifications": {
            "power": "2kW - 45kW modular arrays",
            "voltage": "230V / 415V multi-phase",
            "diameter": "Custom height mounting frames",
            "heatedLength": "300mm - 2500mm active line width",
            "maxTemperature": "Up to 600°C surface target",
            "wavelength": "2.1µm - 2.8µm (Medium Wave)",
            "material": "High purity silicate and gold baffle frames"
        },
        "features": [
            "High absorption efficiency in plastics and adhesives",
            "Extremely long-standing structural lamp lifespans",
            "Low blinding light profile reduces operator strain",
            "Instant feedback controls fit solid-state relays"
        ],
        "applications": [
            "Wood finish basecoat water drying lines",
            "Silicone pre-cure baking conveyors",
            "Laminated safety glass foil production",
            "Pulp cardboard continuous press"
        ],
        "imageUrl": "/src/assets/images/infrared_quartz_heater_1780916164777.webp"
    },
    {
        "id": "brochure-bobbin",
        "name": "Bobbin Heaters",
        "slug": "bobbin-heaters",
        "subtitle": "Ceramic support bobbins | Quick Slide-in Replacement",
        "category": "ceramic",
        "description": "Simplifies element replacements: these slide straight into protective metallic tubes without needing to drain chemical oil wells or high pressure liquid tanks.",
        "longDescription": "Bobbin heaters consist of a collection of high-frequency ceramic insulator guides threaded on Ni-Cr resistance coils. It slides directly inside pockets/pipes of liquid tanks. When an element fails, maintenance can change the core in seconds without draining bulk fluids.",
        "specifications": {
            "power": "1000W - 15kW custom scale",
            "voltage": "230V Single / 415V Three Phase",
            "diameter": "24mm / 31mm / 37mm / 45mm bobbins",
            "heatedLength": "150mm - 3000mm length dimensions",
            "maxTemperature": "Up to 650°C process",
            "material": "Refractory ceramic blocks and Ni-Cr wire core"
        },
        "features": [
            "Core replacement without depleting expensive process oils",
            "Malleable ceramic insulators ensure high structural safety",
            "Supports balanced distribution along extreme lengths",
            "Screw thread connectors with ceramic insulating beads"
        ],
        "applications": [
            "Heavy asphalt storage tanks",
            "Large industrial water boiler wells",
            "Paraffin heating containers",
            "Electroplating baths"
        ],
        "imageUrl": "/src/assets/images/bobbin_ref_1780921683173.webp"
    },
    {
        "id": "brochure-micro-tubular",
        "name": "Micro Tubular Heaters",
        "slug": "micro-tubular-heaters",
        "subtitle": "Nozzle-wrapped coiled heaters | Maximum local watts output",
        "category": "tubular-heaters",
        "description": "Highly compact helically coiled elements designed for plastic injection molds where maximum local power output and miniature fitting spaces are vital.",
        "longDescription": "Micro tubular heaters are extremely small-diameter mineral insulated resistors built to sustain high structural loads. They can lay linear, of custom flat spiral coils, or wrapping tight cylindrical cylinders around plastics injection hot runner molds with minimal thermal loss.",
        "specifications": {
            "power": "100W - 1200W",
            "voltage": "12V - 240V configurations",
            "diameter": "Cross sections: 3.0mm, 3.2mm, or 4.2mm flat profiles",
            "heatedLength": "Coiled to match custom mold cavities",
            "maxTemperature": "Up to 600°C constant operation",
            "material": "Stainless Steel / Inconel sheath guide"
        },
        "features": [
            "Maximum localized thermal capacity inside tiny dimensions",
            "Integrated interior type J/K thermal sensor line probe",
            "Moisture-proof fiberglass or metal-braid lead protection",
            "Adaptable profile wrapping delivers full 360° direct heating"
        ],
        "applications": [
            "Subminiature hot runner molding tips",
            "Plastic nozzle tips and warmers",
            "Analytical device heated valves",
            "Packaging hot sealing pins"
        ],
        "imageUrl": "/src/assets/images/cartridge_heater_1780916136779.webp"
    },
    {
        "id": "brochure-quartz-tubes",
        "name": "Clear & Milky Quartz Tubes",
        "slug": "clear-milky-quartz-tubes",
        "subtitle": "99.98% SiO2 Purity | Ultra-low -OH Hydrosol indexes",
        "category": "quartz-tubes",
        "description": "Floro-silica tubes available in opaque milky or transparent glass options. Resistant to temperature changes, ideal for microwave furnaces and car baking systems.",
        "longDescription": "Premium quality silica glass bodies designed with exceptional mechanical stability and extremely high chemical resistance. Able to survive rapid temperature swings from hot kiln status directly down into cool liquids without fractures or stress cracks.",
        "specifications": {
            "power": "Tubes only - non-resistive envelopes",
            "voltage": "Passive protective sleeve",
            "diameter": "Outer diameters 8mm to 100mm standard lines",
            "heatedLength": "Sleeves cut precisely to length up to 2500mm",
            "maxTemperature": "1150°C constant structural threshold",
            "material": "99.98% pure melted Quartz glass cylinders"
        },
        "features": [
            "Extremely low thermal expansion coefficient prevents crack shock",
            "High transmittance index across full infrared spectra",
            "Chemical, acid, and steam corrosion proofing",
            "Milky frosted or clear transparency selections"
        ],
        "applications": [
            "Quartz infrared heater protective enclosures",
            "High temperature laboratory reaction ovens",
            "Microwave heating systems and furnaces",
            "Ozone disinfection apparatus guards"
        ],
        "imageUrl": "/src/assets/images/infrared_quartz_heater_1780916164777.webp"
    }
]
