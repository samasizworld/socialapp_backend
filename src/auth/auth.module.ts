import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "src/user/user.module";

@Module({
    imports:[ConfigModule,UserModule],
    providers: [AuthService],
    exports: [AuthService]
})
export class AuthModule { }
