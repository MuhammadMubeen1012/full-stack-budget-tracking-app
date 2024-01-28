import { IsInt, IsOptional, IsString } from 'class-validator';

export class EditExpenseDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  type: string;

  @IsInt()
  @IsOptional()
  amount: number;

  @IsString()
  @IsOptional()
  date: string;

  @IsString()
  @IsOptional()
  description: string;
}
