import express from 'express';
import { TYPES } from '@/types';
import { IAuthController } from '@/controllers/auth.controller';
import { container } from '@/config/inversify';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { loginSchema, signUpSchema } from '@/utils/validation/schemas/auth.schema';

const authRouter = express.Router();
const authController = container.get<IAuthController>(TYPES.AuthController);

authRouter.post('/login', validationMiddleware(loginSchema), (req, res, next) => authController.login(req, res).catch(next));

authRouter.post('/logout', (req, res, next) => authController.logout(req, res).catch(next));

authRouter.post('/refresh', (req, res, next) => authController.refresh(req, res).catch(next));

authRouter.post('/signup', validationMiddleware(signUpSchema), (req, res, next) =>
  authController.signUp(req, res).catch(next),
);

export default authRouter;
