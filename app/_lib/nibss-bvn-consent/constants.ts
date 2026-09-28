export const NIBSS_POLL_INITIAL_INTERVAL_MS = 3_000;
export const NIBSS_POLL_MAX_INTERVAL_MS = 10_000;
export const NIBSS_POLL_BACKOFF_MULTIPLIER = 1.5;
export const NIBSS_POLL_MAX_DURATION_MS = 10 * 60 * 1_000;

export const NIBSS_ALLOWED_CONSENT_HOSTS = ["nibss-plc.com.ng"] as const;
export const NIBSS_SESSION_STORAGE_KEY = "nibssSessionId";

/** Comma-separated /igree host origins (path optional). */
export const NIBSS_IGREE_ORIGIN_ENV_KEY = "NEXT_PUBLIC_NIBSS_IGREE_ORIGIN";

export const NIBSS_IGREE_HANDSHAKE_INTERVAL_MS = 500;
export const NIBSS_IGREE_HANDSHAKE_TIMEOUT_MS = 30_000;
