import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AppService {
  getHello(): string {
    return 'FABRIQUE API is running!';
  }

  getVersion(): string {
    try {
      const pkgPath = path.join(process.cwd(), 'package.json');
      const raw = fs.readFileSync(pkgPath, 'utf-8');
      const pkg = JSON.parse(raw);
      return pkg.version || '0.0.0';
    } catch {
      return '0.0.0';
    }
  }
}
