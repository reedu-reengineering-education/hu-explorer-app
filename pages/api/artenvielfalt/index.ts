import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    const body = JSON.parse(req.body);

    try {
      const result = await prisma.artenvielfaltRecord.create({
        data: {
          deviceId: body.deviceId,
          simpsonIndex: body.simpsonIndex,
          group: body.group,
        },
      });
      res.status(201).json(result);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error,
      });
    }
  } else if (req.method === 'GET') {
    const { project } = req.query;

    // fetch boxes from osem api
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_OSEM_API
      }/boxes?format=json&full=true&grouptag=HU Explorers${
        project ? ',' + project : ''
      }`,
    );
    const devices = await response.json();
    const deviceIds = devices.flatMap(device => device._id);

    // Get records and calculate average
    const aggregations = await prisma.artenvielfaltRecord.aggregate({
      _avg: {
        simpsonIndex: true,
      },
      where: {
        deviceId: {
          in: deviceIds,
        },
      },
    });

    const measurements = await prisma.artenvielfaltRecord.findMany({
      include: {
        arten: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      where: {
        deviceId: {
          in: deviceIds,
        },
      },
    });

    res
      .status(201)
      .json({ aggregations, lastMeasurement: measurements[0], measurements });
  } else if (req.method === 'PUT') {
    const body = JSON.parse(req.body);

    try {
      const result = await prisma.artenvielfaltRecord.update({
        where: {
          id: body.id,
        },
        data: {
          simpsonIndex: body.simpsonIndex,
        },
      });
      res.status(201).json(result);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error,
      });
    }
  } else {
    res.status(405).json({});
  }
}
