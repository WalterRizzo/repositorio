-- migrations/33_create_check_status_history.sql
CREATE TABLE check_status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    check_id INTEGER NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by_user_id INTEGER,
    FOREIGN KEY (check_id) REFERENCES checks(id),
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

-- Add initial status to history when a check is created
CREATE TRIGGER after_check_insert
AFTER INSERT ON checks
FOR EACH ROW
BEGIN
    INSERT INTO check_status_history (check_id, new_status, changed_by_user_id)
    VALUES (NEW.id, NEW.estado, NULL); -- Consider how to get user_id here
END;

-- Add status change to history when a check is updated
CREATE TRIGGER after_check_update
AFTER UPDATE ON checks
FOR EACH ROW
WHEN OLD.estado <> NEW.estado
BEGIN
    INSERT INTO check_status_history (check_id, old_status, new_status, changed_by_user_id)
    VALUES (NEW.id, OLD.estado, NEW.estado, NULL); -- Consider how to get user_id here
END;
