import {
  IsString,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateProfilDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  nama: string;

  @IsInt()
  @Min(18)
  @Max(100)
  usia: number;

  @IsString()
  @MinLength(2)
  lokasi: string;

  @IsString()
  @MinLength(2)
  hobi: string;

  @IsString()
  @MinLength(10)
  @MaxLength(300)
  bio: string;
}
