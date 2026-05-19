import envSchema from '../config/envSchema';

const validateEnv = (): NodeJS.ProcessEnv => {
  const { error, value } = envSchema.validate(process.env, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: false,
  });

  if (error) {
    console.error('❌ Environment Variable Validation Failed!\n');
    error.details.forEach((detail) => {
      console.error(`  • ${detail.path.join('.')}: ${detail.message}`);
    });
    process.exit(1);
  }

  return value as NodeJS.ProcessEnv;
};

export = validateEnv;
