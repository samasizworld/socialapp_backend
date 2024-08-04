import { ConflictException, Controller, Delete, Get, NotFoundException, Post, Put, Req, Res } from "@nestjs/common";
import { EventService } from "./event.service";
import { Request, Response } from "express";
import { EventMapper } from "./event.mapper";
import { UserService } from "src/user/user.service";

@Controller('/api/v1/events')
export class EventController {
    constructor(private eventService: EventService, private eventMapper: EventMapper, private userService: UserService) { }

    @Get('')
    async getEvents(@Req() req: Request, @Res() res: Response) {
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 20;
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const offset = pageSize * (page - 1);
        const orderBy = req.query.orderBy ? req.query.orderBy : 'title';
        const orderDir = req.query.orderDir == 'asc' ? 1 : -1;
        const search = req.query.search ? req.query.search as string : '';
        const date = req.query.date;
        const category = req.query.category;
        const currentUserId = req['UserId'];
        const currentUser = await this.userService.getUser(currentUserId);
        const followerIds = currentUser.followers.map(f => f.user.toString());
        followerIds.push(currentUserId);
        const filterOptions = { date, category, userId: followerIds };
        const events = await this.eventService.getEvents(search, pageSize, offset, orderDir, orderBy, filterOptions);
        const { data } = await this.userService.getUsers('', 0, 0, 1, 'email', undefined);
        const dtos = this.eventMapper.ModelToDTOs(events.data, data);
        res.setHeader('x-count', events.count);
        return res.status(200).send(dtos);
    }


    @Get('/:eventid')
    async getEvent(@Req() req: Request, @Res() res: Response) {
        const eventId = req.params.eventid;
        const event: any = await this.eventService.getEvent(eventId);
        const dtos = this.eventMapper.ModelToDTO(event);
        return res.status(200).send(dtos);
    }

    @Post('')
    async addEvent(@Req() req: Request, @Res() res: Response) {
        const currentUserId = req['UserId'];
        const model: any = this.eventMapper.DTOtoModel(req.body);
        const event = await this.eventService.createEvent({ ...model, userId: currentUserId });
        return res.status(201).send({ _id: event._id });
    }

    @Put('/:eventid')
    async updateEvent(@Req() req: Request, @Res() res: Response) {
        const currentUserId = req['UserId'];
        const eventId = req.params.eventid;
        const model: any = this.eventMapper.DTOtoModel(req.body);
        await this.eventService.updateEvent({ ...model, userId: currentUserId }, eventId);

        const user = await this.userService.getUser(eventId);
        user.notifications.unshift({ text: `The event has been updated by ${req['email']}` });
        await user.save();
        return res.status(204).send();
    }

    @Delete('/:eventid')
    async deleteEvent(@Req() req: Request, @Res() res: Response) {
        const eventId = req.params.eventid;
        await this.eventService.deleteEvent(eventId);
        return res.status(204).send();
    }

    @Put('/:eventid/likes')
    async eventLikes(@Req() req: Request, @Res() res: Response) {
        const eventId = req.params.eventid;
        const currentUserId = req['UserId'];
        const event = await this.eventService.getEvent(eventId);
        if (event.likes.filter(like => like.user === currentUserId).length > 0) {
            throw new ConflictException('Event already liked.')
        }
        event.likes.unshift({ user: currentUserId });
        await event.save();

        const user = await this.userService.getUser(event.userId);
        user.notifications.unshift({ text: `The Event ${event.title} has been liked by ${req['email']}` });
        await user.save();
        return res.status(204).send();
    }

    @Put('/:eventid/dislikes')
    async eventDisLikes(@Req() req: Request, @Res() res: Response) {
        const eventId = req.params.eventid;
        const currentUserId = req['UserId'];
        const event = await this.eventService.getEvent(eventId);

        const index = event.likes.findIndex(like => like.user == currentUserId);
        console.log(index)
        if (index === -1) {
            throw new ConflictException('Event already disliked.')
        }
        event.likes.splice(index, 1);
        await event.save();
        const user = await this.userService.getUser(event.userId);
        user.notifications.unshift({ text: `The Event ${event.title} has been disliked by ${req['email']}` });
        await user.save();
        return res.status(204).send();
    }

    @Post('/:eventid/comment')
    async addComment(@Req() req: Request, @Res() res: Response) {
        const eventId = req.params.eventid;
        const { Text } = req.body;
        const currentUserId = req['UserId'];
        const event = await this.eventService.getEvent(eventId);

        const newComments: any = {
            text: Text,
            user: currentUserId
        }
        event.comments.unshift(newComments);
        await event.save();
        const user = await this.userService.getUser(event.userId);
        user.notifications.unshift({ text: `The new comment has been added in the event ${event.title} by ${req['email']}` });
        await user.save();
        return res.status(204).send();
    }

    @Put('/:eventid/comment/:commentid')
    async updateComment(@Req() req: Request, @Res() res: Response) {
        const eventId = req.params.eventid;
        const commentId = req.params.commentid;
        const { Text } = req.body;
        const event = await this.eventService.getEvent(eventId);
        const index = event.comments.findIndex((c: any) => c._id == commentId);
        if (index === -1) {
            throw new NotFoundException('Comment not found.');
        }
        event.comments.forEach((comment: any) => {
            if (comment._id == commentId) {
                comment.text = Text
            }
        })
        await event.save();
        const user = await this.userService.getUser(event.userId);
        user.notifications.unshift({ text: `The comment in the event ${event.title} has been updated by ${req['email']}` });
        await user.save();
        return res.status(204).send();
    }

    @Delete('/:eventid/comment/:commentid')
    async deleteComment(@Req() req: Request, @Res() res: Response) {
        const eventId = req.params.eventid;
        const commentId = req.params.commentid;
        const event = await this.eventService.getEvent(eventId);
        const index = event.comments.findIndex((c: any) => c._id == commentId);
        if (index === -1) {
            throw new NotFoundException('Comment not found.');
        }
        event.comments.splice(index, 1);
        await event.save();
        const user = await this.userService.getUser(event.userId);
        user.notifications.unshift({ text: `The comment in the event ${event.title} has been deleted by ${req['email']}` });
        await user.save();
        return res.status(204).send();
    }

}