import { Request, Response } from 'express';
import { updateApplicationStage, getApplicationWithDetails } from '../../application/services/applicationService';

export const updateStage = async (req: Request, res: Response) => {
  try {
    const applicationId = parseInt(req.params.id);
    if (isNaN(applicationId)) {
      return res.status(400).json({ error: 'Invalid application ID format' });
    }
    
    const { interviewStepId, notes } = req.body;
    
    if (!interviewStepId || isNaN(parseInt(interviewStepId.toString()))) {
      return res.status(400).json({ error: 'Invalid or missing interview step ID' });
    }
    
    await updateApplicationStage(applicationId, parseInt(interviewStepId.toString()), notes);
    const updatedApplication = await getApplicationWithDetails(applicationId);
    
    if (!updatedApplication) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json(updatedApplication);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Application not found') {
        return res.status(404).json({ error: 'Application not found' });
      }
      if (error.message === 'Invalid interview step') {
        return res.status(400).json({ error: 'Invalid interview step' });
      }
    }
    console.error('Error updating application stage:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}; 