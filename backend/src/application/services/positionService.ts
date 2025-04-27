import { Position } from '../../domain/models/Position';

export const getCandidatesForPosition = async (positionId: number, options: any = {}) => {
  // Verificar que la posición existe
  const position = await Position.findOne(parseInt(positionId.toString()));
  if (!position) {
    throw new Error('Position not found');
  }
  
  // Obtener candidatos usando el método del modelo de dominio
  return await Position.getCandidatesForPosition(parseInt(positionId.toString()), options);
}; 