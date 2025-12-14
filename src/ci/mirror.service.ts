import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { SettingsService } from '../settings/settings.service';

export interface MirrorStatus {
  mirrorPath: string;
  mode: string;
  lastPromoteAt?: string;
}

@Injectable()
export class MirrorService {
  private readonly logger = new Logger(MirrorService.name);
  private lastPromoteAt: Date | null = null;

  constructor(private readonly settings: SettingsService) {}

  status(): MirrorStatus {
    const cfg = this.settings.get();
    return {
      mirrorPath: path.resolve(cfg.mirror.basePath),
      mode: cfg.mirror.mode,
      lastPromoteAt: this.lastPromoteAt ? this.lastPromoteAt.toISOString() : undefined,
    };
  }

  /**
   * Stage a file into mirror before it is promoted into workspace.
   * This gives you a "mirror" snapshot of changes for inspection/rollback.
   */
  stageFile(relativePath: string, content: Buffer | string) {
    const cfg = this.settings.get();
    const mirrorBase = path.resolve(cfg.mirror.basePath);
    const target = path.join(mirrorBase, relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }

  /**
   * Promote mirrored content into workspace atomically (best effort).
   * This is intentionally explicit: production code should only be promoted
   * after passing your pipeline gates.
   */
  promoteToWorkspace() {
    const cfg = this.settings.get();
    if (cfg.mirror.mode !== 'stage-then-promote') {
      this.logger.warn(`Mirror mode is ${cfg.mirror.mode}; promote skipped.`);
      return;
    }
    const mirrorBase = path.resolve(cfg.mirror.basePath);
    const workspaceBase = path.resolve(cfg.watch.basePath);

    if (!fs.existsSync(mirrorBase)) return;

    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        const rel = path.relative(mirrorBase, full);
        const dest = path.join(workspaceBase, rel);

        if (entry.isDirectory()) {
          fs.mkdirSync(dest, { recursive: true });
          walk(full);
        } else if (entry.isFile()) {
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          // Best-effort atomic replace
          const tmp = dest + '.tmp';
          fs.copyFileSync(full, tmp);
          fs.renameSync(tmp, dest);
        }
      }
    };

    walk(mirrorBase);
    this.lastPromoteAt = new Date();
    this.logger.log(`Promoted mirror -> workspace at ${this.lastPromoteAt.toISOString()}`);
  }
}
