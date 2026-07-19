const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

const inputFile = 'C:\\Users\\Jeffry\\.gemini\\antigravity-ide\\brain\\ccc0abfe-8c7d-4953-8b0e-69a158f71066\\complete_store_tour_1784314573989.webp';
const outputFile = 'C:\\Users\\Jeffry\\Desktop\\Demostracion_Tienda.mp4';

ffmpeg.setFfmpegPath(ffmpegStatic);

console.log('Iniciando conversión a MP4...');

ffmpeg(inputFile)
  .outputOptions([
    '-c:v libx264',    // Video codec
    '-pix_fmt yuv420p', // Pixel format for wide compatibility
    '-crf 23',         // Constant Rate Factor (0-51, lower is better quality, 23 is default)
    '-preset medium',  // Encoding speed/compression ratio
    '-movflags +faststart' // Enable fast start for web video
  ])
  .on('end', () => {
    console.log('¡Conversión completada con éxito!');
  })
  .on('error', (err) => {
    console.error('Ocurrió un error al convertir:', err.message);
  })
  .save(outputFile);
