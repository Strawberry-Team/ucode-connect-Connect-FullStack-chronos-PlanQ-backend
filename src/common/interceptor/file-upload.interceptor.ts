// src/common/interceptor/file-upload.interceptor.ts
import {BadRequestException} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {diskStorage} from 'multer';
import {extname} from 'path';
import {v4 as uuidv4} from 'uuid';

export interface FileUploadOptions {
    destination: string;
    allowedTypes?: RegExp;
    maxSize?: number;
}

export function createFileUploadInterceptor(options: FileUploadOptions) {
    const interceptorOptions: any = {
        storage: diskStorage({
            destination: options.destination,
            filename: (req, file, callback) => {
                const fileName = `${uuidv4()}${extname(file.originalname)}`;
                callback(null, fileName);
            },
        }),
    };

    if (options.allowedTypes) {
        interceptorOptions.fileFilter = (req, file, callback) => {
            if (!file.mimetype.match(options.allowedTypes)) {
                return callback(
                    new BadRequestException('Only allowed file types are accepted!'),
                    false,
                );
            }
            callback(null, true);
        };
    }

    if (options.maxSize) {
        interceptorOptions.limits = {
            fileSize: options.maxSize
        };
    }

    return FileInterceptor('file', interceptorOptions);
}