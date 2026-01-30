/**
 * JWT Algorithm Security Test
 * Tests: SEC-XXX (JWT Algorithm Validation)
 * Ensures JWT tokens use RS256 algorithm for enhanced security
 */

const jwt = require('jsonwebtoken');
const jwtConfig = require('../../src/config/jwtConfig');
const jwtUtil = require('../../src/utils/jwt');

describe('JWT Algorithm Security Tests', () => {
  describe('SEC-XXX: JWT Algorithm Validation', () => {
    it('should use RS256 algorithm for token signing', () => {
      expect(jwtConfig.algorithm).toBe('RS256');
    });

    it('should have RSA private key configured', () => {
      expect(jwtConfig.privateKey).toBeDefined();
      expect(typeof jwtConfig.privateKey).toBe('string');
      expect(jwtConfig.privateKey).toContain('BEGIN PRIVATE KEY');
    });

    it('should have RSA public key configured', () => {
      expect(jwtConfig.publicKey).toBeDefined();
      expect(typeof jwtConfig.publicKey).toBe('string');
      expect(jwtConfig.publicKey).toContain('BEGIN PUBLIC KEY');
    });

    it('should create access tokens with RS256 algorithm', () => {
      const token = jwtUtil.createAccessToken('test-uid', 'test-callSign');

      // Decode token header to check algorithm
      const decoded = jwt.decode(token, { complete: true });
      expect(decoded.header.alg).toBe('RS256');
    });

    it('should create refresh tokens with RS256 algorithm', () => {
      const token = jwtUtil.createRefreshToken('test-uid');

      // Decode token header to check algorithm
      const decoded = jwt.decode(token, { complete: true });
      expect(decoded.header.alg).toBe('RS256');
    });

    it('should verify tokens signed with RS256', () => {
      const token = jwtUtil.createAccessToken('test-uid', 'test-callSign');
      const decoded = jwtUtil.verifyToken(token);

      expect(decoded.uid).toBe('test-uid');
      expect(decoded.callSign).toBe('test-callSign');
      expect(decoded.type).toBe('access');
    });

    it('should reject tokens signed with different algorithms', () => {
      // Create a token with HS256 using a different secret
      const fakeToken = jwt.sign(
        { uid: 'test-uid', type: 'access' },
        'fake-secret',
        { algorithm: 'HS256' }
      );

      expect(() => jwtUtil.verifyToken(fakeToken)).toThrow('Invalid token');
    });
  });
});