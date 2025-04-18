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

        if (method === 'POST' && body && body.type) {
            const containerData = {
                type: body.type,
                data: body.data ? {...body.data} : {...body},
            };

            request.body = plainToInstance(CreateEventContainerDto, containerData, {
                excludeExtraneousValues: false,
            });

        }
        else if (method === 'PATCH' && body) {
            const eventId = request.params.id;

            if (eventId && userId) {
                const event = await this.eventsService.getEventById(Number(eventId));

                const containerData = {
                    type: event.type,
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