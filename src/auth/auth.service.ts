import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/registerUser.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  generateToken(user: Pick<User, 'id' | 'email' | 'role'>): {
    accessToken: string;
  } {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async registerUser(registerDto: RegisterDto) {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(registerDto.password, saltOrRounds);
    const createdUser = await this.usersService.createUser({
      ...registerDto,
      password: hash,
    });

    const accessToken = this.generateToken(createdUser.user);

    return {
      status: 'success',
      status_code: 201,
      message: createdUser.message,
      data: {
        user: {
          id: createdUser.user?.id,
          full_name: createdUser.user?.full_name,
          email: createdUser.user?.email,
          role: createdUser.user?.role,
        },
        ...accessToken,
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { identifier, password } = loginDto;
    const user = await this.usersService.findOne({
      where: [{ email: identifier }, { phone_no: identifier }],
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const accessToken = this.generateToken(user);
    return {
      status: 'success',
      status_code: 200,
      message: 'Login successful',
      data: {
        user: {
          id: user?.id,
          full_name: user?.full_name,
          email: user?.email,
          role: user?.role,
        },
        ...accessToken,
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    };
  }
}
