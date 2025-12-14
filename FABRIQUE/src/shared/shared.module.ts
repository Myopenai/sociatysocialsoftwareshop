import { Module, Global } from '@nestjs/common';
import { AppLogger } from '../common/logger.service';

@Global()
@Module({
  providers: [
    {
      provide: AppLogger,
      useFactory: () => {
        return new AppLogger('Application');
      },
    },
  ],
  exports: [AppLogger],
})
export class SharedModule {}
