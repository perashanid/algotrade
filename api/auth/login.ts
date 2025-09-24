import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors } from '../utils/cors';
import { executeQuery } from '../lib/database';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

async function loginHandler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
        return;
      }

      // Find user in database
      const query = 'SELECT id, email, password_hash FROM users WHERE email = $1';
      const result = await executeQuery(query, [email.toLowerCase()]);

      if (result.rows.length === 0) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
        return;
      }

      const user = result.rows[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
        return;
      }

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production';
      const token = jwt.sign(
        { id: user.id, email: user.email },
        jwtSecret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(200).json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

export default withCors(loginHandler);