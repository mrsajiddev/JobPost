import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';

interface RequestWithUser extends Request {
  user: {
    sub: number;
    email: string;
    role: string;
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Request() req: RequestWithUser): Promise<any> {
    const userId = req.user.sub;
    const userProfile = await this.userService.getProfile(userId);

    return {
      status: 'success',
      status_code: 200,
      message: 'Profile fetched successfully',
      data: {
        user: {
          id: userProfile?.id,
          full_name: userProfile?.full_name,
          email: userProfile?.email,
          role: userProfile?.role,
        },
      },
    };
  }
}
