// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { EventsController } from './events.controller';
// import { EventsService } from './events.service';
// import { EventsRepository } from './events.repository';
// import { Event } from './entity/event.entity';
//
// @Module({
//     imports: [TypeOrmModule.forFeature([Event])],
//     controllers: [EventsController],
//     providers: [EventsService, EventsRepository],
//     exports: [EventsService, EventsRepository],
// })
// export class EventsModule {}