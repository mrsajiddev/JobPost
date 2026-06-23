import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/registerUser.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(
    registerUserDto: RegisterDto,
  ): Promise<{ message: string; user: Omit<User, 'password'> }> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: [
          { email: registerUserDto.email },
          { phone_no: registerUserDto.phone_no },
        ],
      });

      if (existingUser) {
        if (existingUser.email === registerUserDto.email) {
          throw new ConflictException('Email already exists');
        }
        if (existingUser.phone_no === registerUserDto.phone_no) {
          throw new ConflictException('Phone number already exists');
        }
      }

      const newUser = this.userRepository.create(registerUserDto);
      const savedUser = await this.userRepository.save(newUser);

      const { password, ...result } = savedUser;

      return {
        message: 'User registered successfully',
        user: result,
      };
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Something went wrong while creating user',
      );
    }
  }

  async findOne(query: FindOneOptions<User>): Promise<User | null> {
    return await this.userRepository.findOne(query);
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async getProfile(userId: number): Promise<Omit<User, 'password'>> {
    const user = await this.getUserById(userId);

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    const { password, ...result } = user;
    return result;
  }
}
