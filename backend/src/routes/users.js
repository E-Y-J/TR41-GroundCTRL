/**
 * User Routes
 * Defines user management endpoints
 */

const express = require('express');
const router = express.Router();
const { z } = require('zod');
const userController = require('../controllers/userController');
const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');
const {
  createUserSchema,
  updateUserSchema,
  patchUserSchema,
  userQuerySchema
} = require('../schemas/userSchemas');

// Wrapper schemas for unified validation (body + query + params)
const getUsersValidation = z.object({
  body: z.object({}).strict(),
  query: userQuerySchema,
  params: z.object({}).strict()
});

const getUserByIdValidation = z.object({
  body: z.object({}).strict(),
  query: z.object({}).strict(),
  params: z.object({
    uid: z.string().min(1, 'User ID is required')
  }).strict()
});

const createUserValidation = z.object({
  body: createUserSchema,
  query: z.object({}).strict(),
  params: z.object({}).strict()
});

const updateUserValidation = z.object({
  body: updateUserSchema,
  query: z.object({}).strict(),
  params: z.object({
    uid: z.string().min(1, 'User ID is required')
  }).strict()
});

const patchUserValidation = z.object({
  body: patchUserSchema,
  query: z.object({}).strict(),
  params: z.object({
    uid: z.string().min(1, 'User ID is required')
  }).strict()
});

const deleteUserValidation = z.object({
  body: z.object({}).strict(),
  query: z.object({}).strict(),
  params: z.object({
    uid: z.string().min(1, 'User ID is required')
  }).strict()
});

const getUserAuditLogsValidation = z.object({
  body: z.object({}).strict(),
  query: z.object({
    page: z.string()
      .regex(/^\d+$/, 'Page must be a number')
      .transform(Number)
      .refine(n => n > 0, 'Page must be greater than 0')
      .optional(),
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100')
      .optional()
  }).strict(),
  params: z.object({
    uid: z.string().min(1, 'User ID is required')
  }).strict()
});

/**
 * GET /api/v1/users
 * List all users (admin only)
 * Supports pagination, filtering, and search
 */
router.get('/', authMiddleware, requireAdmin, validate(getUsersValidation), userController.getAllUsers);

/**
 * GET /api/v1/users/:uid
 * Get user by ID
 * Users can view their own profile, admins can view any profile
 */
router.get('/:uid', authMiddleware, validate(getUserByIdValidation), userController.getUserById);

/**
 * POST /api/v1/users
 * Create new user (admin only)
 */
router.post('/', authMiddleware, requireAdmin, authLimiter, validate(createUserValidation), userController.createUser);

/**
 * PUT /api/v1/users/:uid
 * Update user (full replacement)
 * Users can update their own profile, admins can update any profile
 */
router.put('/:uid', authMiddleware, validate(updateUserValidation), userController.updateUser);

/**
 * PATCH /api/v1/users/:uid
 * Patch user (partial update)
 * Users can patch their own profile, admins can patch any profile
 */
router.patch('/:uid', authMiddleware, validate(patchUserValidation), userController.patchUser);

/**
 * DELETE /api/v1/users/:uid
 * Delete user (admin only)
 */
router.delete('/:uid', authMiddleware, requireAdmin, validate(deleteUserValidation), userController.deleteUser);

/**
 * GET /api/v1/users/:uid/audit
 * Get user audit logs
 * Users can view their own logs, admins can view any user's logs
 */
router.get('/:uid/audit', authMiddleware, validate(getUserAuditLogsValidation), userController.getUserAuditLogs);

module.exports = router;
