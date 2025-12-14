import { Injectable, Logger as NestLogger } from '@nestjs/common';

@Injectable()
export class AppLogger {
  private context: string;
  private logger: NestLogger;

  constructor(context = 'Fabrication') {
    this.context = context;
    this.logger = new NestLogger(this.context);
  }

  setContext(context: string) {
    this.context = context;
    this.logger = new NestLogger(this.context);
  }

  log(message: string, context?: string) {
    this.logger.log(message, context || this.context);
  }

  error(message: string, trace?: string, context?: string) {
    if (trace && typeof trace === 'string') {
      this.logger.error(message, trace, context || this.context);
    } else {
      // Handle case where trace is not provided
      this.logger.error(message, context || this.context);
    }
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, context || this.context);
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, context || this.context);
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, context || this.context);
  }
}
