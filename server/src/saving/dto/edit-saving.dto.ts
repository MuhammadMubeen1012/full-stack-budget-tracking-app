import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EditSavingDto {
  @IsString()
  @IsOptional()
  source: string;

  @IsInt()
  @IsOptional()
  amount: number;

  @IsString()
  @IsOptional()
  deadline: string;

  @IsString()
  @IsOptional()
  description: string;
}
