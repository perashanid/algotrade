import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateRequest, registerSchema, loginSchema } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/login', validateRequest(loginSchema), AuthController.login);

// Protected routes
router.get('/profile', authenticateToken, AuthController.getProfile);

export default router;