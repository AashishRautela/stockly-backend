import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsString()
  sku!: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  cost_price!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  sell_price!: number;

  @IsOptional()
  @IsNumber()
  reorder_level?: number;
}
