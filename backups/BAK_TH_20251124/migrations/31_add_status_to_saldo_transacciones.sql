-- Migration 31: Add status and approval fields to saldo_transacciones

-- Add status column to indicate whether the transaction is pending or approved.
-- Default to 'aprobado' to maintain backward compatibility with existing records.
ALTER TABLE saldo_transacciones ADD COLUMN status TEXT DEFAULT 'aprobado';

-- Track who approved the transaction (if any) and when
ALTER TABLE saldo_transacciones ADD COLUMN approved_by TEXT;
ALTER TABLE saldo_transacciones ADD COLUMN approved_at DATETIME;