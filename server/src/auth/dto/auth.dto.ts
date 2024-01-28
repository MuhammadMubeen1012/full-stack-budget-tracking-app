import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

//use this in main.ts
// import { ValidationPipe } from '@nestjs/common';
//app.useGlobalPipes(new ValidationPipe());

export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName: string;
}
