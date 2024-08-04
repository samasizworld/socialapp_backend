import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./user.schema";
import { UserMapper } from "./user.mapper";
import { AuthService } from "src/auth/auth.service";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), ConfigModule],
    controllers: [UserController],
    providers: [UserService, UserMapper, AuthService],
    exports: [UserService, MongooseModule]
})
export class UserModule { }