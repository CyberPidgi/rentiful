import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";

const prisma = new PrismaClient();

export const getTenant = async (req: Request, res: Response): Promise<void> => {
  const { cognitoId } = req.params;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { cognitoId },
      include: {
        favorites: true,
      },
    });

    if (!tenant) {
      res.status(404).json({ message: "Tenant not found" });
      return;
    }

    res.status(200).json(tenant);
  } catch (error) {
    console.error("Error fetching tenant:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createTenant = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { cognitoId, name, email, phoneNumber } = req.body;

  if (
    !cognitoId ||
    name === undefined ||
    email === undefined ||
    phoneNumber === undefined
  ) {
    res.status(400).json({ message: `Missing required fields` });
    return;
  }

  try {
    const existingTenant = await prisma.tenant.findUnique({
      where: { cognitoId },
    });

    if (existingTenant) {
      res.status(409).json({ message: "Tenant already exists" });
      return;
    }

    const newTenant = await prisma.tenant.create({
      data: {
        cognitoId,
        name,
        email,
        phoneNumber,
      },
    });

    res.status(201).json(newTenant);
  } catch (error) {
    console.error("Error creating tenant:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTenant = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { cognitoId } = req.params;
  const { name, email, phoneNumber } = req.body;

  if (!name && !email && !phoneNumber) {
    res.status(201).json({ message: "No fields to update" });
    return;
  }

  try {
    const updatedTenant = await prisma.tenant.update({
      where: { cognitoId },
      data: {
        name,
        email,
        phoneNumber,
      },
    });

    res.status(200).json(updatedTenant);
  } catch (error) {
    console.error("Error updating tenant:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTenantProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { cognitoId } = req.params;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { cognitoId },
    });

    if (!tenant) {
      res.status(404).json({ message: "Tenant not found" });
      return;
    }

    const properties = await prisma.property.findMany({
      where: {
        tenants: {
          some: { cognitoId: cognitoId },
        },
      },
      include: {
        location: true,
      },
    });

    const propertiesWithFormattedLocation = await Promise.all(
      properties.map(async (property) => {
        const coordinates: { coordinates: string }[] = await prisma.$queryRaw`
        SELECT ST_asText(coordinates) as coordinates
        FROM "Location"
        WHERE id = ${property.location.id}
        `;

        const geoJSON: any = wktToGeoJSON(coordinates[0].coordinates || "");
        const [longitude, latitude] = geoJSON.coordinates;

        return {
          ...property,
          location: {
            ...property.location,
            coordinates: {
              latitude,
              longitude,
            },
          },
        };
      })
    );

    res.status(200).json(propertiesWithFormattedLocation);
  } catch (error) {
    console.error(
      `Error fetching properties for tenant with cognitoId ${cognitoId}:`,
      error
    );
    res.status(500).json({ message: "Internal server error" });
  }
};


export const addFavoriteProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { cognitoId, propertyId } = req.params;

  if (!propertyId) {
    res.status(400).json({ message: "Property ID is required" });
    return;
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { cognitoId },
      include: {
        favorites: true,
      },
    });

    if (!tenant) {
      res.status(404).json({ message: "Tenant not found" });
      return;
    }

    const propertyIdNumber = Number(propertyId);
    const existingFavorite = tenant.favorites || [];

    if (existingFavorite.some((fav) => fav.id === propertyIdNumber)) {
      res.status(200).json({ message: "Property already in favorites" });
      return;
    }

    const updatedTenant = await prisma.tenant.update({
      where: { cognitoId },
      data: {
        favorites: {
          connect: { id: propertyIdNumber },
        },
      },
      include: {
        favorites: true,
      }
    });

    res.status(200).json(updatedTenant);

  } catch (error) {
    console.error("Error adding favorite property:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const removeFavoriteProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { cognitoId, propertyId } = req.params;

  if (!propertyId) {
    res.status(400).json({ message: "Property ID is required" });
    return;
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { cognitoId },
      include: {
        favorites: true,
      },
    });

    if (!tenant) {
      res.status(404).json({ message: "Tenant not found" });
      return;
    }

    const propertyIdNumber = Number(propertyId);
    const existingFavorite = tenant.favorites || [];

    if (!existingFavorite.some((fav) => fav.id === propertyIdNumber)) {
      res.status(200).json({ message: "Property not in favorites" });
      return;
    }

    const updatedTenant = await prisma.tenant.update({
      where: { cognitoId },
      data: {
        favorites: {
          disconnect: { id: propertyIdNumber },
        },
      },
      include: {
        favorites: true,
      }
    });

    res.status(200).json(updatedTenant);

  } catch (error) {
    console.error("Error removing favorite property:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
