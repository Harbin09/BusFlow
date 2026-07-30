-- Migration 003: Init Routing Bounded Context Schemas

CREATE SCHEMA IF NOT EXISTS routing;

CREATE TABLE routing.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_code VARCHAR(50) UNIQUE NOT NULL,
    route_name VARCHAR(150) NOT NULL,
    start_point VARCHAR(255) NOT NULL,
    end_point VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE routing.stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES routing.routes(id) ON DELETE CASCADE,
    stop_name VARCHAR(150) NOT NULL,
    sequence_order INT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    geofence_radius_meters INT DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE routing.route_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_route_id UUID NOT NULL REFERENCES routing.routes(id) ON DELETE CASCADE,
    override_reason TEXT NOT NULL,
    altered_stops_json JSONB NOT NULL,
    created_by UUID NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_overrides_expiry ON routing.route_overrides(expires_at);
