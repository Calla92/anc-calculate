/**
 * Calculate Weight Factor (Wf) based on aircraft weight
 * Wf = sqrt(MTOW in Tonnes / 50)
 */
export const calculateWeightFactor = (mtow: number): number => {
  return Math.sqrt(mtow / 50);
};

/**
 * Calculate Distance Factor (Df) based on distance flown
 * Df = Distance Flown in FIR (km) / 100
 */
export const calculateDistanceFactor = (distance: number): number => {
  return distance / 100;
};

/**
 * Calculate R value
 * R = Wf × Df
 */
export const calculateR = (wf: number, df: number): number => {
  return wf * df;
};

/**
 * Calculate charge based on R value using the charge brackets
 */
export const calculateCharge = (r: number): number => {
  if (r <= 1) return 60;
  if (r <= 2) return 90;
  if (r <= 4) return 140;
  if (r <= 8) return 200;
  if (r <= 12) return 235;
  if (r <= 15) return 280;
  if (r <= 20) return 320;
  if (r <= 25) return 365;
  return 400; // Above 25
};