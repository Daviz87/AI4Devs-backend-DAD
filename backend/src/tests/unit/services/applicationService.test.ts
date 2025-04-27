import { updateApplicationStage, getApplicationWithDetails } from '../../../application/services/applicationService';
import { Application } from '../../../domain/models/Application';

// Mock de la clase Application
jest.mock('../../../domain/models/Application');

// Crear una instancia mock de Application con el método updateStage mockeado
const mockUpdateStage = jest.fn();
const MockApplication = jest.fn().mockImplementation(() => {
  return { updateStage: mockUpdateStage }; 
});

// Asignar el constructor mock a la clase Application mockeada
(Application as unknown as jest.Mock) = MockApplication;

// Asignar mocks para los métodos estáticos
(Application as any).findOne = jest.fn();
(Application as any).findOneWithDetails = jest.fn();

describe('Application Service', () => {
  // Limpiar mocks después de cada test
  afterEach(() => {
    jest.clearAllMocks();
    mockUpdateStage.mockClear(); // Limpiar el mock del método de instancia
  });

  describe('updateApplicationStage', () => {
    it('should throw an error if application does not exist', async () => {
      // Mock de Application.findOne retornando null
      (Application.findOne as jest.Mock).mockResolvedValue(null);
      
      await expect(updateApplicationStage(999, 1)).rejects.toThrow('Application not found');
      expect(Application.findOne).toHaveBeenCalledWith(999);
    });
    
    it('should call updateStage on the application instance returned by findOne', async () => {
      // Crear una instancia mock específica para este test
      const specificMockInstance = { 
          id: 1,
          updateStage: jest.fn().mockResolvedValue({ id: 1, currentInterviewStep: 2 })
      };
      // Asegurarnos de que findOne devuelva esta instancia específica
      (Application.findOne as jest.Mock).mockResolvedValue(specificMockInstance);

      await updateApplicationStage(1, 2, 'Test notes');
      
      expect(Application.findOne).toHaveBeenCalledWith(1);
      // Verificar que se llamó al método de la instancia devuelta por findOne
      expect(specificMockInstance.updateStage).toHaveBeenCalledWith(2, 'Test notes');
    });
  });

  describe('getApplicationWithDetails', () => {
    it('should call findOneWithDetails static method', async () => {
      const mockDetails = { id: 1, notes: 'Details' };
      (Application.findOneWithDetails as jest.Mock).mockResolvedValue(mockDetails);

      const result = await getApplicationWithDetails(1);
      expect(result).toEqual(mockDetails);
      expect(Application.findOneWithDetails).toHaveBeenCalledWith(1);
    });

    it('should return null if findOneWithDetails returns null', async () => {
      (Application.findOneWithDetails as jest.Mock).mockResolvedValue(null);

      const result = await getApplicationWithDetails(999);
      expect(result).toBeNull();
      expect(Application.findOneWithDetails).toHaveBeenCalledWith(999);
    });
  });
}); 