import { Injectable } from "@nestjs/common";
import { Followers, User } from "./user.schema";
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class UserMapper {
    constructor(private authService: AuthService) {

    }
    dtoToModel(dto: any) {
        const salt = this.authService.generateRandom();
        return {
            fullname: dto.Fullname,
            email: dto.Email,
            password: this.authService.generateHash(dto.Password, salt),
            salt: salt,
        } as User
    }

    ModelToDTOs(models: any[], currentUserId: string) {
        return models.map(model => {
            return {
                UserId: model._id,
                Fullname: model.fullname,
                Email: model.email,
                IsLoggedInUser: model._id == currentUserId ? true : false,
                Followers: model.followers.map(f => {
                    return {
                        FollowerId: f._id,
                        UserId: f.user,
                        Email: f.email,
                    }
                })
            }
        })
    }
}