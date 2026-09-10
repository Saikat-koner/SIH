// Comprehensive Government Land Portals, National Infrastructure Projects, and Pre-trained Knowledge Base
// Sources: dilrmp.gov.in, svamitva.nic.in, bhuvan.nrsc.gov.in, bhoomirashi.gov.in, gatishakti.gov.in, dfccil.com

export interface GovPortal {
  id: string;
  name: string;
  abbreviation: string;
  ministry: string;
  officialUrl: string;
  badge: string;
  category: 'cadastre_records' | 'drone_mapping' | 'satellite_gis' | 'highway_acquisition' | 'multi_modal' | 'railway_freight';
  description: string;
  coreFeatures: string[];
  liveMetrics: {
    label: string;
    value: string;
    trend: string;
  }[];
  standardsCompliance: string[];
  integrationStatus: 'active' | 'syncing' | 'verified';
}

export interface NationalInfrastructureProject {
  id: string;
  code: string;
  name: string;
  corridor: string;
  executingAgency: string;
  ministry: string;
  portalSource: string;
  totalLengthKm?: number;
  totalParcels: number;
  surveyedParcels: number;
  demarcatedParcels: number;
  awardsPassed: number;
  payoutsCompleted: number;
  allocatedBudgetCr: number;
  disbursedBudgetCr: number;
  escrowBudgetCr: number;
  status: 'on_schedule' | 'minor_delay' | 'critical_bottleneck' | 'completed';
  targetCompletionDate: string;
  statesCovered: string[];
  gazetteNotificationRef: string;
  activeBottlenecksCount: number;
  description: string;
  keyMilestones: {
    stage: string;
    status: 'completed' | 'in_progress' | 'pending';
    date: string;
    details: string;
  }[];
}

export interface GovKnowledgeTopic {
  id: string;
  question: string;
  category: 'compensation_rules' | 'drone_cors' | 'statutory_acts' | 'ulpin_gis' | 'gati_shakti' | 'dispute_resolution';
  tags: string[];
  summary: string;
  detailedAnswer: string;
  officialReferences: {
    title: string;
    sectionOrClause: string;
    portalOrAct: string;
    url?: string;
  }[];
  formula?: string;
  exampleCalculation?: string;
}

export const OFFICIAL_GOV_PORTALS: GovPortal[] = [
  {
    id: 'portal_bhuvan',
    name: 'Bhuvan Indian Geo-Platform (ISRO)',
    abbreviation: 'ISRO Bhuvan',
    ministry: 'Department of Space / Indian Space Research Organisation (ISRO)',
    officialUrl: 'https://bhuvan.nrsc.gov.in',
    badge: 'National Spatial Data Infrastructure',
    category: 'satellite_gis',
    description: 'National Geoportal developed by NRSC/ISRO providing multi-resolution optical satellite imagery (Cartosat-2/3, Resourcesat-2A LISS-IV), Cadastral overlays, Bhuvan-Panchayat spatial planning, and geodetic baselines.',
    coreFeatures: [
      'High-Resolution Satellite Orthorectified Imagery (0.28m Cartosat-3 stereo)',
      'Bhuvan Cadastre layer covering 1.2+ lakh revenue village boundaries',
      'Continuous Operating Reference Station (CORS) geodetic control integration',
      'Web Map Service (WMS) & Web Feature Service (WFS) spatial data pipelines',
    ],
    liveMetrics: [
      { label: 'CORS Stations Active', value: '1,024', trend: '+14 this quarter' },
      { label: 'Cadastral Orthomosaics', value: '28,450', trend: '99.4% georeferenced' },
      { label: 'Spatial Resolution', value: '0.28m - 2.5m', trend: 'Cartosat-3 sub-meter' },
      { label: 'Map Layers Hosted', value: '240+', trend: 'Multi-spectral WMS' },
    ],
    standardsCompliance: ['OGC WMS 1.3.0', 'OGC WFS 2.0', 'EPSG:4326 (WGS84)', 'ISRO NNRMS Standards'],
    integrationStatus: 'active',
  },
  {
    id: 'portal_svamitva',
    name: 'SVAMITVA Rural Cadastre & Property Cards',
    abbreviation: 'MoPR SVAMITVA',
    ministry: 'Ministry of Panchayati Raj & Survey of India',
    officialUrl: 'https://svamitva.nic.in',
    badge: 'Flagship Central Scheme',
    category: 'drone_mapping',
    description: 'National mission for Survey of Villages and Mapping with Improvised Technology in Village Areas using professional drone photogrammetry to provide rural citizens with undisputed digital Property Cards (Sampatti Patrak / Gharoni).',
    coreFeatures: [
      'Survey of India High-Precision Drone photogrammetry with 5cm GSD accuracy',
      'Rural Abadi (inhabited) parcel boundary demarcation using limestone chuna powder',
      'Legal Record of Rights (RoR) & QR-verified Sampatti Patrak for bank loan collateral',
      'Gram Sabha public objection resolution and digital boundary sign-off',
    ],
    liveMetrics: [
      { label: 'Villages Drone-Surveyed', value: '3,12,450', trend: '48.2% of national total' },
      { label: 'Property Cards Generated', value: '1,48,20,000+', trend: '+2.4L weekly' },
      { label: 'States & UTs Covered', value: '31', trend: 'All major states' },
      { label: 'Drone Teams Deployed', value: '850+', trend: 'Survey of India units' },
    ],
    standardsCompliance: ['Survey of India Drone SOP v3', 'Digital Property Card Schema 2.1', 'Aadhaar e-KYC'],
    integrationStatus: 'active',
  },
  {
    id: 'portal_dilrmp',
    name: 'Digital India Land Records Modernization Programme',
    abbreviation: 'DoLR DILRMP',
    ministry: 'Department of Land Resources (DoLR), Ministry of Rural Development',
    officialUrl: 'https://dilrmp.gov.in',
    badge: 'National Cadastre Modernization',
    category: 'cadastre_records',
    description: 'National backbone for end-to-end computerized management of land records, cadastral map digitization, Sub-Registrar Office (SRO) integration, and Bhu-Aadhaar / ULPIN rollout.',
    coreFeatures: [
      '14-digit Unique Land Parcel Identification Number (ULPIN / Bhu-Aadhaar) based on geo-coordinates',
      'National Generic Document Registration System (NGDRS) seamless registration',
      'Integration of Revenue Offices, SROs, and Survey departments',
      'Modern Record Rooms (MRR) equipped with digital kiosks in every tehsil',
    ],
    liveMetrics: [
      { label: 'RoR Computerization', value: '95.8%', trend: '6,22,840 villages' },
      { label: 'Cadastral Maps Digitized', value: '82.4%', trend: '24.5 Cr polygons' },
      { label: 'SRO-Revenue Integration', value: '78.1%', trend: 'Real-time mutation' },
      { label: 'Modern Record Rooms', value: '4,890', trend: 'Across 680 districts' },
    ],
    standardsCompliance: ['ULPIN 14-Digit Standard', 'ISO 19152 LADM (Land Admin Domain Model)', 'NIC Bhunaksha'],
    integrationStatus: 'active',
  },
  {
    id: 'portal_bhoomirashi',
    name: 'Bhoomi Rashi Land Acquisition Portal',
    abbreviation: 'MoRTH Bhoomi Rashi',
    ministry: 'Ministry of Road Transport and Highways (MoRTH) & NHAI',
    officialUrl: 'https://bhoomirashi.gov.in',
    badge: 'MoRTH Highway Payouts',
    category: 'highway_acquisition',
    description: 'Statutory single-window digital portal processing national highway land acquisition under NH Act 1956 and RFCTLARR Act 2013, directly integrated with PFMS for Aadhaar-linked DBT payouts to landowners.',
    coreFeatures: [
      'E-Gazette notification processing for Section 3A (intent), 3D (declaration), and 3G (award)',
      'Automated Solatium (100%) and rural multiplier factor calculation',
      'PFMS-NPCI Direct Benefit Transfer (DBT) directly into farmer bank accounts',
      'Real-time tracking of CALA (Competent Authority for Land Acquisition) awards',
    ],
    liveMetrics: [
      { label: 'Notifications Published', value: '12,450+', trend: '3A, 3D & 3G Gazettes' },
      { label: 'Compensation Disbursed', value: '₹1,84,500 Cr', trend: 'Direct PFMS DBT' },
      { label: 'Highway Alignments', value: '18,200 km', trend: 'National corridors' },
      { label: 'Processing Time Saved', value: '62%', trend: 'Reduced from 24 to 9 mos' },
    ],
    standardsCompliance: ['RFCTLARR Act 2013', 'NH Act 1956 (Sec 3A-3J)', 'PFMS Central Gateway', 'E-Gazette API'],
    integrationStatus: 'active',
  },
  {
    id: 'portal_gatishakti',
    name: 'PM Gati Shakti National Master Plan (NMP)',
    abbreviation: 'Gati Shakti NMP',
    ministry: 'DPIIT, Ministry of Commerce and Industry & BISAG-N',
    officialUrl: 'https://gatishakti.gov.in',
    badge: 'Multi-Modal Connectivity',
    category: 'multi_modal',
    description: 'Comprehensive GIS-based spatial planning engine integrating 200+ spatial data layers across 16 Central Ministries (Roadways, Railways, Power, Petroleum, Telecom, Shipping) to prevent conflicting corridor acquisitions.',
    coreFeatures: [
      'Cross-departmental corridor alignment visualization on 1:10,000 satellite maps',
      'Automatic overlap detection preventing utility cuts (e.g. telecom fiber under newly paved highways)',
      'Forest & environmental clearance GIS overlay mapping with automated buffer analysis',
      'Multi-modal logistics hubs, inland container depots, and industrial corridor node planning',
    ],
    liveMetrics: [
      { label: 'Mega Projects Mapped', value: '1,420+', trend: 'All central ministries' },
      { label: 'Spatial Layers Synced', value: '200+', trend: 'Updated bi-weekly' },
      { label: 'Inter-Agency Approvals', value: '18 Days', trend: 'Down from 180 days' },
      { label: 'Corridor Conflicts Averted', value: '3,840+', trend: 'Zero double acquisitions' },
    ],
    standardsCompliance: ['BISAG-N Enterprise GIS', 'National Spatial Framework', 'NIC G-Cloud'],
    integrationStatus: 'active',
  },
  {
    id: 'portal_dfccil',
    name: 'Dedicated Freight Corridor Corporation (DFCCIL)',
    abbreviation: 'Indian Railways DFCCIL',
    ministry: 'Ministry of Railways',
    officialUrl: 'https://dfccil.com',
    badge: 'Mega Rail Freight Corridor',
    category: 'railway_freight',
    description: 'High-speed, heavy-haul dedicated railway corridors connecting industrial hinterlands to oceanic ports (Western DFC: Dadri to JNPT; Eastern DFC: Ludhiana to Sonnagar).',
    coreFeatures: [
      'Linear Right-of-Way (RoW) GIS demarcation with precision geodetic pegging',
      'Automated compensation escrow management with Railway Land Acquisition Act',
      'Over-bridge and underpass access road conflict resolution with local Gram Panchayats',
      'Real-time construction progress synchronization with drone orthophoto monitoring',
    ],
    liveMetrics: [
      { label: 'Total Track Acquired', value: '2,841 km', trend: '96.4% completed' },
      { label: 'Compensation Paid', value: '₹14,200 Cr', trend: 'Fully audited' },
      { label: 'Freight Speed Increase', value: '3x (75 km/h)', trend: 'Heavy haul 12,000T' },
      { label: 'Parcels Demarcated', value: '1,840', trend: 'Western & Eastern DFC' },
    ],
    standardsCompliance: ['Railways Act 1989', 'RFCTLARR 2013 Schedule I-IV', 'RDSO Geodetic Standards'],
    integrationStatus: 'active',
  },
];

export const ALL_NATIONAL_PROJECTS: NationalInfrastructureProject[] = [
  {
    id: 'proj_dme_01',
    code: 'NHAI-EC-44-DME',
    name: 'Delhi-Mumbai Expressway Green Corridor (Packages 1 to 8)',
    corridor: 'Western Industrial Super Corridor (1,386 km)',
    executingAgency: 'National Highways Authority of India (NHAI)',
    ministry: 'Ministry of Road Transport and Highways (MoRTH)',
    portalSource: 'Bhoomi Rashi & PM Gati Shakti',
    totalLengthKm: 1386,
    totalParcels: 1420,
    surveyedParcels: 1380,
    demarcatedParcels: 1250,
    awardsPassed: 1110,
    payoutsCompleted: 980,
    allocatedBudgetCr: 1240.0,
    disbursedBudgetCr: 940.5,
    escrowBudgetCr: 112.0,
    status: 'minor_delay',
    targetCompletionDate: '2025-06-30',
    statesCovered: ['Haryana', 'Rajasthan', 'Madhya Pradesh', 'Gujarat', 'Maharashtra'],
    gazetteNotificationRef: 'S.O. 1428(E) dated 2021-04-12',
    activeBottlenecksCount: 2,
    description: 'Flagship 8-lane expressway connecting Delhi and Mumbai, reducing travel time from 24 to 12 hours. Demarcation requires stringent CORS survey and 100% Solatium payouts.',
    keyMilestones: [
      { stage: 'Section 3A Intention Notification', status: 'completed', date: '2021-04-12', details: 'Published in Central E-Gazette for all 5 states' },
      { stage: 'Survey & CORS Demarcation', status: 'completed', date: '2022-01-18', details: '1,380 parcels surveyed with 5cm GSD drone imagery' },
      { stage: 'Section 3D Declaration of Acquisition', status: 'completed', date: '2022-09-04', details: 'Title vested absolutely in the Union Government' },
      { stage: 'Section 3G CALA Award Determination', status: 'in_progress', date: '2023-11-20', details: '1,110 awards passed; 82 cases in Vadodara pending revision' },
      { stage: 'PFMS Direct Benefit Transfer (DBT)', status: 'in_progress', date: '2024-03-15', details: '₹940.5 Cr credited directly to verified bank accounts' },
    ],
  },
  {
    id: 'proj_wdfc_02',
    code: 'DFCCIL-WEST-CORR-02',
    name: 'Western Dedicated Freight Corridor (Dadri to JNPT)',
    corridor: 'Dadri (UP) - Rewari - Vadodara - Jawaharlal Nehru Port (1,504 km)',
    executingAgency: 'Dedicated Freight Corridor Corporation of India (DFCCIL)',
    ministry: 'Ministry of Railways',
    portalSource: 'DFCCIL & PM Gati Shakti',
    totalLengthKm: 1504,
    totalParcels: 860,
    surveyedParcels: 840,
    demarcatedParcels: 790,
    awardsPassed: 740,
    payoutsCompleted: 680,
    allocatedBudgetCr: 950.0,
    disbursedBudgetCr: 810.0,
    escrowBudgetCr: 65.0,
    status: 'on_schedule',
    targetCompletionDate: '2025-03-31',
    statesCovered: ['Uttar Pradesh', 'Haryana', 'Rajasthan', 'Gujarat', 'Maharashtra'],
    gazetteNotificationRef: 'MOR-DFC-SEC20A-8910',
    activeBottlenecksCount: 1,
    description: 'Double-stack electric container freight corridor connecting northern manufacturing belts directly to Mumbai international sea container terminals.',
    keyMilestones: [
      { stage: 'Preliminary RoW Alignment Verification', status: 'completed', date: '2020-08-14', details: 'Complete spatial verification on Bhuvan-LISS-IV' },
      { stage: 'Joint Measurement Survey (JMS)', status: 'completed', date: '2021-06-20', details: 'Railway and State Revenue officials completed pegging' },
      { stage: 'Statutory Award Declaration', status: 'completed', date: '2022-12-10', details: '740 awards approved by District Collectors' },
      { stage: 'Disbursement & Land Handover', status: 'in_progress', date: '2024-02-28', details: 'Palghar tribal RoW pending Gram Sabha nod' },
    ],
  },
  {
    id: 'proj_svamitva_03',
    code: 'SVAMITVA-NAT-CAD-2024',
    name: 'SVAMITVA National Rural Cadastre & Drone Survey',
    corridor: 'All-India Rural Abadi Village Lands (31 States & UTs)',
    executingAgency: 'Ministry of Panchayati Raj & Survey of India',
    ministry: 'Ministry of Panchayati Raj',
    portalSource: 'svamitva.nic.in & bhuvan.nrsc.gov.in',
    totalParcels: 2800,
    surveyedParcels: 2650,
    demarcatedParcels: 2410,
    awardsPassed: 2180,
    payoutsCompleted: 1950,
    allocatedBudgetCr: 650.0,
    disbursedBudgetCr: 580.0,
    escrowBudgetCr: 28.0,
    status: 'on_schedule',
    targetCompletionDate: '2025-12-31',
    statesCovered: ['Maharashtra', 'Madhya Pradesh', 'Uttar Pradesh', 'Karnataka', 'Haryana', 'Andhra Pradesh'],
    gazetteNotificationRef: 'MoPR-SVAMITVA-DIR-01/2020',
    activeBottlenecksCount: 1,
    description: 'Transformative scheme establishing clear ownership of property in rural inhabited (Abadi) areas with official Property Cards providing legal collateral.',
    keyMilestones: [
      { stage: 'Gram Panchayat Sensitization & Chuna Marking', status: 'completed', date: '2023-01-10', details: 'Limestone marking of 2,650 parcel perimeters' },
      { stage: 'Survey of India Drone Flying', status: 'completed', date: '2023-06-15', details: '5cm GSD Orthomosaics generated' },
      { stage: 'Ground Inquiry & Objections (Gram Sabha)', status: 'completed', date: '2023-11-25', details: 'Field dispute resolution by Gram Sabha resolution' },
      { stage: 'Property Card Distribution', status: 'in_progress', date: '2024-04-05', details: '1,950 digitized cards issued with QR verification' },
    ],
  },
  {
    id: 'proj_dilrmp_04',
    code: 'DILRMP-CAD-REV-09',
    name: 'DILRMP National Land Record Modernization & High-Precision Georeferencing',
    corridor: 'National Digital RoR & Spatial Cadastre Integration',
    executingAgency: 'Department of Land Resources (DoLR)',
    ministry: 'Ministry of Rural Development',
    portalSource: 'dilrmp.gov.in',
    totalParcels: 1940,
    surveyedParcels: 1820,
    demarcatedParcels: 1610,
    awardsPassed: 1430,
    payoutsCompleted: 1310,
    allocatedBudgetCr: 880.0,
    disbursedBudgetCr: 720.0,
    escrowBudgetCr: 85.0,
    status: 'critical_bottleneck',
    targetCompletionDate: '2025-09-30',
    statesCovered: ['Uttar Pradesh', 'Bihar', 'Madhya Pradesh', 'Odisha', 'West Bengal'],
    gazetteNotificationRef: 'DoLR-DILRMP-REV-2023-04',
    activeBottlenecksCount: 2,
    description: 'Integration of 24.5 crore cadastral maps with digital Record of Rights (RoR), ULPIN generation, and Sub-Registrar Office computerized linking.',
    keyMilestones: [
      { stage: 'RoR Data Digitization', status: 'completed', date: '2022-04-10', details: '95.8% legacy paper revenue records converted to PostgreSQL' },
      { stage: 'Cadastral Map Vectorization (FMB)', status: 'completed', date: '2023-02-18', details: 'Geo-referenced shapefiles created in NIC Bhunaksha' },
      { stage: 'ULPIN 14-Digit Generation', status: 'in_progress', date: '2023-10-30', details: '1,610 parcels assigned unique lat/long Bhu-Aadhaar' },
      { stage: 'SRO Real-Time Mutation Linking', status: 'in_progress', date: '2024-03-22', details: 'Automatic post-registration mutation triggered' },
    ],
  },
  {
    id: 'proj_bengaluru_chennai_05',
    code: 'NHAI-NE-7-BCE',
    name: 'Bengaluru-Chennai Expressway (NE-7 National Corridor)',
    corridor: 'Hoskote (KA) to Sriperumbudur (TN) - 262 km',
    executingAgency: 'NHAI & State Revenue Departments',
    ministry: 'Ministry of Road Transport and Highways',
    portalSource: 'Bhoomi Rashi & MoRTH',
    totalLengthKm: 262,
    totalParcels: 1120,
    surveyedParcels: 1090,
    demarcatedParcels: 1040,
    awardsPassed: 990,
    payoutsCompleted: 920,
    allocatedBudgetCr: 740.0,
    disbursedBudgetCr: 685.0,
    escrowBudgetCr: 32.0,
    status: 'on_schedule',
    targetCompletionDate: '2025-08-15',
    statesCovered: ['Karnataka', 'Andhra Pradesh', 'Tamil Nadu'],
    gazetteNotificationRef: 'S.O. 2918(E) - NHAI NE7',
    activeBottlenecksCount: 1,
    description: 'High-speed 4-lane access-controlled expressway linking South Indian manufacturing hubs, cutting transit time from 6.5 hours to 2.5 hours.',
    keyMilestones: [
      { stage: 'Section 3A/3D Notifications', status: 'completed', date: '2021-09-12', details: 'All 3 state gazettes published' },
      { stage: 'CORS Geodetic Pegging', status: 'completed', date: '2022-05-20', details: 'RoW boundary established with 10mm accuracy' },
      { stage: 'Compensation Disbursed', status: 'completed', date: '2023-12-05', details: '₹685 Cr paid via direct bank transfer' },
    ],
  },
  {
    id: 'proj_mahsr_bullet_06',
    code: 'NHSRCL-MAHSR-01',
    name: 'Mumbai-Ahmedabad High Speed Rail (MAHSR Bullet Train)',
    corridor: 'BKC Mumbai to Sabarmati Ahmedabad (508 km)',
    executingAgency: 'National High Speed Rail Corporation Ltd (NHSRCL)',
    ministry: 'Ministry of Railways',
    portalSource: 'NHSRCL & PM Gati Shakti',
    totalLengthKm: 508,
    totalParcels: 1650,
    surveyedParcels: 1650,
    demarcatedParcels: 1645,
    awardsPassed: 1640,
    payoutsCompleted: 1630,
    allocatedBudgetCr: 1850.0,
    disbursedBudgetCr: 1820.0,
    escrowBudgetCr: 18.0,
    status: 'on_schedule',
    targetCompletionDate: '2026-12-31',
    statesCovered: ['Maharashtra', 'Gujarat', 'Dadra and Nagar Haveli'],
    gazetteNotificationRef: 'MAHSRCL-RO-SEC20E-2019',
    activeBottlenecksCount: 0,
    description: 'India first Shinkansen-technology high speed rail line with 99.8% statutory land acquisition completed across Maharashtra and Gujarat.',
    keyMilestones: [
      { stage: 'Joint Measurement Survey (JMS)', status: 'completed', date: '2020-03-10', details: '100% linear parcels pegged with LIDAR & drone' },
      { stage: 'Consent Agreement & Solatium Payout', status: 'completed', date: '2022-11-15', details: '99.8% title holders received compensation with 25% consent bonus' },
      { stage: 'Civil Construction Handover', status: 'completed', date: '2023-08-30', details: 'Viaduct piers and undersea tunnel shaft construction underway' },
    ],
  },
  {
    id: 'proj_amritsar_jamnagar_07',
    code: 'NHAI-EC-AJ-754K',
    name: 'Amritsar-Jamnagar Economic Corridor (NH-754K)',
    corridor: 'Amritsar (Punjab) to Jamnagar (Gujarat) via Rajasthan - 1,257 km',
    executingAgency: 'NHAI & State PWDs',
    ministry: 'Ministry of Road Transport and Highways',
    portalSource: 'Bhoomi Rashi & PM Gati Shakti',
    totalLengthKm: 1257,
    totalParcels: 1350,
    surveyedParcels: 1310,
    demarcatedParcels: 1260,
    awardsPassed: 1190,
    payoutsCompleted: 1080,
    allocatedBudgetCr: 1150.0,
    disbursedBudgetCr: 995.0,
    escrowBudgetCr: 72.0,
    status: 'on_schedule',
    targetCompletionDate: '2025-07-31',
    statesCovered: ['Punjab', 'Haryana', 'Rajasthan', 'Gujarat'],
    gazetteNotificationRef: 'S.O. 4120(E) - NHAI AJ',
    activeBottlenecksCount: 1,
    description: 'Key border logistics expressway connecting major oil refineries (Bathinda, Barmer, Jamnagar) with northern agricultural centers.',
    keyMilestones: [
      { stage: 'Section 3A/3D Gazettes', status: 'completed', date: '2021-03-15', details: 'Land demarcated in Thar desert region' },
      { stage: 'Award Determination', status: 'completed', date: '2023-01-20', details: '1,190 awards passed by Competent Authorities' },
      { stage: 'Direct Payouts (PFMS)', status: 'in_progress', date: '2024-01-18', details: '₹995 Cr credited directly' },
    ],
  },
  {
    id: 'proj_ken_betwa_08',
    code: 'NWDA-KBLP-CANAL-01',
    name: 'Ken-Betwa River Interlinking Canal Project',
    corridor: 'Daodhan Dam to Barua Sagar Canal Alignment (221 km)',
    executingAgency: 'National Water Development Agency (NWDA) & Ken-Betwa Link Authority',
    ministry: 'Ministry of Jal Shakti',
    portalSource: 'PM Gati Shakti & Bhuvan',
    totalLengthKm: 221,
    totalParcels: 980,
    surveyedParcels: 890,
    demarcatedParcels: 790,
    awardsPassed: 650,
    payoutsCompleted: 510,
    allocatedBudgetCr: 820.0,
    disbursedBudgetCr: 480.0,
    escrowBudgetCr: 110.0,
    status: 'minor_delay',
    targetCompletionDate: '2026-03-31',
    statesCovered: ['Madhya Pradesh', 'Uttar Pradesh'],
    gazetteNotificationRef: 'JAL-SHAKTI-KBLP-2022-01',
    activeBottlenecksCount: 2,
    description: 'National river interlinking priority project providing irrigation to 10.6 lakh hectares in drought-prone Bundelkhand region.',
    keyMilestones: [
      { stage: 'Environmental Buffer Mapping (Bhuvan GIS)', status: 'completed', date: '2022-08-10', details: 'Panna Tiger Reserve buffer demarcated with zero encroachment' },
      { stage: 'JMS Joint Cadastral Survey', status: 'completed', date: '2023-05-12', details: '890 parcels surveyed with GNSS' },
      { stage: 'Resettlement & Rehabilitation (R&R) Awards', status: 'in_progress', date: '2024-02-14', details: 'Special R&R package under RFCTLARR Section 31 passed' },
    ],
  },
];

export const GOV_KNOWLEDGE_BASE: GovKnowledgeTopic[] = [
  {
    id: 'kb_compensation_formula',
    question: 'How is statutory compensation calculated for rural vs urban land under RFCTLARR Act 2013?',
    category: 'compensation_rules',
    tags: ['RFCTLARR 2013', 'Section 26', 'Section 30', 'Solatium', 'Rural Multiplier'],
    summary: 'Compensation = [Market Value × Rural Multiplier (1.25x to 2.0x)] + Standing Assets + 100% Solatium + 12% Per Annum Additional Interest.',
    detailedAnswer: `Under the Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (RFCTLARR Act 2013):
1. **Base Market Value (Section 26):** Whichever is higher among:
   - Registered sale deeds of similar land in vicinity over the preceding 3 years.
   - Average circle rate (Collector Guidance Value) for the revenue village.
   - Consented amount agreed upon for private company acquisition.
2. **Multiplier Factor (First Schedule):**
   - Urban Areas: Factor of **1.0x**
   - Rural Areas: Sliding scale from **1.25x to 2.0x** depending on radial distance from closest municipal corporation boundary.
3. **Standing Assets (Section 29):**
   - Separate valuation for standing crops, timber/fruit trees (evaluated by Forest/Horticulture Officer), and civil structures (wells, drip systems, farm sheds by PWD executive engineer).
4. **Statutory Solatium (Section 30(1)):**
   - Mandated **100% Solatium** on the total multiplied land value plus assets value. This is paid in consideration of the compulsory nature of acquisition.
5. **Additional Interest (Section 30(3)):**
   - Simple interest at **12% per annum** calculated from the date of Preliminary Notification (Section 11 or NH Act 3A) until the date of award declaration or possession.`,
    officialReferences: [
      {
        title: 'RFCTLARR Act 2013',
        sectionOrClause: 'Sections 26 to 30 & First Schedule',
        portalOrAct: 'Ministry of Rural Development',
      },
      {
        title: 'Bhoomi Rashi CALA Circular 2018',
        sectionOrClause: 'Directives on Multiplier Application',
        portalOrAct: 'MoRTH',
      },
    ],
    formula: 'Total Payout = [(Base Market Value × Multiplier) + Asset Value] × 2.0 (Solatium) + [12% × Time × Market Value]',
    exampleCalculation: 'For 1 Hectare rural land with circle rate ₹20,00,000, 1.5x rural multiplier, ₹2,00,000 tree asset, and 1 year duration: Multiplied Value = ₹30,00,000. Total with assets = ₹32,00,000. 100% Solatium = ₹32,00,000. 12% Interest = ₹2,40,000. Final Award = ₹66,40,000.',
  },
  {
    id: 'kb_bhoomirashi_workflow',
    question: 'What is the end-to-end statutory notification lifecycle in Bhoomi Rashi under the National Highways Act 1956?',
    category: 'statutory_acts',
    tags: ['Bhoomi Rashi', 'NH Act 1956', 'Section 3A', 'Section 3D', 'Section 3G', 'CALA', 'PFMS'],
    summary: 'The statutory workflow progresses from 3A (Intention) → 3C (Objections) → 3D (Vesting of Title) → 3G (CALA Award Determination) → PFMS Direct Payment.',
    detailedAnswer: `In the Ministry of Road Transport and Highways (MoRTH) digital workflow on bhoomirashi.gov.in:
- **Section 3A (Notification of Intention to Acquire):** Published in the Central E-Gazette and two local newspapers. It gives surveyors the right to enter, survey, and peg the linear alignment.
- **Section 3C (Hearing of Objections):** Any person interested in the land may file written objections within 21 days of Section 3A publication. The Competent Authority for Land Acquisition (CALA, usually Sub-Divisional Magistrate or SLAO) holds summary hearings and issues reasoned orders.
- **Section 3D (Declaration of Acquisition):** Within 1 year of 3A, if objections are settled, the central government publishes Section 3D. Upon this publication, the land vests absolutely in the Union Government free from all encumbrances.
- **Section 3G (Determination of Compensation):** CALA determines the compensation amount adhering to RFCTLARR 2013 First Schedule rates (Circle rate, Solatium 100%, and Multiplier).
- **PFMS Direct Benefit Transfer:** The sanctioned award is transmitted electronically through the Public Financial Management System (PFMS) directly to the Aadhaar-linked bank account of the land titleholder.`,
    officialReferences: [
      {
        title: 'The National Highways Act, 1956',
        sectionOrClause: 'Sections 3A to 3J',
        portalOrAct: 'bhoomirashi.gov.in',
      },
    ],
  },
  {
    id: 'kb_ulpin_algorithm',
    question: 'How is the 14-digit ULPIN (Bhu-Aadhaar) generated for a land parcel?',
    category: 'ulpin_gis',
    tags: ['ULPIN', 'Bhu-Aadhaar', 'DILRMP', 'Coordinates', 'Geocoding', 'NIC'],
    summary: 'ULPIN is an internationally compliant 14-digit alphanumeric code calculated from the geodetic centroid coordinates (latitude and longitude) of the cadastral polygon.',
    detailedAnswer: `The Unique Land Parcel Identification Number (ULPIN), also branded as Bhu-Aadhaar, is formulated by the Department of Land Resources (DoLR) and National Informatics Centre (NIC):
- **Polygon Centroid Calculation:** Using geodetic EPSG:4326 WGS84 standards, the precise geometric centroid of the parcel's surveyed vertices is computed.
- **Hierarchical Geo-Encoding:** The coordinates are converted into a unique 14-character alphanumeric string using an open-location geohash standard.
- **Elimination of Duplication:** Even if village names, survey numbers, or khasra numbers change due to sub-division (Batwara) or administrative reorganization, the ULPIN remains uniquely tied to the spatial coordinates on Earth.
- **Interoperability:** ULPIN links revenue records (RoR), registry deeds (SRO), agricultural credit (KCC / PM-KISAN), soil health cards, and court litigations to a single geospatial entity.`,
    officialReferences: [
      {
        title: 'ULPIN Technical Specifications Document v2.0',
        sectionOrClause: 'Geospatial Algorithm & Data Schema',
        portalOrAct: 'dilrmp.gov.in',
      },
    ],
  },
  {
    id: 'kb_svamitva_cors',
    question: 'How does the CORS network ensure 5cm GSD accuracy in SVAMITVA drone surveys?',
    category: 'drone_cors',
    tags: ['SVAMITVA', 'CORS', 'Survey of India', 'RTK', 'Drone Photogrammetry'],
    summary: 'Survey of India CORS (Continuously Operating Reference Stations) provide real-time differential GNSS corrections, eliminating base-station setup errors and achieving 5cm ground sampling distance.',
    detailedAnswer: `In the SVAMITVA scheme:
- **CORS Infrastructure:** Over 1,024 permanently installed GNSS tracking stations across India receive continuous signals from NavIC, GPS, GLONASS, and Galileo constellations.
- **Network RTK Corrections:** Drones equipped with Real-Time Kinematic (RTK) and Post-Processed Kinematic (PPK) receivers stream positional telemetry directly against the CORS network.
- **Millimeter Precision:** Horizontal accuracy is kept within 8mm + 1ppm and vertical accuracy within 15mm + 1ppm, yielding orthomosaic maps with a Ground Sampling Distance (GSD) of 5cm or better.
- **Legal Demarcation:** This enables the revenue department to resolve Medh (ridge) boundary disputes down to a single brick or fence post, providing conclusive title records for rural home owners.`,
    officialReferences: [
      {
        title: 'SVAMITVA Scheme Guidelines',
        sectionOrClause: 'Standard Operating Procedure for Drone Flying',
        portalOrAct: 'svamitva.nic.in / Survey of India',
      },
    ],
  },
  {
    id: 'kb_pm_gati_shakti',
    question: 'How does PM Gati Shakti NMP prevent overlapping land claims between infrastructure ministries?',
    category: 'gati_shakti',
    tags: ['Gati Shakti', 'BISAG-N', 'Multi-Modal', 'Spatial GIS', 'Conflict Resolution'],
    summary: 'PM Gati Shakti unifies 200+ spatial layers from 16 ministries on a single GIS platform, running automatic corridor buffer conflict analyses before land acquisition begins.',
    detailedAnswer: `Historically, different government agencies acquired overlapping corridors or dug up newly constructed highways for optical fiber or gas pipelines.
Under the PM Gati Shakti National Master Plan:
1. **Unified Geospatial Engine:** BISAG-N maintains an enterprise GIS platform incorporating layers from MoRTH, Railways, Ministry of Petroleum, Ministry of Power, Telecom, and Environment.
2. **Automated Buffer Analysis:** When NHAI plans a highway alignment, the platform automatically flags overlapping railway crossings, forest sanctuaries, gas transmission pipelines, and high-tension transmission corridors.
3. **Coordinated Right-of-Way (RoW):** Agencies acquire land jointly under a single shared corridor, drastically saving taxpayer funds and avoiding years of inter-ministerial litigation.`,
    officialReferences: [
      {
        title: 'PM Gati Shakti National Master Plan Framework',
        sectionOrClause: 'Empowered Group of Secretaries (EGoS) Protocols',
        portalOrAct: 'gatishakti.gov.in / DPIIT',
      },
    ],
  },
  {
    id: 'kb_dispute_resolution',
    question: 'What legal recourse does a landowner have if dissatisfied with the CALA compensation award?',
    category: 'dispute_resolution',
    tags: ['Section 64', 'LARR Authority', 'Arbitration', 'High Court', 'RFCTLARR Act'],
    summary: 'A landowner can file a reference under Section 64 of RFCTLARR Act to the Land Acquisition, Rehabilitation and Resettlement Authority, or seek arbitration under Section 3G(5) of NH Act.',
    detailedAnswer: `If a citizen or farmer believes their land has been undervalued or solatium incorrectly computed:
1. **Accepting Compensation Under Protest:** The landowner should accept the sanctioned PFMS amount with a written endorsement 'Under Protest' to preserve their right to seek enhancement without being penalized.
2. **Section 64 Reference (RFCTLARR Act):** Within 6 weeks of award notice (or 6 months if not served), the owner can petition the Collector to refer the matter to the designated LARR Authority (presided over by a District Judge).
3. **Statutory Arbitration under NH Act 1956 (Section 3G(5)):** If the acquisition is for a National Highway, an application is submitted to the Central Government-appointed Arbitrator (typically the District Collector or Divisional Commissioner).
4. **Judicial Appeal:** Appeals against the LARR Authority or Arbitrator award lie directly before the High Court under Section 74 of RFCTLARR Act within 60 days.`,
    officialReferences: [
      {
        title: 'RFCTLARR Act 2013',
        sectionOrClause: 'Part VIII (Establishment of LARR Authority, Sections 51-74)',
        portalOrAct: 'Ministry of Law & Justice',
      },
      {
        title: 'NH Act 1956',
        sectionOrClause: 'Section 3G(5) - Appointment of Arbitrator',
        portalOrAct: 'MoRTH',
      },
    ],
  },
];
