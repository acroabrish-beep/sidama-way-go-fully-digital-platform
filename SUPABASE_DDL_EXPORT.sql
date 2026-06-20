-- ============================================================
-- SIDAMA WAY GO - COMPLETE SUPABASE SQL DDL EXPORT
-- PostgreSQL 13+ with PostGIS Support
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================
-- CORE TABLES - Foundation for all systems
-- ============================================================

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('citizen', 'driver', 'business', 'admin', 'emergency', 'healthcare')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  city TEXT NOT NULL DEFAULT 'Hawassa',
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roles and Permissions
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- ============================================================
-- TRANSPORTATION MODULE TABLES
-- ============================================================

-- Routes
CREATE TABLE IF NOT EXISTS public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  start_location GEOGRAPHY,
  end_location GEOGRAPHY,
  distance_km DECIMAL(10, 2),
  estimated_time_minutes INT,
  fare_price DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  operator_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_routes_status ON public.routes(status);
CREATE INDEX IF NOT EXISTS idx_routes_operator ON public.routes(operator_id);

-- Route Stops
CREATE TABLE IF NOT EXISTS public.route_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  stop_number INT NOT NULL,
  name TEXT NOT NULL,
  location GEOGRAPHY NOT NULL,
  arrival_time_minutes INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(route_id, stop_number)
);

CREATE INDEX IF NOT EXISTS idx_route_stops_route ON public.route_stops(route_id);

-- Vehicles
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number TEXT NOT NULL UNIQUE,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('bus', 'minibus', 'taxi', 'ambulance')),
  capacity INT NOT NULL,
  manufacturer TEXT,
  year INT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'retired')),
  current_location GEOGRAPHY,
  current_route_id UUID REFERENCES public.routes(id),
  owner_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON public.vehicles(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_owner ON public.vehicles(owner_id);

-- Drivers
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  license_number TEXT NOT NULL UNIQUE,
  license_expiry DATE NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id),
  status TEXT NOT NULL DEFAULT 'off_duty' CHECK (status IN ('on_duty', 'off_duty', 'on_leave', 'suspended')),
  rating DECIMAL(3, 2) DEFAULT 5.0,
  total_rides INT DEFAULT 0,
  total_earnings DECIMAL(15, 2) DEFAULT 0,
  current_location GEOGRAPHY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drivers_status ON public.drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_vehicle ON public.drivers(vehicle_id);

-- Trips/Rides
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_code TEXT NOT NULL UNIQUE DEFAULT 'TRIP-' || to_char(now(), 'YYYYMMDDHH24MISS'),
  citizen_id UUID NOT NULL REFERENCES public.users(id),
  driver_id UUID REFERENCES public.drivers(id),
  route_id UUID REFERENCES public.routes(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  pickup_location GEOGRAPHY NOT NULL,
  dropoff_location GEOGRAPHY NOT NULL,
  pickup_time TIMESTAMP WITH TIME ZONE NOT NULL,
  dropoff_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  distance_km DECIMAL(10, 2),
  fare DECIMAL(10, 2),
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'mobile_money', 'wallet')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'refunded')),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_citizen ON public.trips(citizen_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON public.trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_created ON public.trips(created_at DESC);

-- Tickets (QR-based ticketing)
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code TEXT NOT NULL UNIQUE DEFAULT 'TKT-' || to_char(now(), 'YYYYMMDDHH24MISS'),
  citizen_id UUID NOT NULL REFERENCES public.users(id),
  trip_id UUID REFERENCES public.trips(id),
  route_id UUID REFERENCES public.routes(id),
  qr_code TEXT,
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  validity_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'refunded')),
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_citizen ON public.tickets(citizen_id);

-- ============================================================
-- TAXI MODULE TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.taxi_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT NOT NULL UNIQUE DEFAULT 'TAX-' || to_char(now(), 'YYYYMMDDHH24MISS'),
  customer_id UUID NOT NULL REFERENCES public.users(id),
  driver_id UUID REFERENCES public.drivers(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  pickup_location GEOGRAPHY NOT NULL,
  dropoff_location GEOGRAPHY NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  estimated_fare DECIMAL(10, 2),
  actual_fare DECIMAL(10, 2),
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'mobile_money')),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_taxi_orders_status ON public.taxi_orders(status);
CREATE INDEX IF NOT EXISTS idx_taxi_orders_customer ON public.taxi_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_taxi_orders_driver ON public.taxi_orders(driver_id);

-- ============================================================
-- TOURISM MODULE TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tourist_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('historical', 'natural', 'cultural', 'religious', 'entertainment', 'shopping', 'dining')),
  location GEOGRAPHY NOT NULL,
  address TEXT,
  opening_hours TEXT,
  website TEXT,
  phone TEXT,
  entrance_fee DECIMAL(10, 2),
  rating DECIMAL(3, 2) DEFAULT 5.0,
  reviews_count INT DEFAULT 0,
  images_urls TEXT[],
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tourist_sites_category ON public.tourist_sites(category);
CREATE INDEX IF NOT EXISTS idx_tourist_sites_verified ON public.tourist_sites(verified);

CREATE TABLE IF NOT EXISTS public.tourist_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_id UUID NOT NULL REFERENCES public.users(id),
  site_id UUID NOT NULL REFERENCES public.tourist_sites(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  images_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tourist_reviews_site ON public.tourist_reviews(site_id);

-- ============================================================
-- HEALTHCARE MODULE TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.healthcare_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  facility_type TEXT NOT NULL CHECK (facility_type IN ('hospital', 'clinic', 'pharmacy', 'lab', 'ambulance')),
  location GEOGRAPHY NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  opening_hours TEXT,
  bed_count INT,
  ambulance_count INT DEFAULT 0,
  website TEXT,
  rating DECIMAL(3, 2) DEFAULT 5.0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_healthcare_type ON public.healthcare_facilities(facility_type);
CREATE INDEX IF NOT EXISTS idx_healthcare_verified ON public.healthcare_facilities(verified);

CREATE TABLE IF NOT EXISTS public.medical_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES public.healthcare_facilities(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  description TEXT,
  availability TEXT,
  cost DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medical_services_facility ON public.medical_services(facility_id);

-- ============================================================
-- EMERGENCY MODULE TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.emergency_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_code TEXT NOT NULL UNIQUE DEFAULT 'INC-' || to_char(now(), 'YYYYMMDDHH24MISS'),
  reporter_id UUID NOT NULL REFERENCES public.users(id),
  incident_type TEXT NOT NULL CHECK (incident_type IN ('fire', 'accident', 'medical', 'crime', 'disaster', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  location GEOGRAPHY NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'acknowledged', 'in_progress', 'resolved', 'closed')),
  responder_id UUID REFERENCES public.users(id),
  response_time_minutes INT,
  resolution_time_minutes INT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emergency_status ON public.emergency_incidents(status);
CREATE INDEX IF NOT EXISTS idx_emergency_severity ON public.emergency_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_emergency_type ON public.emergency_incidents(incident_type);

CREATE TABLE IF NOT EXISTS public.emergency_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type TEXT NOT NULL CHECK (service_type IN ('fire', 'police', 'ambulance', 'disaster_relief')),
  vehicle_id UUID REFERENCES public.vehicles(id),
  location GEOGRAPHY,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_mission', 'maintenance')),
  incident_id UUID REFERENCES public.emergency_incidents(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emergency_services_status ON public.emergency_services(status);
CREATE INDEX IF NOT EXISTS idx_emergency_services_type ON public.emergency_services(service_type);

-- ============================================================
-- BUSINESS & DELIVERY MODULE TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.users(id),
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  location GEOGRAPHY NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  logo_url TEXT,
  rating DECIMAL(3, 2) DEFAULT 5.0,
  verified BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_verified ON public.businesses(verified);

CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_code TEXT NOT NULL UNIQUE DEFAULT 'DEL-' || to_char(now(), 'YYYYMMDDHH24MISS'),
  business_id UUID NOT NULL REFERENCES public.businesses(id),
  driver_id UUID REFERENCES public.drivers(id),
  pickup_location GEOGRAPHY NOT NULL,
  dropoff_location GEOGRAPHY NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'delivered', 'cancelled')),
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  actual_delivery TIMESTAMP WITH TIME ZONE,
  fee DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_business ON public.deliveries(business_id);

-- ============================================================
-- SMART MAP & TRACKING TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.gps_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('vehicle', 'driver', 'emergency_service')),
  entity_id UUID NOT NULL,
  location GEOGRAPHY NOT NULL,
  accuracy INT,
  heading INT,
  speed DECIMAL(10, 2),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gps_locations_entity ON public.gps_locations(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_gps_locations_timestamp ON public.gps_locations(timestamp DESC);

-- ============================================================
-- ANALYTICS & REPORTING TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.daily_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_trips INT DEFAULT 0,
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  active_drivers INT DEFAULT 0,
  active_vehicles INT DEFAULT 0,
  completed_deliveries INT DEFAULT 0,
  emergency_incidents INT DEFAULT 0,
  avg_trip_rating DECIMAL(3, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON public.daily_analytics(date DESC);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxi_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tourist_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tourist_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gps_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Users table policies
CREATE POLICY "users_select_own" ON public.users 
  FOR SELECT USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "users_insert_own" ON public.users 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users 
  FOR UPDATE USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

-- Routes - public read, authenticated write
CREATE POLICY "routes_select_public" ON public.routes 
  FOR SELECT USING (true);

CREATE POLICY "routes_insert_admin" ON public.routes 
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin' OR operator_id = auth.uid());

CREATE POLICY "routes_update_admin" ON public.routes 
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin' OR operator_id = auth.uid());

-- Route Stops - public read
CREATE POLICY "route_stops_select_public" ON public.route_stops 
  FOR SELECT USING (true);

-- Vehicles - public read, admin/owner write
CREATE POLICY "vehicles_select_public" ON public.vehicles 
  FOR SELECT USING (true);

CREATE POLICY "vehicles_insert_admin" ON public.vehicles 
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin' OR owner_id = auth.uid());

CREATE POLICY "vehicles_update_admin" ON public.vehicles 
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin' OR owner_id = auth.uid());

-- Drivers - drivers see own profile, admins see all
CREATE POLICY "drivers_select_own" ON public.drivers 
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "drivers_update_own" ON public.drivers 
  FOR UPDATE USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

-- Trips - citizens see own trips, drivers see assigned trips, admins see all
CREATE POLICY "trips_select_own" ON public.trips 
  FOR SELECT USING (
    auth.uid() = citizen_id 
    OR driver_id = (SELECT id FROM public.drivers WHERE user_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "trips_insert_citizen" ON public.trips 
  FOR INSERT WITH CHECK (auth.uid() = citizen_id);

CREATE POLICY "trips_update_own" ON public.trips 
  FOR UPDATE USING (
    auth.uid() = citizen_id 
    OR driver_id = (SELECT id FROM public.drivers WHERE user_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'admin'
  );

-- Tickets - citizens see own tickets, admins see all
CREATE POLICY "tickets_select_own" ON public.tickets 
  FOR SELECT USING (auth.uid() = citizen_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "tickets_insert_own" ON public.tickets 
  FOR INSERT WITH CHECK (auth.uid() = citizen_id);

-- Taxi Orders - customers see own, drivers see assigned, admins see all
CREATE POLICY "taxi_orders_select_own" ON public.taxi_orders 
  FOR SELECT USING (
    auth.uid() = customer_id 
    OR driver_id = (SELECT id FROM public.drivers WHERE user_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "taxi_orders_insert_customer" ON public.taxi_orders 
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Tourist Sites - public read
CREATE POLICY "tourist_sites_select_public" ON public.tourist_sites 
  FOR SELECT USING (true);

CREATE POLICY "tourist_sites_insert_admin" ON public.tourist_sites 
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Tourist Reviews - authenticated read, own write
CREATE POLICY "tourist_reviews_select_public" ON public.tourist_reviews 
  FOR SELECT USING (true);

CREATE POLICY "tourist_reviews_insert_own" ON public.tourist_reviews 
  FOR INSERT WITH CHECK (auth.uid() = tourist_id);

-- Healthcare Facilities - public read
CREATE POLICY "healthcare_facilities_select_public" ON public.healthcare_facilities 
  FOR SELECT USING (true);

CREATE POLICY "healthcare_facilities_insert_admin" ON public.healthcare_facilities 
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Medical Services - public read
CREATE POLICY "medical_services_select_public" ON public.medical_services 
  FOR SELECT USING (true);

-- Emergency Incidents - reporters see own, responders see assigned, admins see all
CREATE POLICY "emergency_incidents_select_own" ON public.emergency_incidents 
  FOR SELECT USING (
    auth.uid() = reporter_id 
    OR responder_id = auth.uid()
    OR auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "emergency_incidents_insert_authenticated" ON public.emergency_incidents 
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "emergency_incidents_update_admin" ON public.emergency_incidents 
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin' OR responder_id = auth.uid());

-- Emergency Services - admins see all
CREATE POLICY "emergency_services_select_admin" ON public.emergency_services 
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Businesses - owners see own, public see verified, admins see all
CREATE POLICY "businesses_select_public" ON public.businesses 
  FOR SELECT USING (verified OR owner_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "businesses_insert_authenticated" ON public.businesses 
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "businesses_update_own" ON public.businesses 
  FOR UPDATE USING (owner_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Deliveries - senders see own, drivers see assigned, admins see all
CREATE POLICY "deliveries_select_own" ON public.deliveries 
  FOR SELECT USING (
    business_id = (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
    OR driver_id = (SELECT id FROM public.drivers WHERE user_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "deliveries_insert_business" ON public.deliveries 
  FOR INSERT WITH CHECK (
    business_id = (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
  );

-- GPS Locations - admins and dispatchers see all for their vehicles
CREATE POLICY "gps_locations_select_admin" ON public.gps_locations 
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "gps_locations_insert_authenticated" ON public.gps_locations 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Daily Analytics - public read
CREATE POLICY "daily_analytics_select_public" ON public.daily_analytics 
  FOR SELECT USING (true);

-- Audit Logs - admins only
CREATE POLICY "audit_logs_select_admin" ON public.audit_logs 
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "audit_logs_insert_system" ON public.audit_logs 
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin' OR auth.uid() IS NOT NULL);

-- ============================================================
-- END OF DDL SCRIPT
-- Execute this entire script in your Supabase SQL Editor
-- ============================================================
