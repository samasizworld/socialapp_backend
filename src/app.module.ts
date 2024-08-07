import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { DatabaseModule } from './connection/connection.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationMiddleware } from './auth/auth.middleware';
import { EventModule } from './events/event.module';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [DatabaseModule,
    UserModule,
    AuthModule,
    ConfigModule.forRoot({ envFilePath: ['./.node.env'], cache: true }),
    EventModule,
    SocketModule]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).exclude(
      { path: '/api/v1/users/register', method: RequestMethod.POST },
      { path: '/api/v1/users/login', method: RequestMethod.POST },
      { path: '/api/v1/users/refresh', method: RequestMethod.POST }
    )
      .forRoutes({ path: '/api/v1/events*', method: RequestMethod.ALL },
        { path: '/api/v1/users*', method: RequestMethod.ALL })
  }
}

