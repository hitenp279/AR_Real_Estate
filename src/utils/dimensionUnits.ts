export const METERS_TO_FEET = 3.28084;
export const SQ_METERS_TO_SQ_FEET = 10.7639;

export type DimensionUnit = 'metric' | 'imperial';

/**
 * Format a linear length dimension with appropriate unit labels.
 * Metric: meters (e.g. "14.8 m" or "4.33 m")
 * Imperial: feet and inches or decimal feet (e.g. "48.6 ft" or "14.2 ft")
 */
export function formatLength(
  meters: number,
  unit: DimensionUnit,
  precision = 1
): string {
  if (unit === 'imperial') {
    const feet = meters * METERS_TO_FEET;
    return `${feet.toFixed(precision)} ft`;
  }
  return `${meters.toFixed(precision)} m`;
}

/**
 * Format dual dimensions (Width × Depth)
 */
export function formatDimensions(
  widthMeters: number,
  depthMeters: number,
  unit: DimensionUnit,
  precision = 1
): string {
  const w = formatLength(widthMeters, unit, precision);
  const d = formatLength(depthMeters, unit, precision);
  return `${w} × ${d}`;
}

/**
 * Format an area measurement.
 * Metric: m² (e.g. "34.6 m²")
 * Imperial: sq ft (e.g. "373 sq ft")
 */
export function formatArea(sqMeters: number, unit: DimensionUnit): string {
  if (unit === 'imperial') {
    const sqFt = Math.round(sqMeters * SQ_METERS_TO_SQ_FEET);
    return `${sqFt.toLocaleString()} sq ft`;
  }
  return `${sqMeters.toFixed(1)} m²`;
}

/**
 * Format height elevation
 */
export function formatElevation(meters: number, unit: DimensionUnit): string {
  if (unit === 'imperial') {
    const feet = meters * METERS_TO_FEET;
    return `+${feet.toFixed(1)} ft elev.`;
  }
  return `+${meters.toFixed(2)} m elev.`;
}
