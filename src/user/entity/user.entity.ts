import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany
} from 'typeorm';
import {RefreshToken} from 'src/token/entities/refresh-token.entity';
import { Expose } from 'class-transformer';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    @Expose({ groups: ['basic', 'confidential'] })
    id: number;

    @Column({length: 255})
    @Expose({ groups: ['confidential'] })
    password?: string;

    @Column({name: 'first_name', length: 100})
    @Expose({ groups: ['basic', 'confidential'] })
    firstName: string;

    @Column({name: 'last_name', length: 100, nullable: true})
    @Expose({ groups: ['basic', 'confidential'] })
    lastName?: string | null;

    @Column({unique: true, length: 255})
    @Expose({ groups: ['basic', 'confidential'] })
    email: string;

    @Column({
        name: 'profile_picture_name',
        length: 255,
        default: 'default-avatar.png',
    })
    @Expose({ groups: ['basic', 'confidential'] })
    profilePictureName: string;

    @Column({name: 'email_verified', type: 'bit', width: 1, default: () => "b'0'"})
    @Expose({ groups: ['confidential'] })
    emailVerified?: boolean;

    @Column({name: 'country_code', type: 'char', length: 2})
    @Expose({ groups: ['basic', 'confidential'] })
    countryCode: string;

    @CreateDateColumn({name: 'created_at', type: 'timestamp'})
    @Expose({ groups: ['basic', 'confidential'] })
    createdAt: Date;

    @UpdateDateColumn({name: 'updated_at', type: 'timestamp'})
    @Expose({ groups: ['basic', 'confidential'] })
    updatedAt: Date;

    @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, {
        cascade: true,
    })
    @Expose({ groups: ['confidential'] })
    refreshTokens: Promise<RefreshToken[]>;
}
