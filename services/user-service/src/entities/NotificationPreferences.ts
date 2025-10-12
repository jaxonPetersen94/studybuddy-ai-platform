import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity('notification_preferences')
export class NotificationPreferences {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // Delivery channels
  @Column({ name: 'email_enabled', type: 'boolean', default: true })
  emailEnabled!: boolean;

  @Column({ name: 'push_enabled', type: 'boolean', default: true })
  pushEnabled!: boolean;

  @Column({ name: 'in_app_enabled', type: 'boolean', default: true })
  inAppEnabled!: boolean;

  // Category-specific settings
  @Column({ name: 'chat_notifications', type: 'boolean', default: true })
  chatNotifications!: boolean;

  @Column({ name: 'study_notifications', type: 'boolean', default: true })
  studyNotifications!: boolean;

  @Column({ name: 'assignment_notifications', type: 'boolean', default: true })
  assignmentNotifications!: boolean;

  @Column({ name: 'quiz_notifications', type: 'boolean', default: true })
  quizNotifications!: boolean;

  @Column({ name: 'achievement_notifications', type: 'boolean', default: true })
  achievementNotifications!: boolean;

  @Column({ name: 'reminder_notifications', type: 'boolean', default: true })
  reminderNotifications!: boolean;

  @Column({ name: 'system_notifications', type: 'boolean', default: true })
  systemNotifications!: boolean;

  @Column({ name: 'social_notifications', type: 'boolean', default: true })
  socialNotifications!: boolean;

  @Column({ name: 'updates_notifications', type: 'boolean', default: true })
  updatesNotifications!: boolean;

  // Quiet hours
  @Column({ name: 'quiet_hours_enabled', type: 'boolean', default: false })
  quietHoursEnabled!: boolean;

  @Column({
    name: 'quiet_hours_start',
    type: 'varchar',
    length: 5,
    nullable: true,
  })
  quietHoursStart?: string; // HH:MM format

  @Column({
    name: 'quiet_hours_end',
    type: 'varchar',
    length: 5,
    nullable: true,
  })
  quietHoursEnd?: string; // HH:MM format

  // Digest settings
  @Column({ name: 'digest_enabled', type: 'boolean', default: false })
  digestEnabled!: boolean;

  @Column({
    name: 'digest_frequency',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  digestFrequency?: 'daily' | 'weekly' | 'monthly';

  @Column({ name: 'digest_time', type: 'varchar', length: 5, nullable: true })
  digestTime?: string; // HH:MM format

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
