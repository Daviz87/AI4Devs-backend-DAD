import request from 'supertest';
import { app } from '../../../index'; 
import { Position } from '../../../domain/models/Position';
import http from 'http'; // Importar http para manejar el servidor

// Mockear el módulo del modelo Position antes de cualquier importación
jest.mock('../../../domain/models/Position', () => ({
  __esModule: true, // Marcar como módulo ES
  Position: {
    findOne: jest.fn(),
    getCandidatesForPosition: jest.fn()
  }
}));

let server: http.Server; // Variable para mantener la referencia al servidor

// Iniciar el servidor antes de todos los tests en este archivo
beforeAll((done) => {
  server = app.listen(0, done); // Escuchar en un puerto aleatorio (0)
});

// Cerrar el servidor después de todos los tests en este archivo
afterAll((done) => {
  server.close(done);
});

describe('Position Routes Integration', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /positions/:id/candidates', () => {
    it('should return 404 for non-existent position', async () => {
      // Configurar el mock para findOne
      (Position.findOne as jest.Mock).mockResolvedValue(null);
      
      const response = await request(server).get('/positions/999/candidates'); // Usar 'server' en lugar de 'app'
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Position not found');
      expect(Position.findOne).toHaveBeenCalledWith(999);
    });
    
    it('should return 200 with candidates for a valid position', async () => {
      // Configurar el mock para findOne
      (Position.findOne as jest.Mock).mockResolvedValue({ id: 1 });
      
      // Mock de datos de candidatos
      const mockCandidates = [
        { 
          id: 1, 
          applicationId: 101,
          fullName: 'Test Candidate',
          email: 'test@example.com',
          currentInterviewStep: { id: 2, name: 'Technical' },
          averageScore: 4.5
        }
      ];
      // Configurar el mock para getCandidatesForPosition
      (Position.getCandidatesForPosition as jest.Mock).mockResolvedValue(mockCandidates);
      
      const response = await request(server).get('/positions/1/candidates'); // Usar 'server'
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCandidates);
      expect(Position.findOne).toHaveBeenCalledWith(1);
      expect(Position.getCandidatesForPosition).toHaveBeenCalledWith(1, expect.objectContaining({ limit: 50, offset: 0 })); // Asegurar que se llaman con los defaults
    });
    
    it('should apply sorting and pagination parameters', async () => {
      // Configurar el mock para findOne
      (Position.findOne as jest.Mock).mockResolvedValue({ id: 1 });
      // Configurar el mock para getCandidatesForPosition
      (Position.getCandidatesForPosition as jest.Mock).mockResolvedValue([]);
      
      await request(server).get('/positions/1/candidates?sort=score&order=desc&limit=10&offset=5'); // Usar 'server'
      
      expect(Position.findOne).toHaveBeenCalledWith(1);
      expect(Position.getCandidatesForPosition).toHaveBeenCalledWith(1, {
        sort: 'score',
        order: 'desc',
        limit: 10,
        offset: 5
      });
    });

    it('should return 400 for invalid position ID format', async () => {
        const response = await request(server).get('/positions/invalid-id/candidates'); // Usar 'server'
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid position ID format');
    });
  });
}); 