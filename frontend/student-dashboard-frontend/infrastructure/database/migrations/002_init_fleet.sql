-- Migration 002: Init Fleet Bounded Context Schemas

CREATE SCHEMA IF NOT EXISTS fleet;

CREATE TABLE fleet.buses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_number VARCHAR(50) UNIQUE NOT NULL,
    license_plate VARCHAR(50) UNIQUE NOT NULL,
    seating_capacity INT NOT NULL CHECK (seating_capacity > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, MAINTENANCE, DECOMMISSIONED
    current_driver_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fleet.maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_id UUID NOT NULL REFERENCES fleet.buses(id) ON DELETE CASCADE,
    issue_description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);
