'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  createClientSchema, 
  updateClientSchema, 
  type CreateClientInput, 
  type UpdateClientInput,
  type ClientFilter 
} from '@/lib/validations/client';
import { Prisma } from '@prisma/client';

// Error messages
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You must be logged in to perform this action',
  NOT_FOUND: 'Client not found',
  DUPLICATE_EMAIL: 'A client with this email already exists',
  DELETE_FAILED: 'Failed to delete client. They may have associated invoices.',
};

// Create a new client
export async function createClient(input: CreateClientInput) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    // Validate input
    const validatedData = createClientSchema.parse(input);

    // Check for duplicate email
    const existingClient = await prisma.client.findFirst({
      where: {
        userId: user.id,
        email: validatedData.email,
      },
    });

    if (existingClient) {
      throw new Error(ERROR_MESSAGES.DUPLICATE_EMAIL);
    }

    // Create client
    const client = await prisma.client.create({
      data: {
        ...validatedData,
        userId: user.id,
      },
    });

    revalidatePath('/clients');
    return { success: true, data: client };
  } catch (error) {
    console.error('Create client error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create client',
    };
  }
}

// Update an existing client
export async function updateClient(id: string, input: UpdateClientInput) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    // Validate input
    const validatedData = updateClientSchema.parse(input);

    // Check if client exists and belongs to user
    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingClient) {
      throw new Error(ERROR_MESSAGES.NOT_FOUND);
    }

    // Check for duplicate email if email is being updated
    if (validatedData.email && validatedData.email !== existingClient.email) {
      const duplicateClient = await prisma.client.findFirst({
        where: {
          userId: user.id,
          email: validatedData.email,
          NOT: { id },
        },
      });

      if (duplicateClient) {
        throw new Error(ERROR_MESSAGES.DUPLICATE_EMAIL);
      }
    }

    // Update client
    const client = await prisma.client.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath('/clients');
    revalidatePath(`/clients/${id}`);
    return { success: true, data: client };
  } catch (error) {
    console.error('Update client error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update client',
    };
  }
}

// Delete a client
export async function deleteClient(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    // Check if client exists and belongs to user
    const client = await prisma.client.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        invoices: {
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!client) {
      throw new Error(ERROR_MESSAGES.NOT_FOUND);
    }

    // Prevent deletion if client has invoices
    if (client.invoices.length > 0) {
      throw new Error(ERROR_MESSAGES.DELETE_FAILED);
    }

    // Delete client
    await prisma.client.delete({
      where: { id },
    });

    revalidatePath('/clients');
    return { success: true };
  } catch (error) {
    console.error('Delete client error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete client',
    };
  }
}

// Get a single client
export async function getClient(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    const client = await prisma.client.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            total: true,
            status: true,
            dueDate: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            invoices: true,
            timeEntries: true,
          },
        },
      },
    });

    if (!client) {
      throw new Error(ERROR_MESSAGES.NOT_FOUND);
    }

    return { success: true, data: client };
  } catch (error) {
    console.error('Get client error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch client',
    };
  }
}

// Get clients with pagination and filters
export async function getClients(filter: ClientFilter = {}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    const {
      search,
      city,
      state,
      country,
      hasInvoices,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      pageSize = 20,
    } = filter;

    // Build where clause
    const where: Prisma.ClientWhereInput = {
      userId: user.id,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(state && { state: { contains: state, mode: 'insensitive' } }),
      ...(country && { country: { contains: country, mode: 'insensitive' } }),
      ...(hasInvoices !== undefined && {
        invoices: hasInvoices ? { some: {} } : { none: {} },
      }),
    };

    // Get total count
    const totalCount = await prisma.client.count({ where });

    // Get clients
    const clients = await prisma.client.findMany({
      where,
      include: {
        _count: {
          select: {
            invoices: true,
            timeEntries: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      success: true,
      data: {
        clients,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        },
      },
    };
  } catch (error) {
    console.error('Get clients error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch clients',
    };
  }
}

// Search clients (for autocomplete)
export async function searchClients(query: string, limit = 10) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    const clients = await prisma.client.findMany({
      where: {
        userId: user.id,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      take: limit,
    });

    return { success: true, data: clients };
  } catch (error) {
    console.error('Search clients error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search clients',
    };
  }
}

// Get client statistics
export async function getClientStats(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    // Verify client belongs to user
    const client = await prisma.client.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!client) {
      throw new Error(ERROR_MESSAGES.NOT_FOUND);
    }

    // Get statistics
    const [invoiceStats, timeEntryStats] = await Promise.all([
      prisma.invoice.aggregate({
        where: { clientId: id },
        _count: true,
        _sum: { total: true },
      }),
      prisma.timeEntry.aggregate({
        where: { clientId: id },
        _sum: { hours: true },
      }),
    ]);

    const paidInvoices = await prisma.invoice.aggregate({
      where: {
        clientId: id,
        status: 'paid',
      },
      _sum: { total: true },
    });

    return {
      success: true,
      data: {
        totalInvoices: invoiceStats._count,
        totalRevenue: invoiceStats._sum.total || 0,
        paidRevenue: paidInvoices._sum.total || 0,
        totalHours: timeEntryStats._sum.hours || 0,
      },
    };
  } catch (error) {
    console.error('Get client stats error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch client statistics',
    };
  }
}