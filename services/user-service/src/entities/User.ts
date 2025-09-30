import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RefreshToken } from './RefreshToken';
import { PasswordReset } from './PasswordReset';
import { Notification } from './Notification';
import { NotificationPreferences } from './NotificationPreferences';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar', nullable: true })
  password?: string;

  @Column({ name: 'first_name', type: 'varchar', nullable: false })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', nullable: false })
  lastName!: string;

  @Column({ name: 'profile_picture', type: 'varchar', nullable: true })
  profilePicture?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'role', type: 'varchar', default: 'user' })
  role!: string;

  @Column({ name: 'permissions', type: 'simple-array', nullable: true })
  permissions?: string[];

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ name: 'google_id', type: 'varchar', nullable: true })
  googleId?: string;

  @Column({ name: 'github_id', type: 'varchar', nullable: true })
  githubId?: string;

  @Column({ name: 'auth_provider', type: 'varchar', default: 'email' })
  authProvider!: string;

  @Column({ name: 'first_login', type: 'boolean', default: true })
  firstLogin!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens!: RefreshToken[];

  @OneToMany(() => PasswordReset, (passwordReset) => passwordReset.user)
  passwordResets!: PasswordReset[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications!: Notification[];

  @OneToMany(() => NotificationPreferences, (preferences) => preferences.user)
  notificationPreferences!: NotificationPreferences[];

  // Virtual fields
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  // Methods
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}
