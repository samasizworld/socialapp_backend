import { Injectable, NestMiddleware, Next, Req, Res, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserService } from "src/user/user.service";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
    constructor(private readonly authService: AuthService, private readonly userService: UserService) { }

    async use(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {

        const token = req.headers.authorization?.split(' ')[1];
        let decodedToken: { _id: string, iat: number, eat: number };
        if (token) {
            // authentication part
            decodedToken = this.authService.verifyAccessToken(token);
            if (decodedToken) {
                req['UserId'] = decodedToken._id
            } else {
                throw new UnauthorizedException('Token expires. Please try again');
            }
        } else {
            throw new UnauthorizedException('Token is not provided');
        }
        const user = await this.userService.getUser(decodedToken._id);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        req['email'] = user.email;
        next();
    }
}