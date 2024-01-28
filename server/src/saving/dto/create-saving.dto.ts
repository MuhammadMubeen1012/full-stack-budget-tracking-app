import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSavingDto {
  @IsString()
  @IsNotEmpty()
  source: string;

  @IsInt()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  deadline: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsInt()
  @IsNotEmpty()
  incomeID: number;
}
