export type Role =
  | "SUPERVISOR"
  | "MOSQUE_MANAGER"
  | "GENERAL_MANAGER"
  | "PARENT"
  | "STUDENT";

export type Mosque = { id: number; name: string };

export type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  mosque?: Mosque | null;
};

export type ManagedAccount = {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  mosque?: Mosque | null;
  circle?: Circle | null;
  linkedStudentId?: number | null;
  currentPage?: number | null;
};

export type Circle = {
  id: number;
  name: string;
  levelOrder: number;
  startPage: number;
  endPage: number;
  studentsCount?: number;
  supervisor?: { id: number; fullName: string } | null;
  mosque?: Mosque | null;
};

export type Student = {
  id: number;
  fullName: string;
  email?: string;
  currentPage?: number;
  remainingPages?: number;
  progressPercent?: number;
  circle?: Circle | null;
  mosque?: Mosque | null;
};

export type Evaluation = {
  id?: number;
  pageNumber: number;
  rating: string;
  note?: string | null;
  createdAt?: string;
  evaluator?: { fullName: string } | null;
};

export type StudentOverview = {
  student: Student;
  evaluations: Evaluation[];
  lastExam?: { score: number; passed: boolean } | null;
};
