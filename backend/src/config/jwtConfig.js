/**
 * JWT Configuration
 * Defines JWT settings for token generation and validation
 * 
 * Note: Expiry values use shorthand notation supported by the jsonwebtoken library
 * (e.g., "15m" = 15 minutes, "7d" = 7 days, "1h" = 1 hour, "30s" = 30 seconds)
 * See: https://github.com/vercel/ms#examples
 */

module.exports = {
  privateKey: process.env.JWT_PRIVATE_KEY,
  publicKey: process.env.JWT_PUBLIC_KEY,
  accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
  refreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d',
  algorithm: 'RS256',
  issuer: 'GroundCTRL',
  audience: 'GroundCTRL-API'
};
