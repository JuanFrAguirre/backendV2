import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Meal } from 'src/schemas/meals.schema';
import { Model } from 'mongoose';

@Injectable()
export class MealsService {
  constructor(@InjectModel(Meal.name) private mealModel: Model<Meal>) {}

  create(createMealDto: CreateMealDto) {
    return this.mealModel.create(createMealDto);
  }

  findAll(userId: string) {
    return this.mealModel
      .find({ user: userId })
      .sort({ createdAt: 'desc' })
      .populate('mealProducts.product')
      .lean();
  }

  async findOne(id: string, userId: string) {
    const existing = await this.mealModel
      .findOne({ _id: id, user: userId })
      .populate('mealProducts.product')
      .lean();
    if (!existing) throw new NotFoundException('Meal not found');
    return {
      ...existing,
      mealProducts: existing.mealProducts,
    };
  }

  async update(id: string, updateMealDto: UpdateMealDto) {
    const existing = await this.mealModel.findById(id);
    if (!existing) throw new NotFoundException('Meal not found');
    const updated = await this.mealModel.findByIdAndUpdate(id, updateMealDto, {
      new: true,
    });
    return { message: 'Meal updated successfully', updated };
  }

  async remove(id: string) {
    const existing = await this.mealModel.findById(id);
    if (!existing) throw new NotFoundException('Meal not found');
    await this.mealModel.findByIdAndDelete(id);
    return { message: 'Meal deleted successfully' };
  }
}
