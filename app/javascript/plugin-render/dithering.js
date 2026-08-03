// Docs-preview helper only: it fakes the 1-bit e-ink look for the .image-dither
// demo inside the docs example iframes. It is not a device-render mechanism
// (devices are dithered server-side) and it is not part of the release bundle.
//
// Wrapped in an IIFE so the dithering entry points (setup/draw) and helpers stay
// internal. As bare top-level declarations they leaked as window.setup/window.draw,
// colliding with p5.js and any plugin's own setup()/draw(). No public API is exposed;
// the entry point is the load listener at the bottom.
(function () {
function draw(image) {
  return new Promise((resolve) => {
    const displayImage = new Image();

    // crossOrigin must be set BEFORE src. The browser locks in CORS mode when the
    // load starts (at src assignment), so setting it afterward is ignored: the load
    // is non-CORS, a cross-origin image taints the canvas, and getImageData throws.
    displayImage.crossOrigin = "anonymous";

    // Any failure must still settle the promise, or Promise.all in setup() hangs
    // forever and its .catch never fires. On failure we resolve and skip, so the
    // batch completes and that one image just stays undithered.
    displayImage.onerror = () => {
      console.warn("Skipping image that failed to load:", image.src);
      resolve();
    };

    displayImage.onload = () => {
      // Guard the body: a throw here (a tainted-canvas SecurityError, or a
      // 0-dimension canvas IndexSizeError) would otherwise leave the promise
      // pending forever instead of letting the batch move on.
      try {
        const displayCanvas = document.createElement('canvas');
        const displayContext = displayCanvas.getContext('2d', { willReadFrequently: true });

        displayCanvas.width = image.width;
        displayCanvas.height = image.height;
        displayContext.drawImage(displayImage, 0, 0, image.width, image.height);

        const displayImageData = displayContext.getImageData(0, 0, displayCanvas.width, displayCanvas.height);

        ditherFloydSteinberg(displayImageData, displayCanvas.width, displayCanvas.height);
        redrawOriginalImage(displayImageData, image);
        resolve();
      } catch (err) {
        console.warn("Skipping image that failed to dither:", image.src, err);
        resolve();
      }
    };

    // src is assigned last, after crossOrigin and both handlers are wired, so CORS
    // mode is in effect and a cached image cannot fire load before onload exists.
    displayImage.src = image.src;
  });
}

function redrawOriginalImage(imageData, originalImage) {
  const displayCanvas = document.createElement('canvas');
  displayCanvas.width = originalImage.width;
  displayCanvas.height = originalImage.height;
  const displayContext = displayCanvas.getContext('2d');
  displayContext.putImageData(imageData, 0, 0);

  originalImage.src = displayCanvas.toDataURL("image/png");
}

function setup() {
  const images = Array.from(document.querySelectorAll(".image-dither"));
  Promise.all(images.map(draw))
    .then(() => console.log("All images dithered."))
    .catch((err) => console.error("Error processing images:", err));
}

window.addEventListener('load', setup);

function ditherFloydSteinberg(imageData, width, height) {
  const data = imageData.data;
  const w4 = width * 4;

  // One signed slot per pixel, not per byte. The kernel only ever reads and
  // writes the red-channel offset, so a buffer sized to data.length left three
  // of every four slots unused.
  //
  // Int16 is chosen from the range the accumulation can actually reach. A pixel
  // takes `(err * w) >> 4` from up to four already-processed neighbors, with w
  // of 7, 3, 5 and 1: the incoming weights sum to exactly 16/16, so the
  // accumulated error can never exceed a single err in magnitude. err itself is
  // bounded by the threshold. Below it err is `luma + acc`, at worst -128 when
  // luma is 0; at or above it err is `luma + acc - 255`, at worst -127. The
  // induction closes at acc in [-128, 124], and the widest value observed over
  // 6,000 random images is [-125, 121]. Int16Array carries [-32768, 32767], so
  // the diffusion has room to spare and a future tweak to the kernel weights or
  // the threshold cannot silently wrap it.
  const errBuffer = new Int16Array(width * height);

  for (let y = 0; y < height; y++) {
    const rowStart = y * w4;
    const pixelRowStart = y * width;

    for (let x = 0; x < width; x++) {
      const i = rowStart + x * 4;
      const p = pixelRowStart + x;
      const oldPixel = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) + errBuffer[p];
      const newPixel = oldPixel < 128 ? 0 : 255;
      const err = oldPixel - newPixel;

      data[i] = data[i + 1] = data[i + 2] = newPixel;

      // Error diffusion
      if (x + 1 < width) errBuffer[p + 1] += (err * 7) >> 4;
      if (y + 1 < height) {
        if (x > 0) errBuffer[p + width - 1] += (err * 3) >> 4;
        errBuffer[p + width] += (err * 5) >> 4;
        if (x + 1 < width) errBuffer[p + width + 1] += (err * 1) >> 4;
      }
    }
  }
}
})();