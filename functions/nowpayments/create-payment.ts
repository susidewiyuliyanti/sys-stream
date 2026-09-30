// Compatibility route for clients that still call /nowpayments/create-payment.
// The canonical Cloudflare Pages Function lives at /api/nowpayments/create-payment.
export { onRequestPost } from "../api/nowpayments/create-payment";
