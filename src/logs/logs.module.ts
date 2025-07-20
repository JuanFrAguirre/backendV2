import { Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Log, LogSchema } from '../schemas/logs.schema';
import { Product, ProductSchema } from '../schemas/products.schema';
import { Meal, MealSchema } from '../schemas/meals.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Log.name, schema: LogSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Meal.name, schema: MealSchema },
    ]),
  ],
  controllers: [LogsController],
  providers: [LogsService],
})
export class LogsModule {}
