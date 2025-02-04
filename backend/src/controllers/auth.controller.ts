import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/types';
import { IAuthService } from '@/services/auth.service';
import { loginSchema, signUpSchema } from '@/utils/validation/schemas/auth.schema';

export interface IAuthController {
  login(req: Request, res: Response, next: NextFunction): Promise<void>;
  logout(req: Request, res: Response, next: NextFunction): Promise<void>;
  refresh(req: Request, res: Response, next: NextFunction): Promise<void>;
  signUp(req: Request, res: Response, next: NextFunction): Promise<void>;
}

@injectable()
export class AuthController implements IAuthController {
  constructor(@inject(TYPES.AuthService) private authService: IAuthService) {}

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const credentials = loginSchema.parse(req.body);

      const authResponse = await this.authService.login(credentials);

      this.setCookies(res, authResponse);

      res.status(200).json({
        message: 'Login successful',
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await this.authService.logout();

      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        throw new Error('Refresh token not found');
      }

      const authResponse = await this.authService.refreshToken(refreshToken);

      this.setCookies(res, authResponse);

      res.status(200).json({
        message: 'Tokens refreshed',
      });
    } catch (error) {
      next(error);
    }
  }

  async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const credentials = signUpSchema.parse(req.body);
      console.log('===credentials: ', credentials);

      const authResponse = await this.authService.signUp(credentials);

      console.log('===authResponse: ', authResponse);
      this.setCookies(res, authResponse);

      res.status(201).json({
        message: 'User created',
      });
    } catch (error) {
      next(error);
    }
  }

  // TODO: remove and add to headers
  private setCookies(res: Response, authTokens: { accessToken: string; refreshToken?: string }) {
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
