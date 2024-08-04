import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class Followers {
    @Prop({ type: Types.ObjectId, ref: 'User' })
    user: Types.ObjectId

    @Prop()
    email: string;
}

@Schema({ timestamps: true })
export class Notifications {

    @Prop({ type: String })
    text: string;
}

@Schema({ collection: "users", timestamps: true })
export class User {
    @Prop({ required: true, type: String })
    fullname: string;

    @Prop({ required: true, unique: true, type: String })
    email: string;

    @Prop({ required: true, type: String })
    password: string;

    @Prop({ type: String })
    salt: string;

    @Prop({ type: String })
    refreshtoken: string;

    @Prop({ type: [Followers], default: [] })
    followers: Followers[];

    @Prop({ type: [Notifications], default: [] })
    notifications: Notifications[];
}

export const UserSchema = SchemaFactory.createForClass(User);
