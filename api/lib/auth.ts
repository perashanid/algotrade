import { VercelRequest } from '@vercel/node';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email: string;
}

export const authenticateUser = (req: VercelRequest): AuthUser | null => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production';
    
    const decoded = jwt.verify(token, jwtSecret) as any;
    return {
      id: decoded.id || decoded.userId,
      email: decoded.email
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
};

export const requireAuth = (req: VercelRequest): AuthUser => {
  const user = authenticateUser(req);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
};