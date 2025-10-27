import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/types';
import { IAuthService } from '@/services/auth.service';
import { loginSchema, signUpSchema } from '@/validation/schemas/auth.schema';
import { AuthResponse } from '@/types/Auth';

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

    this.setCookies(res, authResponse);

    res.status(200).json({
      message: 'Login successful',
      accessToken: authResponse.accessToken,
    });
  }

  async logout(req: Request, res: Response) {
    await this.authService.logout();

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    res.status(200).json({ message: 'Logout successful' });
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    const authResponse = await this.authService.refreshToken(refreshToken);

    this.setCookies(res, authResponse);

    res.status(200).json({
      message: 'Tokens refreshed',
    });
  }

  async signUp(req: Request, res: Response) {
    const credentials = signUpSchema.parse(req.body);

    const authResponse = await this.authService.signUp(credentials);

    this.setCookies(res, authResponse);

    res.status(201).json({
      message: 'User created',
      response: authResponse,
    });
  }

  private setCookies(res: Response, authTokens: AuthResponse) {
    res.cookie('access_token', authTokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    if (authTokens.refreshToken) {
      res.cookie('refresk_token', authTokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        // sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }
  }
}
