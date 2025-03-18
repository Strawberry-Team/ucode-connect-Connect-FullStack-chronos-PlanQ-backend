import {Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne} from 'typeorm';
import {User} from '../../user/entity/user.entity';

@Entity('refresh_token_nonces')
export class RefreshTokenNonce {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'user_id'})
    userId: number;

    @ManyToOne(() => User, (user) => user.refreshTokenNonces, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'user_id'})
    user: User;

    @Column({name: 'nonce', length: 64})
    nonce: string;

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at'})
    createdAt: Date;
}
