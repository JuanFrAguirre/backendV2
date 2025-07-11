import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

class MealProductDto {
  @IsString()
  @IsNotEmpty()
  product: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class CreateMealDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '8c30a36b-6f8d-4ec6-9057-564ee9a4bdba' })
  user: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MealProductDto)
  mealProducts: MealProductDto[];
}
