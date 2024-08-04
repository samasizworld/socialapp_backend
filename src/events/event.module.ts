import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EventSchema } from "./event.schema";
import { EventService } from "./event.service";
import { EventController } from "./event.controller";
import { EventMapper } from "./event.mapper";
import { UserModule } from "src/user/user.module";

@Module({
    imports: [MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]), UserModule],
    providers: [EventService, EventMapper],
    controllers: [EventController],
    exports: [MongooseModule]
})
export class EventModule {

}