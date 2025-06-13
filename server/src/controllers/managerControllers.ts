import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getManager = async (req: Request, res: Response): Promise<void> => {
  const { cognitoId } = req.params;

  try {
    const manager = await prisma.manager.findUnique({
      where: { cognitoId },
    });

    if (!manager) {
      res.status(404).json({ message: 'Manager not found' });
      return;
    }

    res.status(200).json(manager);

  } catch (error) {
    console.error('Error fetching manager:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const createManager = async (req: Request, res: Response): Promise<void> => {
  const { cognitoId, name, email, phoneNumber } = req.body;

  if (!cognitoId || !name || !email || !phoneNumber) {
    res.status(400).json({ message: 'Missing required fields' });
    return;
  }

  try {
    const existingManager = await prisma.manager.findUnique({
      where: { cognitoId },
    });

    if (existingManager) {
      res.status(409).json({ message: 'Manager already exists' });
      return;
    }

    const newManager = await prisma.manager.create({
      data: {
        cognitoId,
        name,
        email,
        phoneNumber
      },
    });

    res.status(201).json(newManager);

  } catch (error) {
    console.error('Error creating manager:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateManager = async (req: Request, res: Response): Promise<void> => {
  const { cognitoId } = req.params;
  const { name, email, phoneNumber } = req.body;

  if (!name && !email && !phoneNumber) {
    res.status(400).json({ message: 'No fields to update' });
    return;
  }

  try {
    const updatedManager = await prisma.manager.update({
      where: { cognitoId },
      data: {
        name,
        email,
        phoneNumber,
      },
    });

    res.status(200).json(updatedManager);

  } catch (error) {
    console.error('Error updating manager:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};