import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class AppService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  getHello() {
    return {
      message: 'SPEED backend is running',
      timestamp: new Date().toISOString(),
    };
  }

  getHealth() {
    const statusMap: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        state: statusMap[this.connection.readyState] ?? 'unknown',
        host: this.connection.host,
        name: this.connection.name,
      },
    };
  }
}

