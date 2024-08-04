import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { User } from "src/user/user.schema";

@Schema()
export class Like {
    @Prop({ type: Types.ObjectId, ref: User.name })
    user: Types.ObjectId;
}

@Schema({ timestamps: true })
export class Comment {
    @Prop({ type: Types.ObjectId, ref: User.name })
    user: Types.ObjectId;

    @Prop({ required: true })
    text: string;

    // @Prop({ type: [Like], default: [] })
    // commentlikes: Like[];

}



@Schema({ collection: "events", timestamps: true })
export class Event {
    @Prop({ required: true, type: String })
    title: string;
    @Prop({ type: String })
    description: string;
    @Prop({ type: Date })
    datetime: Date;
    @Prop({ type: String })
    location: string;
    @Prop({ type: String })
    image: string;
    @Prop({ type: String })
    category: string;
    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    userId: string;

    @Prop({ type: [Like], default: [] })
    likes: Like[];

    @Prop({ type: [Comment], default: [] })
    comments: Comment[];
}


export const EventSchema = SchemaFactory.createForClass(Event)