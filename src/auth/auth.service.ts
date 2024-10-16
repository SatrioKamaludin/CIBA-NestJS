/* eslint-disable prettier/prettier */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Server } from 'socket.io';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
    private authRequest: Record<string, boolean> = {};
    private tokenMap: Record<string, string> = {};
    private readonly jwtSecret = 'your-secret-key'; // Use a secure key in production

    sendAuthRequest(userId: string): string {
        this.authRequest[userId] = false;
        const token = this.generateToken(userId);
        this.tokenMap[userId] = token;
        return token;
    }

    generateToken(userId: string): string {
        const payload = { userId };
        return jwt.sign(payload, this.jwtSecret, { expiresIn: '30s' }); // Token expires in 5 seconds for testing
    }

    approveAuthRequest(userId: string, approve: boolean): string {
        if (this.authRequest[userId] === undefined) {
            throw new HttpException('Invalid userId or no auth request found', HttpStatus.BAD_REQUEST);
        }
        this.authRequest[userId] = approve;
        return approve ? 'auth request approved' : 'auth request rejected';
    }

    isAuthenticated(userId: string): boolean {
        return this.authRequest[userId] === true;
    }

    startTokenEmission(userId: string, server: Server): void {
        setInterval(() => {
            const newToken = this.generateToken(userId);
            this.tokenMap[userId] = newToken;
            server.emit(`updateToken-${userId}`, {
                token: newToken
            });
        }, 5000);
    }

    getToken(userId: string): string {
        return this.tokenMap[userId];
    }

    verifyToken(token: string): any {
        try {
            return jwt.verify(token, this.jwtSecret);
        } catch (e) {
            throw new HttpException('Invalid or expired token', HttpStatus.UNAUTHORIZED);
        }
    }
}
