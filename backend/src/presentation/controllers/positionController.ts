import { Request, Response } from 'express';
import { getCandidatesForPosition } from '../../application/services/positionService';

export const getPositionCandidates = async (req: Request, res: Response) => {
  try {
    const positionId = parseInt(req.params.id);
    if (isNaN(positionId)) {
      return res.status(400).json({ error: 'Invalid position ID format' });
    }
    
    const options = {
      sort: req.query.sort as string || 'name',
      order: req.query.order as string || 'asc',
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0
    };
    
    const candidates = await getCandidatesForPosition(positionId, options);
    res.json(candidates);
  } catch (error) {
    if (error instanceof Error && error.message === 'Position not found') {
      return res.status(404).json({ error: 'Position not found' });
    }
    console.error('Error retrieving position candidates:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}; 