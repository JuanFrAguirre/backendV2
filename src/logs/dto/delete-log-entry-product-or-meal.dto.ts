import { IsEnum } from 'class-validator';

export class DeleteLogEntryProductOrMealDto {
  @IsEnum(['meal', 'product'])
  type: 'meal' | 'product';
}
