-- Migration 006: Init Billing / Bus Switching Credits Schemas

CREATE SCHEMA IF NOT EXISTS billing;

CREATE TABLE billing.credit_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID UNIQUE NOT NULL,
    available_credits INT NOT NULL DEFAULT 5 CHECK (available_credits >= 0),
    last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE billing.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES billing.credit_accounts(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- MONTHLY_RESET, BUS_SWITCH_DEDUCTION, ADMIN_ADJUSTMENT
    reference_id UUID, -- Links to bus_switch_request_id if applicable
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
