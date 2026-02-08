const fs = require('fs');

// Create a simple PNG with a colored background  
// This creates a minimal valid PNG file (1x1 pixel expanded)
function createSimplePNG(size) {
    // PNG signature
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    // Image data: dark purple/blue gradient effect (simplified as solid color)
    const backgroundColor = { r: 107, g: 33, b: 168 }; // Purple #6B21A8

    // Create raw image data (RGBA for each pixel)
    const pixelData = [];
    for (let y = 0; y < size; y++) {
        pixelData.push(0); // Filter byte for each row
        for (let x = 0; x < size; x++) {
            // Add gradient effect
            const blendFactor = x / size;
            const r = Math.round(backgroundColor.r * (1 - blendFactor) + 37 * blendFactor);
            const g = Math.round(backgroundColor.g * (1 - blendFactor) + 99 * blendFactor);
            const b = Math.round(backgroundColor.b * (1 - blendFactor) + 235 * blendFactor);
            pixelData.push(r, g, b, 255); // RGBA
        }
    }

    const rawData = Buffer.from(pixelData);

    // Compress with zlib
    const zlib = require('zlib');
    const compressedData = zlib.deflateSync(rawData);

    // Create IHDR chunk
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(size, 0);  // width
    ihdrData.writeUInt32BE(size, 4);  // height
    ihdrData.writeUInt8(8, 8);        // bit depth
    ihdrData.writeUInt8(6, 9);        // color type (RGBA)
    ihdrData.writeUInt8(0, 10);       // compression
    ihdrData.writeUInt8(0, 11);       // filter
    ihdrData.writeUInt8(0, 12);       // interlace

    const ihdrChunk = createChunk('IHDR', ihdrData);
    const idatChunk = createChunk('IDAT', compressedData);
    const iendChunk = createChunk('IEND', Buffer.alloc(0));

    return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);

    const typeBuffer = Buffer.from(type);
    const crcData = Buffer.concat([typeBuffer, data]);

    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(crcData), 0);

    return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buffer) {
    let crc = 0xFFFFFFFF;
    const table = [];

    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        table[n] = c;
    }

    for (let i = 0; i < buffer.length; i++) {
        crc = (crc >>> 8) ^ table[(crc ^ buffer[i]) & 0xFF];
    }

    return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Generate icons
const icon192 = createSimplePNG(192);
const icon512 = createSimplePNG(512);

fs.writeFileSync('public/icon-192x192.png', icon192);
fs.writeFileSync('public/icon-512x512.png', icon512);

console.log('Icons created successfully!');
console.log('- public/icon-192x192.png');
console.log('- public/icon-512x512.png');
