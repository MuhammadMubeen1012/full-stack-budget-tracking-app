import {
  IsDate,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class EditIncomeDto {
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
