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

  generateToken(user: Pick<User, 'id' | 'email' | 'role'>): { access_token: string } {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async registerUser(registerDto: RegisterDto) {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(registerDto.password, saltOrRounds);
    const createdUser = await this.usersService.createUser({
      ...registerDto,
      password: hash,
    });

    return {
      ...createdUser,
      ...this.generateToken(createdUser.user),
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
    const access_token = this.generateToken(user);
    return {
      message: 'Login successful',
      user: {
        id: user?.id,
        full_name: user?.full_name,
        email: user?.email,
        phone_no: user?.phone_no,
        role: user?.role,
        is_active: user?.is_active,
      },
      ...access_token,
    };
  }
}
