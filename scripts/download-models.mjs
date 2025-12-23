import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '../public/models');

if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
const files = [
    'ssd_mobilenetv1_model-weights_manifest.json',
    'ssd_mobilenetv1_model-shard1',
    'ssd_mobilenetv1_model-shard2'
];

async function download(file) {
    const dest = path.join(publicDir, file);
    const fileUrl = `${baseUrl}/${file}`;
    console.log(`Downloading ${file}...`);

    return new Promise((resolve, reject) => {
        const fileStream = fs.createWriteStream(dest);
        https.get(fileUrl, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${file}: ${response.statusCode}`));
                return;
            }
            response.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`Saved ${file}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

(async () => {
    try {
        await Promise.all(files.map(download));
        console.log('All models downloaded successfully!');
    } catch (error) {
        console.error('Error downloading models:', error);
        process.exit(1);
    }
})();
