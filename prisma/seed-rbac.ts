import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRBAC() {
  console.log('🌱 Seeding RBAC roles...');

  // Create default roles
  const roles = [
    {
      name: 'admin',
      description: 'Full administrative access',
      permissions: JSON.stringify(['*']), // All permissions
    },
    {
      name: 'moderator',
      description: 'Moderate content and manage games',
      permissions: JSON.stringify(['manage_games', 'manage_events', 'view_admin']),
    },
    {
      name: 'player',
      description: 'Standard player access',
      permissions: JSON.stringify(['view_leaderboard', 'view_games', 'register_deck']),
    },
  ];

  for (const roleData of roles) {
    await prisma.role.upsert({
      where: { name: roleData.name },
      update: roleData,
      create: roleData,
    });
    console.log(`✅ Role "${roleData.name}" created/updated`);
  }

  // Migrate existing ADMIN_USER_IDS to admin role
  const adminUserIds = process.env.ADMIN_USER_IDS?.split(',') || [];
  if (adminUserIds.length > 0) {
    const adminRole = await prisma.role.findUnique({
      where: { name: 'admin' },
    });

    if (adminRole) {
      for (const userId of adminUserIds) {
        if (userId.trim()) {
          try {
            await prisma.userRole.upsert({
              where: {
                userId_roleId: {
                  userId: userId.trim(),
                  roleId: adminRole.id,
                },
              },
              update: {},
              create: {
                userId: userId.trim(),
                roleId: adminRole.id,
              },
            });
            console.log(`✅ Assigned admin role to user ${userId.trim()}`);
          } catch (error) {
            console.warn(
              `⚠️ Could not assign admin role to ${userId.trim()} (user may not exist yet)`
            );
          }
        }
      }
    }
  }

  console.log('✅ RBAC seeding complete!');
}

seedRBAC()
  .catch(e => {
    console.error('Error seeding RBAC:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
