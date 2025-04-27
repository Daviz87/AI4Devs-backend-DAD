import { PrismaClient } from '@prisma/client';
import { Interview } from './Interview';

const prisma = new PrismaClient();

export class Application {
    id?: number;
    positionId: number;
    candidateId: number;
    applicationDate: Date;
    currentInterviewStep: number;
    notes?: string;
    interviews: Interview[]; // Added this line

    constructor(data: any) {
        this.id = data.id;
        this.positionId = data.positionId;
        this.candidateId = data.candidateId;
        this.applicationDate = new Date(data.applicationDate);
        this.currentInterviewStep = data.currentInterviewStep;
        this.notes = data.notes;
        this.interviews = data.interviews || []; // Added this line
    }

    async save() {
        const applicationData: any = {
            positionId: this.positionId,
            candidateId: this.candidateId,
            applicationDate: this.applicationDate,
            currentInterviewStep: this.currentInterviewStep,
            notes: this.notes,
        };

        if (this.id) {
            return await prisma.application.update({
                where: { id: this.id },
                data: applicationData,
            });
        } else {
            return await prisma.application.create({
                data: applicationData,
            });
        }
    }

    static async findOne(id: number): Promise<Application | null> {
        const data = await prisma.application.findUnique({
            where: { id: id },
        });
        if (!data) return null;
        return new Application(data);
    }

    async updateStage(interviewStepId: number, notes?: string) {
        // Validar que la etapa existe
        const interviewStep = await prisma.interviewStep.findUnique({
            where: { id: interviewStepId }
        });
        
        if (!interviewStep) {
            throw new Error("Invalid interview step");
        }
        
        // Actualizar la aplicación
        this.currentInterviewStep = interviewStepId;
        if (notes) {
            this.notes = notes;
        }
        
        return await this.save();
    }

    static async findOneWithDetails(id: number): Promise<Application | null> {
        const data = await prisma.application.findUnique({
            where: { id },
            include: {
                candidate: true,
                position: true,
                interviewStep: true
            }
        });
        
        if (!data) return null;
        
        // Crear una instancia de Application con los datos completos
        const application = new Application(data);
        
        // Añadir detalles adicionales para la respuesta
        const result: any = {
            id: application.id,
            candidateId: application.candidateId,
            positionId: application.positionId,
            applicationDate: application.applicationDate,
            notes: application.notes,
            currentInterviewStep: {
                id: data.interviewStep.id,
                name: data.interviewStep.name
            }
        };
        
        return result;
    }
}
