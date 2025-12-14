import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import chokidar, { FSWatcher } from 'chokidar';
import { SettingsService } from '../settings/settings.service';
import { PipelineService } from './pipeline.service';

@Injectable()
export class WatchdogService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WatchdogService.name);
  private watcher: FSWatcher | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;

  constructor(private readonly settings: SettingsService, private readonly pipeline: PipelineService) {}

  async onModuleInit() {
    const cfg = this.settings.get();
    const watchPath = cfg.watch.basePath;

    this.watcher = chokidar.watch(watchPath, {
      ignored: cfg.watch.ignored,
      persistent: true,
      ignoreInitial: true,
      followSymlinks: false,
      usePolling: true,
      interval: 100,
      binaryInterval: 300,
      depth: 99,
      awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 100 },
    });

    this.watcher
      .on('add', (p) => this.onChange('add', p))
      .on('change', (p) => this.onChange('change', p))
      .on('unlink', (p) => this.onChange('unlink', p))
      .on('error', (e) => this.logger.error(`watcher error: ${String(e)}`));

    this.logger.log(`Watchdog active on ${watchPath}`);
  }

  private onChange(type: string, filePath: string) {
    this.logger.debug(`watch event: ${type} ${filePath}`);
    // Debounce: many file changes can happen during a save/build
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(async () => {
      try {
        await this.pipeline.runContinuousCheck({ reason: `watch:${type}`, filePath });
      } catch (e: any) {
        this.logger.error(`pipeline failed: ${e?.message || e}`);
      }
    }, 800);
  }

  async onModuleDestroy() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    if (this.watcher) await this.watcher.close();
    this.watcher = null;
  }
}
