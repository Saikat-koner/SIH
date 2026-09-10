-- Supabase Database Schema for Cadastral Land Registry
-- You can run this in your Supabase Dashboard -> SQL Editor

-- 1. Create Parcels Table
CREATE TABLE IF NOT EXISTS public.parcels (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    parcel_number TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    zoning TEXT NOT NULL DEFAULT 'Agricultural',
    area_hectares NUMERIC NOT NULL DEFAULT 0,
    area_acres NUMERIC NOT NULL DEFAULT 0,
    valuation_usd NUMERIC NOT NULL DEFAULT 0,
    coordinates JSONB NOT NULL DEFAULT '[]'::jsonb,
    centroid JSONB NOT NULL DEFAULT '[0, 0]'::jsonb,
    last_survey_date TEXT,
    surveyor TEXT,
    notes TEXT,
    dispute_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    field_observations JSONB NOT NULL DEFAULT '[]'::jsonb,
    tax_compliance_status TEXT DEFAULT 'Compliant',
    soil_type TEXT DEFAULT 'Loamy',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Audit & Sync Events Table
CREATE TABLE IF NOT EXISTS public.sync_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    parcel_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    synced_by TEXT DEFAULT 'System',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_events ENABLE ROW LEVEL SECURITY;

-- 4. Public Access Policies (Allow read/write for authenticated and anonymous web app clients)
CREATE POLICY "Allow public read access" ON public.parcels
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON public.parcels
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON public.parcels
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON public.parcels
    FOR DELETE USING (true);

CREATE POLICY "Allow public sync logs" ON public.sync_events
    FOR ALL USING (true);
