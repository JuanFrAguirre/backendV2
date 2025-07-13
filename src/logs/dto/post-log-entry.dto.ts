import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
} from 'class-validator';

class LogProductDto {
  @ApiProperty({
    description: 'Product ID',
    example: '04b3055b-00b7-4145-8a89-d0161678a066',
  })
  @IsString()
  @IsNotEmpty()
  product: string;

  @ApiProperty({ description: 'Quantity of product', example: 2 })
  @IsNumber()
  quantity: number;
}

class LogMealDto {
  @ApiProperty({
    description: 'Meal ID',
    example: '71850970-cab3-4bde-a715-8010159ddb12',
  })
  @IsString()
  @IsNotEmpty()
  meal: string;

  @ApiProperty({ description: 'Quantity of meal', example: 1 })
  @IsNumber()
  quantity: number;
}

export class PostLogEntryDto {
  @ApiProperty({
    description: 'User ID for this log',
    example: '8c30a36b-6f8d-4ec6-9057-564ee9a4bdba',
  })
  @IsString()
  @IsNotEmpty()
  user: string;

  @ApiProperty({
    description: 'Log date as ISO string',
    example: '2025-12-25',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ type: [LogProductDto], description: 'Products logged' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LogProductDto)
  logProducts: LogProductDto[];

  @ApiProperty({ type: [LogMealDto], description: 'Meals logged' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LogMealDto)
  logMeals: LogMealDto[];
}
