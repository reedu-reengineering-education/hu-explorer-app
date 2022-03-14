import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    const body = JSON.parse(req.body);

    try {
      const result = await prisma.artRecord.create({
        data: body,
      });
      res.status(201).json(result);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error,
      });
    }
  } else if (req.method === 'GET') {
    const results = await prisma.artRecord.findMany({});
    res.status(201).json(results);
  } else if (req.method === 'DELETE') {
    const body = JSON.parse(req.body);

    try {
      const result = await prisma.artRecord.delete({
        where: {
          id: body.id,
        },
      });
      res.status(201).json(result);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error,
      });
    }
  } else if (req.method === 'PUT') {
    const body = JSON.parse(req.body);

    try {
      const result = await prisma.artRecord.update({
        where: {
          id: body.id,
        },
        data: {
          art: body.art,
          count: body.count,
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
