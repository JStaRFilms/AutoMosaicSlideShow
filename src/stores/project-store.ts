
import { create } from "zustand";

export interface Project {
    id: string;
    name: string;
    thumbnailUrl?: string;
    updatedAt: string;
}

interface ProjectStore {
    projects: Project[];
    isLoading: boolean;
    error: string | null;

    fetchProjects: () => Promise<void>;
    addProject: (project: Project) => void;
    removeProject: (id: string) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
    projects: [],
    isLoading: false,
    error: null,

    fetchProjects: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch("/api/projects");
            if (!res.ok) throw new Error("Failed to fetch projects");
            const data = await res.json();
            set({ projects: data, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    addProject: (project) =>
        set((state) => ({ projects: [project, ...state.projects] })),

    removeProject: (id) =>
        set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
        })),
}));
