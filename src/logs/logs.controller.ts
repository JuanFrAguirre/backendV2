import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { PostLogEntryDto } from './dto/post-log-entry.dto';
import { UpdateLogEntryQuantitiesDto } from './dto/update-log-entry-quantities.dto';
import { DeleteLogEntryProductOrMealDto } from './dto/delete-log-entry-product-or-meal.dto';

export interface RequestWithUser extends Request {
  user: { sub: string; email: string };
}

@ApiBearerAuth()
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  postLogEntry(
    @Req() req: RequestWithUser,
    @Body() postLogEntry: PostLogEntryDto,
  ) {
    if (req.user.sub !== postLogEntry.user)
      throw new UnauthorizedException(
        'Provided user is not same as authorized',
      );
    console.log(JSON.stringify({ BODY: postLogEntry }, null, 2));
    return this.logsService.postLogEntry(postLogEntry);
  }

  @ApiQuery({ name: 'date', type: String, required: true })
  @Get()
  async findByDate(@Req() req: RequestWithUser, @Query('date') date: string) {
    const existing = await this.logsService.findByDate(req.user.sub, date);
    if (!existing)
      throw new NotFoundException('Log not found for this user/date');
    return existing;
  }

  @ApiQuery({ name: 'startDate', type: String, required: true })
  @ApiQuery({ name: 'endDate', type: String, required: true })
  @Get('/range')
  async findByDateRange(
    @Req() req: RequestWithUser,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const existing = await this.logsService.findByRange(
      req.user.sub,
      startDate,
      endDate,
    );
    if (!existing)
      throw new NotFoundException('Log not found for this user/date range');
    return existing;
  }

  @Put(':id/quantity')
  updateLogEntryQuantities(
    @Param('id') id: string,
    @Body() updateLogEntryQuantitiesDto: UpdateLogEntryQuantitiesDto,
  ) {
    const { type, quantity } = updateLogEntryQuantitiesDto;
    return this.logsService.updateLogEntryQuantities(type, id, quantity);
  }

  @Delete(':id')
  deleteLogEntryProductOrMeal(
    @Param('id') id: string,
    @Body() deleteLogEntryDto: DeleteLogEntryProductOrMealDto,
  ) {
    const { type } = deleteLogEntryDto;
    return this.logsService.deleteLogEntry(type, id);
  }
}
