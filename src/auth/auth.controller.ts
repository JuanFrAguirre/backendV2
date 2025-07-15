import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { Public } from './auth.guard';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

export interface RequestWithUser extends Request {
  user: { sub: string; email: string };
}

@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/signup')
  signup(@Body() createAuthDto: SignupDto) {
    return this.authService.signup(createAuthDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/signin')
  signin(@Body() data: SignInDto) {
    return this.authService.signin(data);
  }

  @Get('/users')
  getUsers() {
    return this.authService.findAll();
  }

  @Get('/me')
  getMe(@Req() req: RequestWithUser) {
    return this.authService.findSelfInfo(req.user.sub);
  }
}
