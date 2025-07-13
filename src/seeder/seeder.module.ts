import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeederService } from './seeder.service';
import { User } from 'src/schemas/users.schema';
import { UserSchema } from 'src/schemas/users.schema';
import { AppModule } from 'src/app.module';
import { Product, ProductSchema } from 'src/schemas/products.schema';
import { Meal, MealSchema } from 'src/schemas/meals.schema';
import { Log, LogSchema } from 'src/schemas/logs.schema';

@Module({
  imports: [
    AppModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Meal.name, schema: MealSchema },
      { name: Log.name, schema: LogSchema },
    ]),
  ],
  providers: [SeederService],
})
export class SeederModule {}
