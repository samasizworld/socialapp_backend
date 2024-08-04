import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./user.schema";
import { Model } from "mongoose";

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {
    }

    async createUser(model: User) {
        return await this.userModel.create(model);
    }

    async updateRefreshToken(refreshToken: string, id: any) {
        return await this.userModel.updateOne({ _id: id }, { refreshtoken: refreshToken })
    }

    async getUser(_id: string) {
        return await this.userModel.findById(_id);
    }

    async getUserWithNotification(_id: string, filterOptions) {
        let searchQuery = {};
        if (filterOptions.search) {
            searchQuery = {
                $or: [
                    { text: { $regex: filterOptions.search, $options: 'i' } },
                ]
            }
        }
        if (filterOptions.pageSize == 0) {
            return await this.userModel.findOne({ _id });
        } else {
            return await this.userModel.findOne({ _id }).select({
                notifications: { $slice: [filterOptions.offset, filterOptions.pageSize] }
            }).exec();
        }

    }

    async checkUserByEmail(email: string) {
        return await this.userModel.findOne({ email });
    }

    async getUsers(search: string, pageSize: number, offset: number, orderDir: any, orderBy: any, filterOptions: Record<string, any>) {
        let searchQuery = {};
        let result: { data?: any[], count?: number } = {};
        if (search) {
            searchQuery = {
                $or: [
                    { fullname: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }
        }
        // if (filterOptions.email) {
        //     searchQuery = {
        //         ...searchQuery, email: filterOptions.email
        //     }
        // }
        // if (filterOptions.fullname) {
        //     searchQuery = {
        //         ...searchQuery, fullname: filterOptions.fullname
        //     }
        // }

        // if (filterOptions?.userId) {
        //     searchQuery = {
        //         ...searchQuery, _id: { $ne: filterOptions.userId }
        //     }
        // }
        if (pageSize == 0) {
            result.data = await this.userModel.find(searchQuery).sort({ [orderBy]: orderDir });
        } else {
            result.data = await this.userModel.find(searchQuery).sort({ [orderBy]: orderDir }).skip(offset).limit(pageSize);
        }
        result.count = await this.userModel.countDocuments(searchQuery);

        return result;
    }

}