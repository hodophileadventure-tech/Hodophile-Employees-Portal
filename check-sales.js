const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const leads = await prisma.salesLead.findMany({
    where: {
      employeeId: 'cmram93xg0002owy3cecp4gnp',
    },
    orderBy: {
      confirmedAt: 'desc',
    },
  });

  console.log('Total leads found:', leads.length);
  console.log(JSON.stringify(leads, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
