import { PrismaClient, ProjectStatus, TransactionType, BillingStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create company
  const company = await prisma.company.upsert({
    where: { code: 'ROSALISCA' },
    update: {},
    create: {
      name: 'PT Rosa Lisca',
      code: 'ROSALISCA',
    },
  });

  console.log('✅ Company created:', company.name);

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@rosalisca.com' },
    update: {},
    create: {
      email: 'admin@rosalisca.com',
      passwordHash: hashedPassword,
      name: 'Admin Rosa Lisca',
      role: 'ADMIN',
      companyId: company.id,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create projects
  const projects = [    {
      name: 'Proyek Pembangunan Gedung A',
      status: ProjectStatus.BERJALAN,
      contractValue: 2500000000,
      downPayment: 375000000,
    },
    {
      name: 'Renovasi Kantor Pusat',
      status: ProjectStatus.SELESAI,
      contractValue: 1200000000,
      downPayment: 180000000,
    },    {
      name: 'Proyek Infrastruktur Jalan',
      status: ProjectStatus.MENDATANG,
      contractValue: 3000000000,
      downPayment: 450000000,
    },
    {
      name: 'Pembangunan Jembatan Layang',
      status: ProjectStatus.BERJALAN,
      contractValue: 5000000000,
      downPayment: 750000000,
    },
  ];

  const createdProjects: any[] = [];
  for (const projectData of projects) {
    const project = await prisma.project.create({
      data: {
        ...projectData,
        companyId: company.id,
        createdById: adminUser.id,
      },
    });
    createdProjects.push(project);
    console.log('✅ Project created:', project.name);
  }
  // Create billings for project 1
  const project1 = createdProjects[0];
  const billings1 = [
    {
      description: 'Tagihan Termin 1 - Pekerjaan Pondasi',
      invoiceNumber: 'FK001/2024',
      billingValue: 500000000,
      downPaymentDeduction: 75000000,
      entryDate: new Date('2024-01-15'),
      dueDate: new Date('2024-02-15'),
      status: BillingStatus.DIBAYAR,
      paymentDate: new Date('2024-01-20'),
    },
    {
      description: 'Tagihan Termin 2 - Pekerjaan Struktur',
      invoiceNumber: 'FK002/2024',
      billingValue: 600000000,
      downPaymentDeduction: 90000000,
      entryDate: new Date('2024-03-20'),
      dueDate: new Date('2024-04-20'),
      status: BillingStatus.DIBAYAR_RETENSI_BELUM_DIBAYARKAN,
      paymentDate: new Date('2024-03-25'),
    },
    {
      description: 'Tagihan Termin 3 - Pekerjaan Arsitektur',
      invoiceNumber: 'FK003/2024',
      billingValue: 700000000,
      downPaymentDeduction: 105000000,
      entryDate: new Date('2024-05-10'),
      dueDate: new Date('2024-06-10'),
      status: BillingStatus.BELUM_DIBAYAR,
    },
  ];

  for (const billingData of billings1) {
    // Calculate fields manually to match existing data
    const kwintansi = billingData.billingValue;
    const retention = kwintansi * 0.05;
    const dpp = kwintansi - billingData.downPaymentDeduction - retention;
    const ppn = dpp * 0.11;
    const pph = dpp * 0.0265;
    const finalAmount = dpp + ppn - pph;

    const billing = await prisma.billing.create({
      data: {
        ...billingData,
        projectId: project1.id,
        retention5Percent: retention,
        dpp: dpp,
        ppn11Percent: ppn,
        pph265Percent: pph,
        finalAmount: finalAmount,
      },
    });
    console.log('✅ Billing created:', billing.invoiceNumber);
  }
  // Create transactions for project 1
  const transactions1 = [
    {
      type: TransactionType.PEMASUKAN,
      amount: 356200000,
      description: 'Pembayaran Termin 1',
      companyName: 'PT Client ABC',
      category: 'Pembayaran Tagihan',
      transactionDate: new Date('2024-01-20'),
    },
    {
      type: TransactionType.PENGELUARAN,
      amount: 150000000,
      description: 'Pembelian Material Pondasi',
      companyName: 'PT Supplier XYZ',
      category: 'Operasional',
      transactionDate: new Date('2024-01-25'),
    },
    {
      type: TransactionType.PEMASUKAN,
      amount: 427440750,
      description: 'Pembayaran Termin 2',
      companyName: 'PT Client ABC',
      category: 'Pembayaran Tagihan',
      transactionDate: new Date('2024-03-25'),
    },
  ];

  for (const transactionData of transactions1) {
    const transaction = await prisma.transaction.create({
      data: {
        ...transactionData,
        projectId: project1.id,
        createdById: adminUser.id,
      },
    });
    console.log('✅ Transaction created:', transaction.description);
  }

  // Create cash requests
  const cashRequest1 = await prisma.cashRequest.create({
    data: {
      projectId: project1.id,
      requestNumber: 'CR001/2024',
      totalAmount: 100000000,
      description: 'Pembelian material bangunan',
      status: 'APPROVED',
      requestedById: adminUser.id,
      approvedById: adminUser.id,
      approvedAt: new Date('2024-01-12'),
      items: {
        create: [
          {
            itemName: 'Semen Portland',
            quantity: 1000,
            unit: 'sak',
            unitPrice: 75000,
            totalPrice: 75000000,
          },
          {
            itemName: 'Besi Beton 12mm',
            quantity: 500,
            unit: 'batang',
            unitPrice: 50000,
            totalPrice: 25000000,
          },
        ],
      },
      history: {
        create: [
          {
            action: 'Submitted',
            actionBy: 'Admin Rosa Lisca',
            comments: 'Pengajuan kas untuk material bangunan',
            actionDate: new Date('2024-01-10'),
          },
          {
            action: 'Approved',
            actionBy: 'Admin Rosa Lisca',
            comments: 'Pengajuan disetujui',
            actionDate: new Date('2024-01-12'),
          },
        ],
      },
    },
  });

  console.log('✅ Cash request created:', cashRequest1.requestNumber);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });