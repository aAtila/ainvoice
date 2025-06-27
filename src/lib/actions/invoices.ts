'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  invoiceFilterSchema,
  invoiceSearchSchema,
  markAsPaidSchema,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoiceFilter,
  InvoiceSearch,
  MarkAsPaidInput,
} from '@/lib/validations/invoice';
import {
  buildLineTotals,
  aggregateTotals,
  generateInvoiceNumber,
  computeStatus,
  isValidStatusTransition,
  buildPrismaLineItems,
} from '@/lib/invoice-utils';
import { Prisma } from '@prisma/client';

// Error messages
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You must be logged in to perform this action',
  NOT_FOUND: 'Invoice not found',
  CLIENT_NOT_FOUND: 'Client not found or does not belong to you',
  LINE_ITEMS_REQUIRED: 'At least one line item is required',
  INVALID_STATUS_TRANSITION: 'Invalid status transition',
  CANNOT_DELETE_PAID: 'Cannot delete a paid invoice',
  CANNOT_EDIT_NON_DRAFT: 'Only draft invoices can be edited',
};

// Create a new invoice
export async function createInvoice(input: CreateInvoiceInput) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: ERROR_MESSAGES.UNAUTHORIZED };
    }

    // Validate input
    const validatedData = createInvoiceSchema.parse(input);

    // Verify client belongs to user
    const client = await prisma.client.findFirst({
      where: {
        id: validatedData.clientId,
        userId: user.id,
      },
    });

    if (!client) {
      return { success: false, error: ERROR_MESSAGES.CLIENT_NOT_FOUND };
    }

    // Calculate line items with totals
    const totals = aggregateTotals(validatedData.lineItems);

    // Create invoice with auto-incremented number
    const invoice = await prisma.$transaction(async (tx) => {
      // Get current user with latest nextInvoiceNumber
      const currentUser = await tx.user.findUnique({
        where: { id: user.id },
      });

      if (!currentUser) {
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      }

      const invoiceNumber = generateInvoiceNumber(
        currentUser.nextInvoiceNumber,
        currentUser.invoiceNumberPrefix,
        currentUser.invoiceNumberSuffix
      );

      // Update user's next invoice number
      await tx.user.update({
        where: { id: user.id },
        data: { nextInvoiceNumber: { increment: 1 } },
      });

      // Create invoice with line items
      return tx.invoice.create({
        data: {
          userId: user.id,
          clientId: validatedData.clientId,
          invoiceNumber,
          invoiceDate: validatedData.invoiceDate,
          dueDate: validatedData.dueDate,
          status: validatedData.status || 'draft',
          currency: validatedData.currency,
          subtotal: totals.subtotal,
          taxTotal: totals.taxTotal,
          total: totals.total,
          notes: validatedData.notes,
          terms: validatedData.terms,
          lineItems: {
            create: buildPrismaLineItems(validatedData.lineItems),
          },
        },
        include: {
          lineItems: true,
          client: true,
        },
      });
    });

    revalidatePath('/invoices');
    revalidatePath('/');
    
    return { success: true, data: invoice };
  } catch (error) {
    console.error('Error creating invoice:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to create invoice' };
  }
}

// Update an existing invoice
export async function updateInvoice(id: string, input: UpdateInvoiceInput) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: ERROR_MESSAGES.UNAUTHORIZED };
    }

    // Validate input
    const validatedData = updateInvoiceSchema.parse(input);

    // Get existing invoice
    const existingInvoice = await prisma.invoice.findFirst({
      where: { id, userId: user.id },
      include: { lineItems: true },
    });

    if (!existingInvoice) {
      return { success: false, error: ERROR_MESSAGES.NOT_FOUND };
    }

    // Check if invoice is editable (only drafts can be fully edited)
    if (existingInvoice.status !== 'draft' && validatedData.lineItems) {
      return { success: false, error: ERROR_MESSAGES.CANNOT_EDIT_NON_DRAFT };
    }

    // Validate status transition if status is changing
    if (validatedData.status && validatedData.status !== existingInvoice.status) {
      if (!isValidStatusTransition(existingInvoice.status, validatedData.status)) {
        return { success: false, error: ERROR_MESSAGES.INVALID_STATUS_TRANSITION };
      }
    }

    // If client is being changed, verify it belongs to user
    if (validatedData.clientId && validatedData.clientId !== existingInvoice.clientId) {
      const client = await prisma.client.findFirst({
        where: {
          id: validatedData.clientId,
          userId: user.id,
        },
      });

      if (!client) {
        return { success: false, error: ERROR_MESSAGES.CLIENT_NOT_FOUND };
      }
    }

    // Calculate new totals if line items are being updated
    let totals = {
      subtotal: existingInvoice.subtotal,
      taxTotal: existingInvoice.taxTotal,
      total: existingInvoice.total,
    };

    if (validatedData.lineItems) {
      totals = aggregateTotals(validatedData.lineItems);
    }

    // Update invoice
    const invoice = await prisma.$transaction(async (tx) => {
      // Delete existing line items if new ones are provided
      if (validatedData.lineItems) {
        await tx.invoiceLineItem.deleteMany({
          where: { invoiceId: id },
        });
      }

      // Update invoice
      return tx.invoice.update({
        where: { id },
        data: {
          clientId: validatedData.clientId,
          invoiceDate: validatedData.invoiceDate,
          dueDate: validatedData.dueDate,
          status: validatedData.status,
          currency: validatedData.currency,
          subtotal: totals.subtotal,
          taxTotal: totals.taxTotal,
          total: totals.total,
          notes: validatedData.notes,
          terms: validatedData.terms,
          sentAt: validatedData.sentAt,
          paidAt: validatedData.paidAt,
          lineItems: validatedData.lineItems
            ? {
                create: buildPrismaLineItems(validatedData.lineItems),
              }
            : undefined,
        },
        include: {
          lineItems: true,
          client: true,
        },
      });
    });

    // Compute and update status based on dates
    const computedStatus = computeStatus(invoice.status, invoice.dueDate, invoice.paidAt);
    if (computedStatus !== invoice.status) {
      await prisma.invoice.update({
        where: { id },
        data: { status: computedStatus },
      });
    }

    revalidatePath('/invoices');
    revalidatePath(`/invoices/${id}`);
    revalidatePath('/');
    
    return { success: true, data: invoice };
  } catch (error) {
    console.error('Error updating invoice:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to update invoice' };
  }
}

// Delete an invoice
export async function deleteInvoice(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: ERROR_MESSAGES.UNAUTHORIZED };
    }

    // Get existing invoice
    const invoice = await prisma.invoice.findFirst({
      where: { id, userId: user.id },
    });

    if (!invoice) {
      return { success: false, error: ERROR_MESSAGES.NOT_FOUND };
    }

    // Check if invoice can be deleted
    if (invoice.status === 'paid') {
      return { success: false, error: ERROR_MESSAGES.CANNOT_DELETE_PAID };
    }

    // Delete invoice (line items will be cascade deleted)
    await prisma.invoice.delete({
      where: { id },
    });

    revalidatePath('/invoices');
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return { success: false, error: 'Failed to delete invoice' };
  }
}

// Get a single invoice
export async function getInvoice(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: ERROR_MESSAGES.UNAUTHORIZED };
    }

    const invoice = await prisma.invoice.findFirst({
      where: { id, userId: user.id },
      include: {
        lineItems: {
          orderBy: { createdAt: 'asc' },
        },
        client: true,
      },
    });

    if (!invoice) {
      return { success: false, error: ERROR_MESSAGES.NOT_FOUND };
    }

    return { success: true, data: invoice };
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return { success: false, error: 'Failed to fetch invoice' };
  }
}

// Get list of invoices with filtering and pagination
export async function getInvoices(filter?: Partial<InvoiceFilter>) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: ERROR_MESSAGES.UNAUTHORIZED };
    }

    // Validate filter with defaults
    const validatedFilter = invoiceFilterSchema.parse(filter || {});
    const { page, pageSize, sortBy, sortOrder, ...filters } = validatedFilter;

    // Build where clause
    const where: Prisma.InvoiceWhereInput = {
      userId: user.id,
    };

    if (filters.search) {
      where.OR = [
        { invoiceNumber: { contains: filters.search } },
        { client: { name: { contains: filters.search } } },
        { client: { email: { contains: filters.search } } },
      ];
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        where.status = { in: filters.status };
      } else {
        where.status = filters.status;
      }
    }

    if (filters.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.invoiceDate = {};
      if (filters.dateFrom) {
        where.invoiceDate.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.invoiceDate.lte = filters.dateTo;
      }
    }

    // Build order by
    const orderBy: Prisma.InvoiceOrderByWithRelationInput = {};
    if (sortBy === 'clientName') {
      orderBy.client = { name: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Get total count
    const totalCount = await prisma.invoice.count({ where });

    // Get invoices
    const invoices = await prisma.invoice.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        client: true,
        _count: {
          select: { lineItems: true },
        },
      },
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasMore = page < totalPages;

    return {
      success: true,
      data: {
        invoices,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages,
          hasMore,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return { success: false, error: 'Failed to fetch invoices' };
  }
}

// Search invoices for autocomplete
export async function searchInvoices(search: InvoiceSearch) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: ERROR_MESSAGES.UNAUTHORIZED };
    }

    const validatedSearch = invoiceSearchSchema.parse(search);

    const invoices = await prisma.invoice.findMany({
      where: {
        userId: user.id,
        OR: [
          { invoiceNumber: { contains: validatedSearch.query } },
          { client: { name: { contains: validatedSearch.query } } },
        ],
      },
      take: validatedSearch.limit,
      orderBy: { invoiceDate: 'desc' },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        total: true,
        currency: true,
        client: {
          select: {
            name: true,
          },
        },
      },
    });

    return { success: true, data: invoices };
  } catch (error) {
    console.error('Error searching invoices:', error);
    return { success: false, error: 'Failed to search invoices' };
  }
}

// Get invoice statistics
export async function getInvoiceStats() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: ERROR_MESSAGES.UNAUTHORIZED };
    }

    const stats = await prisma.invoice.groupBy({
      by: ['status', 'currency'],
      where: { userId: user.id },
      _count: { id: true },
      _sum: { total: true },
    });

    const totalRevenue = await prisma.invoice.aggregate({
      where: { userId: user.id, status: 'paid' },
      _sum: { total: true },
    });

    const overdueInvoices = await prisma.invoice.count({
      where: {
        userId: user.id,
        status: 'overdue',
      },
    });

    const thisMonthRevenue = await prisma.invoice.aggregate({
      where: {
        userId: user.id,
        status: 'paid',
        paidAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { total: true },
    });

    return {
      success: true,
      data: {
        byStatus: stats,
        totalRevenue: totalRevenue._sum.total || 0,
        overdueCount: overdueInvoices,
        thisMonthRevenue: thisMonthRevenue._sum.total || 0,
      },
    };
  } catch (error) {
    console.error('Error fetching invoice stats:', error);
    return { success: false, error: 'Failed to fetch invoice statistics' };
  }
}

// Mark invoice as paid
export async function markInvoiceAsPaid(id: string, input: MarkAsPaidInput) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: ERROR_MESSAGES.UNAUTHORIZED };
    }

    const validatedData = markAsPaidSchema.parse(input);

    const invoice = await prisma.invoice.findFirst({
      where: { id, userId: user.id },
    });

    if (!invoice) {
      return { success: false, error: ERROR_MESSAGES.NOT_FOUND };
    }

    if (invoice.status === 'paid') {
      return { success: false, error: 'Invoice is already marked as paid' };
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: 'paid',
        paidAt: validatedData.paidAt,
      },
      include: {
        client: true,
        lineItems: true,
      },
    });

    revalidatePath('/invoices');
    revalidatePath(`/invoices/${id}`);
    revalidatePath('/');

    return { success: true, data: updatedInvoice };
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    return { success: false, error: 'Failed to mark invoice as paid' };
  }
}

// Duplicate an invoice
export async function duplicateInvoice(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: ERROR_MESSAGES.UNAUTHORIZED };
    }

    const originalInvoice = await prisma.invoice.findFirst({
      where: { id, userId: user.id },
      include: { lineItems: true },
    });

    if (!originalInvoice) {
      return { success: false, error: ERROR_MESSAGES.NOT_FOUND };
    }

    // Create new invoice with duplicated data
    const newInput: CreateInvoiceInput = {
      clientId: originalInvoice.clientId,
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      currency: originalInvoice.currency,
      status: 'draft',
      notes: originalInvoice.notes,
      terms: originalInvoice.terms,
      lineItems: originalInvoice.lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        taxRate: item.taxRate,
      })),
    };

    return createInvoice(newInput);
  } catch (error) {
    console.error('Error duplicating invoice:', error);
    return { success: false, error: 'Failed to duplicate invoice' };
  }
}