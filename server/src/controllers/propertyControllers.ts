import { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";
import { Upload } from "@aws-sdk/lib-storage";
import { S3Client } from "@aws-sdk/client-s3";
import { format } from "path";
import axios from "axios";
import { Location } from "@prisma/client";

const prisma = new PrismaClient();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

export const getProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      favorites,
      priceMin,
      priceMax,
      beds,
      baths,
      propertyType,
      squareFeetMin,
      squareFeetMax,
      amenities,
      availableFrom,
      latitude,
      longitude,
    } = req.query;

    let whereConditions: Prisma.Sql[] = [];

    if (favorites) {
      const favoriteIds = (favorites as string)
        .split(",")
        .map((id) => parseInt(id, 10));
      whereConditions.push(Prisma.sql`p.id IN (${Prisma.join(favoriteIds)})`);
    }

    if (priceMin) {
      whereConditions.push(
        Prisma.sql`p."pricePerMonth" >= ${Number(priceMin as string)}`
      );
    }

    if (priceMax) {
      whereConditions.push(
        Prisma.sql`p."pricePerMonth" <= ${Number(priceMax as string)}`
      );
    }

    if (beds && beds === "any") {
      whereConditions.push(Prisma.sql`p.beds >= ${Number(beds as string)}`);
    }

    if (baths && baths === "any") {
      whereConditions.push(Prisma.sql`p.baths >= ${Number(baths as string)}`);
    }

    if (squareFeetMin) {
      whereConditions.push(
        Prisma.sql`p."squareFeet" >= ${Number(squareFeetMin as string)}`
      );
    }
    if (squareFeetMax) {
      whereConditions.push(
        Prisma.sql`p."squareFeet" <= ${Number(squareFeetMax as string)}`
      );
    }

    if (propertyType && propertyType !== "any") {
      // type::enum_type is used to cast the string to the enum type
      whereConditions.push(
        Prisma.sql`p."propertyType" <= ${propertyType}::"PropertyType"`
      );
    }

    if (amenities && amenities !== "any") {
      const amenitiesArray = (amenities as string).split(",");

      // @> checks if the array contains all elements in the right order
      whereConditions.push(Prisma.sql`p."amenities" @> ${amenitiesArray}`);
    }

    if (availableFrom && availableFrom !== "any") {
      const availableFromDate =
        typeof availableFrom === "string" ? availableFrom : null;

      if (!availableFromDate) {
        res.status(400).json({ message: "Invalid availableFrom date" });
        return;
      }

      const date = new Date(availableFromDate);
      if (isNaN(date.getTime())) {
        res.status(400).json({ message: "Invalid availableFrom date" });
        return;
      }

      whereConditions.push(
        Prisma.sql`EXISTS (SELECT 1 FROM "Lease" l WHERE l."propertyId" = p.id AND l."startDate" <= ${date.toISOString()})`
      );
    }

    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lon = parseFloat(longitude as string);

      if (isNaN(lat) || isNaN(lon)) {
        res.status(400).json({ message: "Invalid latitude or longitude" });
        return;
      }

      const radiusInKm = 1000;
      const degrees = radiusInKm / 111; // Approximate conversion from km to degrees

      whereConditions.push(
        Prisma.sql`ST_DWithin(l.coordinates::geometry, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326), ${degrees})`
      );
    }

    const searchQuery = Prisma.sql`SELECT p.*, json_build_object('id', l.id, 'address', l.address, 'city', l.city, 'state', l.state, 'country', l.country, 'postalCode', l."postalCode", 'coordinates', json_build_object('latitude', ST_Y(l."coordinates"::geometry), 'longitude', ST_X(l."coordinates"::geometry))) as location
      FROM "Property" p
      JOIN "Location" l ON p."locationId" = l.id
      ${
        whereConditions.length > 0
          ? Prisma.sql`WHERE ${Prisma.join(whereConditions, " AND ")}`
          : Prisma.empty
      }
    `;

    console.log("Search Query:", searchQuery);

    const properties = await prisma.$queryRaw(searchQuery);

    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching manager:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
      include: {
        location: true,
      },
    });

    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    const coordinates: { coordinates: string }[] = await prisma.$queryRaw`
      SELECT ST_asText(coordinates) as coordinates
      FROM "Location"
      WHERE id = ${property.location.id}
      `;

    const geoJSON: any = wktToGeoJSON(coordinates[0].coordinates || "");
    const [longitude, latitude] = geoJSON.coordinates;

    res.status(200).json({
      ...property,
      location: {
        ...property.location,
        coordinates: {
          latitude,
          longitude,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    const {
      address,
      city,
      state,
      country,
      postalCode,
      managerCognitoId,
      ...propertyData
    } = req.body;

    const photoUrls = await Promise.all(
      files.map(async (file) => {
        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME || "",
          Key: `properties/${Date.now()}_${file.originalname}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        const uploadResult = await new Upload({
          client: s3Client,
          params: uploadParams,
        }).done();

        return uploadResult.Location;
      })
    );

    const geoCodingUrl = `https://nominatim.openstreetmap.org/${new URLSearchParams(
      {
        street: address,
        city,
        country,
        postalcode: postalCode,
        format: "json",
        limit: "1",
      }
    ).toString()}`;
    const geoCodingResponse = await axios.get(geoCodingUrl, {
      headers: {
        "User-Agent": "Rentify/1.0",
      },
    });

    const longitude = parseFloat(
      geoCodingResponse.data[0].lon || "0"
    );
    const latitude = parseFloat(
      geoCodingResponse.data[0].lat || "0"
    );

    const [location] = await prisma.$queryRaw<Location[]>`
      INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
      VALUES (${address}, ${city}, ${state}, ${country}, ${postalCode}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))
      RETURNING id, address, city, state, country, "postalCode", ST_AsText(coordinates) as coordinates;
    `;

    // create property
    const newProperty = await prisma.property.create({
      data: {
        ...propertyData,
        photoUrls,
        locationId: location.id,
        managerCognitoId,
        amenities:
          typeof propertyData.amenities === "string"
            ? propertyData.amenities.split(",")
            : [],
        highlights:
          typeof propertyData.highlights === "string"
            ? propertyData.highlights.split(",")
            : [],
        isPetsAllowed: propertyData.isPetsAllowed === "true",
        isParkingIncluded: propertyData.isParkingIncluded === "true",
        pricePerMonth: parseFloat(propertyData.pricePerMonth),
        securityDeposit: parseFloat(propertyData.securityDeposit),
        applicationFee: parseFloat(propertyData.applicationFee),
        beds: parseInt(propertyData.beds),
        baths: parseFloat(propertyData.baths),
        squareFeet: parseInt(propertyData.squareFeet),
      },
      include: {
        location: true,
        manager: true,
      },
    });
  
  } catch (error) {
    console.error("Error creating property:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
