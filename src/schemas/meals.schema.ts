// meal.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Product } from './products.schema';

@Schema({ _id: false, timestamps: true })
class MealProduct {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  @Prop({
    type: MongooseSchema.Types.String,
    ref: Product.name,
    required: true,
  })
  product: string;

  @Prop({ required: true })
  quantity: number;
}

export type MealProductDocument = HydratedDocument<MealProduct>;

const MealProductSchema = SchemaFactory.createForClass(MealProduct);

@Schema({ timestamps: true, _id: false })
export class Meal {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  @Prop({ type: MongooseSchema.Types.String, required: true })
  user: string;

  @Prop({ required: true })
  title: string;

  @Prop({ type: [MealProductSchema], default: [] })
  mealProducts: MealProduct[];
}

export const MealSchema = SchemaFactory.createForClass(Meal);
