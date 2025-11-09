
DROP INDEX idx_balance_transactions_user_id;
DROP INDEX idx_expenses_status;
DROP INDEX idx_user_profiles_user_id;
DROP TABLE balance_transactions;
ALTER TABLE expenses DROP COLUMN use_balance;
ALTER TABLE expenses DROP COLUMN approved_at;
ALTER TABLE expenses DROP COLUMN approved_by;
ALTER TABLE expenses DROP COLUMN status;
DROP TABLE user_profiles;
