import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Product } from './products.schema';
import { Meal } from './meals.schema';

@Schema({ _id: false, timestamps: true })
class LogProduct {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  @Prop({
    type: MongooseSchema.Types.Mixed,
    required: true,
  })
  product: Product;

  @Prop({ required: true })
  quantity: number;
}
const LogProductSchema = SchemaFactory.createForClass(LogProduct);

export type LogProductDocument = HydratedDocument<LogProduct>;

@Schema({ _id: false, timestamps: true })
class LogMeal {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  @Prop({
    type: MongooseSchema.Types.Mixed,
    required: true,
  })
  meal: Meal;

  @Prop({ required: true })
  quantity: number;
}
const LogMealSchema = SchemaFactory.createForClass(LogMeal);

export type LogMealDocument = HydratedDocument<LogMeal>;

@Schema({ _id: false, timestamps: true })
export class Log {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  @Prop({ type: MongooseSchema.Types.String, required: true })
  user: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ type: [LogProductSchema], default: [] })
  logProducts?: LogProduct[];

  @Prop({ type: [LogMealSchema], default: [] })
  logMeals?: LogMeal[];
}

export const LogSchema = SchemaFactory.createForClass(Log);
