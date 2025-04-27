import { getCandidatesForPosition } from '../../../application/services/positionService';
import { Position } from '../../../domain/models/Position';

// Mock de Position correctamente estructurado
jest.mock('../../../domain/models/Position', () => ({
  Position: {
    findOne: jest.fn(),
    getCandidatesForPosition: jest.fn()
  }
}));

describe('Position Service', () => {
  // Limpiar mocks después de cada test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCandidatesForPosition', () => {
    it('should throw an error if position does not exist', async () => {
      // Mock de Position.findOne retornando null
      (Position.findOne as jest.Mock).mockResolvedValue(null);
      
      await expect(getCandidatesForPosition(999)).rejects.toThrow('Position not found');
      expect(Position.findOne).toHaveBeenCalledWith(999);
    });
    
    it('should return candidates for a valid position', async () => {
      // Mock de posición existente
      (Position.findOne as jest.Mock).mockResolvedValue({ id: 1 });
      
      // Mock de datos de candidatos
      const mockCandidates = [
        { id: 1, fullName: 'Test Candidate' }
      ];
      (Position.getCandidatesForPosition as jest.Mock).mockResolvedValue(mockCandidates);
      
      const result = await getCandidatesForPosition(1);
      expect(result).toEqual(mockCandidates);
      expect(Position.findOne).toHaveBeenCalledWith(1);
      expect(Position.getCandidatesForPosition).toHaveBeenCalledWith(1, {});
    });

    it('should pass options to getCandidatesForPosition', async () => {
      (Position.findOne as jest.Mock).mockResolvedValue({ id: 1 });
      (Position.getCandidatesForPosition as jest.Mock).mockResolvedValue([]);
      const options = { sort: 'score', order: 'desc', limit: 10, offset: 5 };

      await getCandidatesForPosition(1, options);
      expect(Position.getCandidatesForPosition).toHaveBeenCalledWith(1, options);
    });
  });
}); 