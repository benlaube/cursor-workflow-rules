/**
 * User context utilities.
 * 
 * Provides helpers for parsing user agent, device information, and session tracking.
 */

/**
 * Parsed user agent information.
 */
export interface UserAgentInfo {
  /** Browser name */
  browser?: string;
  /** Browser version */
  browserVersion?: string;
  /** Operating system */
  os?: string;
  /** OS version */
  osVersion?: string;
  /** Device type (desktop, mobile, tablet) */
  deviceType?: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  /** Device model (if mobile/tablet) */
  deviceModel?: string;
  /** Raw user agent string */
  raw?: string;
}

/**
 * Parses user agent string into structured information.
 * 
 * @param userAgent - User agent string
 * @returns Parsed user agent information
 */
export function parseUserAgent(userAgent?: string): UserAgentInfo {
  if (!userAgent) {
    return { deviceType: 'unknown' };
  }
  
  const info: UserAgentInfo = { raw: userAgent };
  const ua = userAgent.toLowerCase();
  
  // Detect browser
  if (ua.includes('chrome') && !ua.includes('edg')) {
    const match = userAgent.match(/Chrome\/(\d+)/);
    info.browser = 'Chrome';
    info.browserVersion = match ? match[1] : undefined;
  } else if (ua.includes('firefox')) {
    const match = userAgent.match(/Firefox\/(\d+)/);
    info.browser = 'Firefox';
    info.browserVersion = match ? match[1] : undefined;
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    const match = userAgent.match(/Version\/(\d+)/);
    info.browser = 'Safari';
    info.browserVersion = match ? match[1] : undefined;
  } else if (ua.includes('edg')) {
    const match = userAgent.match(/Edg\/(\d+)/);
    info.browser = 'Edge';
    info.browserVersion = match ? match[1] : undefined;
  }
  
  // Detect OS
  if (ua.includes('windows')) {
    info.os = 'Windows';
    const match = userAgent.match(/Windows NT (\d+\.\d+)/);
    info.osVersion = match ? match[1] : undefined;
  } else if (ua.includes('mac os x') || ua.includes('macintosh')) {
    info.os = 'macOS';
    const match = userAgent.match(/Mac OS X (\d+[._]\d+)/);
    info.osVersion = match ? match[1].replace('_', '.') : undefined;
  } else if (ua.includes('linux')) {
    info.os = 'Linux';
  } else if (ua.includes('android')) {
    info.os = 'Android';
    const match = userAgent.match(/Android (\d+[.\d]*)/);
    info.osVersion = match ? match[1] : undefined;
  } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    info.os = 'iOS';
    const match = userAgent.match(/OS (\d+[._]\d+)/);
    info.osVersion = match ? match[1].replace('_', '.') : undefined;
  }
  
  // Detect device type
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    info.deviceType = 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    info.deviceType = 'tablet';
  } else {
    info.deviceType = 'desktop';
  }
  
  // Extract device model for mobile
  if (info.deviceType === 'mobile' || info.deviceType === 'tablet') {
    const modelMatch = userAgent.match(/(iPhone|iPad|iPod|Android[\s\w]+)/);
    if (modelMatch) {
      info.deviceModel = modelMatch[1];
    }
  }
  
  return info;
}

/**
 * Session event types.
 */
export type SessionEvent = 'login' | 'logout' | 'timeout' | 'refresh' | 'expired';

/**
 * Session information.
 */
export interface SessionInfo {
  /** Session ID */
  sessionId: string;
  /** User ID */
  userId?: string;
  /** Session start time */
  startTime: Date;
  /** Last activity time */
  lastActivity?: Date;
  /** Session duration in milliseconds */
  duration?: number;
  /** Session event */
  event?: SessionEvent;
  /** IP address */
  ipAddress?: string;
  /** User agent info */
  userAgent?: UserAgentInfo;
}

/**
 * Creates session information for logging.
 * 
 * @param sessionId - Session ID
 * @param userId - User ID (optional)
 * @param startTime - Session start time
 * @param event - Session event (optional)
 * @param userAgent - User agent string (optional)
 * @param ipAddress - IP address (optional)
 * @returns Session information
 */
export function createSessionInfo(
  sessionId: string,
  userId?: string,
  startTime: Date = new Date(),
  event?: SessionEvent,
  userAgent?: string,
  ipAddress?: string
): SessionInfo {
  const info: SessionInfo = {
    sessionId,
    userId,
    startTime,
    event,
    ipAddress,
  };
  
  if (userAgent) {
    info.userAgent = parseUserAgent(userAgent);
  }
  
  if (event === 'logout' || event === 'timeout' || event === 'expired') {
    info.lastActivity = new Date();
    info.duration = info.lastActivity.getTime() - startTime.getTime();
  }
  
  return info;
}

