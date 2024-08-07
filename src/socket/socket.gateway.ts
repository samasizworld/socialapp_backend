// import { ConfigService } from "@nestjs/config";
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

// @WebSocketGateway(parseInt(this.configService.get<string>('SOCKET_SERVER_PORT'), 10), { cors: { origin: '*' } })
@WebSocketGateway(3002, { cors: { origin: "*" } })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    // constructor(private configService: ConfigService) { }
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        console.log('New user connected, ', client.id);
        // client.broadcast.emit
    }
    handleDisconnect(client: Socket) {
        console.log('disconnected, ', client.id);

    }
    @SubscribeMessage('message')
    onNewMessage(client: Socket, message: any) {
        console.log('message', message);
        this.server.emit('message', 'broadcasting....')
    }
}