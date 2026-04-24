import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { PageRating } from '../common/enums';

export class EvaluateDto {
  @IsInt()
  pageNumber!: number;

  @IsEnum(PageRating)
  rating!: PageRating;

  @IsOptional()
  @IsString()
  note?: string;
}
