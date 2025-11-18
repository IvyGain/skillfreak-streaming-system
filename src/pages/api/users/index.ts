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
 * Create user request body
 */
interface CreateUserRequest {
  name: string;
  email: string;
}

// In-memory storage for demonstration (replace with database in production)
let users: User[] = [];

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
 * Validates user input for creation
 * @param body - Request body to validate
 * @returns validation result with error message if invalid
 */
function validateCreateUserInput(body: unknown): { isValid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Request body is required' };
  }

  const { name, email } = body as CreateUserRequest;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return { isValid: false, error: 'Name is required and must be a non-empty string' };
  }

  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    return { isValid: false, error: 'Valid email is required' };
  }

  // Check if email already exists
  if (users.some(user => user.email === email)) {
    return { isValid: false, error: 'Email already exists' };
  }

  return { isValid: true };
}

/**
 * GET /api/users - Retrieve all users
 * @param req - Next.js API request
 * @param res - Next.js API response
 */
function handleGetUsers(req: NextApiRequest, res: NextApiResponse<ApiResponse<User[]>>): void {
  try {
    res.status(200).json({
      success: true,
      data: users,
      message: `Retrieved ${users.length} users`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * POST /api/users - Create a new user
 * @param req - Next.js API request
 * @param res - Next.js API response
 */
function handleCreateUser(req: NextApiRequest, res: NextApiResponse<ApiResponse<User>>): void {
  try {
    const validation = validateCreateUserInput(req.body);
    
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        error: validation.error
      });
      return;
    }

    const { name, email } = req.body as CreateUserRequest;
    
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      createdAt: new Date()
    };

    users.push(newUser);

    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Main API handler for /api/users endpoint
 * Supports GET and POST methods
 * @param req - Next.js API request
 * @param res - Next.js API response
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<User | User[]>>
): void {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  switch (req.method) {
    case 'GET':
      handleGetUsers(req, res as NextApiResponse<ApiResponse<User[]>>);
      break;
    case 'POST':
      handleCreateUser(req, res as NextApiResponse<ApiResponse<User>>);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed`
      });
  }
}

// Export for testing
export { validateCreateUserInput, isValidEmail, users };
