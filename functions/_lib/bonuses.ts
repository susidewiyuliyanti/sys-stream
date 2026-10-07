export const USD_TO_IDR = 17937;
export const REGISTRATION_BONUS_IDR = 15000;
export const REGISTRATION_BONUS_USD_REFERENCE = REGISTRATION_BONUS_IDR / USD_TO_IDR;

export function idrToUsdt(value: number): number {
  return Number((Number(value || 0) / USD_TO_IDR).toFixed(8));
}

export function usdtToIdr(value: number): number {
  return Math.round(Number(value || 0) * USD_TO_IDR);
}
