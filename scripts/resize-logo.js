const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Check if a source image was provided
const sourceImage = process.argv[2] || 'public/logo.png';

if (!fs.existsSync(sourceImage)) {
    console.error(`Error: Source image not found at "${sourceImage}"`);
    console.log('Usage: node scripts/resize-logo.js <source-image-path>');
    console.log('Example: node scripts/resize-logo.js public/logo.png');
    process.exit(1);
}

async function resizeLogos() {
    try {
        console.log(`Resizing logo from: ${sourceImage}`);

        // Create 192x192 icon
        await sharp(sourceImage)
            .resize(192, 192, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png()
            .toFile('public/icon-192x192.png');
        console.log('✓ Created public/icon-192x192.png');

        // Create 512x512 icon
        await sharp(sourceImage)
            .resize(512, 512, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png()
            .toFile('public/icon-512x512.png');
        console.log('✓ Created public/icon-512x512.png');

        // Create favicon.ico (using 32x32)
        await sharp(sourceImage)
            .resize(32, 32, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png()
            .toFile('public/favicon.png');
        console.log('✓ Created public/favicon.png');

        // Create apple-touch-icon (180x180)
        await sharp(sourceImage)
            .resize(180, 180, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png()
            .toFile('public/apple-touch-icon.png');
        console.log('✓ Created public/apple-touch-icon.png');

        console.log('\n✅ All icons created successfully!');
    } catch (error) {
        console.error('Error resizing images:', error);
        process.exit(1);
    }
}

resizeLogos();
