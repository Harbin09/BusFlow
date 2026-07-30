export function formatSpeed(speedKmh: number): string {
  return `${Math.round(speedKmh)} km/h`;
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export function formatOccupancy(current: number, capacity: number): string {
  const percent = Math.round((current / capacity) * 100);
  return `${current}/${capacity} (${percent}%)`;
}

export function formatStatusLabel(status: string): string {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}
