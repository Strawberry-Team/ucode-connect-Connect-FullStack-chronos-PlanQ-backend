// src/event/entity/event.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    OneToOne
} from 'typeorm';
import {User} from '../../user/entity/user.entity';
import {EventTask} from '../../event-task/entity/event-task.entity';
import {EventParticipation} from '../../event-participation/entity/event-participation.entity';

export enum EventCategory {
    HOME = 'home',
    WORK = 'work'
}

export enum EventType {
    ARRANGEMENT = 'arrangement',
    REMINDER = 'reminder',
    TASK = 'task'
}

@Entity('events')
export class Event {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'creator_id'})
    creatorId: number;

    @Column({name: 'name', length: 100})
    name: string;

    @Column({type: 'tinytext', nullable: true})
    description?: string;

    @Column({
        type: 'enum',
        enum: EventCategory,
    })
    category: EventCategory;

    @Column({name: 'started_at', type: 'datetime'})
    startedAt: Date;

    @Column({name: 'ended_at', type: 'datetime'})
    endedAt: Date;

    @Column({
        type: 'enum',
        enum: EventType,
    })
    type: EventType;

    @CreateDateColumn({name: 'created_at', type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({name: 'updated_at', type: 'timestamp'})
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.events, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'creator_id'})
    creator: User;

    @OneToOne(() => EventTask, (eventTask) => eventTask.event, {
        cascade: true,
        onDelete: 'CASCADE',
    })
    task: EventTask;

    @OneToMany(() => EventParticipation, (participation) => participation.event, {
        cascade: true,
        onDelete: 'CASCADE',
    })
    participations: EventParticipation[];
}
