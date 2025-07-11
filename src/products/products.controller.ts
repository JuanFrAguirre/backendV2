import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const existing = await this.productsService.findOne(id);
    if (!existing) throw new NotFoundException();
    return existing;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const existing = await this.productsService.update(id, updateProductDto);
    if (!existing) throw new NotFoundException();
    return existing;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const existing = await this.productsService.remove(id);
    if (!existing) throw new NotFoundException();
    return { message: 'Product deleted successfully' };
  }
}
