import request from 'supertest';
import { app } from '../../../index'; 
import { Application } from '../../../domain/models/Application';
import http from 'http'; // Importar http

// Mock de Application y sus métodos estáticos y de instancia
jest.mock('../../../domain/models/Application', () => ({
  __esModule: true,
  Application: jest.fn().mockImplementation(() => ({
    updateStage: jest.fn() // Mock del método de instancia
  })),
}));

// Asignar mocks estáticos después de mockear la clase
(Application as any).findOne = jest.fn();
(Application as any).findOneWithDetails = jest.fn();

let server: http.Server; // Variable para el servidor

// Iniciar servidor antes de los tests
beforeAll((done) => {
  server = app.listen(0, done); 
});

// Cerrar servidor después de los tests
afterAll((done) => {
  server.close(done);
});

describe('Application Routes Integration', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /applications/:id/stage', () => {
    it('should return 404 for non-existent application', async () => {
      // Configurar mock para findOne
      (Application.findOne as jest.Mock).mockResolvedValue(null);
      
      const response = await request(server) // Usar 'server'
        .put('/applications/999/stage')
        .send({ interviewStepId: 2 });
        
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Application not found');
      expect(Application.findOne).toHaveBeenCalledWith(999);
    });
    
    it('should return 400 for invalid input (missing interviewStepId)', async () => {
      const response = await request(server) // Usar 'server'
        .put('/applications/1/stage')
        .send({}); // Sin interviewStepId
        
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid or missing interview step ID');
    });

    it('should return 400 for invalid input (non-numeric interviewStepId)', async () => {
      const response = await request(server) // Usar 'server'
        .put('/applications/1/stage')
        .send({ interviewStepId: 'invalid' }); 
        
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid or missing interview step ID');
    });

    it('should return 400 if updateStage throws Invalid interview step error', async () => {
      const mockApplicationInstance = { 
          id: 1,
          updateStage: jest.fn().mockRejectedValue(new Error('Invalid interview step'))
      };
      (Application.findOne as jest.Mock).mockResolvedValue(mockApplicationInstance);

      const response = await request(server) // Usar 'server'
        .put('/applications/1/stage')
        .send({ interviewStepId: 999 }); // Supongamos que 999 es un ID inválido
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid interview step');
      expect(mockApplicationInstance.updateStage).toHaveBeenCalledWith(999, undefined);
    });
    
    it('should update the application stage successfully', async () => {
      // Mock para findOne que devuelve una instancia mock
      const mockApplicationInstance = { 
          id: 1,
          updateStage: jest.fn().mockResolvedValue({ id: 1, currentInterviewStep: 2, notes: 'Test notes' })
      };
      (Application.findOne as jest.Mock).mockResolvedValue(mockApplicationInstance);
      
      // Mock para findOneWithDetails que devuelve los detalles actualizados
      const mockDetails = {
        id: 1,
        candidateId: 101,
        positionId: 5,
        currentInterviewStep: { id: 2, name: 'Technical Interview' },
        applicationDate: new Date().toISOString(), // Usar ISOString para comparación JSON
        notes: 'Test notes'
      };
      (Application.findOneWithDetails as jest.Mock).mockResolvedValue(mockDetails);
      
      const response = await request(server) // Usar 'server'
        .put('/applications/1/stage')
        .send({ 
          interviewStepId: 2, 
          notes: 'Test notes' 
        });
        
      expect(response.status).toBe(200);
      // Normalizar fechas para comparación JSON si es necesario
      expect(response.body).toEqual(mockDetails);
      expect(Application.findOne).toHaveBeenCalledWith(1);
      expect(mockApplicationInstance.updateStage).toHaveBeenCalledWith(2, 'Test notes');
      expect(Application.findOneWithDetails).toHaveBeenCalledWith(1);
    });

    it('should return 400 for invalid application ID format', async () => {
        const response = await request(server) // Usar 'server'
            .put('/applications/invalid-id/stage')
            .send({ interviewStepId: 1});
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid application ID format');
    });
  });
}); 