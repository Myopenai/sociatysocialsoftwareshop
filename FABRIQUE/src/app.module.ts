import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FabricationModule } from './fabrication/fabrication.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
      exclude: ['/api/*'],
    }),
    SharedModule,
    FabricationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
