/* eslint-disable prettier/prettier */
import { WebSocketServer, WebSocketGateway } from "@nestjs/websockets";
import { Server } from "socket.io";
import { AuthService } from "./auth.service";

@WebSocketGateway()
export class AuthGateway {
  @WebSocketServer()
    server: Server;
    constructor(private readonly authService: AuthService) { }

    startTokenEmission(userId: string): void {
        this.authService.startTokenEmission(userId, this.server);
    }
}