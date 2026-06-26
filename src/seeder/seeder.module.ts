import { Module } from '@nestjs/common';
import { RolesSeederService } from './services/roles-seeder.service';

@Module({
  providers: [RolesSeederService],
  exports: [RolesSeederService],
})
export class SeederModule {}
