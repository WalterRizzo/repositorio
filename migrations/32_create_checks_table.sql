```sql
CREATE TABLE checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT CHECK(type IN ('propio', 'tercero')) NOT NULL,
    check_number TEXT NOT NULL,
    bank TEXT NOT NULL,
    issuer_beneficiary TEXT NOT NULL,
    emission_date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL,
    status TEXT CHECK(status IN ('en cartera', 'depositado', 'endosado', 'pagado', 'rechazado', 'anulado')) NOT NULL,
    observations TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_checks_unique_check ON checks (check_number, bank);

CREATE TRIGGER update_checks_updated_at
AFTER UPDATE ON checks
FOR EACH ROW
BEGIN
    UPDATE checks SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
```