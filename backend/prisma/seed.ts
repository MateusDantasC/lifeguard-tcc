import { hash } from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '../src/config/env.js';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { LinkStatus, UserType } from '../src/generated/prisma/enums.js';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: env.DATABASE_URL }) });

async function main() {
  const passwordHash = await hash('Teste123!', 12);

  const caregiver = await prisma.user.upsert({
    where: { email: 'ana@lifeguard.test' },
    update: { passwordHash, phone: '+5511999990001' },
    create: {
      name: 'Ana Pereira',
      email: 'ana@lifeguard.test',
      phone: '+5511999990001',
      passwordHash,
      type: UserType.CAREGIVER,
    },
  });

  const elder = await prisma.user.upsert({
    where: { email: 'maria@lifeguard.test' },
    update: { passwordHash, phone: '+5511988881234' },
    create: {
      name: 'Maria Silva',
      email: 'maria@lifeguard.test',
      phone: '+5511988881234',
      passwordHash,
      type: UserType.ELDER,
      elderProfile: {
        create: {
          emergencyContactName: 'Ana Pereira',
          emergencyContactPhone: '+5511999990001',
        },
      },
      alertLimits: {
        create: {
          heartRateMinimum: 60,
          heartRateMaximum: 120,
          temperatureMinimum: 35.5,
          temperatureMaximum: 37.8,
        },
      },
    },
  });

  await prisma.elderProfile.upsert({
    where: { userId: elder.id },
    create: {
      userId: elder.id,
      birthDate: new Date('1954-04-12T12:00:00.000Z'),
      bloodType: 'O+',
      medicalConditions: 'Hipertensão controlada',
      allergies: 'Nenhuma alergia conhecida',
      medications: 'Losartana 50 mg pela manhã',
      importantNotes: 'Usa óculos e pode precisar de ajuda para ler textos pequenos.',
      emergencyContactName: 'Ana Pereira',
      emergencyContactPhone: '+5511999990001',
    },
    update: {
      birthDate: new Date('1954-04-12T12:00:00.000Z'),
      bloodType: 'O+',
      medicalConditions: 'Hipertensão controlada',
      allergies: 'Nenhuma alergia conhecida',
      medications: 'Losartana 50 mg pela manhã',
      importantNotes: 'Usa óculos e pode precisar de ajuda para ler textos pequenos.',
      emergencyContactName: 'Ana Pereira',
      emergencyContactPhone: '+5511999990001',
    },
  });

  await prisma.alertLimit.update({ where: { elderId: elder.id }, data: { definedById: caregiver.id } });
  await prisma.caregiverElderLink.upsert({
    where: { caregiverId_elderId: { caregiverId: caregiver.id, elderId: elder.id } },
    update: { status: LinkStatus.ACTIVE },
    create: { caregiverId: caregiver.id, elderId: elder.id, status: LinkStatus.ACTIVE },
  });
  await prisma.device.upsert({
    where: { hardwareCode: env.SIMULATOR_DEVICE_CODE },
    update: { elderId: elder.id, active: true },
    create: {
      hardwareCode: env.SIMULATOR_DEVICE_CODE,
      elderId: elder.id,
      nickname: 'Pulseira de demonstração',
      active: true,
    },
  });

  console.log('Dados de demonstração criados.');
  console.log('Cuidador: ana@lifeguard.test / Teste123!');
  console.log('Idoso: maria@lifeguard.test / Teste123!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
