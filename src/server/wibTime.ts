/**
 * Utility for Western Indonesia Time (WIB / UTC+7)
 * Reset daily at 00:00 WIB
 */
export function getWIBTime(referenceDate: Date = new Date()) {
  // Convert current UTC time to UTC+7 (WIB)
  const utcMillis = referenceDate.getTime();
  const wibOffsetMillis = 7 * 60 * 60 * 1000;
  const wibDate = new Date(utcMillis + wibOffsetMillis);

  const year = wibDate.getUTCFullYear();
  const month = String(wibDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(wibDate.getUTCDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  // Calculate Next 00:00:00 WIB
  // Create tomorrow's date at 00:00:00 in WIB terms
  const nextResetWib = new Date(Date.UTC(year, wibDate.getUTCMonth(), wibDate.getUTCDate() + 1, 0, 0, 0));
  // Convert nextReset back to actual UTC epoch
  const nextResetUtcEpoch = nextResetWib.getTime() - wibOffsetMillis;

  const msRemaining = Math.max(0, nextResetUtcEpoch - utcMillis);

  const hours = Math.floor(msRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((msRemaining % (1000 * 60)) / 1000);
  const countdownFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    dateStr,
    wibDate,
    nextResetUtcEpoch,
    msRemaining,
    countdownFormatted,
  };
}
