-- Migration 005: Init Support Bounded Context Schemas

CREATE SCHEMA IF NOT EXISTS support;

CREATE TABLE support.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL,
    reporter_role VARCHAR(50) NOT NULL, -- STUDENT, DRIVER
    category VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, RESOLVED, CLOSED
    assigned_admin_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);
