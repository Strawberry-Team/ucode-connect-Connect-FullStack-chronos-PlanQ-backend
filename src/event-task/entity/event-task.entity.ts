// src/event-task/entity/event-task.entity.ts
import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import {Event} from '../../event/entity/event.entity';
import {BooleanTransformer} from '../../common/transformers/BooleanTransformer';

export enum TaskPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high'
}

@Entity('event_tasks')
export class EventTask {
    @PrimaryColumn({name: 'event_id'})
    eventId: number;

    @Column({
        name: 'is_completed',
        type: 'bit',
        width: 1,
        default: () => "b'0'",
        transformer: BooleanTransformer(false)
    })
    isCompleted: boolean;

    @Column({
        type: 'enum',
        enum: TaskPriority,
        nullable: true //TODO: remove nullable
    })
    priority?: TaskPriority;

    @CreateDateColumn({name: 'created_at', type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({name: 'updated_at', type: 'timestamp'})
    updatedAt: Date;

    @OneToOne(() => Event, (event) => event.task, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'event_id'})
    event: Event;
}
