
import { type NextRequest, NextResponse } from "next/server";
import { ProjectService } from "@/services/project.service";
import { z } from "zod";

const createProjectSchema = z.object({
    name: z.string().min(1),
    thumbnailUrl: z.string().optional(),
    data: z.string(), // We expect a JSON string here
});

export async function GET() {
    try {
        const projects = await ProjectService.getAll();
        return NextResponse.json(projects);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch projects" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const json = await req.json();
        const body = createProjectSchema.parse(json);

        const project = await ProjectService.create(body);
        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: (error as any).errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Failed to create project" },
            { status: 500 }
        );
    }
}
