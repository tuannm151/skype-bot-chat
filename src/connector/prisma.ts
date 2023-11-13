import { PrismaClient } from '@prisma/client';

class PrismaService extends PrismaClient {
    private static instance: PrismaClient;

    private constructor() { 
        super();
    }

    public static getInstance(): PrismaClient {
        if (!PrismaService.instance) {
            PrismaService.instance = new PrismaService();
        }
        return PrismaService.instance;
    }

    public static recreateInstance(): PrismaClient {
        PrismaService.instance = new PrismaService();
        return PrismaService.instance;
    }

    public static async disconnect(): Promise<void> {
        await PrismaService.instance.$disconnect();
    }

    public static async connect(): Promise<void> {
        await PrismaService.instance.$connect();
    }
}

const prisma = PrismaService.getInstance();

export default prisma;