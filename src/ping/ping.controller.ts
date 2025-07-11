import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/auth/auth.guard';

@Controller('ping')
export class PingController {
  @Get()
  @Public()
  ping() {
    return 'pong';
  }
}
