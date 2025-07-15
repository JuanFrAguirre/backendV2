import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { MealsService } from './meals.service';
import { RequestWithUser } from 'src/auth/auth.controller';

@Controller('meals')
@ApiBearerAuth()
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Post()
  create(@Body() createMealDto: CreateMealDto) {
    return this.mealsService.create(createMealDto);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.mealsService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.mealsService.findOne(id, req.user.sub);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateMealDto: UpdateMealDto) {
    return this.mealsService.update(id, updateMealDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mealsService.remove(id);
  }
}
