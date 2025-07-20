import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log } from '../schemas/logs.schema';
import { PostLogEntryDto } from './dto/post-log-entry.dto';
import { v4 as uuidv4 } from 'uuid';
import { Product } from 'src/schemas/products.schema';
import { Meal } from 'src/schemas/meals.schema';

@Injectable()
export class LogsService {
  constructor(
    @InjectModel(Log.name) private logModel: Model<Log>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Meal.name) private mealModel: Model<Meal>,
  ) {}

  private getDayStart(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  }

  async findByDate(user: string, date: string) {
    if (!user) throw new BadRequestException('User is required');
    if (!date) throw new BadRequestException('Date is required');
    const existing = await this.logModel
      .findOne({ user, date: this.getDayStart(date) })
      .lean();
    return existing;
  }

  async findByRange(user: string, startDate: string, endDate: string) {
    if (!user) throw new BadRequestException('User is required');
    const existing = await this.logModel
      .find({
        user,
        date: {
          $gte: this.getDayStart(startDate),
          $lte: this.getDayStart(endDate),
        },
      })
      .lean()
      .sort({ date: -1 });
    return existing;
  }

  async postLogEntry(postLogEntry: PostLogEntryDto) {
    const dateObj = this.getDayStart(postLogEntry.date);
    let log = await this.logModel.findOne({
      user: postLogEntry.user,
      date: dateObj,
    });
    if (!log) {
      log = new this.logModel({
        user: postLogEntry.user,
        date: dateObj,
        logProducts: [],
        logMeals: [],
      });
    }
    // Ensure arrays exist
    if (!log.logProducts) log.logProducts = [];
    if (!log.logMeals) log.logMeals = [];
    // Embed full product snapshots
    if (postLogEntry.logProducts) {
      for (const incoming of postLogEntry.logProducts) {
        const productData = await this.productModel
          .findById(incoming.product)
          .lean();
        if (!productData) throw new NotFoundException('Product not found');
        const existingProduct = log.logProducts.find(
          (lp) => lp.product._id === incoming.product,
        );
        if (existingProduct) {
          existingProduct.quantity += incoming.quantity;
        } else {
          log.logProducts.push({
            _id: uuidv4(),
            product: productData,
            quantity: incoming.quantity,
          });
        }
      }
    }
    // Embed full meal snapshots
    if (postLogEntry.logMeals) {
      for (const incoming of postLogEntry.logMeals) {
        const mealData = await this.mealModel
          .findById(incoming.meal)
          .populate('mealProducts.product')
          .lean();
        if (!mealData) throw new NotFoundException('Meal not found');
        const existingMeal = log.logMeals.find(
          (lm) => lm.meal._id === incoming.meal,
        );
        if (existingMeal) {
          existingMeal.quantity += incoming.quantity;
        } else {
          log.logMeals.push({
            _id: uuidv4(),
            meal: mealData,
            quantity: incoming.quantity,
          });
        }
      }
    }
    return log.save();
  }

  async updateLogEntryQuantities(
    type: 'meal' | 'product',
    entryId: string,
    quantity: number,
  ) {
    const field = type === 'meal' ? 'logMeals' : 'logProducts';
    const log = await this.logModel.findOne({ [`${field}._id`]: entryId });
    if (!log)
      throw new NotFoundException(
        'No log found containing this product or meal',
      );
    const entries =
      type === 'meal' ? (log.logMeals ?? []) : (log.logProducts ?? []);
    const entry = entries.find((e) => e._id === entryId);
    if (!entry) throw new NotFoundException(`${type} log entry not found`);
    entry.quantity = quantity;
    return log.save();
  }

  async deleteLogEntry(type: 'meal' | 'product', entryId: string) {
    if (type === 'meal') {
      const updated = await this.logModel.findOneAndUpdate(
        { 'logMeals._id': entryId },
        { $pull: { logMeals: { _id: entryId } } },
        { new: true },
      );
      if (!updated)
        throw new NotFoundException('Meal log entry not found for deletion');
      return updated;
    } else if (type === 'product') {
      const updated = await this.logModel.findOneAndUpdate(
        { 'logProducts._id': entryId },
        { $pull: { logProducts: { _id: entryId } } },
        { new: true },
      );
      if (!updated)
        throw new NotFoundException('Product log entry not found for deletion');
      return updated;
    } else {
      throw new BadRequestException('Invalid type');
    }
  }
}
