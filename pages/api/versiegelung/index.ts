import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    try {
      const body = JSON.parse(req.body);

      const exists = await prisma.versiegelungRecord.findMany({
        where: {
          deviceId: body.deviceId,
          createdAt: new Date(),
        },
      });

      if (exists.length > 0) {
        const result = await prisma.versiegelungRecord.update({
          where: {
            id: exists[0].id,
          },
          data: {
            value: parseFloat(body.value),
          },
        });
        res.status(201).json(result);
      } else {
        const result = await prisma.versiegelungRecord.create({
          data: {
            value: parseFloat(body.value),
            group: body.group,
            deviceId: body.deviceId,
          },
        });
        res.status(201).json(result);
      }
    } catch (error) {
      res.status(500).json({
        error,
      });
    }
  } else if (req.method === 'GET') {
    const { project, from, to } = req.query;

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
    const aggregations = await prisma.versiegelungRecord.aggregate({
      _avg: {
        value: true,
      },
      where: {
        deviceId: {
          in: deviceIds,
        },
        createdAt: {
          gte: from as string,
          lte: to as string,
        },
      },
    });
    const measurements = await prisma.versiegelungRecord.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
      where: {
        deviceId: {
          in: deviceIds,
        },
        createdAt: {
          gte: from as string,
          lte: to as string,
        },
      },
    });

    const grouped = await prisma.versiegelungRecord.groupBy({
      by: ['createdAt'],
      _avg: {
        value: true,
      },
      where: {
        deviceId: {
          in: deviceIds,
        },
        createdAt: {
          gte: from as string,
          lte: to as string,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(201).json({
      aggregations,
      lastMeasurement: measurements[0],
      measurements,
      grouped,
    });
  } else {
    res.status(405).json({});
  }
}
