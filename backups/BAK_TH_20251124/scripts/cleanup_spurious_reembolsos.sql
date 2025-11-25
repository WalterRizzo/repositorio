-- Cleanup script: Remove spurious pending "Reembolso (pendiente) por eliminación de gasto"
-- Usage: run SELECT first to review, then run DELETE when you're ready.

-- 1) Preview candidate rows (dry-run)
SELECT st.* FROM saldo_transacciones st
WHERE st.tipo = 'carga'
  AND LOWER(st.descripcion) LIKE '%reembolso (pendiente) por eliminaci%'
  AND (st.status IS NULL OR st.status = 'pendiente')
  AND NOT EXISTS (
    SELECT 1 FROM saldo_transacciones s2
    WHERE s2.user_id = st.user_id
      AND s2.tipo = 'descuento'
      AND s2.currency = st.currency
      AND ABS(CAST(s2.monto AS REAL) - CAST(st.monto AS REAL)) <= 0.01
      AND s2.status = 'aprobado'
  );

-- 2) If the preview looks correct, run the DELETE below to remove the spurious rows
-- DELETE FROM saldo_transacciones
-- WHERE tipo = 'carga'
--  AND LOWER(descripcion) LIKE '%reembolso (pendiente) por eliminaci%'
--  AND (status IS NULL OR status = 'pendiente')
--  AND NOT EXISTS (
--    SELECT 1 FROM saldo_transacciones s2
--    WHERE s2.user_id = saldo_transacciones.user_id
--      AND s2.tipo = 'descuento'
--      AND s2.currency = saldo_transacciones.currency
--      AND ABS(CAST(s2.monto AS REAL) - CAST(saldo_transacciones.monto AS REAL)) <= 0.01
--      AND s2.status = 'aprobado'
--  );

-- Note: This script is conservative — it only targets pending carga reembolsos created by deletion flows
-- where there is NO approved descuento to reverse. Review results carefully before DELETE.
