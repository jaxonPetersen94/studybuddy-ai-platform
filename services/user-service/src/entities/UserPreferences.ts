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

@Entity('user_preferences')
export class UserPreferences {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId!: string;

  @Column({ type: 'jsonb', nullable: true })
  appearance?: {
    themeMode?: 'light' | 'dark' | 'auto';
  };

  @Column({ type: 'varchar', nullable: true })
  timezone?: string;

  @Column({ type: 'varchar', nullable: true })
  location?: string;

  @Column({ name: 'learning_level', type: 'varchar', nullable: true })
  learningLevel?: 'beginner' | 'intermediate' | 'advanced';

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ name: 'study_goal', type: 'text', nullable: true })
  studyGoal?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @OneToOne(() => User, (user) => user.preferences)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
