SELECT
  'PAYMENT_ID=' || COALESCE(CAST(payment_id AS TEXT),'NULL') ||
  ' | USER=' || COALESCE(user_id,'NULL') ||
  ' | AMOUNT=' || COALESCE(CAST(amount AS TEXT),'NULL') ||
  ' | STATUS=' || COALESCE(status,'NULL') ||
  ' | CREDITED=' || COALESCE(CAST(credited AS TEXT),'NULL') ||
  ' | NOWPAYMENTS_STATUS=' || COALESCE(nowpayments_status,'NULL') ||
  ' | CURRENCY=' || COALESCE(pay_currency,'NULL') ||
  ' | PAY_AMOUNT=' || COALESCE(CAST(pay_amount AS TEXT),'NULL') ||
  ' | ADDRESS=' || COALESCE(pay_address,'NULL') ||
  ' | ORDER_ID=' || COALESCE(order_id,'NULL')
FROM payments
WHERE user_id='test-user-001'
ORDER BY created_at DESC
LIMIT 1;
