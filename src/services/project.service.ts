
import { PrismaClient } from "@prisma/client";

// Prevent multiple instances in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export interface ProjectData {
    id?: string;
    name: string;
    thumbnailUrl?: string | null;
    data: string; // JSON blob
}

export const ProjectService = {
    async create(data: ProjectData) {
        return prisma.project.create({
            data: {
                name: data.name,
                thumbnailUrl: data.thumbnailUrl,
                data: data.data,
            },
        });
    },

    async update(id: string, data: Partial<ProjectData>) {
        return prisma.project.update({
            where: { id },
            data,
        });
    },

    async getAll() {
        return prisma.project.findMany({
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                name: true,
                thumbnailUrl: true,
                updatedAt: true,
            },
        });
    },

    async getById(id: string) {
        return prisma.project.findUnique({
            where: { id },
        });
    },

    async delete(id: string) {
        return prisma.project.delete({
            where: { id },
        });
    },
};
