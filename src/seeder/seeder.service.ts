import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import chalk from 'chalk';
import { Model } from 'mongoose';
import { Log } from 'src/schemas/logs.schema';
import { Meal } from 'src/schemas/meals.schema';
import { Product } from 'src/schemas/products.schema';
import { User } from 'src/schemas/users.schema';
import { SEED_MEALS, SEED_PRODUCTS, SEED_USERS } from './seed.data';

@Injectable()
export class SeederService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Meal.name) private mealModel: Model<Meal>,
    @InjectModel(Log.name) private logModel: Model<Log>,
  ) {}

  async run() {
    // Deleting all data
    console.log(chalk.yellow('Wiping DB...'));
    await this.mealModel.deleteMany();
    await this.productModel.deleteMany();
    await this.userModel.deleteMany();
    await this.logModel.deleteMany();
    console.log(chalk.red('DB wiped'));

    // Seeding users
    console.log(chalk.yellow('Seeding users...'));
    const users = await Promise.all(
      SEED_USERS.map(async (u) => {
        const password = await bcrypt.hash(u.password, 10);
        return this.userModel.create({
          ...u,
          _id: u.id,
          password,
        });
      }),
    );

    // Seeding products
    console.log(chalk.yellow('Seeding products...'));
    const products = await Promise.all(
      SEED_PRODUCTS.sort((a, b) => a.title.localeCompare(b.title)).map((p) =>
        this.productModel.create({
          ...p,
          _id: p.id,
        }),
      ),
    );

    // Seeding meals
    console.log(chalk.yellow('Seeding meals...'));
    const meals = await Promise.all(
      SEED_MEALS.map((m) =>
        this.mealModel.create({
          ...m,
          _id: m.id,
        }),
      ),
    );

    // Seed results
    console.log(chalk.green(`Seeded ${products.length} products`));
    console.log(chalk.green(`Seeded ${users.length} users`));
    console.log(chalk.green(`Seeded ${meals.length} meals`));
  }
}
