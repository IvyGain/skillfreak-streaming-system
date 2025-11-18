import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * User data structure
 */
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

/**
 * API response for user operations
 */
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Update user request body
 */
interface UpdateUserRequest {
  name?: string;
  email?: string;
}

// Import users array from index (in production, use shared database)
import { users } from './index';

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns boolean indicating if email is valid
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates user ID format
 * @param id - User ID to validate
 * @returns boolean indicating if ID is valid
 */
function isValidUserId(id: string): boolean {
  return typeof id === 'string' && id.length > 0;
}

/**
 * GET /api/users/[id] - Retrieve a specific user
 * @param req - Next.js API request
 * @param res - Next.js API response
 * @param userId - User ID from query params
 */
function handleGetUser(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<User>>,
  userId: string
): void {
  try {
    if (!isValidUserId(userId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
      return;
    }

    const user = users.find(u => u.id === userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
      message: 'User retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * PUT /api/users/[id] - Update a specific user
 * @param req - Next.js API request
 * @param res - Next.js API response
 * @param userId - User ID from query params
 */
function handleUpdateUser(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<User>>,
  userId: string
): void {
  try {
    if (!isValidUserId(userId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
      return;
    }

    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    const { name, email } = req.body as UpdateUserRequest;
    
    // Validate input
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      res.status(400).json({
        success: false,
        error: 'Name must be a non-empty string'
      });
      return;
    }

    if (email !== undefined && (typeof email !== 'string' || !isValidEmail(email))) {
      res.status(400).json({
        success: false,
        error: 'Valid email is required'
      });
      return;
    }

    // Check if email already exists (exclude current user)
    if (email && users.some(user => user.email === email && user.id !== userId)) {
      res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
      return;
    }

    // Update user
    const updatedUser: User = {
      ...users[userIndex],
      ...(name !== undefined && { name: name.trim() }),
      ...(email !== undefined && { email: email.toLowerCase().trim() })
    };

    users[userIndex] = updatedUser;

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * DELETE /api/users/[id] - Delete a specific user
 * @param req - Next.js API request
 * @param res - Next.js API response
 * @param userId - User ID from query params
 */
function handleDeleteUser(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  userId: string
): void {
  try {
    if (!isValidUserId(userId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
      return;
    }

    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    users.splice(userIndex, 1);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Main API handler for /api/users/[id] endpoint
 * Supports GET, PUT, and DELETE methods
 * @param req - Next.js API request
 * @param res - Next.js API response
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<User>>
): void {
  const { id } = req.query;
  const userId = Array.isArray(id) ? id[0] : id;

  if (!userId) {
    res.status(400).json({
      success: false,
      error: 'User ID is required'
    });
    return;
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  switch (req.method) {
    case 'GET':
      handleGetUser(req, res, userId);
      break;
    case 'PUT':
      handleUpdateUser(req, res, userId);
      break;
    case 'DELETE':
      handleDeleteUser(req, res as NextApiResponse<ApiResponse>, userId);
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed`
      });
  }
}

// Export for testing
export { isValidUserId, handleGetUser, handleUpdateUser, handleDeleteUser };
