import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash } from "crypto";
import { sign, verify } from 'jsonwebtoken';

@Injectable()
export class AuthService {
    constructor(private config: ConfigService) {
    }

    generateRandom() {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&*';
        const charactersLength = characters.length;
        for (let i = 0; i < charactersLength; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    generateHash(password: string, salt: string) {
        let updatedPassword = password + salt;
        return createHash('sha256').update(updatedPassword).digest('hex');
    }



    generateAccessToken(payload: any): string {
        // algorithm is HS256
        // expires in 1min
        return sign(payload, this.config.get('JWT_KEY_ACCESS'), { expiresIn: 60 * 60 });
    }

    verifyAccessToken(token: string): any {
        try {
            return verify(token, this.config.get('JWT_KEY_ACCESS'));
        } catch (error) {
            return null;
        }
    }

    generateRefreshToken(payload: any): string {
        // algorithm is HS256
        // expires in 1min
        return sign(payload, this.config.get('JWT_KEY_REFRESH'), { expiresIn: '7d' });
    }

    verifyRefreshToken(token: string): any {
        try {
            return verify(token, this.config.get('JWT_KEY_REFRESH'));
        } catch (error) {
            return null;
        }
    }
}