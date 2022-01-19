import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    try {
      const body = JSON.parse(req.body);
      const result = await prisma.versiegelungRecord.create({
        data: {
          value: parseFloat(body.value),
          group: body.group,
        },
      });
      res.status(201).json(result);
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
