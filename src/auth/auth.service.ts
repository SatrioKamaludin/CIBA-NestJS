/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
    // private authRequest: Record<string, boolean> = {};
    // private tokenMap: Record<string, string> = {};
    private readonly jwtSecret = 'your-secret-key'; // will be replaced with another secret key later

    constructor(private readonly redisService: RedisService) { }

    async sendAuthRequest(userId: string): Promise<string> {
        await this.redisService.set(`authRequest:${userId}`, 'false');
        const token = this.generateToken(userId);
        console.log(`Generated token for user ${userId}: ${token}`); // Log the token
        await this.redisService.set(`token:${userId}`, token);
        return token;
    }

    generateToken(userId: string): string {
        const payload = { userId };
        return jwt.sign(payload, this.jwtSecret, { expiresIn: '30s' }); // Token expires in 20 Seconds
    }

    async approveAuthRequest(userId: string, approve: boolean): Promise<string> {
        const authRequest = await this.redisService.get(`authRequest:${userId}`);
        if (authRequest === null) {
            throw new HttpException('Invalid userId or no auth request found', HttpStatus.BAD_REQUEST);
        }
        await this.redisService.set(`authRequest:${userId}`, approve.toString());
        return approve
            ? 'auth request approved'
            : 'auth request rejected';
    }

    async isAuthenticated(userId: string): Promise<boolean> {
        const authRequest = await this.redisService.get(`authRequest:${userId}`);
        return authRequest === 'true';
    }

    startTokenEmission(userId: string, server: Server): void {
        setInterval(async() => {
            const newToken = this.generateToken(userId);
            await this.redisService.set(`token:${userId}`, newToken);
            server.emit(`updateToken-${userId}`, {
                token: newToken
            });
        }, 30000);
    }

    async getToken(userId: string): Promise<string> {
        return await this.redisService.get(`token:${userId}`);
    }

    verifyToken(token: string): any {
        try {
            return jwt.verify(token, this.jwtSecret);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            throw new HttpException('Invalid or expired token', HttpStatus.UNAUTHORIZED);
        }
    }
}
