import { Application } from '../../domain/models/Application';

export const updateApplicationStage = async (applicationId: number, interviewStepId: number, notes?: string) => {
  const application = await Application.findOne(applicationId);
  if (!application) {
    throw new Error('Application not found');
  }
  
  // Actualizar la etapa usando el método del modelo de dominio
  return await application.updateStage(interviewStepId, notes);
};

export const getApplicationWithDetails = async (applicationId: number) => {
  return await Application.findOneWithDetails(applicationId);
}; 