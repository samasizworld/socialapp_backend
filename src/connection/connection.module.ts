import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
    imports: [MongooseModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => {
            const user = config.get('DB_USER');
            const pass = config.get('DB_PASS');
            const port = config.get('DB_PORT');
            const dbName = config.get('DB_NAME');
            const host = config.get('DB_HOST');
            const uri = `mongodb://${user}:${pass}@${host}:${port}/${dbName}?authSource=${dbName}`;
            return { uri };
        },
        inject: [ConfigService]
    })],
})
export class DatabaseModule { }