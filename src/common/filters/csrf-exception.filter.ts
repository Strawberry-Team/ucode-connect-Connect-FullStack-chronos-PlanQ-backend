import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class CsrfExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        // Проверяем, является ли ошибка CSRF ошибкой
        if (exception && exception.code === 'EBADCSRFTOKEN') {
            // Отправляем ошибку клиенту без логирования в консоль
            return response.status(HttpStatus.FORBIDDEN).json({
                statusCode: HttpStatus.FORBIDDEN,
                message: 'Invalid CSRF token',
                path: request.url,
            });
        }

        // Если это не CSRF ошибка, пропускаем её дальше для стандартной обработки
        throw exception;
    }
}