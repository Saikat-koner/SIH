import { jsPDF } from 'jspdf';

export interface CodebaseSummaryData {
  appName: string;
  version: string;
  generatedDate: string;
  totalFiles: number;
}

/**
 * Generates and triggers download of an enterprise-grade PDF dossier
 * covering the full source code architecture, module directory, functions used,
 * data schemas, and backend API contracts.
 */
export function downloadSourceCodePDF(): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let cursorY = 20;

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = 20;
      // Add running header
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text('TerraGIS Cadastre - Full Source Code & Architecture Dossier', margin, 10);
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, 12, pageWidth - margin, 12);
    }
  };

  // --- PAGE 1: COVER & EXECUTIVE SUMMARY ---
  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 42, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('TerraGIS Sovereign Cadastre Platform', margin, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.text('Full Source Code, Functions & Architectural Documentation Dossier', margin, 26);

  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text('Standards: DILRMP, SVAMITVA, RFCTLARR 2013 | WCAG 2.1 AA Accessible | Multi-Tier Offline Sync', margin, 34);

  cursorY = 52;

  // Metadata Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('DOCUMENT METADATA & COMPILATION SPECS', margin + 4, cursorY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Framework: React 19 + TypeScript + Express.js + Vite 6 + Leaflet GIS`, margin + 4, cursorY + 12);
  doc.text(`Styling: Tailwind CSS 4 with Dynamic Light / Tactical Dark Themes`, margin + 4, cursorY + 17);
  doc.text(`Export Timestamp: ${new Date().toLocaleString()} | Security Level: Statutory Public Standard`, margin + 4, cursorY + 22);

  cursorY += 32;

  // Section 1: Executive Architectural Overview
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Executive System Architecture Overview', margin, cursorY);
  cursorY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const overviewText = 
    "TerraGIS is a production-ready, full-stack Land Administration and Cadastral GIS Platform built to bridge the gap between high-precision government surveying (Survey of India, ISRO Bhuvan, State Land Revenue departments) and citizen empowerment. It incorporates sub-5cm CORS RTK drone cadastral boundaries, statutory RFCTLARR 2013 compensation calculation engines, cryptographically sealed Property Passbooks (e-Gharoni 7/12 & 8A), multi-tier role-based access control (RBAC), and vernacular accessibility across 8 Indian languages.";
  
  const splitOverview = doc.splitTextToSize(overviewText, pageWidth - margin * 2);
  doc.text(splitOverview, margin, cursorY);
  cursorY += splitOverview.length * 4.5 + 4;

  // Architectural Layers Table
  const layers = [
    { name: 'Presentation Layer', tech: 'React 19, TypeScript, Tailwind CSS 4', desc: 'Single-page responsive UX with dark/light themes, WCAG 2.1 AA keyboard & screen-reader navigation' },
    { name: 'Spatial GIS Engine', tech: 'Leaflet 1.9, EPSG:4326 WGS84, Canvas Markers', desc: 'Hardware-accelerated polygon boundary rendering, Geofence HUD, centroid labels, corridor fly-to' },
    { name: 'Backend API Service', tech: 'Express 4.21, Node.js, TSX runtime', desc: 'RESTful endpoints for parcels, corridors, compensation calculation, grievance ticketing, and digital seals' },
    { name: 'Cloud & Offline Persistence', tech: 'Supabase / PostgreSQL + localStorage queue', desc: 'Two-way sync, conflict resolution, offline mutate-and-replay telemetry buffer' },
    { name: 'Accessibility & i18n', tech: 'WAI-ARIA 1.2, SpeechSynthesis, i18n dictionary', desc: 'Screen reader live regions, bilingual passbooks, audio readout in 8 Indian vernaculars' },
  ];

  layers.forEach((l) => {
    checkPageBreak(14);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 12, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(l.name, margin + 3, cursorY + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(16, 185, 129); // emerald-600
    doc.text(`[${l.tech}]`, margin + 45, cursorY + 4.5);
    doc.setTextColor(71, 85, 105);
    doc.text(l.desc, margin + 3, cursorY + 9);
    cursorY += 14;
  });

  cursorY += 4;

  // --- SECTION 2: FILE MANIFEST & DIRECTORY STRUCTURE ---
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Codebase File Structure & Module Directory', margin, cursorY);
  cursorY += 6;

  const fileManifest = [
    { path: 'server.ts', role: 'Full-Stack Express API Server with mock/live database routes, CORS, and static bundle serving' },
    { path: 'src/App.tsx', role: 'Main Application orchestrator, theme management (light/dark), RBAC routing, state initialization' },
    { path: 'src/components/HomePage.tsx', role: 'Public pre-login landing portal, instant Khasra verification widget, module index' },
    { path: 'src/components/CitizenPortal.tsx', role: 'Vernacular Citizen Self-Service Portal (8 Indian languages, speech audio, passbook, claims)' },
    { path: 'src/components/GISMap.tsx', role: 'Interactive Leaflet Cadastral Map, mega-corridors overlay, base layer switcher, ARIA HUD' },
    { path: 'src/components/Navbar.tsx', role: 'Enterprise Top Navigation, Role Switcher, Network Simulator, Theme Sun/Moon toggle' },
    { path: 'src/components/ParcelTable.tsx', role: 'Data Grid with multi-column sorting, advanced filtering, CSV/GeoJSON export' },
    { path: 'src/components/LifecycleMonitoringDashboard.tsx', role: 'RFCTLARR 2013 Acquisition tracker, section 11/19/23 milestone pipeline' },
    { path: 'src/components/AuthModal.tsx', role: 'Unified Citizen (Aadhaar/OTP) & Revenue Officer (Cadre ID) login and registration modal' },
    { path: 'src/components/GeofenceMonitorModal.tsx', role: 'Real-time GPS/Simulated field survey telemetry HUD with ray-casting proximity engine' },
    { path: 'src/components/OfflineSyncPanel.tsx', role: 'Two-way sync queue viewer, retry manager, and offline conflict resolution inspector' },
    { path: 'src/services/cadastralApi.ts', role: 'Client-side REST API client communicating with backend endpoints (/api/parcels, /api/verify)' },
    { path: 'src/lib/supabaseSync.ts', role: 'Supabase PostgreSQL cloud sync integration, remote health checks, fallback adapters' },
    { path: 'src/lib/i18n.ts', role: 'Vernacular dictionary supporting 8 Indian languages (Hindi, Marathi, Bengali, Telugu, etc.)' },
    { path: 'src/data/mockData.ts', role: 'Authentic Indian Cadastral sample records (Khasra 142/1, 142/2 Haveli Pune, CORS markers)' },
    { path: 'src/types.ts', role: 'Core TypeScript data structures (LandParcel, UserRole, GrievanceItem, DigitalSeal, etc.)' },
  ];

  fileManifest.forEach((file) => {
    checkPageBreak(9);
    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(2, 132, 199); // sky-600
    doc.text(file.path, margin + 2, cursorY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const descLines = doc.splitTextToSize(file.role, pageWidth - margin * 2 - 48);
    doc.text(descLines, margin + 48, cursorY);
    cursorY += Math.max(descLines.length * 3.6, 5.5);
  });

  cursorY += 4;

  // --- SECTION 3: EXHAUSTIVE FUNCTION & API CATALOG ---
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Key Functions, Algorithms & Utility Implementations', margin, cursorY);
  cursorY += 6;

  const functionCatalog = [
    {
      name: 'calculateCompensation() (src/components/CitizenPortal.tsx)',
      returns: 'CompensationBreakdown (Market Value + Solatium + 12% Interest)',
      desc: 'Implements Section 26-30 of Right to Fair Compensation Act (RFCTLARR 2013). Computes rural land multiplier (1.0x to 2.0x based on distance from urban node), adds 100% statutory solatium, plus 12% additional compensation.',
    },
    {
      name: 'isPointInPolygon() (src/context/GeofenceContext.tsx)',
      returns: 'boolean (Point inside parcel boundary)',
      desc: 'Ray-casting algorithm testing whether surveyor or landowner GPS coordinates (latitude, longitude) fall strictly inside arbitrary multi-vertex cadastral boundaries.',
    },
    {
      name: 'calculateDistanceToPolygon() (src/context/GeofenceContext.tsx)',
      returns: 'number (Distance in meters)',
      desc: 'Computes minimum perpendicular distance from coordinate to parcel boundary segments using WGS84 haversine geodesic trigonometry. Drives real-time geofence HUD alerts.',
    },
    {
      name: 'verifyParcelOnBackend() (src/services/cadastralApi.ts)',
      returns: 'Promise<ParcelVerificationResult>',
      desc: 'Queries backend /api/parcels/verify/:id to validate authenticity, SHA-256 seal integrity, CORS RTK accuracy status, and Revenue Department encumbrance records.',
    },
    {
      name: 'speakVernacularSummary() (src/components/CitizenPortal.tsx)',
      returns: 'void',
      desc: 'Integrates HTML5 SpeechSynthesis API configured with localized regional language voices (hi-IN, mr-IN, bn-IN, te-IN, ta-IN, gu-IN, kn-IN) for rural auditory accessibility.',
    },
    {
      name: 'handlePortalModeChange() (src/App.tsx)',
      returns: 'void',
      desc: 'Persists and switches active portal state between "home" (landing page), "citizen" (vernacular portal), and "admin" (enterprise GIS workbench) with localStorage caching.',
    },
    {
      name: 'syncParcelsWithBackend() (src/lib/supabaseSync.ts)',
      returns: 'Promise<SyncResult>',
      desc: 'Performs bidirectional synchronization between local indexed offline storage and remote Supabase PostgreSQL database with timestamp-based conflict reconciliation.',
    },
    {
      name: 'handleQuickVerify() (src/components/HomePage.tsx)',
      returns: 'Promise<void>',
      desc: 'Asynchronous event handler triggering real-time digital verification of Khasra numbers, providing instant verification badge and cryptographic seal inspection.',
    },
  ];

  functionCatalog.forEach((fn) => {
    checkPageBreak(16);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, cursorY - 1, pageWidth - margin * 2, 14, 'FD');

    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(fn.name, margin + 3, cursorY + 3.5);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(147, 51, 234); // purple-600
    doc.text(`Returns: ${fn.returns}`, margin + 3, cursorY + 7.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const splitDesc = doc.splitTextToSize(fn.desc, pageWidth - margin * 2 - 6);
    doc.text(splitDesc, margin + 3, cursorY + 11);
    cursorY += 16;
  });

  cursorY += 4;

  // --- SECTION 4: SERVER-SIDE REST API ENDPOINTS ---
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Server REST API Endpoint Contract (server.ts)', margin, cursorY);
  cursorY += 6;

  const endpoints = [
    { method: 'GET', path: '/api/parcels', desc: 'Returns all registered land parcels, geospatial polygon boundaries, and ownership details.' },
    { method: 'GET', path: '/api/parcels/:id', desc: 'Returns single parcel record with cadastral deed, dispute status, and survey history.' },
    { method: 'POST', path: '/api/parcels', desc: 'Registers new land parcel with geometry, acreage, zoning, and revenue classification.' },
    { method: 'PUT', path: '/api/parcels/:id', desc: 'Updates land parcel metadata, ownership transfer, or boundary demarcation status.' },
    { method: 'GET', path: '/api/parcels/verify/:id', desc: 'Cryptographically verifies parcel authenticity, returns SHA-256 seal and CORS survey logs.' },
    { method: 'GET', path: '/api/projects', desc: 'Returns all 8 National Infrastructure Corridors (Delhi-Mumbai Expressway, Bullet Train, etc.).' },
    { method: 'GET', path: '/api/grievances', desc: 'Fetches filed citizen grievances with SLA countdown and assigned Revenue Inspector.' },
    { method: 'POST', path: '/api/grievances', desc: 'Submits new citizen grievance ticket with SMS/email notification acknowledgment.' },
    { method: 'POST', path: '/api/compensation/calculate', desc: 'Server-side calculation of RFCTLARR 2013 statutory compensation package.' },
    { method: 'GET', path: '/api/audit-log', desc: 'Returns immutable audit trail of all cadastral mutations and boundary demarcations.' },
  ];

  endpoints.forEach((ep) => {
    checkPageBreak(9);
    doc.setFont('courier', 'bold');
    doc.setFontSize(7.5);
    if (ep.method === 'GET') doc.setTextColor(16, 185, 129); // green
    else if (ep.method === 'POST') doc.setTextColor(2, 132, 199); // blue
    else doc.setTextColor(245, 158, 11); // amber
    doc.text(ep.method, margin + 2, cursorY);

    doc.setTextColor(15, 23, 42);
    doc.text(ep.path, margin + 18, cursorY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const epDesc = doc.splitTextToSize(ep.desc, pageWidth - margin * 2 - 62);
    doc.text(epDesc, margin + 62, cursorY);
    cursorY += Math.max(epDesc.length * 3.6, 5.5);
  });

  cursorY += 6;

  // --- SECTION 5: DATA MODELS & SCHEMAS ---
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('5. Core TypeScript Data Models (src/types.ts)', margin, cursorY);
  cursorY += 6;

  const dataModels = [
    {
      name: 'LandParcel',
      fields: 'id, parcelNumber, title, owner, area, areaAcres, zoning, status, coordinates [lat,lng][], deedId, lastSurveyDate, propertyCardUrl, encumbranceCertificateUrl, disputesCount',
    },
    {
      name: 'NationalProjectCorridor',
      fields: 'id, name, shortName, code, corridorType, agency, totalLengthKm, allocatedBudgetCr, disbursedBudgetCr, gazetteRef, coordinates [lat,lng][], waypoints',
    },
    {
      name: 'GrievanceItem',
      fields: 'id, parcelNumber, ownerName, category, title, description, submittedAt, status, assignedOfficer, slaDaysRemaining, resolution',
    },
    {
      name: 'CompensationClaim',
      fields: 'id, parcelNumber, claimantName, marketValueBase, multiplierFactor, statutorySolatium, interestTwelvePercent, totalCompensation, disbursementStatus',
    },
    {
      name: 'AuthUser',
      fields: 'id, name, email, phone, role ("citizen" | "admin" | "surveyor" | "auditor" | "viewer"), aadhaarLast4, cadreRank, stateJurisdiction',
    },
  ];

  dataModels.forEach((dm) => {
    checkPageBreak(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`interface ${dm.name}`, margin + 2, cursorY);
    cursorY += 3.5;

    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const splitFields = doc.splitTextToSize(`{ ${dm.fields} }`, pageWidth - margin * 2 - 4);
    doc.text(splitFields, margin + 4, cursorY);
    cursorY += splitFields.length * 3.2 + 2.5;
  });

  // Footer for all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${totalPages} | TerraGIS Sovereign Cadastre | Ministry of Panchayati Raj & Survey of India`,
      margin,
      pageHeight - 8
    );
  }

  // Save / Trigger Download
  doc.save('TerraGIS_Source_Code_Architecture_Dossier.pdf');
}
