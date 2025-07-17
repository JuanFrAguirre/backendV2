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

@Injectable()
export class LogsService {
  constructor(@InjectModel(Log.name) private logModel: Model<Log>) {}

  private getDayStart(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  }

  async findByDate(user: string, date: string) {
    if (!user) throw new BadRequestException('User is required');
    if (!date) throw new BadRequestException('Date is required');
    const existing = await this.logModel
      .findOne({ user, date: this.getDayStart(date) })
      .populate({
        path: 'logMeals.meal',
        populate: { path: 'mealProducts.product', model: Product.name },
      })
      .populate('logProducts.product')
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
      .populate({
        path: 'logMeals.meal',
        populate: { path: 'mealProducts.product', model: Product.name },
      })
      .populate('logProducts.product')
      .lean()
      .sort({ date: -1 });
    return existing;
  }

  async postLogEntry(postLogEntry: PostLogEntryDto) {
    const dateObj = this.getDayStart(postLogEntry.date);
    const log = await this.logModel.findOne({
      user: postLogEntry.user,
      date: dateObj,
    });
    if (!log) {
      return this.logModel.create({
        user: postLogEntry.user,
        date: dateObj,
        ...(postLogEntry.logProducts && {
          logProducts: postLogEntry.logProducts,
        }),
        ...(postLogEntry.logMeals && { logMeals: postLogEntry.logMeals }),
      });
    }
    if (postLogEntry.logProducts) {
      if (!log.logProducts) log.logProducts = [];
      for (const incoming of postLogEntry.logProducts) {
        const existingProduct = log.logProducts.find(
          (lp) => lp.product === incoming.product,
        );
        if (existingProduct) {
          existingProduct.quantity += incoming.quantity;
        } else {
          log.logProducts.push({
            _id: uuidv4(),
            product: incoming.product,
            quantity: incoming.quantity,
          });
        }
      }
    }
    if (postLogEntry.logMeals) {
      if (!log.logMeals) log.logMeals = [];
      for (const incoming of postLogEntry.logMeals) {
        const existingMeal = log.logMeals.find(
          (lm) => lm.meal === incoming.meal,
        );
        if (existingMeal) {
          existingMeal.quantity += incoming.quantity;
        } else {
          log.logMeals.push({
            _id: uuidv4(),
            meal: incoming.meal,
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
