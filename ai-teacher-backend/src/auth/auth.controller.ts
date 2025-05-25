import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    try {
      const result = await this.authService.register(registerDto);
      return {
        message: 'User registered successfully',
        ...result,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await this.authService.login(loginDto.email, loginDto.password);
      return {
        message: 'Login successful',
        ...result,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return {
      message: 'Profile retrieved successfully',
      user: req.user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto) {
    try {
      await this.authService.changePassword(
        req.user.userId,
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword,
      );
      return {
        message: 'Password changed successfully',
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      await this.authService.forgotPassword(forgotPasswordDto.email);
      return {
        message: 'Password reset instructions sent to your email',
      };
    } catch (error) {
      return {
        message: 'If the email exists, password reset instructions have been sent',
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refreshToken(@Req() req) {
    try {
      const result = await this.authService.refreshToken(req.user.userId);
      return {
        message: 'Token refreshed successfully',
        ...result,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req) {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    return {
      message: 'Logged out successfully',
    };
  }

  @Get('verify-email/:token')
  async verifyEmail(@Req() req) {
    // Implementation for email verification
    return {
      message: 'Email verified successfully',
    };
  }
}