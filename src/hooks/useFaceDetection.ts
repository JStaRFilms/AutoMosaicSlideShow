import { useEffect, useState } from "react";
import * as faceapi from "face-api.js";

interface DetectionResult {
    x: number;
    y: number;
}

export function useFaceDetection() {
    const [isModelLoaded, setIsModelLoaded] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function loadModels() {
            try {
                const modelPath = "/models"; // Served from public/models
                await faceapi.nets.ssdMobilenetv1.loadFromUri(modelPath);
                if (isMounted) setIsModelLoaded(true);
                console.log("FaceAPI models loaded");
            } catch (err) {
                console.error("Failed to load FaceAPI models", err);
            }
        }

        loadModels();

        return () => {
            isMounted = false;
        };
    }, []);

    /**
     * Detects the most prominent face in an image.
     * Returns center coordinates {x, y} as percentages (0-100).
     * Defaults to {50, 50} if no face found.
     */
    const detectProminentFace = async (imageElement: HTMLImageElement): Promise<DetectionResult> => {
        if (!isModelLoaded) return { x: 50, y: 50 };

        try {
            // Detect all faces
            const detections = await faceapi.detectAllFaces(imageElement, new faceapi.SsdMobilenetv1Options());

            if (detections.length === 0) {
                return { x: 50, y: 50 };
            }

            // Find the biggest face (most prominent)
            const biggestFace = detections.reduce((prev, current) => {
                return (prev.box.width * prev.box.height > current.box.width * current.box.height) ? prev : current;
            });

            const { x, y, width, height } = biggestFace.box;
            const centerX = x + width / 2;
            const centerY = y + height / 2;

            // Convert to percentage
            const percentX = (centerX / imageElement.width) * 100;
            const percentY = (centerY / imageElement.height) * 100;

            return { x: percentX, y: percentY };
        } catch (e) {
            console.error("Face detection failed", e);
            return { x: 50, y: 50 };
        }
    };

    return {
        isModelLoaded,
        detectProminentFace,
    };
}
