import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SignInDto } from './dto/signin.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignupDto } from './dto/signup.dto';
import { User } from '../schemas/users.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwt: JwtService,
  ) {}

  async findAll() {
    return this.userModel.find();
  }

  async signup({ password, ...dataWithoutPassword }: SignupDto) {
    const userAlreadyRegistered = await this.findOneByEmail(
      dataWithoutPassword.email,
    );
    if (userAlreadyRegistered)
      throw new BadRequestException('Email already registered');
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.userModel.create({
      ...dataWithoutPassword,
      password: hashedPassword,
    });
    const { password: _password, ...userWithoutPassword } = newUser.toObject();
    return userWithoutPassword;
  }

  async signin({ email, password }: SignInDto) {
    const userInDB = await this.findOneByEmail(email);
    if (!userInDB) throw new NotFoundException('User not found');
    const isPasswordValid = await bcrypt.compare(password, userInDB.password);
    if (!isPasswordValid) throw new BadRequestException('Invalid password');
    const payload = { sub: userInDB._id, email: userInDB.email };
    const token = await this.jwt.signAsync(payload);
    return {
      token,
      sub: userInDB._id,
      email: userInDB.email,
      user: userInDB.toObject(),
    };
  }

  async findOneByEmail(email: string) {
    const userInDB = await this.userModel.findOne({
      email,
    });
    console.log(userInDB);
    return userInDB ?? null;
  }

  async findSelfInfo(id: string) {
    const userInDb = await this.userModel.findById(id);
    if (!userInDb) throw new NotFoundException('User not found');
    const { password: _password, ...userWithoutPassword } = userInDb.toObject();
    return userWithoutPassword;
  }
}
