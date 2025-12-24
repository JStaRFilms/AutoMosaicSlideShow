
"use client";

import { useState } from "react";
import { X, Save, Loader2, Check } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import { useProjectStore } from "@/stores/project-store";

interface SaveProjectDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SaveProjectDialog({ isOpen, onClose }: SaveProjectDialogProps) {
    const images = useEditorStore((s) => s.images);
    const slides = useEditorStore((s) => s.slides);
    const config = useEditorStore((s) => s.config);
    const currentProjectId = useEditorStore((s) => s.currentProjectId);
    const setCurrentProjectId = useEditorStore((s) => s.setCurrentProjectId);
    const setIsDirty = useEditorStore((s) => s.setIsDirty);

    const addProject = useProjectStore((s) => s.addProject);

    const [name, setName] = useState(config.name);
    const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

    const handleSave = async () => {
        setStatus("saving");

        try {
            // 1. Sync assets to public/uploads (reuse logic from ExportDialog essentially)
            // We need permanent URLs for the database state, OR we assume they are local.
            // Strategy: We upload them to /api/save-assets, which returns relative paths /uploads/...
            // Then we look continuously update the image objects with these new URLs? 
            // Or we just save the state referring to these new URLs.

            const formData = new FormData();
            images.forEach((img) => {
                // Only upload if it's a blob URL AND we have the File object
                // Images restored from localStorage won't have File objects
                if (img.url.startsWith("blob:") && img.file) {
                    formData.append("files", img.file);
                }
            });

            // If we have files to upload
            let pathMap: Record<string, string> = {};
            if (formData.has("files")) {
                const res = await fetch("/api/save-assets", { method: "POST", body: formData });
                if (!res.ok) throw new Error("Failed to upload assets");
                const data = await res.json();
                pathMap = data.paths; // filename -> /uploads/filename
            }

            // 2. Construct State Snapshot
            // Replace blob URLs with permanent paths (only if we have the file to map)
            const persistentImages = images.map(img => ({
                ...img,
                url: img.url.startsWith("blob:") && img.file ? (pathMap[img.file.name] || img.url) : img.url
            }));

            // Also need to update slides if they reference images? 
            // The slides reference objects by reference or ID? 
            // In LayoutEngine, slides have `layout.images` which are correct references. 
            // But if we change the URL in the DB, we need to ensure consistency.
            // Ideally we save the "EditorState" object.

            const snapshot = {
                config: { ...config, name }, // Update name
                images: persistentImages,
                slides: slides.map(s => ({
                    ...s,
                    layout: {
                        ...s.layout,
                        images: s.layout.images.map(img => ({
                            ...img,
                            url: img.url.startsWith("blob:") && img.file ? (pathMap[img.file.name] || img.url) : img.url
                        }))
                    }
                }))
            };

            // 3. Save to DB (PUT for existing, POST for new)
            const isUpdate = !!currentProjectId;
            const endpoint = isUpdate
                ? `/api/projects/${currentProjectId}`
                : "/api/projects";
            const method = isUpdate ? "PUT" : "POST";

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    thumbnailUrl: persistentImages[0]?.url,
                    data: JSON.stringify(snapshot)
                })
            });

            if (!res.ok) throw new Error("Failed to save project");

            const savedProject = await res.json();

            // Only add to list if it's a new project
            if (!isUpdate) {
                addProject(savedProject);
            }

            // Track this as the current project
            setCurrentProjectId(savedProject.id);
            setIsDirty(false);

            setStatus("success");
            setTimeout(() => {
                onClose();
                setStatus("idle");
            }, 1500);

        } catch (error) {
            console.error(error);
            setStatus("error");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="border-b border-border p-4 flex items-center justify-between bg-surface-highlight">
                    <h3 className="font-semibold text-primary">Save Project</h3>
                    <button onClick={onClose} className="text-secondary hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-xs text-secondary mb-1 block">Project Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black/20 border border-surface-highlight rounded px-3 py-2 text-primary focus:border-accent outline-none"
                            placeholder="My Awesome Mosaic"
                        />
                    </div>

                    {status === "error" && (
                        <p className="text-danger text-sm">Failed to save project. Please try again.</p>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded text-secondary hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={status === "saving" || status === "success"}
                            className={`px-6 py-2 rounded font-medium flex items-center gap-2 transition-all ${status === "success"
                                ? "bg-green-500 text-black"
                                : "bg-primary text-black hover:bg-white"
                                }`}
                        >
                            {status === "saving" ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : status === "success" ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Saved!
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Project
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
