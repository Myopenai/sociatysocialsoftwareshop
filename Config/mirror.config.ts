import { join } from 'path';

export const mirrorConfig = {
  rules: [
    {
      name: "Source to Mirror",
      source: join(process.cwd(), 'source'),
      destination: join(process.cwd(), 'mirror'),
      recursive: true,
      file_rules: [
        {
          pattern: "*.*",
          fix_errors: false,
          backup: true,
          max_size: 10 * 1024 * 1024, // 10MB
          allowed_extensions: ['*']
        }
      ]
    }
  ],
  logging: {
    level: "INFO",
    file: join(process.cwd(), 'logs', 'mirror-system.log'),
    max_size: 10 * 1024 * 1024, // 10MB
    backup_count: 5
  }
};

export default mirrorConfig;
