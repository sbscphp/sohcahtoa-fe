/** Polling starts at 3s, backs off to 10s max between requests. */
export const NIBSS_POLL_INITIAL_INTERVAL_MS = 3_000;
export const NIBSS_POLL_MAX_INTERVAL_MS = 10_000;
export const NIBSS_POLL_BACKOFF_MULTIPLIER = 1.5;

/** Stop polling after 10 minutes — user can retry consent. */
export const NIBSS_POLL_MAX_DURATION_MS = 10 * 60 * 1_000;

/** Allowed NIBSS consent portal hostnames (exact or subdomain). */
export const NIBSS_ALLOWED_CONSENT_HOSTS = ["nibss-plc.com.ng"] as const;

export const NIBSS_SESSION_STORAGE_KEY = "nibssSessionId";
