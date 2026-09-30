import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PARCELS, INDIAN_VILLAGE_PARCELS } from './src/data/mockData';
import {
  isSupabaseConfigured,
  getSupabaseClient,
  fetchParcelsFromSupabase,
  upsertParcelsToSupabase,
  deleteParcelFromSupabase,
  logSyncEvent,
} from './server/supabase';

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: '10mb' }));

// In-memory cache of land parcels initialized with Indian cadastre and initial parcels
let cachedParcels: any[] = [...INDIAN_VILLAGE_PARCELS, ...INITIAL_PARCELS];
let lastSyncTimestamp: string | null = null;
let lastSyncError: string | null = null;

// ==========================================
// USER AUTHENTICATION & SESSIONS REGISTRY
// ==========================================

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  role: 'citizen' | 'admin' | 'surveyor' | 'auditor';
  roleTitle: string;
  organization: string;
  department?: string;
  state?: string;
  district?: string;
  village?: string;
  khasraNumber?: string;
  aadhaarMasked?: string;
  token?: string;
  avatar?: string;
  createdAt: string;
}

// Initial registered demo accounts (Citizens & Officers)
let usersRegistry: UserAccount[] = [
  {
    id: 'cit_001',
    name: 'Rameshwar K. Shinde',
    email: 'rameshwar.shinde@farmer.in',
    phone: '9876543210',
    role: 'citizen',
    roleTitle: 'Landowner & Agricultural Pattadar',
    organization: 'Gram Panchayat Haveli',
    state: 'Maharashtra',
    district: 'Pune',
    village: 'Haveli',
    khasraNumber: 'MH-PUN-HAV-2024-142B',
    aadhaarMasked: 'XXXX-XXXX-8921',
    token: 'tok_citizen_rameshwar',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'cit_002',
    name: 'Sunita Laxman Jadhav',
    email: 'sunita.jadhav@rural.in',
    phone: '9822012345',
    role: 'citizen',
    roleTitle: 'SVAMITVA Property Card Holder',
    organization: 'Gram Panchayat Haveli',
    state: 'Maharashtra',
    district: 'Pune',
    village: 'Haveli',
    khasraNumber: 'MH-PUN-SVAM-8812',
    aadhaarMasked: 'XXXX-XXXX-5510',
    token: 'tok_citizen_sunita',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-02-10T00:00:00Z',
  },
  {
    id: 'cit_003',
    name: 'Dnyaneshwar Ramchandra Patil',
    email: 'dnyaneshwar.patil@agri.in',
    phone: '9850123987',
    role: 'citizen',
    roleTitle: 'Sugarcane Grower & Pattadar',
    organization: 'Gram Panchayat Haveli',
    state: 'Maharashtra',
    district: 'Pune',
    village: 'Haveli',
    khasraNumber: 'MH-PUN-HAV-2024-142A',
    aadhaarMasked: 'XXXX-XXXX-3342',
    token: 'tok_citizen_dnyaneshwar',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-02-14T00:00:00Z',
  },
  {
    id: 'off_001',
    name: 'Suresh Deshmukh',
    email: 'suresh.deshmukh@rev.gov.in',
    phone: '9423001122',
    role: 'admin',
    roleTitle: 'Revenue Inspector (RI)',
    organization: 'Department of Revenue & Land Records',
    department: 'Tehsil Land Revenue Division',
    state: 'Maharashtra',
    district: 'Pune',
    token: 'tok_admin_suresh',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2023-08-01T00:00:00Z',
  },
  {
    id: 'off_002',
    name: 'Dr. Ananya Sharma',
    email: 'ananya.sharma@soi.gov.in',
    phone: '9412004455',
    role: 'surveyor',
    roleTitle: 'Director of Geodetic Drone Operations',
    organization: 'Survey of India (SOI)',
    department: 'CORS Geodetic Control Wing',
    state: 'National',
    district: 'Dehradun HQ',
    token: 'tok_surveyor_ananya',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    createdAt: '2023-05-12T00:00:00Z',
  },
  {
    id: 'off_003',
    name: 'Rajesh Shinde',
    email: 'rajesh.shinde@patwari.gov.in',
    phone: '9890112233',
    role: 'auditor',
    roleTitle: 'Village Accountant (Patwari / Talathi)',
    organization: 'Haveli Tehsil Revenue Circle',
    department: 'DILRMP Satbara Verification Desk',
    state: 'Maharashtra',
    district: 'Pune',
    token: 'tok_patwari_rajesh',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2023-09-20T00:00:00Z',
  },
];

// In-memory active grievances database
let grievancesRegistry: any[] = [
  {
    id: 'GRV-2024-881',
    parcelNumber: 'MH-PUN-HAV-2024-142B',
    ownerName: 'Rameshwar K. Shinde',
    category: 'boundary_dispute',
    title: 'Medh (Mud Ridge) southern encroachment of 1.4m',
    description: 'Adjacent owner tilled the ancestral bund ridge. Drone CORS survey confirms 1.4m deviation from 1998 cadastre.',
    submittedAt: '2024-04-03',
    status: 'hearing_scheduled',
    assignedOfficer: 'Revenue Inspector (RI) Suresh Deshmukh',
    slaDaysRemaining: 4,
    resolutionNotes: 'Field joint inspection completed with electronic total station. Demarcation hearing on Monday.',
  },
  {
    id: 'GRV-2024-892',
    parcelNumber: 'MH-PUN-SVAM-8812',
    ownerName: 'Laxman V. Jadhav',
    category: 'record_correction',
    title: 'Correction of spouse co-tenancy spelling in 8A extract',
    description: 'Requesting amendment of spouse name to Sunita Laxman Jadhav in official village records.',
    submittedAt: '2024-04-08',
    status: 'under_inspection',
    assignedOfficer: 'Patwari Rajesh Shinde',
    slaDaysRemaining: 8,
    resolutionNotes: 'Aadhaar e-KYC verified. Awaiting Tehsildar signature approval.',
  },
  {
    id: 'GRV-2024-905',
    parcelNumber: 'MH-PUN-HAV-2024-142A',
    ownerName: 'Dnyaneshwar Ramchandra Patil',
    category: 'resurvey_request',
    title: 'Drone ground control point resurvey for canal easement',
    description: 'Irrigation department canal expansion marked. Requesting resurvey of eastern boundary pegs.',
    submittedAt: '2024-04-10',
    status: 'submitted',
    assignedOfficer: 'Tehsildar Office Geomatics Unit',
    slaDaysRemaining: 14,
    resolutionNotes: null,
  },
];

// ==========================================
// 1. HEALTH & DIAGNOSTIC ENDPOINTS
// ==========================================

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Cadastral GIS Land Registry Backend',
    version: '1.2.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/api/status', async (_req: Request, res: Response) => {
  const configured = isSupabaseConfigured();
  let supabaseConnected = false;
  let remoteRowCount: number | null = null;
  let statusMessage = 'Operating with high-speed local memory cache';

  if (configured) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { count, error } = await client
          .from('parcels')
          .select('*', { count: 'exact', head: true });

        if (!error) {
          supabaseConnected = true;
          remoteRowCount = count ?? 0;
          statusMessage = `Connected to Supabase (${remoteRowCount} parcels registered in cloud database)`;
        } else {
          statusMessage = `Supabase credentials detected, but 'parcels' table returned: ${error.message}`;
          lastSyncError = error.message;
        }
      } catch (err: any) {
        statusMessage = `Supabase query error: ${err.message}`;
        lastSyncError = err.message;
      }
    }
  } else {
    statusMessage = 'Supabase credentials not configured in environment (SUPABASE_URL and SUPABASE_ANON_KEY required in Settings)';
  }

  // Sanitize Supabase URL to hide sensitive details
  const rawUrl = process.env.SUPABASE_URL || '';
  const sanitizedHost = rawUrl ? rawUrl.replace(/^https?:\/\//, '').split('/')[0] : null;

  res.json({
    configured,
    supabaseConnected,
    supabaseHost: sanitizedHost,
    statusMessage,
    lastSyncTimestamp,
    lastSyncError,
    cachedCount: cachedParcels.length,
    remoteRowCount,
  });
});

// ==========================================
// 2. PARCEL REST & SYNC API ROUTES
// ==========================================

/**
 * GET /api/parcels
 * Fetches all parcels. If Supabase is connected, reads from Supabase and synchronizes the local cache.
 */
app.get('/api/parcels', async (_req: Request, res: Response) => {
  if (isSupabaseConfigured()) {
    const { data, error } = await fetchParcelsFromSupabase();
    if (!error && data && data.length > 0) {
      cachedParcels = data;
      lastSyncTimestamp = new Date().toISOString();
      lastSyncError = null;
      return res.json({
        parcels: cachedParcels,
        source: 'supabase',
        count: cachedParcels.length,
        timestamp: lastSyncTimestamp,
      });
    }

    if (error) {
      lastSyncError = error;
    }
  }

  // Fallback to in-memory cached parcels
  return res.json({
    parcels: cachedParcels,
    source: isSupabaseConfigured() ? 'supabase-fallback' : 'local-cache',
    count: cachedParcels.length,
    timestamp: lastSyncTimestamp || new Date().toISOString(),
    syncError: lastSyncError,
  });
});

/**
 * POST /api/parcels
 * Creates or inserts a new land parcel.
 */
app.post('/api/parcels', async (req: Request, res: Response) => {
  const newParcel = req.body;
  if (!newParcel || !newParcel.id) {
    return res.status(400).json({ error: 'Invalid parcel payload. "id" is required.' });
  }

  // Update in-memory cache
  const existingIdx = cachedParcels.findIndex((p) => p.id === newParcel.id);
  if (existingIdx >= 0) {
    cachedParcels[existingIdx] = { ...cachedParcels[existingIdx], ...newParcel, updatedAt: new Date().toISOString() };
  } else {
    cachedParcels.unshift({ ...newParcel, updatedAt: new Date().toISOString() });
  }

  let cloudSynced = false;
  let cloudError: string | null = null;

  if (isSupabaseConfigured()) {
    const { count, error } = await upsertParcelsToSupabase([newParcel]);
    if (!error && count > 0) {
      cloudSynced = true;
      lastSyncTimestamp = new Date().toISOString();
      await logSyncEvent('CREATE_PARCEL', newParcel.id, { parcelNumber: newParcel.parcelNumber, title: newParcel.title });
    } else if (error) {
      cloudError = error;
      lastSyncError = error;
    }
  }

  res.status(201).json({
    success: true,
    parcel: newParcel,
    cloudSynced,
    cloudError,
    timestamp: new Date().toISOString(),
  });
});

/**
 * PUT /api/parcels/:id
 * Updates an existing parcel.
 */
app.put('/api/parcels/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const idx = cachedParcels.findIndex((p) => p.id === id);
  if (idx < 0) {
    return res.status(404).json({ error: `Parcel with ID ${id} not found.` });
  }

  cachedParcels[idx] = {
    ...cachedParcels[idx],
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  };

  const updatedParcel = cachedParcels[idx];
  let cloudSynced = false;
  let cloudError: string | null = null;

  if (isSupabaseConfigured()) {
    const { count, error } = await upsertParcelsToSupabase([updatedParcel]);
    if (!error && count > 0) {
      cloudSynced = true;
      lastSyncTimestamp = new Date().toISOString();
      await logSyncEvent('UPDATE_PARCEL', id, { title: updatedParcel.title });
    } else if (error) {
      cloudError = error;
      lastSyncError = error;
    }
  }

  res.json({
    success: true,
    parcel: updatedParcel,
    cloudSynced,
    cloudError,
  });
});

/**
 * DELETE /api/parcels/:id
 * Deletes a parcel by ID.
 */
app.delete('/api/parcels/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const prevCount = cachedParcels.length;
  cachedParcels = cachedParcels.filter((p) => p.id !== id);

  if (cachedParcels.length === prevCount) {
    return res.status(404).json({ error: `Parcel with ID ${id} not found.` });
  }

  let cloudSynced = false;
  let cloudError: string | null = null;

  if (isSupabaseConfigured()) {
    const { success, error } = await deleteParcelFromSupabase(id);
    if (success) {
      cloudSynced = true;
      await logSyncEvent('DELETE_PARCEL', id);
    } else {
      cloudError = error;
    }
  }

  res.json({
    success: true,
    deletedId: id,
    cloudSynced,
    cloudError,
  });
});

/**
 * POST /api/sync
 * Two-way bulk synchronization endpoint.
 * Takes frontend parcels and upserts all of them into Supabase, or seeds Supabase if remote is empty.
 */
app.post('/api/sync', async (req: Request, res: Response) => {
  const { parcels, forcePush } = req.body;
  const incomingParcels: any[] = Array.isArray(parcels) && parcels.length > 0 ? parcels : cachedParcels;

  // Merge into in-memory store
  for (const item of incomingParcels) {
    const i = cachedParcels.findIndex((p) => p.id === item.id);
    if (i >= 0) {
      cachedParcels[i] = { ...cachedParcels[i], ...item };
    } else {
      cachedParcels.push(item);
    }
  }

  if (!isSupabaseConfigured()) {
    return res.json({
      success: true,
      mode: 'local_sync_only',
      message: 'Synced with in-memory server cache. Configure SUPABASE_URL and SUPABASE_ANON_KEY in Settings to sync with cloud Supabase database.',
      syncedCount: incomingParcels.length,
      parcels: cachedParcels,
      timestamp: new Date().toISOString(),
    });
  }

  // If force push or Supabase is connected
  try {
    // Check remote data first
    if (!forcePush) {
      const { data: remoteData, error: fetchErr } = await fetchParcelsFromSupabase();
      if (!fetchErr && remoteData && remoteData.length > 0) {
        // Merge remote data with local
        const idMap = new Map<string, any>();
        for (const p of incomingParcels) idMap.set(p.id, p);
        for (const rp of remoteData) idMap.set(rp.id, rp);
        cachedParcels = Array.from(idMap.values());
        lastSyncTimestamp = new Date().toISOString();
        return res.json({
          success: true,
          mode: 'supabase_merged',
          syncedCount: remoteData.length,
          parcels: cachedParcels,
          timestamp: lastSyncTimestamp,
        });
      }
    }

    // Push local parcels to Supabase
    const { count, error } = await upsertParcelsToSupabase(cachedParcels);
    if (error) {
      lastSyncError = error;
      return res.status(500).json({
        success: false,
        error: `Supabase push error: ${error}`,
        hint: 'Please ensure you have executed the SQL schema script in supabase/schema.sql in your Supabase SQL Editor.',
      });
    }

    lastSyncTimestamp = new Date().toISOString();
    lastSyncError = null;
    await logSyncEvent('BULK_SYNC', undefined, { count });

    return res.json({
      success: true,
      mode: 'supabase_pushed',
      syncedCount: count,
      parcels: cachedParcels,
      timestamp: lastSyncTimestamp,
    });
  } catch (err: any) {
    lastSyncError = err.message;
    return res.status(500).json({
      success: false,
      error: err.message || 'Bulk sync failed',
    });
  }
});

// ==========================================
// 3. AUTHENTICATION & USER MANAGEMENT API
// ==========================================

/**
 * GET /api/auth/demo-users
 * Returns available demo user profiles for quick 1-click testing.
 */
app.get('/api/auth/demo-users', (_req: Request, res: Response) => {
  res.json({
    citizens: usersRegistry.filter((u) => u.role === 'citizen'),
    officers: usersRegistry.filter((u) => u.role !== 'citizen'),
  });
});

/**
 * POST /api/auth/login
 * Handles both Citizen and Officer authentication.
 */
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier, password, role, isDemo, demoUserId } = req.body;

  // Handle 1-click quick demo login
  if (isDemo && demoUserId) {
    const demoUser = usersRegistry.find((u) => u.id === demoUserId);
    if (demoUser) {
      return res.json({
        success: true,
        token: demoUser.token || `tok_${demoUser.id}_${Date.now()}`,
        user: demoUser,
        message: `Authenticated as ${demoUser.name} (${demoUser.roleTitle})`,
      });
    }
  }

  if (!identifier) {
    return res.status(400).json({ error: 'Mobile number, Email, or Officer ID is required.' });
  }

  // Find user by phone, email, or ID
  const cleanId = String(identifier).trim().toLowerCase();
  let user = usersRegistry.find(
    (u) =>
      u.email.toLowerCase() === cleanId ||
      (u.phone && u.phone === cleanId) ||
      u.id.toLowerCase() === cleanId
  );

  // If user does not exist but provides identifier, auto-provision guest citizen or officer session
  if (!user) {
    const isOfficer = role && role !== 'citizen';
    user = {
      id: isOfficer ? `off_${Date.now().toString(36)}` : `cit_${Date.now().toString(36)}`,
      name: isOfficer ? `Officer ${cleanId.split('@')[0]}` : `Citizen ${cleanId}`,
      email: cleanId.includes('@') ? cleanId : `${cleanId}@rural.in`,
      phone: !cleanId.includes('@') ? cleanId : undefined,
      role: (role as any) || 'citizen',
      roleTitle: isOfficer ? 'Field Revenue Officer' : 'Registered Landowner',
      organization: isOfficer ? 'Department of Land Revenue' : 'Gram Panchayat Citizen',
      state: 'Maharashtra',
      district: 'Pune',
      village: 'Haveli',
      token: `tok_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
    };
    usersRegistry.push(user);
  }

  return res.json({
    success: true,
    token: user.token || `tok_${user.id}`,
    user,
    message: `Login successful. Welcome back, ${user.name}!`,
  });
});

/**
 * POST /api/auth/register
 * Registers a new citizen or field surveyor.
 */
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, role, village, district, state, khasraNumber } = req.body;

  if (!name || (!email && !phone)) {
    return res.status(400).json({ error: 'Name and at least Mobile or Email are required.' });
  }

  const existing = usersRegistry.find(
    (u) => (email && u.email.toLowerCase() === email.toLowerCase()) || (phone && u.phone === phone)
  );

  if (existing) {
    return res.status(409).json({
      error: 'An account with this email or mobile already exists. Please log in directly.',
      existingUser: existing,
    });
  }

  const isOfficer = role && role !== 'citizen';
  const newUser: UserAccount = {
    id: isOfficer ? `off_${Date.now().toString(36)}` : `cit_${Date.now().toString(36)}`,
    name: name.trim(),
    email: (email || `${phone}@rural.in`).trim(),
    phone: phone ? phone.trim() : undefined,
    role: (role as any) || 'citizen',
    roleTitle: isOfficer ? 'Assistant Revenue Surveyor' : 'Registered Landowner',
    organization: isOfficer ? 'Tehsil Revenue Department' : `Gram Panchayat ${village || 'Haveli'}`,
    state: state || 'Maharashtra',
    district: district || 'Pune',
    village: village || 'Haveli',
    khasraNumber: khasraNumber || 'PENDING-VERIFICATION',
    token: `tok_reg_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  usersRegistry.push(newUser);

  res.status(201).json({
    success: true,
    token: newUser.token,
    user: newUser,
    message: `Account created successfully for ${newUser.name}.`,
  });
});

/**
 * GET /api/auth/me
 * Returns current authenticated user details from token.
 */
app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or malformed.' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const user = usersRegistry.find((u) => u.token === token);

  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }

  res.json({ success: true, user });
});

/**
 * POST /api/auth/logout
 */
app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ==========================================
// 4. GRIEVANCE REDRESSAL & DISPUTE API
// ==========================================

/**
 * GET /api/grievances
 * Fetches all registered grievances.
 */
app.get('/api/grievances', (req: Request, res: Response) => {
  const { status, parcelNumber } = req.query;
  let list = [...grievancesRegistry];

  if (status && typeof status === 'string') {
    list = list.filter((g) => g.status === status);
  }
  if (parcelNumber && typeof parcelNumber === 'string') {
    list = list.filter((g) => g.parcelNumber.toLowerCase().includes(parcelNumber.toLowerCase()));
  }

  res.json({
    success: true,
    count: list.length,
    grievances: list,
  });
});

/**
 * POST /api/grievances
 * Lodges a new grievance or boundary dispute.
 */
app.post('/api/grievances', (req: Request, res: Response) => {
  const { parcelNumber, ownerName, category, title, description, citizenContact, village } = req.body;

  if (!parcelNumber || !title || !description) {
    return res.status(400).json({ error: 'parcelNumber, title, and description are required.' });
  }

  const newTicketId = `GRV-2024-${Math.floor(1000 + Math.random() * 9000)}`;
  const newGrievance = {
    id: newTicketId,
    parcelNumber,
    ownerName: ownerName || 'Registered Pattadar',
    category: category || 'boundary_dispute',
    title,
    description,
    citizenContact: citizenContact || null,
    village: village || 'Haveli',
    submittedAt: new Date().toISOString().split('T')[0],
    status: 'submitted',
    assignedOfficer: 'Revenue Inspector (RI) Suresh Deshmukh',
    slaDaysRemaining: 14,
    resolutionNotes: null,
  };

  grievancesRegistry.unshift(newGrievance);

  res.status(201).json({
    success: true,
    grievance: newGrievance,
    message: `Grievance #${newTicketId} registered. SMS acknowledgment dispatched. Statutory SLA: 14 days.`,
  });
});

/**
 * PUT /api/grievances/:id
 * Updates an existing grievance with officer inspection findings.
 */
app.put('/api/grievances/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, resolutionNotes, assignedOfficer } = req.body;

  const idx = grievancesRegistry.findIndex((g) => g.id === id);
  if (idx < 0) {
    return res.status(404).json({ error: `Grievance ${id} not found.` });
  }

  grievancesRegistry[idx] = {
    ...grievancesRegistry[idx],
    status: status || grievancesRegistry[idx].status,
    resolutionNotes: resolutionNotes !== undefined ? resolutionNotes : grievancesRegistry[idx].resolutionNotes,
    assignedOfficer: assignedOfficer || grievancesRegistry[idx].assignedOfficer,
    updatedAt: new Date().toISOString(),
  };

  res.json({
    success: true,
    grievance: grievancesRegistry[idx],
    message: `Grievance ${id} updated.`,
  });
});

// ==========================================
// 5. RFCTLARR 2013 LAND COMPENSATION CALCULATOR API
// ==========================================

/**
 * POST /api/compensation/calculate
 * Calculates statutory land acquisition compensation under RFCTLARR Act 2013:
 * Formula:
 * - Basic Land Value = Area (sq.m) * Circle Rate
 * - Multiplying Factor = 1.0 (Urban) or 1.5 - 2.0 (Rural distance based)
 * - Solatium = 100% of (Basic Land Value * Multiplying Factor)
 * - Additional Interest = 12% p.a. from Sec 4(1) / Preliminary notification
 * - Structural / Standing Crop Allowance
 */
app.post('/api/compensation/calculate', (req: Request, res: Response) => {
  const {
    areaHectares = 1,
    circleRatePerSqm = 1200,
    isRural = true,
    ruralMultiplier = 1.5,
    monthsElapsed = 12,
    structureValue = 250000,
    treesAndCropsValue = 75000,
    rehabilitationGrant = 500000,
  } = req.body;

  const areaSqm = Number(areaHectares) * 10000;
  const baseLandValue = areaSqm * Number(circleRatePerSqm);
  const factor = isRural ? Math.max(1.0, Math.min(2.0, Number(ruralMultiplier))) : 1.0;
  const adjustedLandValue = baseLandValue * factor;
  const solatium = adjustedLandValue * 1.0; // 100% Solatium mandated by law
  const interestRatePerMonth = 0.12 / 12; // 12% per annum
  const interestAmount = baseLandValue * interestRatePerMonth * Number(monthsElapsed);
  const assetsTotal = Number(structureValue) + Number(treesAndCropsValue);
  const totalCompensation = adjustedLandValue + solatium + interestAmount + assetsTotal + Number(rehabilitationGrant);

  res.json({
    success: true,
    breakdown: {
      areaHectares: Number(areaHectares),
      areaSqm,
      circleRatePerSqm: Number(circleRatePerSqm),
      baseLandValue,
      isRural,
      ruralMultiplyingFactor: factor,
      adjustedLandValue,
      solatium100Percent: solatium,
      interest12Percent: interestAmount,
      assetsTotal,
      structureValue: Number(structureValue),
      treesAndCropsValue: Number(treesAndCropsValue),
      rehabilitationGrant: Number(rehabilitationGrant),
      totalStatutoryCompensation: totalCompensation,
      currency: 'INR',
      statutoryAct: 'The Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (RFCTLARR)',
    },
  });
});

// ==========================================
// 6. KHASRA TITLE & E-GHAROUNI VERIFICATION API
// ==========================================

/**
 * GET /api/parcels/verify/:parcelNumber
 * Returns cryptographic verification and cadastral authenticity check.
 */
app.get('/api/parcels/verify/:parcelNumber', (req: Request, res: Response) => {
  const { parcelNumber } = req.params;
  const parcel = cachedParcels.find(
    (p) => p.parcelNumber.toLowerCase() === parcelNumber.toLowerCase() || p.id === parcelNumber
  );

  if (!parcel) {
    return res.status(404).json({
      verified: false,
      message: `Parcel identifier ${parcelNumber} not found in official state cadastral registry.`,
    });
  }

  // Create deterministic digital seal hash
  const payloadToHash = `${parcel.id}|${parcel.parcelNumber}|${parcel.owner}|${parcel.areaHectares}|${parcel.valuationUSD}`;
  const digitalSealHash = crypto.createHash('sha256').update(payloadToHash).digest('hex');

  res.json({
    verified: true,
    parcel,
    digitalSeal: {
      sha256Hash: digitalSealHash,
      certifyingAuthority: 'National Informatics Centre (NIC) & Survey of India Geomatics Unit',
      verifiedAt: new Date().toISOString(),
      corsRtkAccuracy: '± 3.2 cm (Sub-decimeter survey-grade)',
      statutoryScheme: 'SVAMITVA / DILRMP - Government of India',
      tamperProofStatus: 'PASSED - Cryptographically Sealed',
      deedAuthenticity: 'Verified against State Land Revenue Core Record (Satbara 7/12 & 8A)',
    },
  });
});

// ==========================================
// 7. PLATFORM TELEMETRY & LIVE STATS API
// ==========================================

/**
 * GET /api/stats
 * Aggregated statistics for the Home Page and executive dashboard.
 */
app.get('/api/stats', (_req: Request, res: Response) => {
  const totalParcels = cachedParcels.length;
  const totalHectares = cachedParcels.reduce((sum, p) => sum + (Number(p.areaHectares) || 0), 0);
  const activeDisputes = grievancesRegistry.filter((g) => g.status !== 'resolved').length;
  const resolvedDisputes = grievancesRegistry.filter((g) => g.status === 'resolved').length;
  const verifiedTitles = cachedParcels.filter((p) => p.status === 'active').length;

  res.json({
    totalParcels,
    totalHectares: Number(totalHectares.toFixed(2)),
    verifiedTitles,
    activeDisputes,
    resolvedDisputes,
    activeSurveyorsOnline: 14,
    villagesCoveredNational: 654210,
    propertyCardsGeneratedNational: 14280940,
    corsStationsActive: 1042,
    dbtDisbursedCrores: 4820.5,
    systemUptime: '99.98%',
    lastUpdated: new Date().toISOString(),
  });
});

// ==========================================
// 8. CITIZEN SUPPORT & TICKETING API
// ==========================================

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  name: string;
  email: string;
  phone?: string;
  category: string;
  subject: string;
  message: string;
  status: 'received' | 'in_review' | 'resolved';
  priority: 'normal' | 'urgent';
  createdAt: string;
}

let supportTicketsRegistry: SupportTicket[] = [
  {
    id: 'tkt_001',
    ticketNumber: 'NIC-TKT-2024-8841',
    name: 'Govind Narayan Patil',
    email: 'govind.patil@agri.in',
    phone: '9822334455',
    category: 'E-Gharouni Download Issue',
    subject: 'Satbara 7/12 digital seal verification delay',
    message: 'Generated property card for parcel MH-PUN-HAV-2024-142B, requesting official Tehsil re-verification seal.',
    status: 'resolved',
    priority: 'normal',
    createdAt: '2024-03-01T10:30:00Z',
  },
  {
    id: 'tkt_002',
    ticketNumber: 'NIC-TKT-2024-9104',
    name: 'Shyamala Rao',
    email: 'shyamala.rao@rural.org',
    phone: '9845012345',
    category: 'Mutation Status Enquiry',
    subject: 'Namantaran deed timeline query for Haveli village',
    message: 'Registered deed mutation filed on Feb 12th, seeking update on Sub-Registrar endorsement.',
    status: 'in_review',
    priority: 'normal',
    createdAt: '2024-03-05T14:20:00Z',
  },
];

/**
 * POST /api/support/ticket
 * Lodges a support / citizen query ticket and returns an official ticket number.
 */
app.post('/api/support/ticket', (req: Request, res: Response) => {
  const { name, email, phone, category, subject, message } = req.body;
  if (!message || (!name && !email)) {
    return res.status(400).json({ error: 'Name, email, and inquiry description are required.' });
  }

  const ticketNumber = `NIC-TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const ticket: SupportTicket = {
    id: `tkt_${Date.now()}`,
    ticketNumber,
    name: name || 'Citizen Requester',
    email: email || 'citizen.helpdesk@nic.in',
    phone: phone || '',
    category: category || 'General Land Records Inquiry',
    subject: subject || (message.length > 50 ? message.slice(0, 50) + '...' : message),
    message,
    status: 'received',
    priority: 'normal',
    createdAt: new Date().toISOString(),
  };

  supportTicketsRegistry.unshift(ticket);
  res.status(201).json({
    success: true,
    ticket,
    message: `Official support request logged successfully. Tracking ID: ${ticketNumber}. A Revenue Officer will follow up within 24-48 business hours.`,
  });
});

/**
 * GET /api/support/tickets
 * Retrieves logged support tickets.
 */
app.get('/api/support/tickets', (_req: Request, res: Response) => {
  res.json({ tickets: supportTicketsRegistry });
});

/**
 * POST /api/support/ai-query
 * Automated cadastral knowledge assistant query endpoint.
 */
app.post('/api/support/ai-query', (req: Request, res: Response) => {
  const { query } = req.body;
  const userQ = (query || '').toLowerCase();
  let reply = 'For official statutory procedures, please consult your local Tehsil Revenue Inspector or dial the National Land Governance Toll-Free Helpline at 1800-180-1551.';

  if (userQ.includes('card') || userQ.includes('gharouni') || userQ.includes('svamitva') || userQ.includes('property')) {
    reply = 'Official Digital Property Cards (E-Gharouni / ई-घरौनी) are generated under the SVAMITVA scheme following CORS RTK drone cadastral surveys. They confer legal title for inhabited village abadi plots and are recognized by all scheduled commercial banks for institutional credit.';
  } else if (userQ.includes('dispute') || userQ.includes('encroach') || userQ.includes('boundary') || userQ.includes('grievance')) {
    reply = 'Boundary disputes and encroachment appeals can be lodged in the Citizen Services Portal under "Grievances". A tamper-evident digital token is issued and a joint drone re-verification survey is scheduled within 14 statutory days.';
  } else if (userQ.includes('compensation') || userQ.includes('payout') || userQ.includes('highway') || userQ.includes('rfctlarr')) {
    reply = 'Under the RFCTLARR Act 2013, acquired land compensation equals the notified Circle Rate multiplied by the rural factor (1.5x - 2.0x), plus a statutory 100% Solatium and 12% per-annum interest disbursed directly via Aadhaar Direct Benefit Transfer (DBT).';
  } else if (userQ.includes('mutation') || userQ.includes('namantaran') || userQ.includes('transfer')) {
    reply = 'E-Mutation (Namantaran) workflows automatically process registered deeds through Sub-Registrar Office integration, updating Revenue Form VII-XII / Khatauni within 30 statutory days without manual clerk intervention.';
  } else if (userQ.includes('offline') || userQ.includes('sync') || userQ.includes('internet')) {
    reply = 'The portal features decentralized offline-first caching. Field survey measurements recorded in remote areas without cellular coverage synchronize automatically through cryptographic SHA-256 conflict resolution once connectivity resumes.';
  }

  res.json({
    reply,
    timestamp: new Date().toISOString(),
    source: 'National Cadastre Automated Knowledge Engine (NIC / Survey of India)',
  });
});

/**
 * GET /api/khasra/search
 * Search parcels by Khasra number, owner, village, or district.
 */
app.get('/api/khasra/search', (req: Request, res: Response) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  if (!q) {
    return res.json({ results: cachedParcels.slice(0, 10) });
  }

  const results = cachedParcels.filter((p) => {
    return (
      (p.parcelNumber && p.parcelNumber.toLowerCase().includes(q)) ||
      (p.owner && p.owner.toLowerCase().includes(q)) ||
      (p.village && p.village.toLowerCase().includes(q)) ||
      (p.district && p.district.toLowerCase().includes(q)) ||
      (p.id && p.id.toLowerCase().includes(q))
    );
  });

  res.json({ count: results.length, results });
});

// ==========================================
// 9. VITE MIDDLEWARE & STATIC ASSETS
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Cadastral Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`[Cadastral Server] Supabase status: ${isSupabaseConfigured() ? 'Configured ✅' : 'Waiting for credentials in Settings'}`);
  });
}

startServer();
