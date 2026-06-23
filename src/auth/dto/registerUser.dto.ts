import { IsNotEmpty, IsEmail, IsString } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Full name is required' })
  @IsString()
  full_name!: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  phone_no!: string;

  @IsNotEmpty({ message: 'Role is required' })
  role!: string;

  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
}