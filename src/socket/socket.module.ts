import { Module } from "@nestjs/common";
import { SocketGateway } from "./socket.gateway";
// import { ConfigModule } from "@nestjs/config";

@Module({
    // imports: [ConfigModule],
    providers: [SocketGateway]
})
export class SocketModule { }