import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Event } from "./event.schema";

@Injectable()
export class EventService {
    constructor(@InjectModel(Event.name) private eventModel: Model<Event>) { }

    async getEvents(search: string, pageSize: number, offset: number, orderDir: any, orderBy: any, filterOptions: Record<string, any>) {
        let searchQuery = {};
        let result: { data?: any[], count?: number } = {};
        if (search) {
            searchQuery = {
                $or: [
                    { title: { $regex: search, $options: 'i' } }
                ]
            }
        }
        if (filterOptions.date) {
            searchQuery = {
                ...searchQuery, datetime: filterOptions.date
            }
        }
        if (filterOptions.category) {
            searchQuery = {
                ...searchQuery, category: filterOptions.category
            }
        }

        if (Array.isArray(filterOptions.userId)) {
            searchQuery = {
                ...searchQuery, userId: { $in: filterOptions.userId }
            }
        }
        if (pageSize == 0) {
            result.data = await this.eventModel.find(searchQuery).sort({ [orderBy]: orderDir });
        } else {
            result.data = await this.eventModel.find(searchQuery).sort({ [orderBy]: orderDir }).skip(offset).limit(pageSize);
        }
        result.count = await this.eventModel.countDocuments(searchQuery);

        return result;
    }

    async getEvent(_id: string) {
        return await this.eventModel.findById(_id);
    }

    async createEvent(model: Event) {
        return await this.eventModel.create(model);
    }

    async updateEvent(model: Event, _id: string) {
        return await this.eventModel.updateOne({ _id }, { ...model });
    }

    async deleteEvent(_id: string) {
        await this.eventModel.deleteOne({ _id });
    }
}