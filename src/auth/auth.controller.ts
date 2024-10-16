/* eslint-disable prettier/prettier */
import { Body, Controller, Get, HttpException, HttpStatus, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGateway } from './auth.gateway';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly authGateway: AuthGateway
    ) { }

    // auth/request
    @Post('request')
    async sendAuthRequest(@Body('userId') userId: string): Promise<any> {
        const token = await this.authService.sendAuthRequest(userId);
        this.authGateway.startTokenEmission(userId);
        return { token };
    }

    // auth/approve
    @Post('approve')
    async approveAuthRequest(@Body('userId') userId: string, @Body('approve') approve: boolean): Promise<any> {
        const message = await this.authService.approveAuthRequest(userId, approve);
        return { message };
    }
}

@Controller('resource')
export class ResourceController {
    constructor(private readonly authservice: AuthService) { }

    @Get()
    async accessResource(@Query('token') token: string): Promise<any> {
        const decoded = this.authservice.verifyToken(token);
        if (!decoded) {
            throw new HttpException('Invalid or expired token', HttpStatus.UNAUTHORIZED);
        }   
        const isAuthenticated = this.authservice.isAuthenticated(decoded.userId);
        if (!isAuthenticated) {
            throw new HttpException('Access denied, please authenticate', HttpStatus.UNAUTHORIZED);
        }
        return { message: 'Access granted' };
    }
}
