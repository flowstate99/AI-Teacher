import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (user && await bcrypt.compare(password, user.password)) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    
    const payload = { 
      email: user.email, 
      sub: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        learningProfile: user.learningProfile,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    try {
      await this.usersService.findByEmail(registerDto.email);
      throw new ConflictException('User with this email already exists');
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      // User doesn't exist, continue with registration
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);
    
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });
    
    const { password, ...result } = user;
    
    const payload = { 
      email: result.email, 
      sub: result.id,
      firstName: result.firstName,
      lastName: result.lastName,
    };
    
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: result.id,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        learningProfile: result.learningProfile,
      },
    };
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findOne(userId);
    
    // Verify current password
    const userWithPassword = await this.usersService.findByEmail(user.email);
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userWithPassword.password);
    
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    await this.usersService.update(userId, { password: hashedNewPassword });
    
    return { message: 'Password changed successfully' };
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      
      // In a real application, you would:
      // 1. Generate a secure reset token
      // 2. Store it in the database with expiration
      // 3. Send an email with the reset link
      
      // For now, we'll just log it (don't do this in production!)
      const resetToken = this.jwtService.sign(
        { email: user.email, type: 'password-reset' },
        { expiresIn: '1h' }
      );
      
      console.log(`Password reset token for ${email}: ${resetToken}`);
      
      return { message: 'Password reset email sent' };
    } catch (error) {
      // Don't reveal whether the email exists or not
      return { message: 'If the email exists, a reset link has been sent' };
    }
  }

  async refreshToken(userId: number) {
    const user = await this.usersService.findOne(userId);
    
    const payload = { 
      email: user.email, 
      sub: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    
    const accessToken = this.jwtService.sign(payload);
    
    return {
      access_token: accessToken,
    };
  }

  async validateRefreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}