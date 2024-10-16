/* eslint-disable prettier/prettier */
import { Injectable, OnModuleInit } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit {
    private client: Redis;

    onModuleInit() {
        this.client = new Redis({
            host: 'localhost',
            port: 6379,
        });
    }

    async set(key: string, value: string): Promise<void> {
        console.log(`Setting key ${key} with value ${value}`); // Log the set operation
        await this.client.set(key, value);
    }

    async get(key: string): Promise<string> {
        const value = await this.client.get(key);
        console.log(`Getting key ${key} with value ${value}`); // Log the get operation
        return await this.client.get(key);
    }
}

