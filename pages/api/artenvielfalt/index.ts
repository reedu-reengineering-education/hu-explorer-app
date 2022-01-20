import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    try {
      const result = await prisma.artenvielfaltRecord.create({
        data: {
          art: 'Rose',
          count: 25,
          group: 'sensebox1',
        },
      });
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        error,
      });
    }
  } else if (req.method === 'GET') {
    const results = await prisma.artenvielfaltRecord.findMany();
    res.status(201).json(results);
  } else {
    res.status(405).json({});
  }
}