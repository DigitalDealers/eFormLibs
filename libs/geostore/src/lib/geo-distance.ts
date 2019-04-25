import { degreesToRadians, validateLocation } from './utils';

/**
 * Function which calculates the distance, in kilometers, between two locations,
 * via the Haversine formula. Note that this is approximate due to the fact that the
 * Earth's radius varies between 6356.752 km and 6378.137 km.
 *
 * @param location1 The [latitude, longitude] pair of the first location.
 * @param location2 The [latitude, longitude] pair of the second location.
 * @returns The distance, in kilometers, between the inputted locations.
 */
export function geoDistance(location1: number[], location2: number[]): number {
  validateLocation(location1);
  validateLocation(location2);

  const radius = 6371; // Earth's radius in kilometers
  const latDelta = degreesToRadians(location2[0] - location1[0]);
  const lonDelta = degreesToRadians(location2[1] - location1[1]);

  const a = Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(degreesToRadians(location1[0])) *
    Math.cos(degreesToRadians(location2[0])) *
    Math.sin(lonDelta / 2) *
    Math.sin(lonDelta / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return radius * c;
}
