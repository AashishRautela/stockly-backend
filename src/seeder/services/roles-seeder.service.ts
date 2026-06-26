import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { AppError } from 'src/common/errors/app-error';

type RoleTemplate = {
  name: string;
  description: string;
  created_by: string;
  permissions: Record<string, string[]>;
};

@Injectable()
export class RolesSeederService {
  private readonly rolesFilePath = resolve(
    process.cwd(),
    'src',
    'seeder',
    'data',
    'roles.json',
  );

  getRoleTemplates(): RoleTemplate[] {
    try {
      const fileContent = readFileSync(this.rolesFilePath, 'utf-8');
      const templates = JSON.parse(fileContent) as RoleTemplate[];

      if (!Array.isArray(templates)) {
        throw new AppError('Invalid roles seed data', 500, [
          'roles.json must contain an array of role templates',
        ]);
      }

      return templates;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError('Unable to load roles seed data', 500, [
        'roles.json could not be read or parsed',
      ]);
    }
  }
}
