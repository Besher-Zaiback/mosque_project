import { IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';

export class CreateMosqueDto {
  @IsNotEmpty()
  name!: string;
}

export class ExamScoreDto {
  @IsInt()
  @Min(0)
  @Max(100)
  score!: number;

  @IsOptional()
  @IsInt()
  nextCircleId?: number;
}
