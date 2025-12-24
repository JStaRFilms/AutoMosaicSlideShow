
import { type NextRequest, NextResponse } from "next/server";
import { ProjectService } from "@/services/project.service";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const project = await ProjectService.getById(id);
        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(project);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch project" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        await ProjectService.delete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete project" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const updated = await ProjectService.update(id, {
            name: body.name,
            thumbnailUrl: body.thumbnailUrl,
            data: body.data,
        });
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update project" },
            { status: 500 }
        );
    }
}
