import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PingController } from './ping/ping.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from './products/products.module';
import { MealsModule } from './meals/meals.module';
import { LogsModule } from './logs/logs.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGO_URI_1! +
        encodeURIComponent(process.env.MONGO_PASSWORD!) +
        process.env.MONGO_URI_2!,
    ),
    ProductsModule,
    MealsModule,
    LogsModule,
  ],
  exports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI_1! +
        encodeURIComponent(process.env.MONGO_PASSWORD!) +
        process.env.MONGO_URI_2!,
    ),
  ],
  controllers: [PingController],
  providers: [],
})
export class AppModule {}
