SELECT payment_id, user_id, amount, status, credited, nowpayments_status
FROM payments
WHERE user_id = 'test-user-001';
