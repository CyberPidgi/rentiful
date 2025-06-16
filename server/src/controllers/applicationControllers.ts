import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const listApplications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, userType } = req.query;

    let whereClause: any = {};

    if (!userId || !userType) {
      res
        .status(400)
        .json({ message: "Missing userId or userType query parameters" });
      return;
    }

    if (userType === "tenant") {
      whereClause = { tenantCognitoId: String(userId) };
    } else if (userType === "manager") {
      whereClause = { property: { managerCognitoId: String(userId) } };
    } else {
      res
        .status(400)
        .json({ message: 'Invalid userType. Must be "tenant" or "manager".' });
      return;
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        property: {
          include: {
            manager: true,
            location: true,
          },
        },
        tenant: true,
      },
    });

    function calculateNextPaymentDate(startDate: Date): Date {
      const today = new Date();
      const nextPaymentDate = new Date(startDate);
      while (nextPaymentDate <= today) {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      }
      return nextPaymentDate;
    }

    const formattedApplications = await Promise.all(
      applications.map(async (application) => {
        const lease = await prisma.lease.findFirst({
          where: {
            tenant: {
              cognitoId: application.tenantCognitoId,
            },
            propertyId: application.propertyId,
          },
          orderBy: { startDate: "desc" },
        });

        return {
          ...application,
          property: {
            ...application.property,
            address: application.property.location.address,
          },
          manager: application.property.manager,
          lease: lease
            ? {
                ...lease,
                nextPaymentDate: calculateNextPaymentDate(lease.startDate),
              }
            : null,
        };
      })
    );

    res.json(formattedApplications);

    if (applications.length === 0) {
      res.status(404).json({ message: "No applications found" });
      return;
    }

    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      applicationDate,
      status,
      propertyId,
      tenantCognitoId,
      name,
      email,
      phoneNumber,
      message,
    } = req.body;

    if (!applicationDate || !status || !propertyId || !tenantCognitoId) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        pricePerMonth: true,
        securityDeposit: true,
      },
    });

    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    const newApplication = await prisma.$transaction(async (tx) => {
      const lease = tx.lease.create({
        data: {
          startDate: new Date(),
          endDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ),
          rent: property.pricePerMonth,
          deposit: property.securityDeposit,
          property: {
            connect: { id: propertyId },
          },
          tenant: {
            connect: { cognitoId: tenantCognitoId },
          },
        },
      });

      const application = tx.application.create({
        data: {
          applicationDate: new Date(applicationDate),
          status,
          name,
          email,
          phoneNumber,
          message,
          property: {
            connect: { id: propertyId },
          },
          tenant: {
            connect: { cognitoId: tenantCognitoId },
          },
        },
        include: {
          property: true,
          tenant: true,
          lease: true,
        },
      });

      return application;
    }); 

    res.status(201).json(newApplication);
  } catch (error) {
    console.error("Error creating application:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const updateApplicationStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ message: "Status is required" });
      return;
    }

    const application = await prisma.application.findUnique({
      where: { id: Number(id) },
      include: {
        property: true,
        tenant: true,
      }
    });

    if (!application) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    if (status === 'Approved'){
      const newLease = await prisma.lease.create({
        data: {
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          rent: application.property.pricePerMonth,
          deposit: application.property.securityDeposit,
          propertyId: application.propertyId,
          tenantCognitoId: application.tenantCognitoId,
        }
      });

      await prisma.property.update({
        where: { id: application.propertyId},
        data: {
          tenants: {
            connect: { cognitoId: application.tenantCognitoId }
          }
        }
      })

      await prisma.application.update({
        where: { id: Number(id) },
        data: {
          status,
          leaseId: newLease.id, // Associate the new lease with the application
        },
        include: {
          property: true,
          tenant: true,
          lease: true, // Include the newly created lease in the response
        }
      })
    } else if (status === 'Rejected') {
      // If the application is rejected, we can simply update the status
      await prisma.application.update({
        where: { id: Number(id) },
        data: { status },
        include: {
          property: true,
          tenant: true,
        },
      });
    } else {
      res.status(400).json({ message: "Invalid status. Must be 'Approved' or 'Rejected'." });
      return;
    }

    const updatedApplication = await prisma.application.findUnique({
      where: { id: Number(id) },
      include: {
        property: true,
        tenant: true,
        lease: true, // Include the lease if it was created
      },
    })

    res.status(200).json(updatedApplication);
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
