import express from 'express';
import { TYPES } from '@/shared/types';
import { IAuthController } from './auth.controller';
import { container } from '@/config/inversify';
import { validateRequest } from '@/shared/middlewares';
import { loginSchema, signUpSchema } from './auth.validation';

const authRouter = express.Router();
const authController = container.get<IAuthController>(TYPES.AuthController);

authRouter.post('/login', validateRequest(loginSchema), (req, res, next) => authController.login(req, res).catch(next));

authRouter.post('/logout', (req, res, next) => authController.logout(req, res).catch(next));

authRouter.post('/refresh', (req, res, next) => authController.refresh(req, res).catch(next));

authRouter.post('/signup', validateRequest(signUpSchema), (req, res, next) =>
  authController.signUp(req, res).catch(next),
);

export default authRouter;
