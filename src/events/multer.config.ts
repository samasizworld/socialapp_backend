import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Request } from 'express';
import { BadRequestException } from '@nestjs/common';

const uploadDir = './dist/uploads';
console.log(uploadDir)
if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
}

const imageFileFilter = (req: Request, file, callback) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return callback(new BadRequestException('Only image files are allowed!'), false);
    }
    callback(null, true);
};

export const storage = diskStorage({
    destination: uploadDir,
    filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        callback(null, `${file.originalname}-${uniqueSuffix}${ext}`);
    },
});

export const multerOptions = {
    storage,
    fileFilter: imageFileFilter,
};
