// GeoJSON / Waypoint spatial coordinates for National Infrastructure Projects
// Corridors include Delhi-Mumbai Expressway, Western DFC, Eastern DFC, MAHSR Bullet Train,
// Bengaluru-Chennai Expressway, Amritsar-Jamnagar Corridor, Ken-Betwa Canal, and SVAMITVA Clusters.

export interface CorridorWaypoint {
  name: string;
  position: [number, number]; // [lat, lng]
  state: string;
  type: 'terminal' | 'interchange' | 'junction' | 'station' | 'dam_siphon' | 'cluster';
  details?: string;
  parcelsDemarcated?: number;
}

export interface MapProjectCorridor {
  id: string;
  code: string;
  name: string;
  shortName: string;
  corridorType: 'expressway' | 'rail_freight' | 'high_speed_rail' | 'waterway_canal' | 'rural_cadastre';
  agency: string;
  ministry: string;
  color: string;
  totalLengthKm?: number;
  totalParcels: number;
  surveyedParcels: number;
  demarcatedParcels: number;
  awardsPassed: number;
  payoutsCompleted: number;
  allocatedBudgetCr: number;
  disbursedBudgetCr: number;
  status: 'on_schedule' | 'minor_delay' | 'critical_bottleneck';
  gazetteRef: string;
  statesCovered: string[];
  coordinates: [number, number][]; // Line coordinates [lat, lng]
  waypoints: CorridorWaypoint[];
  description: string;
}

export const NATIONAL_PROJECT_CORRIDORS: MapProjectCorridor[] = [
  {
    id: 'proj_dme_01',
    code: 'NHAI-EC-44-DME',
    name: 'Delhi-Mumbai Expressway Green Corridor',
    shortName: 'Delhi-Mumbai Expwy',
    corridorType: 'expressway',
    agency: 'NHAI (National Highways Authority of India)',
    ministry: 'Ministry of Road Transport and Highways',
    color: '#f97316', // Orange
    totalLengthKm: 1386,
    totalParcels: 1420,
    surveyedParcels: 1380,
    demarcatedParcels: 1250,
    awardsPassed: 1110,
    payoutsCompleted: 980,
    allocatedBudgetCr: 1240.0,
    disbursedBudgetCr: 940.5,
    status: 'minor_delay',
    gazetteRef: 'S.O. 1428(E) - Sec 3A/3D',
    statesCovered: ['Haryana', 'Rajasthan', 'Madhya Pradesh', 'Gujarat', 'Maharashtra'],
    description: '1,386 km 8-lane access-controlled greenfield expressway cutting transit time between Delhi and Mumbai to 12 hours.',
    coordinates: [
      [28.248, 77.062], // Sohna / Delhi NCR
      [27.850, 76.820], // Nuh / Mewat
      [27.553, 76.634], // Alwar
      [27.180, 76.510], // Rajgarh
      [26.892, 76.338], // Dausa / Jaipur Spur
      [26.450, 76.320], // Lalsot
      [26.002, 76.353], // Sawai Madhopur
      [25.620, 76.120], // Indragarh
      [25.183, 75.834], // Kota Gateway
      [24.650, 75.520], // Bhanpura
      [24.072, 75.068], // Mandsaur
      [23.680, 75.050], // Jaora
      [23.331, 75.036], // Ratlam Junction
      [22.837, 74.256], // Dahod (Gujarat border)
      [22.775, 73.614], // Godhra
      [22.307, 73.181], // Vadodara Multi-Modal Hub
      [21.705, 72.995], // Bharuch Narmada Bridge
      [21.170, 72.831], // Surat Logistics Node
      [20.950, 72.930], // Navsari
      [20.599, 72.934], // Valsad
      [20.371, 72.904], // Vapi
      [19.980, 72.840], // Palghar / Dahanu
      [19.456, 72.809], // Virar Spur
      [19.180, 72.960], // Thane Connector
      [18.950, 72.950], // JNPT Mumbai Port Terminal
    ],
    waypoints: [
      { name: 'Sohna Gateway Interchange (Km 0)', position: [28.248, 77.062], state: 'Haryana', type: 'terminal', details: 'Northern terminus connecting KMP Expressway' },
      { name: 'Dausa-Jaipur Major Interchange (Km 240)', position: [26.892, 76.338], state: 'Rajasthan', type: 'interchange', details: 'Connectivity to Pink City Jaipur & NH-21' },
      { name: 'Kota Chambal River Viaduct (Km 410)', position: [25.183, 75.834], state: 'Rajasthan', type: 'junction', details: 'Cable-stayed viaduct crossing Chambal River' },
      { name: 'Ratlam Multi-Modal Logistics Hub (Km 650)', position: [23.331, 75.036], state: 'Madhya Pradesh', type: 'junction', details: 'Central MP agrarian cargo transit park' },
      { name: 'Vadodara Golden Quadrilateral Interchange (Km 920)', position: [22.307, 73.181], state: 'Gujarat', type: 'interchange', details: 'Integrated with Ahmedabad-Vadodara NE-1' },
      { name: 'Surat Maritime Logistics Node (Km 1080)', position: [21.170, 72.831], state: 'Gujarat', type: 'interchange', details: 'Diamond & textile logistics export hub' },
      { name: 'JNPT Port Southern Terminal (Km 1386)', position: [18.950, 72.950], state: 'Maharashtra', type: 'terminal', details: 'Direct container port connectivity' },
    ],
  },
  {
    id: 'proj_wdfc_02',
    code: 'DFCCIL-WEST-CORR-02',
    name: 'Western Dedicated Freight Corridor (Dadri-JNPT)',
    shortName: 'Western DFC Rail',
    corridorType: 'rail_freight',
    agency: 'DFCCIL (Dedicated Freight Corridor Corp)',
    ministry: 'Ministry of Railways',
    color: '#2563eb', // Blue
    totalLengthKm: 1504,
    totalParcels: 860,
    surveyedParcels: 840,
    demarcatedParcels: 790,
    awardsPassed: 740,
    payoutsCompleted: 680,
    allocatedBudgetCr: 950.0,
    disbursedBudgetCr: 810.0,
    status: 'on_schedule',
    gazetteRef: 'MOR-DFC-SEC20A-8910',
    statesCovered: ['Uttar Pradesh', 'Haryana', 'Rajasthan', 'Gujarat', 'Maharashtra'],
    description: '1,504 km double-stack electrified heavy-haul freight railway moving 12,000-tonne container trains from northern ICDs to Mumbai ports.',
    coordinates: [
      [28.552, 77.554], // Dadri ICD
      [28.320, 77.150], // Sohna WDFC
      [28.183, 76.618], // Rewari Junction
      [27.680, 75.950], // Narnaul
      [27.280, 75.520], // Ringas
      [26.877, 75.241], // Phulera Junction
      [26.449, 74.639], // Ajmer
      [25.733, 73.616], // Marwar Junction
      [25.050, 73.120], // Falna
      [24.482, 72.782], // Abu Road
      [24.172, 72.433], // Palanpur
      [23.588, 72.369], // Mehsana
      [22.986, 72.378], // Sanand / Ahmedabad GIDC
      [22.316, 73.170], // Vadodara Yard
      [21.710, 73.010], // Bharuch Yard
      [21.210, 72.845], // Surat Udhna Yard
      [20.610, 72.940], // Valsad
      [20.360, 72.910], // Vapi
      [19.820, 72.780], // Boisar
      [19.380, 72.830], // Vasai Road
      [18.950, 72.950], // JNPT Freight Terminal
    ],
    waypoints: [
      { name: 'Dadri Inland Container Depot (Km 0)', position: [28.552, 77.554], state: 'Uttar Pradesh', type: 'terminal', details: 'Mega multi-modal logistics hub and northern freight origin' },
      { name: 'Rewari Junction Junction (Km 140)', position: [28.183, 76.618], state: 'Haryana', type: 'junction', details: 'Double stack electric container interchange' },
      { name: 'Phulera Operational Yard (Km 360)', position: [26.877, 75.241], state: 'Rajasthan', type: 'station', details: 'Central Rajasthan freight marshalling yard' },
      { name: 'Palanpur Gujarat Gateway (Km 790)', position: [24.172, 72.433], state: 'Gujarat', type: 'junction', details: 'Junction connecting Mundra & Kandla port branches' },
      { name: 'Sanand Industrial Rail Siding (Km 920)', position: [22.986, 72.378], state: 'Gujarat', type: 'station', details: 'Automobile manufacturing export siding' },
      { name: 'Vadodara Freight Yard (Km 1050)', position: [22.316, 73.170], state: 'Gujarat', type: 'junction', details: 'Heavy axle haul inspection hub' },
      { name: 'JNPT Marine Container Siding (Km 1504)', position: [18.950, 72.950], state: 'Maharashtra', type: 'terminal', details: 'Deepwater container terminal direct rail link' },
    ],
  },
  {
    id: 'proj_edfc_09',
    code: 'DFCCIL-EAST-CORR-01',
    name: 'Eastern Dedicated Freight Corridor (Ludhiana to Sonnagar)',
    shortName: 'Eastern DFC Rail',
    corridorType: 'rail_freight',
    agency: 'DFCCIL (Ministry of Railways)',
    ministry: 'Ministry of Railways',
    color: '#0284c7', // Sky Blue
    totalLengthKm: 1337,
    totalParcels: 1180,
    surveyedParcels: 1160,
    demarcatedParcels: 1120,
    awardsPassed: 1080,
    payoutsCompleted: 1040,
    allocatedBudgetCr: 890.0,
    disbursedBudgetCr: 840.0,
    status: 'on_schedule',
    gazetteRef: 'MOR-EDFC-SEC20E-2018',
    statesCovered: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Bihar'],
    description: '1,337 km heavy haul freight artery transporting thermal coal and agrarian staples between Punjab and the eastern mineral heartland.',
    coordinates: [
      [30.901, 75.857], // Ludhiana
      [30.640, 76.320], // Sirhind
      [30.375, 76.782], // Ambala Cantt
      [29.964, 77.546], // Saharanpur
      [29.470, 77.700], // Muzaffarnagar
      [28.984, 77.706], // Meerut
      [28.580, 77.780], // Bulandshahr
      [28.252, 77.854], // Khurja Junction
      [27.880, 78.080], // Aligarh
      [27.208, 78.241], // Tundla
      [26.920, 78.850], // Etawah
      [26.449, 80.331], // Kanpur Central Yard
      [25.928, 80.813], // Fatehpur
      [25.435, 81.846], // Prayagraj (Allahabad)
      [25.281, 83.120], // Pt. Deen Dayal Upadhyaya (Mughalsarai)
      [24.952, 84.016], // Sasaram
      [24.908, 84.185], // Sonnagar (Bihar)
    ],
    waypoints: [
      { name: 'Ludhiana Northern Terminal (Km 0)', position: [30.901, 75.857], state: 'Punjab', type: 'terminal', details: 'Northern agrarian & industrial origin point' },
      { name: 'Khurja Electrified Junction (Km 395)', position: [28.252, 77.854], state: 'Uttar Pradesh', type: 'junction', details: 'Intersection with Dadri link of WDFC' },
      { name: 'Kanpur Central Freight Terminal (Km 670)', position: [26.449, 80.331], state: 'Uttar Pradesh', type: 'station', details: 'Industrial hub and inland clearing depot' },
      { name: 'Pt. Deen Dayal Upadhyaya Junction (Km 920)', position: [25.281, 83.120], state: 'Uttar Pradesh', type: 'junction', details: 'Asia largest railway marshalling yard' },
      { name: 'Sonnagar Coal Link Terminus (Km 1337)', position: [24.908, 84.185], state: 'Bihar', type: 'terminal', details: 'Coal corridor connection to Jharia & Raniganj basins' },
    ],
  },
  {
    id: 'proj_mahsr_bullet_06',
    code: 'NHSRCL-MAHSR-01',
    name: 'Mumbai-Ahmedabad High-Speed Rail (MAHSR Bullet Train)',
    shortName: 'Bullet Train (MAHSR)',
    corridorType: 'high_speed_rail',
    agency: 'NHSRCL (National High Speed Rail Corp)',
    ministry: 'Ministry of Railways',
    color: '#059669', // Emerald Green
    totalLengthKm: 508,
    totalParcels: 1650,
    surveyedParcels: 1650,
    demarcatedParcels: 1645,
    awardsPassed: 1640,
    payoutsCompleted: 1630,
    allocatedBudgetCr: 1850.0,
    disbursedBudgetCr: 1820.0,
    status: 'on_schedule',
    gazetteRef: 'MAHSRCL-RO-SEC20E-2019',
    statesCovered: ['Maharashtra', 'Gujarat', 'Dadra and Nagar Haveli'],
    description: 'India premier 320 km/h Shinkansen high-speed rail line connecting Mumbai (BKC) to Ahmedabad in 2 hours and 7 minutes.',
    coordinates: [
      [19.066, 72.868], // Bandra Kurla Complex (BKC Underground Station)
      [19.218, 72.978], // Thane Station
      [19.456, 72.810], // Virar Elevated Station
      [19.802, 72.755], // Boisar Station
      [20.371, 72.910], // Vapi High Speed Station
      [20.763, 72.964], // Bilimora Station
      [21.210, 72.860], // Surat High Speed Terminal
      [21.710, 73.020], // Bharuch Elevated Station
      [22.315, 73.190], // Vadodara High Speed Station
      [22.564, 72.928], // Anand / Nadiad Station
      [23.022, 72.571], // Ahmedabad Kalupur Terminal
      [23.080, 72.585], // Sabarmati Multimodal Hub
    ],
    waypoints: [
      { name: 'Mumbai BKC Underground Terminal (Km 0)', position: [19.066, 72.868], state: 'Maharashtra', type: 'terminal', details: 'Sub-surface 6-platform terminal connecting to 21km undersea tunnel' },
      { name: 'Thane High Speed Station (Km 21)', position: [19.218, 72.978], state: 'Maharashtra', type: 'station', details: 'Suburban Mumbai connector hub' },
      { name: 'Vapi Industrial Station (Km 167)', position: [20.371, 72.910], state: 'Gujarat', type: 'station', details: 'First high-speed station in Gujarat state' },
      { name: 'Surat High Speed Terminal (Km 265)', position: [21.210, 72.860], state: 'Gujarat', type: 'station', details: 'Diamond City iconic terminal on 12m elevated viaduct' },
      { name: 'Vadodara High Speed Station (Km 396)', position: [22.315, 73.190], state: 'Gujarat', type: 'station', details: 'Steel truss bridge crossing existing Indian Railways lines' },
      { name: 'Sabarmati Multimodal Transport Hub (Km 508)', position: [23.080, 72.585], state: 'Gujarat', type: 'terminal', details: 'Integrated terminal connecting Metro, IR, and BRTS' },
    ],
  },
  {
    id: 'proj_bengaluru_chennai_05',
    code: 'NHAI-NE-7-BCE',
    name: 'Bengaluru-Chennai Expressway (NE-7 National Corridor)',
    shortName: 'Bengaluru-Chennai Expwy',
    corridorType: 'expressway',
    agency: 'NHAI (MoRTH)',
    ministry: 'Ministry of Road Transport and Highways',
    color: '#8b5cf6', // Violet/Purple
    totalLengthKm: 262,
    totalParcels: 1120,
    surveyedParcels: 1090,
    demarcatedParcels: 1040,
    awardsPassed: 990,
    payoutsCompleted: 920,
    allocatedBudgetCr: 740.0,
    disbursedBudgetCr: 685.0,
    status: 'on_schedule',
    gazetteRef: 'S.O. 2918(E) - NHAI NE7',
    statesCovered: ['Karnataka', 'Andhra Pradesh', 'Tamil Nadu'],
    description: '262 km 4-lane access-controlled greenfield expressway slashing travel time between Bengaluru and Chennai from 6.5 hours to 2.5 hours.',
    coordinates: [
      [13.072, 77.798], // Hoskote (Bengaluru Urban)
      [13.003, 77.940], // Malur
      [12.981, 78.196], // Bangarapet / KGF Spur
      [13.120, 78.450], // Venkatagirikota
      [13.200, 78.750], // Palamaner (Andhra Pradesh)
      [13.217, 79.100], // Chittoor Gateway
      [13.120, 79.250], // Gudipala
      [12.930, 79.333], // Ranipet / Walajah (Tamil Nadu)
      [13.083, 79.667], // Arakkonam
      [12.972, 79.944], // Sriperumbudur Industrial Hub
      [13.068, 80.165], // Maduravoyal (Chennai bypass)
    ],
    waypoints: [
      { name: 'Hoskote Western Terminus (Km 0)', position: [13.072, 77.798], state: 'Karnataka', type: 'terminal', details: 'Bengaluru Satellite Town Ring Road integration' },
      { name: 'Bangarapet / Kolar Interchange (Km 45)', position: [12.981, 78.196], state: 'Karnataka', type: 'interchange', details: 'Gold Fields logistics feeder' },
      { name: 'Chittoor Andhra Gateway (Km 125)', position: [13.217, 79.100], state: 'Andhra Pradesh', type: 'interchange', details: 'Crosses Chittoor agro-processing belt' },
      { name: 'Ranipet SIPCOT Interchange (Km 185)', position: [12.930, 79.333], state: 'Tamil Nadu', type: 'interchange', details: 'Leather and heavy engineering export corridor' },
      { name: 'Sriperumbudur Automobile Gateway (Km 245)', position: [12.972, 79.944], state: 'Tamil Nadu', type: 'terminal', details: 'Chennai manufacturing belt connection' },
    ],
  },
  {
    id: 'proj_amritsar_jamnagar_07',
    code: 'NHAI-EC-AJ-754K',
    name: 'Amritsar-Jamnagar Economic Corridor (NH-754K)',
    shortName: 'Amritsar-Jamnagar Corridor',
    corridorType: 'expressway',
    agency: 'NHAI & State PWDs',
    ministry: 'Ministry of Road Transport and Highways',
    color: '#ec4899', // Pink
    totalLengthKm: 1257,
    totalParcels: 1350,
    surveyedParcels: 1310,
    demarcatedParcels: 1260,
    awardsPassed: 1190,
    payoutsCompleted: 1080,
    allocatedBudgetCr: 1150.0,
    disbursedBudgetCr: 995.0,
    status: 'on_schedule',
    gazetteRef: 'S.O. 4120(E) - NHAI AJ',
    statesCovered: ['Punjab', 'Haryana', 'Rajasthan', 'Gujarat'],
    description: '1,257 km economic corridor connecting HPCL Bathinda, HMEL, and Reliance Jamnagar refineries with agricultural export terminals.',
    coordinates: [
      [31.634, 74.872], // Amritsar
      [30.211, 74.945], // Bathinda Refinery Node
      [29.581, 74.328], // Hanumangarh
      [29.321, 73.901], // Suratgarh
      [28.022, 73.311], // Bikaner Junction
      [27.150, 73.180], // Nagaur
      [26.238, 73.024], // Jodhpur
      [25.925, 72.247], // Pachpadra (Barmer Refinery)
      [25.752, 71.400], // Barmer
      [24.755, 71.772], // Sanchore
      [23.834, 71.603], // Radhanpur
      [23.275, 70.470], // Samakhiali / Kandla Link
      [22.470, 70.060], // Jamnagar Refining Complex
    ],
    waypoints: [
      { name: 'Amritsar Golden Temple Gateway (Km 0)', position: [31.634, 74.872], state: 'Punjab', type: 'terminal', details: 'Northern international trade gateway' },
      { name: 'Bathinda Refinery Interchange (Km 155)', position: [30.211, 74.945], state: 'Punjab', type: 'interchange', details: 'HPCL Petrochemicals direct access spur' },
      { name: 'Bikaner Thar Desert Node (Km 420)', position: [28.022, 73.311], state: 'Rajasthan', type: 'junction', details: 'Solar corridor green energy transmission intersection' },
      { name: 'Pachpadra Mega Refinery Spur (Km 780)', position: [25.925, 72.247], state: 'Rajasthan', type: 'junction', details: 'HPCL Rajasthan Refinery 9 MMTPA complex' },
      { name: 'Jamnagar Petrochemical Port (Km 1257)', position: [22.470, 70.060], state: 'Gujarat', type: 'terminal', details: 'World largest refining hub terminus' },
    ],
  },
  {
    id: 'proj_ken_betwa_08',
    code: 'NWDA-KBLP-CANAL-01',
    name: 'Ken-Betwa River Interlinking Link Canal',
    shortName: 'Ken-Betwa Link Canal',
    corridorType: 'waterway_canal',
    agency: 'NWDA & Ken-Betwa Link Project Authority',
    ministry: 'Ministry of Jal Shakti',
    color: '#06b6d4', // Cyan
    totalLengthKm: 221,
    totalParcels: 980,
    surveyedParcels: 890,
    demarcatedParcels: 790,
    awardsPassed: 650,
    payoutsCompleted: 510,
    allocatedBudgetCr: 820.0,
    disbursedBudgetCr: 480.0,
    status: 'minor_delay',
    gazetteRef: 'JAL-SHAKTI-KBLP-2022-01',
    statesCovered: ['Madhya Pradesh', 'Uttar Pradesh'],
    description: '221 km link canal transferring surplus water from Ken River basin to Betwa River, bringing drinking water to 62 lakh people in Bundelkhand.',
    coordinates: [
      [24.635, 79.865], // Daodhan Dam site (Ken River)
      [24.780, 79.720], // Panna National Park perimeter bypass
      [24.890, 79.550], // Chhatarpur Canal Reach
      [25.010, 79.340], // Nowgong Siphon
      [25.120, 79.120], // Tikamgarh Aqueduct
      [25.260, 78.910], // Mauranipur Feeder
      [25.375, 78.730], // Barua Sagar on Betwa River
    ],
    waypoints: [
      { name: 'Daodhan Dam Headworks (Km 0)', position: [24.635, 79.865], state: 'Madhya Pradesh', type: 'dam_siphon', details: '77m high concrete gravity dam on Ken River' },
      { name: 'Panna Eco-Buffer Canal Tunnel (Km 35)', position: [24.780, 79.720], state: 'Madhya Pradesh', type: 'dam_siphon', details: 'Underground conduit preserving wildlife migration corridor' },
      { name: 'Tikamgarh Super Passage (Km 120)', position: [25.120, 79.120], state: 'Madhya Pradesh', type: 'junction', details: 'Drought relief irrigation branch channel' },
      { name: 'Barua Sagar Betwa Outfall (Km 221)', position: [25.375, 78.730], state: 'Uttar Pradesh', type: 'terminal', details: 'Discharge into Betwa reservoir for Bundelkhand distribution' },
    ],
  },
  {
    id: 'proj_svamitva_03',
    code: 'SVAMITVA-NAT-CAD-2024',
    name: 'SVAMITVA National Rural Abadi Cadastre Clusters',
    shortName: 'SVAMITVA Drone Clusters',
    corridorType: 'rural_cadastre',
    agency: 'Survey of India & MoPR',
    ministry: 'Ministry of Panchayati Raj',
    color: '#14b8a6', // Teal
    totalParcels: 2800,
    surveyedParcels: 2650,
    demarcatedParcels: 2410,
    awardsPassed: 2180,
    payoutsCompleted: 1950,
    allocatedBudgetCr: 650.0,
    disbursedBudgetCr: 580.0,
    status: 'on_schedule',
    gazetteRef: 'MoPR-SVAMITVA-DIR-01/2020',
    statesCovered: ['Maharashtra', 'Madhya Pradesh', 'Uttar Pradesh', 'Haryana', 'Karnataka'],
    description: 'Survey of India 5cm GSD drone orthomosaics and geodetic CORS network creating definitive digital Property Cards across rural Abadi settlements.',
    coordinates: [
      [18.528, 73.856], // Pune Haveli Gaothan (Maharashtra)
      [19.876, 75.343], // Aurangabad Rural Abadi (Maharashtra)
      [22.719, 75.857], // Indore Sanwer Cluster (Madhya Pradesh)
      [23.259, 77.412], // Bhopal Rural Cluster (Madhya Pradesh)
      [25.317, 82.973], // Varanasi Kashi Rural Abadi (Uttar Pradesh)
      [26.846, 80.946], // Lucknow Mohanlalganj Abadi (Uttar Pradesh)
      [28.993, 77.015], // Sonipat Rai Rural Abadi (Haryana)
    ],
    waypoints: [
      { name: 'Haveli Gaothan Pilot #01', position: [18.528, 73.856], state: 'Maharashtra', type: 'cluster', details: '54 household digital property cards issued via drone survey' },
      { name: 'Indore Sanwer Rural Abadi', position: [22.719, 75.857], state: 'Madhya Pradesh', type: 'cluster', details: '120 inhabited homesteads demarcated with CORS GNSS pegs' },
      { name: 'Varanasi Kashi Abadi Unit', position: [25.317, 82.973], state: 'Uttar Pradesh', type: 'cluster', details: 'Gharoni digital cards linked to Land Revenue Code' },
      { name: 'Sonipat Rai Industrial Cluster', position: [28.993, 77.015], state: 'Haryana', type: 'cluster', details: 'Lal Dora boundary abolished with high-precision drone maps' },
    ],
  },
];
