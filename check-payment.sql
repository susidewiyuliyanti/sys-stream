SELECT payment_id, invoice_id, user_id, amount, status, credited,
nowpayments_status, pay_currency, pay_amount, pay_address, order_id
FROM payments
WHERE user_id = 'test-user-001'
ORDER BY created_at DESC
LIMIT 5;
