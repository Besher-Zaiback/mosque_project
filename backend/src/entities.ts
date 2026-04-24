import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ExamRequestStatus, PageRating, UserRole } from './common/enums';

@Entity()
export class Circle {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ type: 'int', default: 1 })
  levelOrder!: number;

  @Column({ type: 'int', default: 1 })
  startPage!: number;

  @Column({ type: 'int', default: 20 })
  endPage!: number;

  @ManyToOne(() => User, (user) => user.supervisedCircles, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'supervisorId' })
  supervisor!: User | null;

  @ManyToOne(() => Mosque, (mosque) => mosque.circles, {
    nullable: true,
    eager: true,
  })
  mosque!: Mosque | null;

  @OneToMany(() => User, (user) => user.circle)
  users!: User[];
}

@Entity()
export class Mosque {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @OneToMany(() => Circle, (circle) => circle.mosque)
  circles!: Circle[];

  @OneToMany(() => User, (user) => user.mosque)
  users!: User[];
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  fullName!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole;

  @ManyToOne(() => Circle, (circle) => circle.users, { nullable: true })
  circle!: Circle | null;

  @ManyToOne(() => Mosque, (mosque) => mosque.users, {
    nullable: true,
    eager: true,
  })
  mosque!: Mosque | null;

  @OneToMany(() => Circle, (circle) => circle.supervisor)
  supervisedCircles!: Circle[];

  // For parent account: linked child student id.
  @Column({ type: 'int', nullable: true })
  linkedStudentId!: number | null;

  // Student current memorization page.
  @Column({ type: 'int', nullable: true })
  currentPage!: number | null;
}

@Entity()
export class PageEvaluation {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { eager: true })
  student!: User;

  @ManyToOne(() => User, { eager: true })
  evaluator!: User;

  @Column()
  pageNumber!: number;

  @Column({ type: 'enum', enum: PageRating })
  rating!: PageRating;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}

@Entity()
export class ExamRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { eager: true })
  student!: User;

  @ManyToOne(() => User, { eager: true })
  requestedByManager!: User;

  @Column({
    type: 'enum',
    enum: ExamRequestStatus,
    default: ExamRequestStatus.PENDING,
  })
  status!: ExamRequestStatus;

  @CreateDateColumn()
  createdAt!: Date;
}

@Entity()
export class ExamResult {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { eager: true })
  student!: User;

  @ManyToOne(() => User, { eager: true })
  reviewedByGeneralManager!: User;

  @Column()
  score!: number;

  @Column()
  passed!: boolean;
}
