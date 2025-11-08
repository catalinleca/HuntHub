import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/shared/types';
import { IAuthService } from './auth.service';
import { loginSchema, signUpSchema } from './auth.validation';
import { UnauthorizedError } from '@/shared/errors';

export interface IAuthController {
  login(req: Request, res: Response): Promise<void>;
  logout(req: Request, res: Response): Promise<void>;
  refresh(req: Request, res: Response): Promise<void>;
  signUp(req: Request, res: Response): Promise<void>;
}

@injectable()
export class AuthController implements IAuthController {
  constructor(@inject(TYPES.AuthService) private authService: IAuthService) {}

  async login(req: Request, res: Response) {
    const credentials = loginSchema.parse(req.body);
    const authResponse = await this.authService.login(credentials);

    res.status(200).json({
      message: 'Login successful',
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
    });
  }

  async logout(req: Request, res: Response) {
    await this.authService.logout();

    res.status(200).json({
      message: 'Logout successful',
    });
  }

  async refresh(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    const refreshToken = authHeader?.split(' ')[1];

    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token not provided');
    }

    const authResponse = await this.authService.refreshToken(refreshToken);

    res.status(200).json({
      message: 'Token refreshed',
      accessToken: authResponse.accessToken,
    });
  }

  async signUp(req: Request, res: Response) {
    const credentials = signUpSchema.parse(req.body);
    const authResponse = await this.authService.signUp(credentials);

    res.status(201).json({
      message: 'User created',
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
    });
  }
}
