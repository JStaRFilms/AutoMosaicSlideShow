
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Clock, Trash2, Loader2, Play } from "lucide-react";
import { useProjectStore, type Project } from "@/stores/project-store";
import { useEditorStore } from "@/stores/editor-store";

export default function ProjectsPage() {
    const router = useRouter();
    const { projects, isLoading, fetchProjects, removeProject } = useProjectStore();
    const { setSlides, updateConfig, clearImages, addImageAssets, setCurrentProjectId, resetEditor, setIsDirty } = useEditorStore();

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleLoadProject = async (id: string) => {
        try {
            const res = await fetch(`/api/projects/${id}`);
            if (!res.ok) throw new Error("Failed to load project");

            const project = await res.json();
            const snapshot = JSON.parse(project.data);

            // 1. Restore Config
            Object.entries(snapshot.config).forEach(([key, value]) => {
                // @ts-ignore - Dynamic key usage
                updateConfig(key, value);
            });

            // 2. Restore Images (with new URLs if applicable)
            clearImages();
            // @ts-ignore
            addImageAssets(snapshot.images);

            // 3. Restore Slides (ensure layout images match store images)
            // @ts-ignore
            setSlides(snapshot.slides);

            // 4. Track this project as current
            setCurrentProjectId(id);
            setIsDirty(false);

            router.push("/");

        } catch (error) {
            console.error(error);
            alert("Failed to load project");
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this project?")) return;

        try {
            const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed");
            removeProject(id);
        } catch (error) {
            alert("Failed to delete");
        }
    };

    return (
        <div className="min-h-screen bg-background text-primary p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">My Projects</h1>
                        <p className="text-secondary text-sm">Manage your AutoMosaic creations</p>
                    </div>
                    <button
                        onClick={() => {
                            resetEditor();
                            router.push("/");
                        }}
                        className="bg-primary text-black px-4 py-2 rounded-lg font-bold hover:bg-white transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        New Project
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-accent" />
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-24 border border-dashed border-border rounded-xl bg-surface/30">
                        <p className="text-secondary mb-4">No projects found</p>
                        <Link href="/" className="text-accent hover:underline">Create your first one</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                onClick={() => handleLoadProject(project.id)}
                                className="group bg-surface border border-border rounded-xl overflow-hidden cursor-pointer hover:border-accent transition-colors relative"
                            >
                                <div className="aspect-video bg-black relative">
                                    {project.thumbnailUrl ? (
                                        <img src={project.thumbnailUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-surface-highlight">
                                            <span className="text-xs text-secondary">No Preview</span>
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Play className="w-12 h-12 text-white drop-shadow-lg" />
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-semibold text-lg truncate pr-2">{project.name}</h3>
                                        <button
                                            onClick={(e) => handleDelete(e, project.id)}
                                            className="text-secondary hover:text-danger p-1 rounded hover:bg-white/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-secondary">
                                        <Clock className="w-3 h-3" />
                                        <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
