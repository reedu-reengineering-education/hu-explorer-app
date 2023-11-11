import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const { deviceId, from, to } = req.query;
    try {
      const results = await prisma.artenvielfaltRecord.findMany({
        where: {
          deviceId: deviceId as string,
          createdAt: {
            gte: from as string,
            lte: to as string,
          },
        },
        include: {
          arten: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
      res.status(201).json(results);
    } catch (error) {}
  } else {
    res.status(405).json({});
  }
}
