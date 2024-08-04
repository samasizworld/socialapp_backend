import { Injectable } from "@nestjs/common";

@Injectable()
export class EventMapper {
    ModelToDTOs(models: any[], users: any[]) {
        return models.map(model => {
            const email = users.find(u => u._id == model.userId)
            return {
                EventId: model._id,
                Title: model.title,
                Category: model.category,
                Createdby: email?.email
            }
        })
    }
    ModelToDTO(model) {
        return {
            EventId: model._id,
            Title: model.title,
            Description: model.description,
            Datetime: new Date(model.datetime).toLocaleString(),
            UserId: model.userId,
            Location: model.location,
            Category: model.category,
            Image: model.image,
            LikesCount: model.likes.length,
            Likes: model.likes.map(l => {
                return {
                    Likeid: l._id,
                    UserId: l.user
                }
            }),
            Comments: model.comments.map(c => {
                return {
                    CommentId: c._id,
                    UserId: c.user,
                    Text: c.text,
                    Datemodified: new Date(c.updatedAt).toLocaleString()
                }
            })
        }
    }

    DTOtoModel(dto: any) {
        return {
            title: dto.Title,
            description: dto.Description,
            image: dto.Image,
            location: dto.Location,
            category: dto.Category,
            datetime: dto.Datetime
        }
    }
}