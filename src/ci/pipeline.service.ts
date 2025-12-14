import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { SettingsService } from '../settings/settings.service';
import { MirrorService } from './mirror.service';

export interface PipelineRunResult {
  ok: boolean;
  startedAt: string;
  finishedAt: string;
  reason: string;
  details: { build?: string; test?: string; lint?: string };
}

@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);
  private lastResult: PipelineRunResult | null = null;
  private running = false;

  constructor(private readonly settings: SettingsService, private readonly mirror: MirrorService) {}

  getStatus() {
    return { running: this.running, lastResult: this.lastResult };
  }

  async runContinuousCheck(input: { reason: string; filePath?: string }): Promise<PipelineRunResult> {
    if (this.running) {
      this.logger.warn('Pipeline already running; skipping this trigger.');
      return this.lastResult || {
        ok: true,
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        reason: 'skipped',
        details: {},
      };
    }
    this.running = true;
    const cfg = this.settings.get();
    const started = new Date();

    const details: any = {};
    let ok = true;
    try {
      if (cfg.pipeline.lintCommand) {
        details.lint = await this.exec(cfg.pipeline.lintCommand, cfg.pipeline.timeoutMs);
      }
      details.build = await this.exec(cfg.pipeline.buildCommand, cfg.pipeline.timeoutMs);
      details.test = await this.exec(cfg.pipeline.testCommand, cfg.pipeline.timeoutMs);

      // Only promote mirror -> workspace if gates passed
      this.mirror.promoteToWorkspace();
    } catch (e: any) {
      ok = false;
      details.error = e?.message || String(e);
      this.logger.error(`Pipeline failed: ${details.error}`);
    } finally {
      const finished = new Date();
      this.running = false;
      this.lastResult = {
        ok,
        startedAt: started.toISOString(),
        finishedAt: finished.toISOString(),
        reason: input.reason,
        details,
      };
    }
    return this.lastResult!;
  }

  private exec(command: string, timeoutMs: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, { shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
      let out = '';
      let err = '';
      const timer = setTimeout(() => {
        child.kill('SIGKILL');
        reject(new Error(`Command timed out after ${timeoutMs}ms: ${command}`));
      }, timeoutMs);

      child.stdout.on('data', (d) => (out += d.toString()));
      child.stderr.on('data', (d) => (err += d.toString()));

      child.on('close', (code) => {
        clearTimeout(timer);
        if (code === 0) resolve(out.trim() || '(ok)');
        else reject(new Error(`Command failed (${code}): ${command}\n${err || out}`));
      });
    });
  }
}
