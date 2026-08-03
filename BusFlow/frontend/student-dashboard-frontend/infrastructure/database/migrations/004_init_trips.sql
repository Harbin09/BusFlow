-- Migration 004: Init Trips Bounded Context Schemas

CREATE SCHEMA IF NOT EXISTS trips;

CREATE TABLE trips.active_trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL,
    bus_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    current_passenger_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trips.boarding_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips.active_trips(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    stop_id UUID NOT NULL,
    boarded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    student_lat DECIMAL(10, 8),
    student_lng DECIMAL(11, 8),
    is_valid BOOLEAN DEFAULT TRUE
);

CREATE TABLE trips.missed_bus_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips.active_trips(id),
    student_id UUID NOT NULL,
    stop_id UUID NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
