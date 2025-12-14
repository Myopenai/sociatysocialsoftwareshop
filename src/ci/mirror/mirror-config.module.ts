import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.development', '.env.production'],
      isGlobal: true,
      validationSchema: Joi.object({
        MIRROR_ENABLED: Joi.boolean().default(true),
        MIRROR_CONFIG_PATH: Joi.string().default(join(process.cwd(), 'config', 'mirror.config.ts')),
      }),
    }),
  ],
  exports: [ConfigModule],
})
export class MirrorConfigModule {}
