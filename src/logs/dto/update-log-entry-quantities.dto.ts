import { IsEnum, IsNumber } from 'class-validator';

export class UpdateLogEntryQuantitiesDto {
  @IsEnum(['meal', 'product'])
  type: 'meal' | 'product';

  @IsNumber()
  quantity: number;
}
