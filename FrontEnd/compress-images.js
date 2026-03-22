const fs = require("node:fs/promises");

const IMAGE_GLOBS = ["assets/images/**/*.{png,jpg,jpeg}"];

async function getTotalSize(paths) {
  const stats = await Promise.all(paths.map((filePath) => fs.stat(filePath)));
  return stats.reduce((total, file) => total + file.size, 0);
}

function formatBytes(bytes) {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

(async () => {
  const { default: imagemin } = await import("imagemin");
  const { default: mozjpeg } = await import("imagemin-mozjpeg");
  const { default: pngquant } = await import("imagemin-pngquant");
  const { default: webp } = await import("imagemin-webp");

  const inputFiles = await imagemin(["assets/images/**/*.{png,jpg,jpeg}"]);
  const beforeBytes = await getTotalSize(
    inputFiles.map((file) => file.sourcePath),
  );

  await imagemin(IMAGE_GLOBS, {
    destination: "assets/images",
    plugins: [
      mozjpeg({ quality: 58 }),
      pngquant({ quality: [0.55, 0.75], speed: 1 }),
    ],
  });

  await imagemin(IMAGE_GLOBS, {
    destination: "assets/images",
    plugins: [webp({ quality: 68 })],
  });

  const outputFiles = await imagemin(["assets/images/**/*.{png,jpg,jpeg}"]);
  const afterBytes = await getTotalSize(
    outputFiles.map((file) => file.sourcePath),
  );
  const savedBytes = Math.max(0, beforeBytes - afterBytes);
  const savedPercent = beforeBytes > 0 ? (savedBytes / beforeBytes) * 100 : 0;

  console.log("Image optimization complete");
  console.log(`Before: ${formatBytes(beforeBytes)}`);
  console.log(`After : ${formatBytes(afterBytes)}`);
  console.log(
    `Saved : ${formatBytes(savedBytes)} (${savedPercent.toFixed(2)}%)`,
  );
})();
