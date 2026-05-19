import { Request, Response } from 'express';
// @ts-ignore
import resources from '../../data/resources';

export const getResources = async (req: Request, res: Response) => {
  const topic = ((req.query.topic as string) || '').toLowerCase().trim();

  if (!topic) {
    return res.status(400).json({
      success: false,
      message: 'Topic is required',
    });
  }

  const result = (resources as any)[topic] || [];

  return res.status(200).json({
    success: true,
    topic,
    count: result.length,
    resources: result,
  });
};
