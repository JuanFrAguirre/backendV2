import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true, _id: false })
export class Product {
  @Prop({ type: String, default: uuidv4 })
  _id: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  image?: string;

  @Prop({ required: true })
  calories: number;

  @Prop({ required: true })
  fats: number;

  @Prop({ required: true })
  carbs: number;

  @Prop({ required: true })
  protein: number;

  @Prop({ required: true })
  presentationSize: number;

  @Prop()
  tags?: string; // or string[]
}

export const ProductSchema = SchemaFactory.createForClass(Product);
