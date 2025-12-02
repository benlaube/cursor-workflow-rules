/**
 * Geolocation utilities (privacy-aware).
 * 
 * Provides helpers for IP-based geolocation with privacy considerations.
 */

/**
 * Geolocation information (privacy-aware).
 */
export interface GeolocationInfo {
  /** Country code (ISO 3166-1 alpha-2) */
  country?: string;
  /** Region/state code */
  region?: string;
  /** City name */
  city?: string;
  /** Timezone */
  timezone?: string;
  /** IP address (may be anonymized) */
  ipAddress?: string;
  /** Whether IP was anonymized */
  ipAnonymized?: boolean;
}

/**
 * Privacy mode for geolocation.
 */
export type PrivacyMode = 'full' | 'country-only' | 'none';

/**
 * Gets geolocation from IP address (privacy-aware).
 * 
 * Note: This is a placeholder implementation. In production, you would:
 * 1. Use a geolocation service (MaxMind GeoIP2, ipapi.co, etc.)
 * 2. Respect user privacy preferences
 * 3. Anonymize IP addresses based on privacy mode
 * 4. Cache results to avoid excessive API calls
 * 
 * @param ipAddress - IP address
 * @param privacyMode - Privacy mode (default: 'country-only')
 * @returns Geolocation information or undefined if not available
 */
export async function getGeolocation(
  ipAddress?: string,
  privacyMode: PrivacyMode = 'country-only'
): Promise<GeolocationInfo | undefined> {
  if (!ipAddress || privacyMode === 'none') {
    return undefined;
  }
  
  // Anonymize IP if needed
  let anonymizedIp = ipAddress;
  let ipAnonymized = false;
  
  if (privacyMode === 'full') {
    // Anonymize last octet for IPv4, last 64 bits for IPv6
    if (ipAddress.includes('.')) {
      // IPv4
      const parts = ipAddress.split('.');
      if (parts.length === 4) {
        anonymizedIp = `${parts[0]}.${parts[1]}.${parts[2]}.0`;
        ipAnonymized = true;
      }
    } else if (ipAddress.includes(':')) {
      // IPv6 - anonymize last 64 bits
      const parts = ipAddress.split(':');
      if (parts.length > 4) {
        anonymizedIp = parts.slice(0, 4).join(':') + '::';
        ipAnonymized = true;
      }
    }
  }
  
  // Placeholder: In production, call geolocation service
  // For now, return undefined to indicate not implemented
  // Example implementation would use MaxMind GeoIP2 or similar:
  // const geo = await geoipService.lookup(anonymizedIp);
  // return {
  //   country: geo.country?.iso_code,
  //   region: geo.subdivisions?.[0]?.iso_code,
  //   city: geo.city?.names?.en,
  //   timezone: geo.location?.time_zone,
  //   ipAddress: anonymizedIp,
  //   ipAnonymized,
  // };
  
  return {
    ipAddress: anonymizedIp,
    ipAnonymized,
  };
}

/**
 * Anonymizes IP address based on privacy mode.
 * 
 * @param ipAddress - IP address
 * @param privacyMode - Privacy mode
 * @returns Anonymized IP address
 */
export function anonymizeIp(
  ipAddress: string,
  privacyMode: PrivacyMode
): string {
  if (privacyMode === 'none') {
    return ipAddress;
  }
  
  if (ipAddress.includes('.')) {
    // IPv4 - anonymize last octet
    const parts = ipAddress.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
  } else if (ipAddress.includes(':')) {
    // IPv6 - anonymize last 64 bits
    const parts = ipAddress.split(':');
    if (parts.length > 4) {
      return parts.slice(0, 4).join(':') + '::';
    }
  }
  
  return ipAddress;
}

