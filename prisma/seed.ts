import { PrismaClient, InvoiceStatus } from '../src/generated/prisma';

const prisma = new PrismaClient();

import bcrypt from 'bcryptjs';

// Hash password using bcrypt
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function main() {
  // Clean up existing data
  await prisma.paymentReminder.deleteMany();
  await prisma.emailLog.deleteMany();
  await prisma.invoiceLineItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.taxRate.deleteMany();
  await prisma.recurringInvoice.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@ainvoice.com',
      password: await hashPassword('demo123'),
      companyName: 'Demo Freelancer Inc.',
      companyAddress: '123 Main St, Suite 100\nSan Francisco, CA 94105',
      companyTaxId: 'XX-1234567',
      defaultCurrency: 'USD',
      defaultTaxRate: 0,
      invoiceNumberPrefix: 'INV-',
      invoiceNumberSuffix: '',
      nextInvoiceNumber: 1004,
    },
  });

  console.log(`Created demo user: ${demoUser.email}`);

  // Create default tax rates
  const taxRates = await Promise.all([
    prisma.taxRate.create({
      data: {
        userId: demoUser.id,
        name: 'No Tax',
        rate: 0,
        isDefault: true,
      },
    }),
    prisma.taxRate.create({
      data: {
        userId: demoUser.id,
        name: 'Sales Tax 5%',
        rate: 5,
      },
    }),
    prisma.taxRate.create({
      data: {
        userId: demoUser.id,
        name: 'VAT 10%',
        rate: 10,
      },
    }),
    prisma.taxRate.create({
      data: {
        userId: demoUser.id,
        name: 'VAT 20%',
        rate: 20,
      },
    }),
  ]);

  console.log(`Created ${taxRates.length} tax rates`);

  // Create sample clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        userId: demoUser.id,
        name: 'Acme Corporation',
        email: 'billing@acme.com',
        phone: '(555) 123-4567',
        address: '456 Corporate Blvd',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
        taxId: 'US-7654321',
        notes: 'Prefers NET 30 payment terms',
      },
    }),
    prisma.client.create({
      data: {
        userId: demoUser.id,
        name: 'StartupXYZ',
        email: 'finance@startupxyz.io',
        phone: '(555) 987-6543',
        address: '789 Innovation Way',
        city: 'Austin',
        state: 'TX',
        postalCode: '78701',
        country: 'USA',
        notes: 'Early-stage startup, prompt payer',
      },
    }),
    prisma.client.create({
      data: {
        userId: demoUser.id,
        name: 'Global Consulting Ltd',
        email: 'accounts@globalconsulting.co.uk',
        address: '10 Downing Street',
        city: 'London',
        postalCode: 'SW1A 2AA',
        country: 'UK',
        taxId: 'GB123456789',
      },
    }),
  ]);

  console.log(`Created ${clients.length} clients`);

  // Create sample invoices
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Paid invoice from 60 days ago
  const paidInvoice = await prisma.invoice.create({
    data: {
      userId: demoUser.id,
      clientId: clients[0].id,
      invoiceNumber: 'INV-1001',
      invoiceDate: sixtyDaysAgo,
      dueDate: new Date(sixtyDaysAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
      status: InvoiceStatus.paid,
      currency: 'USD',
      subtotal: 500000, // $5,000
      taxTotal: 50000,  // $500
      total: 550000,    // $5,500
      notes: 'Thank you for your business!',
      terms: 'Payment is due within 30 days.',
      sentAt: sixtyDaysAgo,
      paidAt: new Date(sixtyDaysAgo.getTime() + 15 * 24 * 60 * 60 * 1000),
      lineItems: {
        create: [
          {
            description: 'Website Development - Phase 1',
            quantity: 40,
            rate: 10000, // $100/hour
            taxRate: 10,
            amount: 400000,
            taxAmount: 40000,
            total: 440000,
          },
          {
            description: 'UI/UX Design Consultation',
            quantity: 10,
            rate: 10000, // $100/hour
            taxRate: 10,
            amount: 100000,
            taxAmount: 10000,
            total: 110000,
          },
        ],
      },
    },
  });

  // Sent invoice from 30 days ago (now overdue)
  const overdueInvoice = await prisma.invoice.create({
    data: {
      userId: demoUser.id,
      clientId: clients[1].id,
      invoiceNumber: 'INV-1002',
      invoiceDate: thirtyDaysAgo,
      dueDate: now,
      status: InvoiceStatus.overdue,
      currency: 'USD',
      subtotal: 300000, // $3,000
      taxTotal: 0,
      total: 300000,
      notes: 'Thank you for your business!',
      terms: 'Payment is due within 30 days.',
      sentAt: thirtyDaysAgo,
      lineItems: {
        create: [
          {
            description: 'Mobile App Development',
            quantity: 30,
            rate: 10000, // $100/hour
            taxRate: 0,
            amount: 300000,
            taxAmount: 0,
            total: 300000,
          },
        ],
      },
    },
  });

  // Draft invoice (current)
  const draftInvoice = await prisma.invoice.create({
    data: {
      userId: demoUser.id,
      clientId: clients[2].id,
      invoiceNumber: 'INV-1003',
      invoiceDate: now,
      dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      status: InvoiceStatus.draft,
      currency: 'GBP',
      subtotal: 200000, // £2,000
      taxTotal: 40000,  // £400
      total: 240000,    // £2,400
      notes: 'Thank you for your business!',
      terms: 'Payment is due within 30 days.',
      lineItems: {
        create: [
          {
            description: 'Consulting Services - March 2024',
            quantity: 20,
            rate: 10000, // £100/hour
            taxRate: 20,
            amount: 200000,
            taxAmount: 40000,
            total: 240000,
          },
        ],
      },
    },
  });

  console.log('Created 3 sample invoices');

  // Create sample time entries
  const timeEntries = await Promise.all([
    // Billed time entry
    prisma.timeEntry.create({
      data: {
        userId: demoUser.id,
        clientId: clients[0].id,
        date: new Date('2024-03-01'),
        hours: 8,
        description: 'Backend API development',
        rate: 10000, // $100/hour
        isBillable: true,
        isBilled: true,
      },
    }),
    // Unbilled billable time
    prisma.timeEntry.create({
      data: {
        userId: demoUser.id,
        clientId: clients[1].id,
        date: new Date('2024-03-15'),
        hours: 5.5,
        description: 'React component development',
        rate: 10000, // $100/hour
        isBillable: true,
        isBilled: false,
      },
    }),
    // Non-billable time
    prisma.timeEntry.create({
      data: {
        userId: demoUser.id,
        clientId: clients[0].id,
        date: new Date('2024-03-20'),
        hours: 2,
        description: 'Project planning meeting',
        rate: 10000,
        isBillable: false,
        isBilled: false,
      },
    }),
  ]);

  console.log(`Created ${timeEntries.length} time entries`);

  // Create email log for sent invoice
  await prisma.emailLog.create({
    data: {
      invoiceId: overdueInvoice.id,
      recipientEmail: clients[1].email,
      subject: `Invoice ${overdueInvoice.invoiceNumber} from ${demoUser.companyName}`,
      sentAt: thirtyDaysAgo,
    },
  });

  // Create payment reminder for overdue invoice
  await prisma.paymentReminder.create({
    data: {
      invoiceId: overdueInvoice.id,
      scheduledFor: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      reminderNumber: 1,
    },
  });

  console.log('Created email log and payment reminder');

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });