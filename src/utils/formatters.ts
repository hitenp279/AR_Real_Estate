export const METERS_TO_FEET = 3.28084;
export const SQM_TO_SQFT = 10.76391;

/**
 * Formats monetary amounts into standard architectural financial notation using Indian rupees (INR).
 */
export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Converts area in square meters to square feet.
 */
export const convertSqmToSqft = (sqm: number): number => {
  return Math.round(sqm * SQM_TO_SQFT);
};

/**
 * Converts linear meters to feet.
 */
export const convertMetersToFeet = (meters: number): number => {
  return Number((meters * METERS_TO_FEET).toFixed(1));
};

/**
 * Formats an area value according to the active unit preference.
 */
export const formatArea = (sqm: number, unit: 'metric' | 'imperial' = 'metric'): string => {
  if (unit === 'imperial') {
    const sqft = convertSqmToSqft(sqm);
    return `${sqft.toLocaleString()} sq ft`;
  }
  return `${sqm.toLocaleString()} m²`;
};

/**
 * Formats linear room dimension (e.g., 4.5m or 14.8ft).
 */
export const formatDimension = (meters: number, unit: 'metric' | 'imperial' = 'metric'): string => {
  if (unit === 'imperial') {
    return `${convertMetersToFeet(meters)} ft`;
  }
  return `${meters.toFixed(1)} m`;
};
