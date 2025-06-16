import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getLeases = async (req: Request, res: Response): Promise<void> => {

  try {
    const leases = await prisma.lease.findMany({
      include: {
        tenant: true,
        property: true,
      },
    });

    if (leases.length === 0) {
      res.status(404).json({ message: 'No leases found for this property' });
      return;
    }

    res.status(200).json(leases);
  } catch (error) {
    console.error('Error fetching leases:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export const getLeasePayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id }  = req.params;
    const leasePayments = await prisma.payment.findMany({
      where: { leaseId: Number(id) },
    });
  } catch (error) {
    console.error('Error fetching lease payments:', error);
    res.status(500).json({ message: 'Internal server error' });
    
  }
}