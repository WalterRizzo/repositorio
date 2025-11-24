-- Revert migration 30: Drop closure/archived tables
DROP TABLE IF EXISTS closed_saldo_transacciones;
DROP TABLE IF EXISTS closed_expenses;
DROP TABLE IF EXISTS trip_closures;
