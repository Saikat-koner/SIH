export interface TrackingDocument {
  id: string;
  name: string;
  type: 'survey_map' | 'gazette_notification' | 'revenue_record' | 'valuation_sheet' | 'award_order' | 'dbt_receipt';
  fileName: string;
  fileSize: string;
  issuedBy: string;
  verificationHash: string;
  verifiedAt: string;
}

export interface TrackingStage {
  id: 'survey' | 'notification' | 'verification' | 'valuation' | 'award' | 'payout';
  title: string;
  shortLabel: string;
  status: 'completed' | 'in_progress' | 'delayed' | 'pending';
  date: string;
  officer: string;
  designation: string;
  remarks: string;
  digitalSeal: string;
  documents: TrackingDocument[];
}

export interface CompensationDetail {
  baseMarketRatePerHa: number;
  areaAcquiredHa: number;
  marketValue: number;
  multiplierFactor: number; // 1.25x - 2.0x for rural land under RFCTLARR Act 2013
  multipliedLandValue: number;
  solatiumPercent: number; // 100% statutory solatium
  solatiumAmount: number;
  assetsValue: number; // Standing crops, trees, well, farm structures
  additionalInterest: number; // 12% per annum from notification date
  totalPayout: number;
  disbursementStatus: 'paid' | 'in_escrow' | 'sanction_pending' | 'disputed';
  dbtReference?: string;
  bankName: string;
  bankAccountMask: string;
  ifscCode: string;
  disbursedDate?: string;
}

export interface EndToEndCase {
  id: string; // e.g. TRK-2024-MH-142A
  parcelId: string;
  khasraNumber: string;
  projectName: string;
  projectId: string;
  landownerName: string;
  aadhaarMask: string;
  mobileMask: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  currentStageIndex: number; // 0 to 5
  stages: TrackingStage[];
  compensation: CompensationDetail;
  delayRisk: 'low' | 'medium' | 'high';
  delayDays: number;
  bottleneckReason?: string;
  lastUpdated: string;
}

export interface ProjectBottleneck {
  id: string;
  stage: string;
  title: string;
  description: string;
  impactParcels: number;
  estimatedDelayDays: number;
  severity: 'critical' | 'moderate' | 'low';
  recommendedAction: string;
  actionLabel: string;
  resolved: boolean;
}

export interface NationalProject {
  id: string;
  code: string;
  name: string;
  corridor: string;
  executingAgency: string;
  ministry: string;
  totalParcels: number;
  surveyedParcels: number;
  demarcatedParcels: number;
  awardsPassed: number;
  payoutsCompleted: number;
  allocatedBudgetCr: number;
  disbursedBudgetCr: number;
  escrowBudgetCr: number;
  status: 'on_track' | 'needs_attention' | 'critical_bottleneck';
  targetCompletionDate: string;
  statesCovered: string[];
  bottlenecks: ProjectBottleneck[];
}

export const INITIAL_NATIONAL_PROJECTS: NationalProject[] = [
  {
    id: 'proj_dme_01',
    code: 'NHAI-DME-PKG-04',
    name: 'Delhi-Mumbai Expressway Green Corridor (Package 4)',
    corridor: 'Vadodara-Mumbai Greenfield Spur',
    executingAgency: 'National Highways Authority of India (NHAI)',
    ministry: 'Ministry of Road Transport and Highways',
    totalParcels: 1420,
    surveyedParcels: 1390,
    demarcatedParcels: 1285,
    awardsPassed: 1140,
    payoutsCompleted: 980,
    allocatedBudgetCr: 3450.0,
    disbursedBudgetCr: 2415.0,
    escrowBudgetCr: 395.0,
    status: 'needs_attention',
    targetCompletionDate: '2025-06-30',
    statesCovered: ['Maharashtra', 'Gujarat', 'Madhya Pradesh'],
    bottlenecks: [
      {
        id: 'btnk_01',
        stage: 'Title Verification',
        title: 'Heirship & Succession Certificates Pending in Taluka Haveli',
        description: '28 agrarian parcels held under undivided Hindu Undivided Family (HUF) titles require fast-track legal heir affidavits.',
        impactParcels: 28,
        estimatedDelayDays: 45,
        severity: 'critical',
        recommendedAction: 'Convene Tehsil-level Special Lok Adalat with District Legal Services Authority (DLSA) for instant succession certification.',
        actionLabel: 'Trigger Special Lok Adalat Camp',
        resolved: false,
      },
      {
        id: 'btnk_02',
        stage: 'Valuation Inquiry',
        title: 'Circle Rate vs Market Rate Disparity in Peri-Urban Zone',
        description: 'Landowners in Khasra 142/2 and adjacent belt disputed 2022 Ready Reckoner base rates citing recent industrial expansion.',
        impactParcels: 14,
        estimatedDelayDays: 25,
        severity: 'moderate',
        recommendedAction: 'Authorize Competent Authority for Land Acquisition (CALA) 1.25x rural multiplier reassessment under RFCTLARR First Schedule.',
        actionLabel: 'Apply Statutory Rural Multiplier 1.25x',
        resolved: false,
      },
    ],
  },
  {
    id: 'proj_svamitva_02',
    code: 'SVAMITVA-MH-PUN-07',
    name: 'SVAMITVA Village Abadi Drone Demarcation & Property Card Drive',
    corridor: 'Pune District Rural Inhabited Cadastre (Gaothan)',
    executingAgency: 'Survey of India (SoI) & Directorate of Land Records',
    ministry: 'Ministry of Panchayati Raj',
    totalParcels: 680,
    surveyedParcels: 680,
    demarcatedParcels: 640,
    awardsPassed: 590,
    payoutsCompleted: 560,
    allocatedBudgetCr: 125.0,
    disbursedBudgetCr: 104.5,
    escrowBudgetCr: 8.2,
    status: 'on_track',
    targetCompletionDate: '2025-03-31',
    statesCovered: ['Maharashtra'],
    bottlenecks: [
      {
        id: 'btnk_03',
        stage: 'Boundary Demarcation',
        title: 'Ancestral Medh (Mud Bund) Alignment Shift',
        description: 'Discrepancy of 1.4 meters detected between 1942 cloth shajra and high-resolution 5cm GSD CORS drone orthomosaic in Khasra #142/2.',
        impactParcels: 6,
        estimatedDelayDays: 14,
        severity: 'low',
        recommendedAction: 'Deploy differential RTK GNSS field team with Joint Measurement Survey (JMS) committee for on-ground boundary peg fixation.',
        actionLabel: 'Dispatch RTK Joint Verification Team',
        resolved: false,
      },
    ],
  },
  {
    id: 'proj_dfc_03',
    code: 'MOR-DFCCIL-WST-12',
    name: 'Western Dedicated Freight Corridor (JNPT-Dadri Cadastral Section)',
    corridor: 'Jawaharlal Nehru Port Trust Rail Linkage',
    executingAgency: 'Dedicated Freight Corridor Corporation of India (DFCCIL)',
    ministry: 'Ministry of Railways',
    totalParcels: 2150,
    surveyedParcels: 2150,
    demarcatedParcels: 2010,
    awardsPassed: 1870,
    payoutsCompleted: 1720,
    allocatedBudgetCr: 5820.0,
    disbursedBudgetCr: 4790.0,
    escrowBudgetCr: 410.0,
    status: 'on_track',
    targetCompletionDate: '2025-12-31',
    statesCovered: ['Maharashtra', 'Gujarat', 'Rajasthan', 'Haryana'],
    bottlenecks: [],
  },
  {
    id: 'proj_dilrmp_04',
    code: 'DILRMP-CAD-REV-09',
    name: 'National Land Record Modernization & High-Precision Georeferencing',
    corridor: 'Inter-State River Basin Agro-Cadastre',
    executingAgency: 'Department of Land Resources (DoLR)',
    ministry: 'Ministry of Rural Development',
    totalParcels: 940,
    surveyedParcels: 820,
    demarcatedParcels: 610,
    awardsPassed: 430,
    payoutsCompleted: 310,
    allocatedBudgetCr: 880.0,
    disbursedBudgetCr: 320.0,
    escrowBudgetCr: 120.0,
    status: 'critical_bottleneck',
    targetCompletionDate: '2025-09-30',
    statesCovered: ['Uttar Pradesh', 'Bihar', 'Madhya Pradesh'],
    bottlenecks: [
      {
        id: 'btnk_04',
        stage: 'Preliminary Notification',
        title: 'Objection Window Backlog in Sub-Divisional Magistrate (SDM) Court',
        description: 'Over 82 Section 15 objection petitions awaiting collector hearing dates due to revenue court calendar congestion.',
        impactParcels: 82,
        estimatedDelayDays: 60,
        severity: 'critical',
        recommendedAction: 'Appoint Special Land Acquisition Officer (SLAO) on 60-day deputation with delegated summary hearing powers.',
        actionLabel: 'Sanction Special SLAO Summary Court',
        resolved: false,
      },
    ],
  },
];

export const INITIAL_TRACKING_CASES: EndToEndCase[] = [
  {
    id: 'TRK-2024-MH-142A',
    parcelId: 'pcl_ind_001',
    khasraNumber: '142/1',
    projectName: 'Delhi-Mumbai Expressway Green Corridor (Package 4)',
    projectId: 'proj_dme_01',
    landownerName: 'Dnyaneshwar Ramchandra Patil',
    aadhaarMask: 'XXXX-XXXX-8921',
    mobileMask: '+91 98230-XXXXX',
    village: 'Haveli Gaothan',
    taluka: 'Haveli',
    district: 'Pune',
    state: 'Maharashtra',
    currentStageIndex: 5, // Fully completed
    lastUpdated: '2024-04-10T14:30:00Z',
    delayRisk: 'low',
    delayDays: 0,
    compensation: {
      baseMarketRatePerHa: 4824560,
      areaAcquiredHa: 3.42,
      marketValue: 16500000,
      multiplierFactor: 1.5,
      multipliedLandValue: 24750000,
      solatiumPercent: 100,
      solatiumAmount: 24750000,
      assetsValue: 2850000, // 420 sugarcane clumps, 1 borewell, drip system
      additionalInterest: 1180000,
      totalPayout: 53530000, // ₹5.35 Crore
      disbursementStatus: 'paid',
      dbtReference: 'PFMS-NPCI-2024-MH8910482',
      bankName: 'State Bank of India (Pune Agri Branch)',
      bankAccountMask: 'XXXXXX5012',
      ifscCode: 'SBIN0001423',
      disbursedDate: '2024-04-09',
    },
    stages: [
      {
        id: 'survey',
        title: 'CORS GNSS & Drone Cadastral Survey',
        shortLabel: '1. Ground Survey',
        status: 'completed',
        date: '2023-11-14',
        officer: 'Patwari Rajesh Shinde & SoI Drone Unit',
        designation: 'Cadastral Surveyor (Circle 4)',
        remarks: '5cm GSD Orthomosaic generated; Survey of India CORS benchmark #PUN-042 locked with 8mm geodetic precision.',
        digitalSeal: 'SHA256: 9b2d8e4f1a0c7b39...8d2e',
        documents: [
          {
            id: 'doc_01',
            name: 'High-Resolution Drone Orthomosaic Map',
            type: 'survey_map',
            fileName: 'ortho_khasra_142_1_geotiff.pdf',
            fileSize: '14.2 MB',
            issuedBy: 'Survey of India Drone Cell',
            verificationHash: 'SOI-DRN-2023-8812',
            verifiedAt: '2023-11-15',
          },
        ],
      },
      {
        id: 'notification',
        title: 'Preliminary Notification & Demarcation (Sec 11)',
        shortLabel: '2. Gazette Notice',
        status: 'completed',
        date: '2023-12-20',
        officer: 'S. K. Kulkarni, IAS',
        designation: 'District Collector & Competent Authority (CALA)',
        remarks: 'Statutory Gazette Notification published in District Gazette & local dailies. Physical boundary pegs set.',
        digitalSeal: 'SHA256: c3e10984ba71302...ff1a',
        documents: [
          {
            id: 'doc_02',
            name: 'State Gazette Notification Sec 11(1)',
            type: 'gazette_notification',
            fileName: 'gazette_sec11_dme_pkg4.pdf',
            fileSize: '2.4 MB',
            issuedBy: 'Dept. of Revenue, Govt. of Maharashtra',
            verificationHash: 'MAH-GAZ-2023-9014',
            verifiedAt: '2023-12-21',
          },
        ],
      },
      {
        id: 'verification',
        title: 'Title, Khatauni & Heirship Verification',
        shortLabel: '3. Title Clear',
        status: 'completed',
        date: '2024-01-28',
        officer: 'Suresh Deshmukh',
        designation: 'Revenue Inspector (RI) Haveli',
        remarks: 'Satbara 7/12 Extract, Gaon Namuna 8A, and non-encumbrance certificate cleared with zero third-party claims.',
        digitalSeal: 'SHA256: f12a809b43178c...4501',
        documents: [
          {
            id: 'doc_03',
            name: 'Authenticated Satbara (7/12) Extract',
            type: 'revenue_record',
            fileName: 'satbara_authenticated_142_1.pdf',
            fileSize: '1.1 MB',
            issuedBy: 'Mahabhulekh E-Mutation Portal',
            verificationHash: 'MAHA-712-HAV-8921',
            verifiedAt: '2024-01-29',
          },
        ],
      },
      {
        id: 'valuation',
        title: 'Joint Measurement & Solatium Valuation',
        shortLabel: '4. Valuation',
        status: 'completed',
        date: '2024-02-22',
        officer: 'Er. Sandeep Bapat',
        designation: 'District Land Valuation Officer',
        remarks: 'Ready Reckoner rate validated at ₹48.24L/Ha. 1.5x rural multiplier + 100% Solatium computed per RFCTLARR Act 2013.',
        digitalSeal: 'SHA256: 7d1045ca8172be...11e9',
        documents: [
          {
            id: 'doc_04',
            name: 'Statutory Valuation & Solatium Audit Sheet',
            type: 'valuation_sheet',
            fileName: 'valuation_rfctlarr_142_1.pdf',
            fileSize: '3.8 MB',
            issuedBy: 'District Land Valuation Directorate',
            verificationHash: 'VAL-RFCTLARR-2024-1102',
            verifiedAt: '2024-02-23',
          },
        ],
      },
      {
        id: 'award',
        title: 'Formal Compensation Award Declaration (Sec 23)',
        shortLabel: '5. Award Order',
        status: 'completed',
        date: '2024-03-24',
        officer: 'Anand More',
        designation: 'Sub-Divisional Officer (SDO) & SLAO',
        remarks: 'Compensation Award declared under Section 23; zero pending legal stay orders; disbursement file approved.',
        digitalSeal: 'SHA256: 2289cf0014aef1...7883',
        documents: [
          {
            id: 'doc_05',
            name: 'Compensation Award Order No. 44/2024',
            type: 'award_order',
            fileName: 'award_order_sec23_142_1.pdf',
            fileSize: '4.1 MB',
            issuedBy: 'Office of the Land Acquisition Collector',
            verificationHash: 'AWD-SLAO-PUN-044',
            verifiedAt: '2024-03-25',
          },
        ],
      },
      {
        id: 'payout',
        title: 'Direct Benefit Transfer (DBT) & E-Mutation',
        shortLabel: '6. DBT Payout',
        status: 'completed',
        date: '2024-04-09',
        officer: 'Finance Controller, NHAI Project Unit',
        designation: 'Chief Accounts Officer & Public Financial Management System (PFMS)',
        remarks: '₹5,35,30,000 credited directly to landowner Aadhaar-seeded bank account. E-mutation logged on state cadastre.',
        digitalSeal: 'SHA256: 8812cba04712ef...0012',
        documents: [
          {
            id: 'doc_06',
            name: 'PFMS Electronic Transfer Advice & Receipt',
            type: 'dbt_receipt',
            fileName: 'pfms_payout_receipt_53530000.pdf',
            fileSize: '890 KB',
            issuedBy: 'Reserve Bank of India / PFMS Gateway',
            verificationHash: 'PFMS-TRN-2024-998124',
            verifiedAt: '2024-04-09',
          },
        ],
      },
    ],
  },
  {
    id: 'TRK-2024-MH-142B',
    parcelId: 'pcl_ind_002',
    khasraNumber: '142/2',
    projectName: 'Delhi-Mumbai Expressway Green Corridor (Package 4)',
    projectId: 'proj_dme_01',
    landownerName: 'Rameshwar K. Shinde & Tukaram Jadhav',
    aadhaarMask: 'XXXX-XXXX-4412',
    mobileMask: '+91 94220-XXXXX',
    village: 'Haveli Gaothan',
    taluka: 'Haveli',
    district: 'Pune',
    state: 'Maharashtra',
    currentStageIndex: 3, // At Stage 4 (Valuation/Dispute)
    lastUpdated: '2024-04-12T14:40:00Z',
    delayRisk: 'high',
    delayDays: 28,
    bottleneckReason: 'Boundary Ridge (Medh) discrepancy of 1.4m flagged by Survey of India CORS station. Requires Joint Re-measurement hearing.',
    compensation: {
      baseMarketRatePerHa: 4824560,
      areaAcquiredHa: 2.18,
      marketValue: 10517540,
      multiplierFactor: 1.5,
      multipliedLandValue: 15776310,
      solatiumPercent: 100,
      solatiumAmount: 15776310,
      assetsValue: 1420000,
      additionalInterest: 640000,
      totalPayout: 33612620, // ₹3.36 Crore
      disbursementStatus: 'in_escrow',
      bankName: 'Bank of Maharashtra (Haveli Branch)',
      bankAccountMask: 'XXXXXX8821',
      ifscCode: 'MAHB0000122',
    },
    stages: [
      {
        id: 'survey',
        title: 'CORS GNSS & Drone Cadastral Survey',
        shortLabel: '1. Ground Survey',
        status: 'completed',
        date: '2023-11-18',
        officer: 'Patwari Rajesh Shinde',
        designation: 'Cadastral Surveyor',
        remarks: '5cm GSD drone orthophoto completed; boundary shift of 1.4m flagged against adjacent Khasra 142/1.',
        digitalSeal: 'SHA256: aa10884210ec99...55b1',
        documents: [
          {
            id: 'doc_201',
            name: 'Cadastral Drone Orthophoto',
            type: 'survey_map',
            fileName: 'ortho_khasra_142_2.pdf',
            fileSize: '12.8 MB',
            issuedBy: 'Survey of India Drone Cell',
            verificationHash: 'SOI-DRN-2023-8819',
            verifiedAt: '2023-11-19',
          },
        ],
      },
      {
        id: 'notification',
        title: 'Preliminary Notification & Demarcation (Sec 11)',
        shortLabel: '2. Gazette Notice',
        status: 'completed',
        date: '2023-12-20',
        officer: 'S. K. Kulkarni, IAS',
        designation: 'District Collector',
        remarks: 'Gazette notice issued. Demarcation markers placed with dispute annotation on southern bund.',
        digitalSeal: 'SHA256: b89201fca34001...22c7',
        documents: [
          {
            id: 'doc_202',
            name: 'State Gazette Notification',
            type: 'gazette_notification',
            fileName: 'gazette_sec11_dme_pkg4.pdf',
            fileSize: '2.4 MB',
            issuedBy: 'Dept. of Revenue',
            verificationHash: 'MAH-GAZ-2023-9014',
            verifiedAt: '2023-12-21',
          },
        ],
      },
      {
        id: 'verification',
        title: 'Title, Khatauni & Heirship Verification',
        shortLabel: '3. Title Clear',
        status: 'completed',
        date: '2024-02-10',
        officer: 'Suresh Deshmukh',
        designation: 'Revenue Inspector (RI)',
        remarks: 'Joint tenancy verified between co-owners; mutual consent agreement executed.',
        digitalSeal: 'SHA256: 44bc0918efca11...991a',
        documents: [
          {
            id: 'doc_203',
            name: '7/12 Extract & Tenancy Verification',
            type: 'revenue_record',
            fileName: 'satbara_142_2_joint.pdf',
            fileSize: '1.3 MB',
            issuedBy: 'Mahabhulekh E-Mutation Portal',
            verificationHash: 'MAHA-712-HAV-8922',
            verifiedAt: '2024-02-11',
          },
        ],
      },
      {
        id: 'valuation',
        title: 'Joint Measurement & Solatium Valuation',
        shortLabel: '4. Valuation (Disputed)',
        status: 'in_progress',
        date: '2024-03-10',
        officer: 'Er. Sandeep Bapat',
        designation: 'District Land Valuation Officer',
        remarks: 'Area measurement subject to resolution of 0.12 Ha bund dispute under Section 138 MLRC.',
        digitalSeal: 'SHA256: dd87103290ffea...3310',
        documents: [
          {
            id: 'doc_204',
            name: 'Preliminary Joint Measurement Record',
            type: 'valuation_sheet',
            fileName: 'jmr_draft_142_2.pdf',
            fileSize: '2.1 MB',
            issuedBy: 'District Land Valuation Directorate',
            verificationHash: 'VAL-JMR-2024-0412',
            verifiedAt: '2024-03-11',
          },
        ],
      },
      {
        id: 'award',
        title: 'Formal Compensation Award Declaration (Sec 23)',
        shortLabel: '5. Award Order',
        status: 'pending',
        date: 'Scheduled: 2024-05-15',
        officer: 'Anand More',
        designation: 'SDO & SLAO',
        remarks: 'Award hearing pending finalization of boundary coordinates.',
        digitalSeal: 'Pending Issuance',
        documents: [],
      },
      {
        id: 'payout',
        title: 'Direct Benefit Transfer (DBT) & E-Mutation',
        shortLabel: '6. DBT Payout',
        status: 'pending',
        date: 'Scheduled: 2024-05-30',
        officer: 'Finance Controller, NHAI',
        designation: 'Chief Accounts Officer',
        remarks: 'Escrow account pre-funded with ₹3.36 Cr; disbursement scheduled upon award confirmation.',
        digitalSeal: 'Pending Issuance',
        documents: [],
      },
    ],
  },
  {
    id: 'TRK-2024-UP-089A',
    parcelId: 'pcl_001',
    khasraNumber: '89/A',
    projectName: 'National Land Record Modernization & High-Precision Georeferencing',
    projectId: 'proj_dilrmp_04',
    landownerName: 'Suman Devi & Sons',
    aadhaarMask: 'XXXX-XXXX-9104',
    mobileMask: '+91 97110-XXXXX',
    village: 'Rampur Kalan',
    taluka: 'Chandauli',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    currentStageIndex: 2, // At Stage 3 (Title Verification)
    lastUpdated: '2024-04-08T10:15:00Z',
    delayRisk: 'medium',
    delayDays: 16,
    bottleneckReason: 'Khatauni title deed requires mutation entry sync from legacy paper archives.',
    compensation: {
      baseMarketRatePerHa: 3850000,
      areaAcquiredHa: 1.85,
      marketValue: 7122500,
      multiplierFactor: 1.5,
      multipliedLandValue: 10683750,
      solatiumPercent: 100,
      solatiumAmount: 10683750,
      assetsValue: 850000,
      additionalInterest: 420000,
      totalPayout: 22637500, // ₹2.26 Crore
      disbursementStatus: 'sanction_pending',
      bankName: 'Punjab National Bank (Chandauli)',
      bankAccountMask: 'XXXXXX3310',
      ifscCode: 'PUNB0192000',
    },
    stages: [
      {
        id: 'survey',
        title: 'CORS GNSS & Drone Cadastral Survey',
        shortLabel: '1. Ground Survey',
        status: 'completed',
        date: '2024-01-15',
        officer: 'Lekhpal Vinod Kumar',
        designation: 'Cadastral Surveyor',
        remarks: 'Shajra georeferenced using Survey of India CORS ground control points.',
        digitalSeal: 'SHA256: 77a091cbf8201a...66e1',
        documents: [],
      },
      {
        id: 'notification',
        title: 'Preliminary Notification & Demarcation (Sec 11)',
        shortLabel: '2. Gazette Notice',
        status: 'completed',
        date: '2024-02-28',
        officer: 'District Magistrate Office',
        designation: 'CALA Officer',
        remarks: 'Gazette notice notified; public notices displayed in Gram Panchayat Bhawan.',
        digitalSeal: 'SHA256: 33ec8912ba009a...11f4',
        documents: [],
      },
      {
        id: 'verification',
        title: 'Title, Khatauni & Heirship Verification',
        shortLabel: '3. Title Verification',
        status: 'in_progress',
        date: '2024-03-20',
        officer: 'Naib Tehsildar (Chandauli)',
        designation: 'Title Verification Officer',
        remarks: 'Reviewing lineage pedigree tree and legacy Khatauni registry folio #214.',
        digitalSeal: 'SHA256: Pending Verification',
        documents: [],
      },
      {
        id: 'valuation',
        title: 'Joint Measurement & Solatium Valuation',
        shortLabel: '4. Valuation',
        status: 'pending',
        date: 'Scheduled: 2024-04-25',
        officer: 'Valuation Officer',
        designation: 'SLAO Appraiser',
        remarks: 'Awaiting title clearance.',
        digitalSeal: 'Pending Issuance',
        documents: [],
      },
      {
        id: 'award',
        title: 'Formal Compensation Award Declaration (Sec 23)',
        shortLabel: '5. Award Order',
        status: 'pending',
        date: 'Scheduled: 2024-05-20',
        officer: 'SLAO Officer',
        designation: 'Awarding Authority',
        remarks: 'Scheduled post-valuation.',
        digitalSeal: 'Pending Issuance',
        documents: [],
      },
      {
        id: 'payout',
        title: 'Direct Benefit Transfer (DBT) & E-Mutation',
        shortLabel: '6. DBT Payout',
        status: 'pending',
        date: 'Scheduled: 2024-06-10',
        officer: 'PFMS Treasury Node',
        designation: 'Finance Officer',
        remarks: 'Awaiting award sanction.',
        digitalSeal: 'Pending Issuance',
        documents: [],
      },
    ],
  },
];
