import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { WarehouseStatus } from '../../../generated/prisma/enums';
import { CreateWarehouseDto } from './create-warehouse.dto';

export class UpdateWarehouseDto extends PartialType(CreateWarehouseDto) {
  @IsOptional()
  @IsEnum(WarehouseStatus)
  status?: WarehouseStatus;
}
