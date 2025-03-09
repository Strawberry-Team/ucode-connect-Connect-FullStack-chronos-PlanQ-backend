import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    password: string;

    @Column({ name: 'first_name', length: 100 })
    firstName: string;

    @Column({ name: 'last_name', length: 100, nullable: true })
    lastName?: string;

    @Column({ unique: true, length: 255 })
    email: string;

    @Column({
        name: 'profile_picture_name',
        length: 255,
        default: 'default-avatar.png',
    })
    profilePictureName: string;

    @Column({ name: 'email_verified', type: 'tinyint', default: 0 })
    emailVerified: number; // 0 или 1

    @Column({ name: 'country_code', type: 'char', length: 2 })
    countryCode: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;
}
