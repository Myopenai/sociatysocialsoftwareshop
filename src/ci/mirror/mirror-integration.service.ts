import { Injectable, Logger } from '@nestjs/common';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { SettingsService } from '../settings/settings.service';

const execAsync = promisify(exec);

@Injectable()
export class MirrorIntegrationService {
  private readonly logger = new Logger(MirrorIntegrationService.name);
  private pythonProcess: any = null;
  private isRunning = false;

  constructor(private readonly settings: SettingsService) {}

  /**
   * Start the mirror system with the given configuration
   */
  async startMirrorSystem(configPath?: string): Promise<{ status: string; message: string }> {
    try {
      if (this.isRunning) {
        return { status: 'error', message: 'Mirror system is already running' };
      }

      const pythonScript = join(__dirname, 'mirror', 'mirror_system.py');
      const args = ['start'];
      
      if (configPath) {
        args.push(configPath);
      }

      this.pythonProcess = spawn('python', [pythonScript, ...args]);
      this.isRunning = true;

      this.pythonProcess.stdout.on('data', (data: Buffer) => {
        this.logger.log(`Mirror System: ${data.toString().trim()}`);
      });

      this.pythonProcess.stderr.on('data', (data: Buffer) => {
        this.logger.error(`Mirror System Error: ${data.toString().trim()}`);
      });

      this.pythonProcess.on('close', (code: number) => {
        this.isRunning = false;
        if (code !== 0) {
          this.logger.error(`Mirror System exited with code ${code}`);
        } else {
          this.logger.log('Mirror System stopped successfully');
        }
      });

      return { status: 'success', message: 'Mirror system started' };
    } catch (error) {
      this.logger.error(`Failed to start mirror system: ${error.message}`);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Stop the mirror system
   */
  async stopMirrorSystem(): Promise<{ status: string; message: string }> {
    if (!this.isRunning) {
      return { status: 'error', message: 'Mirror system is not running' };
    }

    try {
      const pythonScript = join(__dirname, 'mirror', 'mirror_system.py');
      const { stdout } = await execAsync(`python ${pythonScript} stop`);
      
      if (this.pythonProcess) {
        this.pythonProcess.kill('SIGTERM');
        this.pythonProcess = null;
      }
      
      this.isRunning = false;
      return { status: 'success', message: 'Mirror system stopped' };
    } catch (error) {
      this.logger.error(`Failed to stop mirror system: ${error.message}`);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Manually sync a file
   */
  async syncFile(source: string, destination: string): Promise<{ status: string; message: string }> {
    try {
      const pythonScript = join(__dirname, 'mirror', 'mirror_system.py');
      const { stdout } = await execAsync(`python ${pythonScript} sync "${source}" "${destination}"`);
      
      try {
        return JSON.parse(stdout);
      } catch (e) {
        return { status: 'success', message: stdout };
      }
    } catch (error) {
      this.logger.error(`Failed to sync file: ${error.message}`);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Check if the mirror system is running
   */
  isMirrorSystemRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get the status of the mirror system
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      pid: this.pythonProcess?.pid || null,
      lastSync: new Date().toISOString()
    };
  }
}
