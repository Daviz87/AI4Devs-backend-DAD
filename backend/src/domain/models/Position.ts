import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class Position {
    id?: number;
    companyId: number;
    interviewFlowId: number;
    title: string;
    description: string;
    status: string;
    isVisible: boolean;
    location: string;
    jobDescription: string;
    requirements?: string;
    responsibilities?: string;
    salaryMin?: number;
    salaryMax?: number;
    employmentType?: string;
    benefits?: string;
    companyDescription?: string;
    applicationDeadline?: Date;
    contactInfo?: string;

    constructor(data: any) {
        this.id = data.id;
        this.companyId = data.companyId;
        this.interviewFlowId = data.interviewFlowId;
        this.title = data.title;
        this.description = data.description;
        this.status = data.status ?? 'Draft';
        this.isVisible = data.isVisible ?? false;
        this.location = data.location;
        this.jobDescription = data.jobDescription;
        this.requirements = data.requirements;
        this.responsibilities = data.responsibilities;
        this.salaryMin = data.salaryMin;
        this.salaryMax = data.salaryMax;
        this.employmentType = data.employmentType;
        this.benefits = data.benefits;
        this.companyDescription = data.companyDescription;
        this.applicationDeadline = data.applicationDeadline ? new Date(data.applicationDeadline) : undefined;
        this.contactInfo = data.contactInfo;
    }

    async save() {
        const positionData: any = {
            companyId: this.companyId,
            interviewFlowId: this.interviewFlowId,
            title: this.title,
            description: this.description,
            status: this.status,
            isVisible: this.isVisible,
            location: this.location,
            jobDescription: this.jobDescription,
            requirements: this.requirements,
            responsibilities: this.responsibilities,
            salaryMin: this.salaryMin,
            salaryMax: this.salaryMax,
            employmentType: this.employmentType,
            benefits: this.benefits,
            companyDescription: this.companyDescription,
            applicationDeadline: this.applicationDeadline,
            contactInfo: this.contactInfo,
        };

        if (this.id) {
            return await prisma.position.update({
                where: { id: this.id },
                data: positionData,
            });
        } else {
            return await prisma.position.create({
                data: positionData,
            });
        }
    }

    static async findOne(id: number): Promise<Position | null> {
        const data = await prisma.position.findUnique({
            where: { id: id },
        });
        if (!data) return null;
        return new Position(data);
    }

    static async getCandidatesForPosition(positionId: number, options: any = {}): Promise<any[]> {
        const { sort = 'name', order = 'asc', limit = 50, offset = 0 } = options;
        
        // Determinar campo de ordenamiento
        let orderBy: any = {};
        switch (sort) {
            case 'stage':
                orderBy = { interviewStep: { orderIndex: order } };
                break;
            case 'score':
                // Ordenamiento por score se manejará después de obtener los datos
                orderBy = { applicationDate: order };
                break;
            case 'name':
            default:
                orderBy = { candidate: { firstName: order } };
                break;
        }
        
        // Buscar aplicaciones para esta posición
        const applications = await prisma.application.findMany({
            where: { positionId },
            include: {
                candidate: true,
                interviewStep: true,
                interviews: {
                    select: {
                        score: true,
                        interviewDate: true
                    }
                }
            },
            orderBy,
            skip: offset,
            take: limit
        });
        
        // Transformar datos para la respuesta
        return applications.map(app => {
            // Calcular puntuación media
            const validScores = app.interviews
                .map(interview => interview.score)
                .filter((score): score is number => score !== null && score !== undefined);
                
            const averageScore = validScores.length > 0
                ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
                : null;
                
            // Obtener fecha de última entrevista
            const interviewDates = app.interviews
                .map(interview => interview.interviewDate)
                .filter(date => date !== null);
                
            const lastInterviewDate = interviewDates.length > 0
                ? new Date(Math.max(...interviewDates.map(date => date.getTime())))
                : null;
                
            return {
                id: app.candidate.id,
                applicationId: app.id,
                fullName: `${app.candidate.firstName} ${app.candidate.lastName}`,
                email: app.candidate.email,
                phone: app.candidate.phone,
                currentInterviewStep: {
                    id: app.interviewStep.id,
                    name: app.interviewStep.name
                },
                averageScore,
                lastInterviewDate,
                applicationDate: app.applicationDate
            };
        });
    }
}

