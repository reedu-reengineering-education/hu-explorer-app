import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const { deviceId } = req.query;
    try {
      const results = await prisma.versiegelungRecord.findMany({
        where: {
          deviceId: deviceId as string,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      res.status(201).json(results);
    } catch (error) {}
  } else {
    res.status(405).json({});
  }
}
