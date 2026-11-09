/**
 * AT Protocol configuration.
 * Centralizes DID and other AT Protocol settings with fallbacks for type checking.
 */

// Default DID for Ewan's repository - used as fallback during type checking
// This is hardcoded as the import from $env/static/public doesn't work during type checking
export const ATPROTO_DID = "did:plc:ofrbh253gwicbkc5nktqepol";
