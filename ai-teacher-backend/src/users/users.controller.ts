import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  getProfile(@Req() req) {
    return this.usersService.findOne(req.user.userId);
  }

  @Get('me/stats')
  getUserStats(@Req() req) {
    return this.usersService.getUserStats(req.user.userId);
  }

  @Get('me/progress')
  getUserProgress(@Req() req) {
    return this.usersService.getUserProgress(req.user.userId);
  }

  @Get('search')
  searchUsers(@Query('q') query: string) {
    return this.usersService.searchUsers(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch('me')
  updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @Patch('me/learning-profile')
  updateLearningProfile(
    @Req() req,
    @Body() learningProfile: {
      strengths: string[];
      weaknesses: string[];
      preferredStyle: string;
      pace: string;
    },
  ) {
    return this.usersService.updateLearningProfile(req.user.userId, learningProfile);
  }

  @Patch('me/preferences')
  updatePreferences(
    @Req() req,
    @Body() preferences: {
      notifications?: boolean;
      theme?: string;
      language?: string;
      difficulty?: string;
    },
  ) {
    return this.usersService.updateUserPreferences(req.user.userId, preferences);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}