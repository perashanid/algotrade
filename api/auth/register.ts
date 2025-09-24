import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors } from '../utils/cors';
import { executeQuery } from '../lib/database';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

async function registerHandler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
        return;
      }

      // Check if user already exists
      const existingUserQuery = 'SELECT id FROM users WHERE email = $1';
      const existingUser = await executeQuery(existingUserQuery, [email.toLowerCase()]);

      if (existingUser.rows.length > 0) {
        res.status(409).json({
          success: false,
          error: 'User with this email already exists'
        });
        return;
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const createUserQuery = `
        INSERT INTO users (email, password_hash, name, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING id, email, name, created_at
      `;

      const result = await executeQuery(createUserQuery, [
        email.toLowerCase(),
        passwordHash,
        name || email.split('@')[0]
      ]);

      const user = result.rows[0];

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production';
      const token = jwt.sign(
        { id: user.id, email: user.email },
        jwtSecret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name
          }
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

export default withCors(registerHandler);