import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { generateToken } from '../middleware/auth';
import { LoginRequest, RegisterRequest, APIResponse, AuthResponse } from '../types';

export class AuthController {
  static async register(req: Request<{}, APIResponse<AuthResponse>, RegisterRequest>, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        res.status(409).json({
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'User with this email already exists'
          },
          timestamp: new Date()
        });
        return;
      }

      // Create new user
      const user = await UserModel.create(email, password);
      const token = generateToken(user.id, user.email);

      res.status(201).json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'REGISTRATION_ERROR',
          message: 'Failed to create user account'
        },
        timestamp: new Date()
      });
    }
  }

  static async login(req: Request<{}, APIResponse<AuthResponse>, LoginRequest>, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          },
          timestamp: new Date()
        });
        return;
      }

      // Verify password
      const isValidPassword = await UserModel.verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          },
          timestamp: new Date()
        });
        return;
      }

      // Generate token
      const token = generateToken(user.id, user.email);

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGIN_ERROR',
          message: 'Failed to authenticate user'
        },
        timestamp: new Date()
      });
    }
  }

  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const user = await UserModel.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          },
          timestamp: new Date()
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PROFILE_ERROR',
          message: 'Failed to get user profile'
        },
        timestamp: new Date()
      });
    }
  }
}