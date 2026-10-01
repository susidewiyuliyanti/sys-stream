SELECT
  printf(
    'USER=%s | AVAILABLE=%.4f | LOCKED=%.4f',
    id,
    available_balance,
    total_locked
  ) AS balance_check
FROM users
WHERE id = 'test-user-001';
