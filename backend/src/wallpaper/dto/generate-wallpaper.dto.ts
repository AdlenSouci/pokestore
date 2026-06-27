import { IsInt, Min } from 'class-validator';

export class GenerateWallpaperDto {
  @IsInt()
  @Min(1)
  cardId: number;
}
