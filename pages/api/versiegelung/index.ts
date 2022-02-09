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
    const results = await prisma.versiegelungRecord.findMany();
    res.status(201).json(results);
  } else {
    res.status(405).json({});
  }
}
