import os
import json
import urllib.request
from supabase import create_client

PRODUCTS_DATA = [
    {
        "id": "short-wave-infrared-heaters",
        "name": "Short Wave Infrared Heaters",
        "slug": "short-wave-infrared-heaters",
        "subtitle": "High-Speed IR Heating | Tungsten Filament | Rapid Thermal Response",
        "category": "infrared",
        "description": "High-intensity infrared heaters designed for rapid, direct heating where high temperatures must be achieved in the shortest possible time.",
        "longDescription": "Heat One Short Wave Infrared Heaters use a helically wound tungsten resistance filament enclosed in a quartz envelope. The element provides extremely rapid thermal response, making it suitable for ON/OFF heating and high-speed industrial processes. The heaters are available in different lengths, wattages, voltages, and configurations, including single and twin tube designs and optional reflective coatings.",
        "specifications": {
            "power": "500W – 3000W",
            "voltage": "240V / 415V",
            "diameter": "Single Tube / Twin Tube Quartz Construction",
            "heatedLength": "212mm – 1120mm overall length",
            "maxTemperature": "Above 2450°C filament temperature",
            "wavelength": "Short Wave IR — approximately 0.8–1.5 μm",
            "material": "Quartz Envelope with Ceramic Insulating Caps"
        },
        "features": [
            "Tungsten filament",
            "Extremely rapid response",
            "Over 90% IR energy emission within approximately 1 second",
            "Single and twin tube options",
            "Clear or coated versions",
            "High heating intensity",
            "Custom lengths and electrical ratings"
        ],
        "applications": [
            "PET preform heating",
            "PET bottle and jar blowing",
            "Screen-printing curing",
            "Textile heating",
            "Printing ink drying",
            "Paper coating and drying",
            "Powder coating",
            "Paint curing",
            "Rubber coating and drying",
            "Lamination"
        ],
        "imageUrl": "/src/assets/images/infrared_quartz_heater_1780916164777.webp"
    },
    {
        "id": "medium-wave-infrared-heater",
        "name": "Medium Wave Quartz Infrared Heaters",
        "slug": "medium-wave-infrared-heater",
        "subtitle": "Medium Wave IR | Quartz Tube | High-Efficiency Radiant Heating",
        "category": "infrared",
        "description": "Quartz infrared heating elements designed for efficient medium-wave radiant heating across industrial and commercial applications.",
        "longDescription": "Heat One Medium Wave Quartz Infrared Heaters consist of a helically wound resistance coil housed inside a pure vitreous silica fused-quartz tube. Ceramic insulating caps provide secure electrical termination and mechanical support. The heaters are designed for horizontal installation and can be supplied in different diameters and lengths according to application requirements.",
        "specifications": {
            "power": "500W – 4000W custom",
            "voltage": "110V / 230V / 415V",
            "diameter": "8mm / 10mm / 12mm / 15mm / 19mm",
            "heatedLength": "300mm – 1500mm",
            "maxTemperature": "Up to 800°C",
            "wavelength": "1.5 – 3.0 μm",
            "material": "Pure Fused Silica Quartz with Ceramic Insulating Caps"
        },
        "features": [
            "High-purity quartz tube",
            "Helically wound resistance coil",
            "Excellent thermal-shock resistance",
            "Ceramic end caps",
            "High-temperature cement termination",
            "Horizontal installation",
            "Custom lengths and wattages"
        ],
        "applications": [
            "Plastic heating",
            "Food warming",
            "Packaging",
            "Drying",
            "Adhesive heating",
            "Solvent heating",
            "Industrial ovens",
            "Thermoforming"
        ],
        "imageUrl": "/src/assets/images/infrared_quartz_heater_1780916164777.webp"
    },
    {
        "id": "twin-tube-carbon-infrared-heaters",
        "name": "Twin Tube Carbon Infrared Heaters",
        "slug": "twin-tube-carbon-infrared-heaters",
        "subtitle": "Twin Tube Carbon IR | Fast Response | High-Efficiency Heating",
        "category": "infrared",
        "description": "High-performance twin-tube infrared heaters designed for rapid, efficient and uniform heating of industrial materials and surfaces.",
        "longDescription": "Heat One Twin Tube Carbon Infrared Heaters use carbon-based infrared heating elements housed within quartz tubes to provide rapid radiant heat transfer. The twin-tube construction provides a broader heating area and improved heat distribution, making the heaters suitable for continuous production lines and high-speed thermal processes.",
        "specifications": {
            "power": "500W – 3000W",
            "voltage": "230V / 415V",
            "diameter": "Twin Quartz Tube",
            "heatedLength": "300mm – 1500mm custom",
            "maxTemperature": "Up to 1200°C surface temperature",
            "wavelength": "Approximately 2.0 – 5.0 μm",
            "material": "Quartz Glass with Ceramic End Caps"
        },
        "features": [
            "Twin-tube construction",
            "Carbon infrared element",
            "Fast thermal response",
            "High radiant efficiency",
            "Wide heating coverage",
            "Optional reflector coating",
            "Custom dimensions"
        ],
        "applications": [
            "Plastic thermoforming",
            "PET processing",
            "Paint curing",
            "Textile drying",
            "Printing",
            "Lamination",
            "Adhesive curing",
            "Industrial drying"
        ],
        "imageUrl": "/src/assets/images/infrared_quartz_heater_1780916164777.webp"
    },
    {
        "id": "ceramic-infrared-heaters",
        "name": "Ceramic Infrared Heaters",
        "slug": "ceramic-infrared-heaters",
        "subtitle": "Long Wave IR | Ceramic Radiators | 60W–1000W",
        "category": "ceramic",
        "description": "Durable ceramic infrared emitters designed for efficient long-wave radiant heating, drying, curing and thermoforming applications.",
        "longDescription": "Heat One Ceramic Infrared Heaters incorporate resistance heating elements into a glazed ceramic body. The ceramic surface provides effective infrared radiation and allows heaters to be arranged into radiation areas of different geometries. Multiple sizes, shapes, colours and power ratings are available.",
        "specifications": {
            "power": "60W – 1000W",
            "voltage": "230V standard",
            "diameter": "245 × 60mm / 122 × 60mm / 122 × 122mm",
            "heatedLength": "122mm – 245mm",
            "maxTemperature": "Up to 720°C",
            "wavelength": "Long Wave IR — approximately 3–10 μm",
            "material": "Glazed Ceramic"
        },
        "features": [
            "High-temperature ceramic body",
            "Excellent radiant performance",
            "Multiple shapes",
            "White and yellow standard colours",
            "Curved and flat designs",
            "Thermocouple option",
            "Suitable for custom radiation areas"
        ],
        "applications": [
            "Vacuum forming",
            "Thermoforming",
            "Plastic heating",
            "Drying",
            "Curing",
            "Ovens",
            "Industrial radiant heating"
        ],
        "imageUrl": "/src/assets/images/ceramic_ir_ref_1780921664369.webp"
    },
    {
        "id": "bobbin-heaters",
        "name": "Bobbin Heaters",
        "slug": "bobbin-heaters",
        "subtitle": "Compact Coil Heating | High-Temperature Ceramic Support",
        "category": "ceramic",
        "description": "Compact resistance heating elements designed for localized heating in industrial equipment and confined installation spaces.",
        "longDescription": "Heat One Bobbin Heaters are compact resistance heating assemblies designed around a ceramic bobbin structure. The heating coil is securely supported and insulated to provide dependable electrical performance and efficient heat transfer. Custom coil dimensions, wattage and termination configurations can be supplied according to equipment requirements.",
        "specifications": {
            "power": "100W – 2000W custom",
            "voltage": "110V / 230V / 415V",
            "diameter": "Ceramic Bobbin / Coiled Element",
            "heatedLength": "50mm – 500mm custom",
            "maxTemperature": "Up to 800°C",
            "wavelength": "Primarily conductive / convective heating",
            "material": "High-Temperature Ceramic"
        },
        "features": [
            "Compact construction",
            "Ceramic electrical insulation",
            "High-temperature resistance coil",
            "Custom winding density",
            "Custom terminals",
            "Long operating life"
        ],
        "applications": [
            "Industrial machinery",
            "Small ovens",
            "Heating chambers",
            "Laboratory equipment",
            "Plastic-processing equipment",
            "Localized process heating"
        ],
        "imageUrl": "/src/assets/images/bobbin_ref_1780921683173.webp"
    },
    {
        "id": "micro-tubular-heaters",
        "name": "Micro Tubular Heaters",
        "slug": "micro-tubular-heaters",
        "subtitle": "Compact Tubular Heating | 360° Heating | Fast Response",
        "category": "tubular-heaters",
        "description": "Compact, flexible tubular heaters designed for efficient heating in restricted spaces and complex installation geometries.",
        "longDescription": "Heat One Micro Tubular Heaters feature a compact swaged construction with a resistance element embedded in high-purity magnesium oxide insulation. They can be manufactured in different shapes and configurations and provide 360° heating around the tubular surface. J or K type thermocouples can also be incorporated for temperature monitoring.",
        "specifications": {
            "power": "100W – 2000W custom",
            "voltage": "110V / 230V / 415V",
            "diameter": "Round or Square Tubular",
            "heatedLength": "50mm – 1000mm custom",
            "maxTemperature": "Up to 750°C",
            "wavelength": "Primarily conductive / convective",
            "material": "High-Purity Magnesium Oxide"
        },
        "features": [
            "360° heating",
            "Compact design",
            "Fast response",
            "Quick heat transfer",
            "Corrosion-resistant sheath",
            "Helical coil option",
            "J/K thermocouple option",
            "Custom forming"
        ],
        "applications": [
            "Compact machinery",
            "Molds and dies",
            "Sealing equipment",
            "Small ovens",
            "Plastic processing",
            "Laboratory equipment",
            "Fluid heating"
        ],
        "imageUrl": "/src/assets/images/cartridge_heater_1780916136779.webp"
    },
    {
        "id": "finned-air-heaters",
        "name": "Finned Air Heaters",
        "slug": "finned-air-heaters",
        "subtitle": "High-Surface-Area Air Heating | SS Tube | Rapid Heat Transfer",
        "category": "tubular-heaters",
        "description": "Finned tubular heaters designed to maximize surface area and provide rapid, efficient heating of moving air and gases.",
        "longDescription": "Heat One Finned Air Heaters use tubular resistance heating elements fitted with metal fins to increase the effective heat-transfer surface. The finned construction improves air contact and allows rapid transfer of heat to circulating air. Different tube diameters, lengths, wattages and mounting configurations can be supplied.",
        "specifications": {
            "power": "500W – 5000W custom",
            "voltage": "230V / 415V",
            "diameter": "6.5mm / 8mm tubular element with fins",
            "heatedLength": "200mm – 2000mm custom",
            "maxTemperature": "Up to 650°C sheath temperature",
            "wavelength": "Primarily convective heating",
            "material": "Magnesium Oxide with Chrome-Nickel Steel Sheath"
        },
        "features": [
            "Extended finned surface",
            "Rapid air heat transfer",
            "High-temperature resistance",
            "Swaged construction",
            "Moisture-protected terminals",
            "Custom shapes"
        ],
        "applications": [
            "Air heating systems",
            "Industrial ovens",
            "Drying chambers",
            "HVAC equipment",
            "Air ducts",
            "Heating tunnels",
            "Packaging machines"
        ],
        "imageUrl": "/src/assets/images/finned_air_ref_1780920106330.webp"
    },
    {
        "id": "standard-band-heaters",
        "name": "Standard Mica Band Heaters",
        "slug": "standard-band-heaters",
        "subtitle": "Flexible Mica Insulation | Uniform Heat Distribution | Custom Fit",
        "category": "ceramic",
        "description": "Flexible and economical band heaters designed for uniform heating of molds, dies, nozzles and plastic-processing machine barrels.",
        "longDescription": "Heat One Standard Band Heaters use mica insulation around a resistance element and are designed for reliable surface heating. The heaters can be manufactured in round, flat, rectangular, square or hexagonal configurations and supplied as one-piece or two-piece assemblies. Integral clamping arrangements simplify installation.",
        "specifications": {
            "power": "250W – 5000W custom",
            "voltage": "110V / 230V / 415V",
            "diameter": "Round / Flat / Box / Custom",
            "heatedLength": "50mm – 1000mm custom",
            "maxTemperature": "Up to 300°C",
            "wavelength": "Primarily conductive heating",
            "material": "Mica Insulation"
        },
        "features": [
            "Flexible construction",
            "Integral clamping",
            "Uniform heat distribution",
            "One-piece or two-piece design",
            "Leads or terminals",
            "Custom shapes",
            "Energy-saving insulation"
        ],
        "applications": [
            "Plastic extruders",
            "Injection molding machines",
            "Molds",
            "Dies",
            "Nozzles",
            "Machine barrels",
            "Plastic-processing machinery"
        ],
        "imageUrl": "/src/assets/images/standard_band_ref_1780920054390.webp"
    },
    {
        "id": "ceramic-band-heaters",
        "name": "Ceramic Band Heaters",
        "slug": "ceramic-band-heaters",
        "subtitle": "Flexible Ceramic Mat | Energy Efficient | High-Temperature Barrel Heating",
        "category": "ceramic",
        "description": "Flexible ceramic band heaters designed for efficient, uniform heating of industrial barrels, cylinders and processing equipment.",
        "longDescription": "Heat One Ceramic Band Heaters use a helically wound Nickel-Chrome resistance coil precisely positioned through specially designed ceramic insulating bricks. The ceramic heating mat is combined with ceramic-fiber insulation inside a stainless-steel housing with serrated edges, providing flexibility during installation and efficient thermal performance.",
        "specifications": {
            "power": "500W – 8000W custom",
            "voltage": "230V / 415V",
            "diameter": "Round / Cylindrical / Custom",
            "heatedLength": "100mm – 1500mm custom",
            "maxTemperature": "Up to 700°C",
            "wavelength": "Primarily conductive heating",
            "material": "Ceramic Bricks + Ceramic Fiber"
        },
        "features": [
            "Nickel-Chrome resistance coil",
            "Flexible ceramic mat",
            "Stainless-steel housing",
            "Serrated edges",
            "Energy-efficient insulation",
            "Uniform heat distribution",
            "Custom clamping"
        ],
        "applications": [
            "Plastic extruders",
            "Injection molding machines",
            "Barrel heating",
            "Dies",
            "Nozzles",
            "Plastic-processing machinery"
        ],
        "imageUrl": "/src/assets/images/ceramic_band_ref_1780920035217.webp"
    },
    {
        "id": "high-density-cartridge-heaters",
        "name": "High Watt Density Cartridge Heaters",
        "slug": "high-density-cartridge-heaters",
        "subtitle": "12 W/cm² High Watt Density | SS304/SS316 | Long Service Life",
        "category": "infrared",
        "description": "High-density cartridge heaters designed for rapid and efficient heating of molds, dies, packaging machinery and industrial equipment.",
        "longDescription": "Heat One High Watt Density Cartridge Heaters use a Nickel-Chrome resistance wire embedded in compressed magnesium oxide insulation and enclosed in a high-temperature stainless-steel or alloy sheath. SS304 and SS316 versions are available with high watt density up to 12 W/cm². Built-in thermocouples and different termination configurations can be supplied according to application requirements.",
        "specifications": {
            "power": "100W – 5000W custom",
            "voltage": "110V / 230V / 415V",
            "diameter": "6mm – 25mm custom",
            "heatedLength": "25mm – 1000mm custom",
            "maxTemperature": "Up to 800°C",
            "wavelength": "Primarily conductive heating",
            "material": "Compressed High-Purity Magnesium Oxide"
        },
        "features": [
            "High watt density",
            "SS304 / SS316 sheath",
            "Nickel-Chrome resistance wire",
            "MgO insulation",
            "Built-in thermocouple option",
            "Multiple termination options",
            "Custom lead lengths",
            "Long operating life"
        ],
        "applications": [
            "Molds & dies",
            "Labeling machines",
            "Packaging equipment",
            "Laminating equipment",
            "Liquid heating",
            "Gas heating"
        ],
        "imageUrl": "/src/assets/images/cartridge_heater_1780916136779.webp"
    },
    {
        "id": "multi-element-immersion-heaters",
        "name": "Multi Element Immersion Heaters",
        "slug": "multi-element-immersion-heaters",
        "subtitle": "Multi-Tube Immersion Heating | High Capacity | Fluid Heating",
        "category": "tubular-heaters",
        "description": "Multi-element tubular heaters designed for efficient heating of water, oil, chemicals and industrial process fluids.",
        "longDescription": "Heat One Multi Element Immersion Heaters combine multiple tubular heating elements into a common mounting assembly for high-capacity fluid heating. The elements are manufactured using high-temperature resistance wire, magnesium oxide insulation and corrosion-resistant metal sheathing. Threaded or flange-mounted configurations allow secure installation through tank walls.",
        "specifications": {
            "power": "1000W – 15000W custom",
            "voltage": "230V / 415V",
            "diameter": "Multiple Tubular Elements with Flange or Threaded Mounting",
            "heatedLength": "200mm – 1500mm custom",
            "maxTemperature": "Up to 650°C sheath temperature",
            "wavelength": "Convective / Immersion Heating",
            "material": "High-Purity Magnesium Oxide"
        },
        "features": [
            "Multiple heating elements",
            "High heating capacity",
            "Corrosion-resistant sheath",
            "Swaged construction",
            "Moisture-resistant terminals",
            "Threaded/flange mounting",
            "Custom element spacing"
        ],
        "applications": [
            "Water tanks",
            "Oil tanks",
            "Chemical tanks",
            "Industrial process vessels",
            "Boilers",
            "Washing systems",
            "Cleaning equipment"
        ],
        "imageUrl": "/src/assets/images/multi_immersion_ref_1780920071201.webp"
    },
    {
        "id": "small-immersion-heater-clusters",
        "name": "Small Immersion Heater Clusters",
        "slug": "small-immersion-heater-clusters",
        "subtitle": "Compact Immersion Heating | Brass Thread | Protective Terminal Caps",
        "category": "tubular-heaters",
        "description": "Compact immersion elements designed for efficient heating of fluids in small tanks, laboratory vessels and compact industrial equipment.",
        "longDescription": "Heat One Small Immersion Heater Clusters provide concentrated heat distribution for compact fluid-heating applications. High-durability threaded mounting provides secure installation, while insulated terminal caps protect electrical connections from moisture and accidental contact. Custom wattage, dimensions and mounting arrangements can be supplied.",
        "specifications": {
            "power": "500W – 3000W custom",
            "voltage": "230V / 415V standard",
            "diameter": "1/2 inch or 1 inch NPT",
            "heatedLength": "100mm – 350mm custom",
            "maxTemperature": "Up to 350°C",
            "wavelength": "Convective / Immersion Heating",
            "material": "High-Purity MgO with Copper/Nickel Sheathing and Brass Mounting"
        },
        "features": [
            "Compact element cluster",
            "Brass threaded mounting",
            "Shock-resistant terminal caps",
            "Moisture-resistant connections",
            "High heat-transfer efficiency",
            "Custom dimensions",
            "Corrosion-resistant construction"
        ],
        "applications": [
            "Small water heaters",
            "Laboratory sterilizing baths",
            "Oil heating",
            "Small fluid tanks",
            "In-line fluid heating",
            "Chemical processing",
            "Sterilization equipment"
        ],
        "imageUrl": "/src/assets/images/immersion_cluster_ref_1780920087508.webp"
    },
    {
        "id": "quartz-glass-heating-elements",
        "name": "Quartz Glass Heating Elements",
        "slug": "quartz-glass-heating-elements",
        "subtitle": "Pure Silica Quartz | Medium Wave Radiation | Thermal Shock Resistant",
        "category": "quartz-tubes",
        "description": "High-performance quartz heating elements designed for uniform medium-wave infrared radiation and efficient industrial heating.",
        "longDescription": "Heat One Quartz Glass Heating Elements feature a helically wound resistance coil housed inside a high-purity fused quartz tube. The quartz construction provides excellent thermal-shock resistance and allows efficient infrared transmission. Ceramic insulating caps and high-temperature cement provide secure electrical termination.",
        "specifications": {
            "power": "500W – 4000W custom",
            "voltage": "110V / 230V / 415V",
            "diameter": "8mm / 10mm / 12mm / 15mm / 19mm",
            "heatedLength": "300mm – 1500mm",
            "maxTemperature": "Up to 800°C",
            "wavelength": "1.5 – 3.0 μm",
            "material": "Fused Silica Quartz + Ceramic End Caps"
        },
        "features": [
            "High-purity quartz",
            "Helically wound resistance coil",
            "Excellent thermal shock resistance",
            "Ceramic end caps",
            "High-temperature cement",
            "Uniform heat distribution",
            "Custom dimensions"
        ],
        "applications": [
            "Food warming",
            "Plastic heating",
            "Packaging",
            "Drying",
            "Adhesive heating",
            "Solvent heating",
            "Industrial ovens",
            "Thermoforming"
        ],
        "imageUrl": "/src/assets/images/infrared_quartz_heater_1780916164777.webp"
    },
    {
        "id": "ceramic-infrared-panels",
        "name": "Ceramic Infrared Heating Panels",
        "slug": "ceramic-infrared-panels",
        "subtitle": "Long Wave IR Panel | Ceramic Surface | Custom Radiation Areas",
        "category": "ceramic",
        "description": "Ceramic infrared panels designed to provide uniform radiant heating across large or specially shaped heating areas.",
        "longDescription": "Heat One Ceramic Infrared Panels use high-temperature ceramic infrared emitters arranged into a panel configuration to provide controlled and uniform radiant heat. Multiple heater shapes and layouts can be combined to create radiation zones suited to the geometry of the product being heated.",
        "specifications": {
            "power": "250W – 5000W custom",
            "voltage": "230V / 415V",
            "diameter": "Flat / Curved Ceramic Panel",
            "heatedLength": "122mm – 500mm per element",
            "maxTemperature": "Up to 720°C",
            "wavelength": "Long Wave IR — approximately 3–10 μm",
            "material": "High-Temperature Glazed Ceramic"
        },
        "features": [
            "Modular panel construction",
            "Uniform radiant heating",
            "Multiple ceramic shapes",
            "High-temperature operation",
            "Custom radiation zones",
            "Optional temperature sensing",
            "Suitable for large heating areas"
        ],
        "applications": [
            "Vacuum forming",
            "Thermoforming",
            "Plastic sheet heating",
            "Drying",
            "Curing",
            "Industrial ovens",
            "Surface heating"
        ],
        "imageUrl": "/src/assets/images/ceramic_ir_ref_1780921664369.webp"
    },
    {
        "id": "infrared-batch-conveyor-ovens",
        "name": "Infrared Batch & Conveyor Ovens",
        "slug": "infrared-batch-conveyor-ovens",
        "subtitle": "Industrial IR Ovens | Batch & Continuous Heating | Energy Efficient",
        "category": "ovens",
        "description": "Industrial infrared ovens designed for controlled batch and continuous heating, drying, curing and surface-treatment processes.",
        "longDescription": "Heat One Infrared Batch & Conveyor Ovens combine infrared heating elements with insulated heating chambers and controlled material movement systems. The systems can be configured with short-wave, medium-wave or ceramic infrared emitters depending on the material and required heating profile. Conveyor configurations allow continuous production while batch ovens provide controlled heating for individual loads.",
        "specifications": {
            "power": "5kW – 100kW+ custom",
            "voltage": "230V / 415V / 3-Phase",
            "diameter": "Batch Chamber / Conveyor Tunnel",
            "heatedLength": "Custom chamber and conveyor dimensions",
            "maxTemperature": "Up to 500°C chamber temperature",
            "wavelength": "Short / Medium / Long Wave IR",
            "material": "Ceramic Fiber / Mineral Wool / Reflective Insulation"
        },
        "features": [
            "Batch or continuous operation",
            "Multi-zone temperature control",
            "Infrared heating modules",
            "Adjustable conveyor speed",
            "Insulated heating chamber",
            "Custom heating zones",
            "Energy-efficient radiant heating"
        ],
        "applications": [
            "Paint curing",
            "Powder coating",
            "Printing",
            "Lamination",
            "Plastic heating",
            "Rubber curing",
            "Textile drying",
            "Food warming",
            "Industrial drying"
        ],
        "imageUrl": "/src/assets/images/glowing_heater_banner_1780912353211.webp"
    },
    {
        "id": "short-wave-ir-modules",
        "name": "Short Wave Infrared Heating Modules",
        "slug": "short-wave-ir-modules",
        "subtitle": "High-Intensity Short Wave IR | Modular Heating | Rapid Response",
        "category": "ovens",
        "description": "Compact infrared heating modules designed to provide concentrated short-wave radiant heating in industrial equipment and custom heating systems.",
        "longDescription": "Heat One Short Wave IR Modules integrate short-wave infrared emitters into compact reflector assemblies to direct radiant energy toward the target surface. Their modular construction allows multiple units to be combined into customized heating zones for precise industrial heating applications.",
        "specifications": {
            "power": "500W – 3000W per module",
            "voltage": "230V / 415V",
            "diameter": "Narrow / Wider Module",
            "heatedLength": "Custom modular configuration",
            "maxTemperature": "Up to 1000°C target heating capability",
            "wavelength": "Approximately 0.8–1.5 μm",
            "material": "Quartz / Ceramic Insulation"
        },
        "features": [
            "Compact modular design",
            "Short-wave IR emitters",
            "Reflector-assisted heating",
            "Rapid thermal response",
            "Easy integration",
            "Custom heating zones",
            "High radiant intensity"
        ],
        "applications": [
            "Plastic processing",
            "Printing",
            "Paint curing",
            "Lamination",
            "Drying",
            "Packaging",
            "Thermoforming"
        ],
        "imageUrl": "/src/assets/images/infrared_quartz_heater_1780916164777.webp"
    },
    {
        "id": "medium-wave-ir-heating-modules",
        "name": "Medium Wave Infrared Heating Modules",
        "slug": "medium-wave-ir-heating-modules",
        "subtitle": "80% Radiant Efficiency | 30–60 Sec Response | 2.5–3.0 μm",
        "category": "ovens",
        "description": "Efficient modular infrared heating units designed for rapid, controlled medium-wave heating in industrial applications.",
        "longDescription": "Heat One Medium Wave IR Heating Modules provide concentrated medium-wave infrared radiation through compact modular assemblies. Their high radiant efficiency, rapid heat-up and cool-down characteristics make them suitable for applications requiring responsive and energy-efficient heating. Modules can be arranged into multiple heating zones.",
        "specifications": {
            "power": "500W – 3000W per module",
            "voltage": "230V / 415V",
            "diameter": "Full-Length / Half-Length Module",
            "heatedLength": "125mm / 248mm",
            "maxTemperature": "Up to 800°C",
            "wavelength": "2.5 – 3.0 μm",
            "material": "Ceramic / Quartz Insulation"
        },
        "features": [
            "Radiant efficiency up to 80%",
            "Rapid heat-up",
            "Rapid cool-down",
            "30–60 second response",
            "Watt density up to 40 W/in²",
            "Low power consumption",
            "Modular installation"
        ],
        "applications": [
            "Plastic heating",
            "Drying",
            "Curing",
            "Packaging",
            "Food warming",
            "Lamination",
            "Industrial ovens",
            "Surface heating"
        ],
        "imageUrl": "/src/assets/images/infrared_quartz_heater_1780916164777.webp"
    },
    {
        "id": "clear-milky-quartz-tubes",
        "name": "Clear & Milky Quartz Glass Tubes",
        "slug": "clear-milky-quartz-tubes",
        "subtitle": "High-Purity Quartz | Thermal Stability | Infrared & Immersion Applications",
        "category": "quartz-tubes",
        "description": "High-purity quartz glass tubes available in clear and milky configurations for infrared heating, industrial ovens and specialized thermal applications.",
        "longDescription": "Heat One Quartz Glass Tubes are manufactured from high-purity quartz materials and are available in clear and opaque milky configurations. Clear quartz provides excellent spectral transmission, controlled dimensions and low hydroxyl content. Milky quartz provides strong heat resistance and high thermal stability and is suitable for infrared heating and oven applications. Closed-end versions can also be used for silica immersion heating applications.",
        "specifications": {
            "power": "Application dependent / Custom",
            "voltage": "Application dependent",
            "diameter": "Round / Custom Quartz Tube",
            "heatedLength": "300mm – 1500mm custom",
            "maxTemperature": "Up to approximately 1000°C depending on application",
            "wavelength": "High spectral transmission / Infrared compatible",
            "material": "High-Purity Quartz / Fused Silica"
        },
        "features": [
            "Clear and milky variants",
            "High-purity quartz",
            "Excellent thermal stability",
            "Strong heat resistance",
            "Good spectral transmission",
            "Controlled dimensions",
            "Custom lengths",
            "Closed-end option"
        ],
        "applications": [
            "Infrared heating elements",
            "Microwave ovens",
            "Electrical baking ovens",
            "Car-paint baking",
            "Industrial heating",
            "Quartz heating elements",
            "Silica immersion heaters"
        ],
        "imageUrl": "/src/assets/images/infrared_quartz_heater_1780916164777.webp"
    }
]

# 1. Update backend/seed_data.py
with open("backend/seed_data.py", "w", encoding="utf-8") as f:
    f.write("# Seed data for Heat One Technology catalog database\n\nSEED_PRODUCTS = " + json.dumps(PRODUCTS_DATA, indent=4) + "\n")
print("Updated backend/seed_data.py with all 18 brochure products.")

# 2. Sync to Supabase
url = "https://amfsxtgljegkkbkgtwpm.supabase.co"
key = "sb_publishable_QywuvEw3Hd-kPmEns1QuzA_rr_S2oP5"
supabase = create_client(url, key)

print("Purging existing products in Supabase...")
try:
    supabase.table("products").delete().neq("id", "___dummy___").execute()
    print("Purged old products from Supabase.")
except Exception as e:
    print("Purge warning:", e)

print("Inserting 18 new brochure products into Supabase...")
seeded = []
for idx, p in enumerate(PRODUCTS_DATA):
    item = dict(p)
    item["order"] = idx
    seeded.append(item)

res = supabase.table("products").upsert(seeded).execute()
print(f"Successfully inserted {len(res.data or seeded)} products into Supabase!")

