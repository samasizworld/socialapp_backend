import { BadRequestException, ConflictException, Controller, Get, NotFoundException, Patch, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import { UserService } from "./user.service";
import { Request, Response } from "express";
import { UserMapper } from "./user.mapper";
import { AuthService } from "src/auth/auth.service";
import { Types } from "mongoose";

@Controller('api/v1/users')
export class UserController {
    constructor(private readonly userService: UserService, private readonly userMapper: UserMapper, private authService: AuthService) { }

    @Post('/register')
    async registerUser(@Req() req: Request, @Res() res: Response) {
        const body = req.body;
        const user = this.userMapper.dtoToModel(body);
        const checkUser = await this.userService.checkUserByEmail(user.email);
        if (checkUser) {
            throw new ConflictException('User already exists');
        }
        if (!user.fullname) {
            throw new BadRequestException('Fullname is empty');
        }
        const userCreated = await this.userService.createUser(user);
        return res.status(201).send({ _id: userCreated._id });

    }

    @Post('/login')
    async login(@Req() req: Request, @Res() res: Response) {
        const { Email, Password } = req.body;
        const user = await this.userService.checkUserByEmail(Email);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const hashPassword = this.authService.generateHash(Password, user.salt);
        if (hashPassword != user.password) {
            throw new UnauthorizedException('Password doesnt match.');
        }

        const accessToken = this.authService.generateAccessToken({ _id: user._id });
        const refreshToken = this.authService.generateRefreshToken({ _id: user._id });
        await this.userService.updateRefreshToken(refreshToken, user._id);

        return res.status(200).send({ accessToken, refreshToken, email: user.email });
    }

    @Post('/refresh')
    async regenerateAccessToken(@Req() req: Request, @Res() res: Response) {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new UnauthorizedException('Bad Request');
        }
        let decodedToken: any;
        try {
            decodedToken = this.authService.verifyRefreshToken(refreshToken);
        }
        catch (error) {
            throw new UnauthorizedException(error);
        }
        const user = await this.userService.getUser(decodedToken._id);
        if (!user) {
            throw new UnauthorizedException('Refresh token not found.');
        }

        // check db refrehtoken and frontend sent are okay
        if (user.refreshtoken != refreshToken) {
            throw new UnauthorizedException('Refresh token doesnt match.');
        }

        const accessToken = this.authService.generateAccessToken({ _id: user._id });
        const newRefreshToken = this.authService.generateRefreshToken({ _id: user._id });

        await this.userService.updateRefreshToken(newRefreshToken, user._id);

        return res.status(200).send({ accessToken, refreshToken: newRefreshToken, email: user.email });

    }

    @Get('')
    async getUsers(@Req() req: Request, @Res() res: Response) {
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 20;
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const offset = pageSize * (page - 1);
        const orderBy = req.query.orderBy ? req.query.orderBy : 'title';
        const orderDir = req.query.orderDir == 'asc' ? 1 : -1;
        const search = req.query.search ? req.query.search as string : '';
        const currentUserId = req['UserId'];
        // const filterOptions = { userId: currentUserId };
        const users = await this.userService.getUsers(search, pageSize, offset, orderDir, orderBy, undefined);
        const dtos = this.userMapper.ModelToDTOs(users.data, currentUserId);
        res.setHeader('x-count', users.count);
        return res.status(200).send(dtos);
    }

    @Post('/:userid/followers')
    async addFollowers(@Req() req: Request, @Res() res: Response) {
        const userId = req.params.userid;
        const { data } = await this.userService.getUsers('', 0, 0, 1, 'email', undefined);

        const { Followers } = req.body;
        if (Array.isArray(Followers) == false) {
            throw new BadRequestException('Invalid Request')
        }

        const user = await this.userService.getUser(userId);
        const followers = Followers.map((f: any) => {
            const email = data.find(u => u._id == f);
            return {
                user: email ? email._id.toString() : '',
                email: email ? email.email : ''
            };
        });

        const userFollowers = user.followers.map(f2 => f2.user.toString());
        const filteredFollowers = followers.filter(f1 => !userFollowers.includes(f1.user));
        user.followers.push(...filteredFollowers)
        await user.save();
        return res.status(200).send();
    }

    @Post('/:userid/followers/:followerid')
    async deleteFollowers(@Req() req: Request, @Res() res: Response) {
        const userId = req.params.userid;
        const followerId = req.params.followerid;
        const user = await this.userService.getUser(userId);

        const index = user.followers.findIndex((f: any) => f._id == followerId);
        if (index === -1) {
            throw new NotFoundException('Follower not found.');
        }
        user.followers.splice(index, 1);
        await user.save();
        return res.status(204).send();
    }

    @Get('/:userid/notifications')
    async getNotifications(@Req() req: Request, @Res() res: Response) {
        const userId = req.params.userid;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 20;
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const offset = pageSize * (page - 1);
        const search = req.query.search ? req.query.search as string : '';
        const filterOptions = {
            pageSize, offset, search
        }
        const user = await this.userService.getUserWithNotification(userId, filterOptions);
        const notifications = user.notifications?.map((n: any) => {
            return {
                NotificationId: n._id,
                Text: n.text,
                Datemodified: new Date(n.updatedAt).toLocaleString()
            }
        })
        return res.status(200).send(notifications);
    }
}