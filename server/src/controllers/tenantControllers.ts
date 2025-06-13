import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTenant = async (req: Request, res: Response): Promise<void> => {
  const { cognitoId } = req.params;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { cognitoId },
      include: {
        favorites: true,
      }
    });

    if (!tenant) {
      res.status(404).json({ message: 'Tenant not found' });
      return;
    }

    res.status(200).json(tenant);

  } catch (error) {
    console.error('Error fetching tenant:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const createTenant = async (req: Request, res: Response): Promise<void> => {
  const { cognitoId, name, email, phoneNumber } = req.body;

  if (!cognitoId || name === undefined || email === undefined || phoneNumber === undefined) {
    res.status(400).json({ message: `Missing required fields` });
    return;
  }

  try {
    const existingTenant = await prisma.tenant.findUnique({
      where: { cognitoId },
    });

    if (existingTenant) {
      res.status(409).json({ message: 'Tenant already exists' });
      return;
    }

    const newTenant = await prisma.tenant.create({
      data: {
        cognitoId,
        name,
        email,
        phoneNumber
      },
    });

    res.status(201).json(newTenant);

  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateTenant = async (req: Request, res: Response): Promise<void> => {
  const { cognitoId } = req.params;
  const { name, email, phoneNumber } = req.body;

  if (!name && !email && !phoneNumber) {
    res.status(201).json({ message: 'No fields to update' });
    return;
  }

  try {
    const updatedTenant = await prisma.tenant.update({
      where: { cognitoId },
      data: {
        name,
        email,
        phoneNumber
      },
    });

    res.status(200).json(updatedTenant);

  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};