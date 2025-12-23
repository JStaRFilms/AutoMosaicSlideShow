import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const files = formData.getAll("files") as File[];
        const propsJson = formData.get("props") as string;

        // Ensure upload dir exists
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });

        // Save images and build a map of new paths
        const pathMap = new Map<string, string>();

        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());
            // Sanitize filename
            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
            const filePath = path.join(uploadDir, safeName);

            await writeFile(filePath, buffer);

            // Return RELATIVE path for web serving
            // Next.js serves "public" at root
            const webPath = `/uploads/${safeName}`;
            pathMap.set(file.name, webPath);
        }

        // If props are provided, we don't need to deeply parse/rewrite them server-side 
        // if the frontend constructs the final URLs. 
        // However, if the frontend sends the "raw" props and expects valid paths back in the JSON, we should do it.
        // Given the new plan, the frontend will use the `pathMap` to construct URLs.
        // So we just save the JSON "as is" or minimal processing?
        // Let's just save the JSON provided (which might be the raw render-props)
        // actually, let's just save what we got.

        let savedPropsPath = "";
        if (propsJson) {
            const propsPath = path.join(uploadDir, "render-props.json");
            await writeFile(propsPath, propsJson);
            savedPropsPath = "/uploads/render-props.json";
        }

        // Return the map of filenames to Web Paths
        const pathsObj = Object.fromEntries(pathMap);

        return NextResponse.json({ success: true, paths: pathsObj, propsPath: savedPropsPath });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to save assets" }, { status: 500 });
    }
}
