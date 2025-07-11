import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from 'src/schemas/products.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  create(createProductDto: CreateProductDto) {
    return this.productModel.create(createProductDto);
  }

  findAll() {
    return this.productModel.find().sort({ title: 'asc' });
  }

  async findOne(id: string) {
    const existing = await this.productModel.findById(id);
    if (!existing) throw new NotFoundException('Product not found');
    return existing;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const existing = await this.productModel.findById(id);
    if (!existing) throw new NotFoundException('Product not found');
    const updated = await this.productModel.findByIdAndUpdate(
      id,
      updateProductDto,
      { new: true },
    );
    return { message: 'Product updated successfully', updated };
  }

  async remove(id: string) {
    const existing = await this.productModel.findById(id);
    if (!existing) throw new NotFoundException('Product not found');
    await this.productModel.findByIdAndDelete(id);
    return { message: 'Product deleted successfully' };
  }
}
