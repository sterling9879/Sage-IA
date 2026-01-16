import { PrismaClient, SettingType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Criar admin inicial
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Administrador',
      role: 'SUPER_ADMIN'
    }
  });

  console.log(`✅ Admin criado: ${adminEmail}`);

  // Configurações padrão
  const defaultSettings: { key: string; value: string; type: SettingType }[] = [
    { key: 'app_name', value: 'AI Chat', type: 'STRING' },
    { key: 'free_messages_limit', value: '50', type: 'NUMBER' },
    { key: 'pro_messages_limit', value: '500', type: 'NUMBER' },
    { key: 'max_history_tokens', value: '6000', type: 'NUMBER' },
    { key: 'default_model', value: 'google/gemini-2.5-flash', type: 'STRING' },
    { key: 'maintenance_mode', value: 'false', type: 'BOOLEAN' }
  ];

  for (const setting of defaultSettings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting
    });
  }

  console.log('✅ Configurações padrão criadas');

  // Modelos disponíveis
  const models = [
    { modelId: 'anthropic/claude-3.7-sonnet', displayName: 'Claude 3.7 Sonnet', provider: 'anthropic', sortOrder: 1, isFree: false },
    { modelId: 'anthropic/claude-3.5-sonnet', displayName: 'Claude 3.5 Sonnet', provider: 'anthropic', sortOrder: 2, isFree: false },
    { modelId: 'anthropic/claude-3-haiku', displayName: 'Claude 3 Haiku', provider: 'anthropic', isFree: true, sortOrder: 3 },
    { modelId: 'google/gemini-2.5-flash', displayName: 'Gemini 2.5 Flash', provider: 'google', sortOrder: 4, isFree: false },
    { modelId: 'google/gemini-2.5-pro', displayName: 'Gemini 2.5 Pro', provider: 'google', sortOrder: 5, isFree: false },
    { modelId: 'google/gemini-2.0-flash-exp:free', displayName: 'Gemini 2.0 Flash', provider: 'google', isFree: true, sortOrder: 6 },
    { modelId: 'openai/gpt-4o', displayName: 'GPT-4o', provider: 'openai', sortOrder: 7, isFree: false },
    { modelId: 'openai/gpt-4.1', displayName: 'GPT-4.1', provider: 'openai', sortOrder: 8, isFree: false },
    { modelId: 'openai/gpt-5-chat', displayName: 'GPT-5 Chat', provider: 'openai', sortOrder: 9, isFree: false },
    { modelId: 'meta-llama/llama-3.2-90b-vision-instruct', displayName: 'LLaMA 3.2 90B Vision', provider: 'meta', sortOrder: 10, isFree: false },
    { modelId: 'meta-llama/llama-4-maverick', displayName: 'LLaMA 4 Maverick', provider: 'meta', sortOrder: 11, isFree: false },
    { modelId: 'meta-llama/llama-4-scout', displayName: 'LLaMA 4 Scout', provider: 'meta', isFree: true, sortOrder: 12 },
    { modelId: 'deepseek/deepseek-chat', displayName: 'DeepSeek Chat', provider: 'deepseek', sortOrder: 13, isFree: false },
    { modelId: 'deepseek/deepseek-r1', displayName: 'DeepSeek R1', provider: 'deepseek', sortOrder: 14, isFree: false }
  ];

  for (const model of models) {
    await prisma.modelConfig.upsert({
      where: { modelId: model.modelId },
      update: {},
      create: {
        ...model,
        isEnabled: true,
        maxTokens: 4096
      }
    });
  }

  console.log('✅ Modelos configurados');

  console.log('🎉 Seed concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
