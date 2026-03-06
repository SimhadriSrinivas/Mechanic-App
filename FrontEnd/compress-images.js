import imagemin from "imagemin";
import mozjpeg from "imagemin-mozjpeg";
import pngquant from "imagemin-pngquant";
import webp from "imagemin-webp";

(async () => {
  await imagemin(["assets/images/**/*.{jpg,png}"], {
    destination: "assets/images",
    plugins: [
      mozjpeg({ quality: 60 }),
      pngquant({ quality: [0.6, 0.8] }),
    ],
  });

  await imagemin(["assets/images/**/*.{jpg,png}"], {
    destination: "assets/images",
    plugins: [webp({ quality: 70 })],
  });

  console.log("Images compressed successfully");
})();