/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { AuthController, ResourceController } from './auth/auth.controller';
import { AuthGateway } from './auth/auth.gateway';
import { RedisConfigModule } from './redis/redis.module';

@Module({
  imports: [RedisConfigModule],
  controllers: [AppController, AuthController, ResourceController],
  providers: [AppService, AuthService, AuthGateway],
})
export class AppModule { }
