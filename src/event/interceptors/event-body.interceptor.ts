// src/event/interceptors/event-body.interceptor.ts
import {Injectable, NestInterceptor, ExecutionContext, CallHandler} from '@nestjs/common';
import {Observable} from 'rxjs';
import {plainToInstance} from 'class-transformer';
import {CreateEventContainerDto} from '../dto/container/create-event-container.dto';
import {UpdateEventContainerDto} from '../dto/container/update-event-container.dto';
import {EventsService} from '../events.service';

@Injectable()
export class EventBodyInterceptor implements NestInterceptor {
    constructor(private readonly eventsService: EventsService) {
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const body = request.body;
        const method = request.method;
        const userId = request.user?.userId;

        // Для POST запросов (создание)
        if (method === 'POST' && body && body.type) {
            const containerData = {
                type: body.type,
                data: {...body}
            };

            request.body = plainToInstance(CreateEventContainerDto, containerData, {
                excludeExtraneousValues: false
            });
        }
        // Для PATCH запросов (обновление)
        else if (method === 'PATCH' && body) {
            // Получаем ID события из URL параметров
            const eventId = request.params.id;

            if (eventId && userId) {
                // Получаем существующее событие из базы данных
                const event = await this.eventsService.getEventById(Number(eventId));

                // Создаем контейнер с типом из существующего события
                const containerData = {
                    type: event.type, // Используем тип из базы данных
                    data: {...body}
                };

                request.body = plainToInstance(UpdateEventContainerDto, containerData, {
                    excludeExtraneousValues: false
                });
            }
        }

        return next.handle();
    }
}