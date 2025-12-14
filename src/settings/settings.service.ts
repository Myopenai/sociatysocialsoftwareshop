import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export interface FabrikageConfig {
  watch: { basePath: string; ignored: string[] };
  mirror: { basePath: string; mode: 'stage-then-promote' | 'read-only' };
  pipeline: {
    buildCommand: string;
    testCommand: string;
    lintCommand?: string;
    timeoutMs: number;
  };
  runtime: { requiredDirs: string[] };
}

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);
  private readonly configPath: string;
  private config: FabrikageConfig;

  constructor() {
    const envPath = process.env.FABRIQUE_CONFIG || path.join(process.cwd(), 'settings', 'config.yaml');
    this.configPath = envPath;
    this.config = this.loadOrDefault();
  }

  get(): FabrikageConfig {
    return this.config;
  }

  reload(): FabrikageConfig {
    this.config = this.loadOrDefault();
    return this.config;
  }

  private loadOrDefault(): FabrikageConfig {
    const defaults: FabrikageConfig = {
      watch: { basePath: './workspace', ignored: ['**/node_modules/**', '**/.git/**', '**/tmp/**', '**/logs/**', '**/dist/**'] },
      mirror: { basePath: './mirror', mode: 'stage-then-promote' },
      pipeline: { buildCommand: 'npm run build', testCommand: 'npm test', timeoutMs: 15 * 60 * 1000 },
      runtime: { requiredDirs: ['logs', 'data', 'tmp', 'settings', 'workspace', 'mirror'] },
    };

    try {
      if (!fs.existsSync(this.configPath)) {
        this.logger.warn(`Config not found at ${this.configPath}. Using defaults.`);
        return defaults;
      }
      const raw = fs.readFileSync(this.configPath, 'utf-8');
      const parsed = yaml.load(raw) as Partial<FabrikageConfig>;
      return {
        ...defaults,
        ...parsed,
        watch: { ...defaults.watch, ...(parsed.watch || {}) },
        mirror: { ...defaults.mirror, ...(parsed.mirror || {}) },
        pipeline: { ...defaults.pipeline, ...(parsed.pipeline || {}) },
        runtime: { ...defaults.runtime, ...(parsed.runtime || {}) },
      };
    } catch (e: any) {
      this.logger.error(`Failed to load config at ${this.configPath}: ${e?.message || e}`);
      return defaults;
    }
  }
}
