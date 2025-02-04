import express from 'express';
import { TYPES } from '@/types';
import { IAuthController } from '@/controllers/auth.controller';
import { container } from '@/config/inversify';
import { validateRequest } from '@/middlewares/validation.middleware';
import { loginSchema, signUpSchema } from '@/utils/validation/schemas/auth.schema';

const authRouter = express.Router();
const authController = container.get<IAuthController>(TYPES.AuthController);

authRouter.post('/login', validateRequest(loginSchema), (req, res, next) => authController.login(req, res, next));

authRouter.post('/logout', (req, res, next) => authController.logout(req, res, next));

authRouter.post('/refresh', (req, res, next) => authController.refresh(req, res, next));

authRouter.post('/signup', validateRequest(signUpSchema), (req, res, next) => authController.signUp(req, res, next));

export default authRouter;
