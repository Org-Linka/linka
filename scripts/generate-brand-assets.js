const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const rootDir = path.resolve(__dirname, "..");
const sourcePath = path.join(rootDir, "assets/images/logoDarkIcon.png");

const outputs = [
  {
    path: "assets/public/icon.png",
    width: 1024,
    height: 1024,
    background: [0, 0, 0, 255],
    scale: 0.74,
  },
  {
    path: "assets/public/favicon.png",
    width: 256,
    height: 256,
    background: [0, 0, 0, 255],
    scale: 0.74,
  },
  {
    path: "assets/public/splash-icon.png",
    width: 1024,
    height: 1024,
    background: [0, 0, 0, 255],
    scale: 0.72,
  },
  {
    path: "assets/public/android-icon-background.png",
    width: 512,
    height: 512,
    background: [0, 0, 0, 255],
    scale: 0,
  },
  {
    path: "assets/public/android-icon-foreground.png",
    width: 512,
    height: 512,
    background: [0, 0, 0, 0],
    scale: 0.66,
  },
  {
    path: "assets/public/android-icon-monochrome.png",
    width: 432,
    height: 432,
    background: [0, 0, 0, 0],
    scale: 0.72,
    tint: [255, 255, 255],
  },
  {
    path: "assets/public/notifications/ic_stat_onesignal_default.png",
    width: 96,
    height: 96,
    background: [0, 0, 0, 0],
    scale: 0.74,
    tint: [255, 255, 255],
  },
  {
    path: "assets/public/notifications/ic_onesignal_large_icon_default.png",
    width: 256,
    height: 256,
    background: [0, 0, 0, 255],
    scale: 0.74,
  },
];

function readPng(filePath) {
  return PNG.sync.read(fs.readFileSync(filePath));
}

function writePng(filePath, png) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, PNG.sync.write(png));
}

function getTrimBounds(png) {
  let minX = png.width;
  let minY = png.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const alpha = png.data[(png.width * y + x) * 4 + 3];
      if (alpha > 8) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return { x: 0, y: 0, width: png.width, height: png.height };
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

function createCanvas(width, height, background) {
  const png = new PNG({ width, height });

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (width * y + x) * 4;
      png.data[index] = background[0];
      png.data[index + 1] = background[1];
      png.data[index + 2] = background[2];
      png.data[index + 3] = background[3];
    }
  }

  return png;
}

function getPixel(source, x, y) {
  const clampedX = Math.min(source.width - 1, Math.max(0, x));
  const clampedY = Math.min(source.height - 1, Math.max(0, y));
  const index = (source.width * clampedY + clampedX) * 4;

  return [
    source.data[index],
    source.data[index + 1],
    source.data[index + 2],
    source.data[index + 3],
  ];
}

function sampleBilinear(source, sourceX, sourceY) {
  const x0 = Math.floor(sourceX);
  const y0 = Math.floor(sourceY);
  const x1 = x0 + 1;
  const y1 = y0 + 1;
  const xWeight = sourceX - x0;
  const yWeight = sourceY - y0;
  const topLeft = getPixel(source, x0, y0);
  const topRight = getPixel(source, x1, y0);
  const bottomLeft = getPixel(source, x0, y1);
  const bottomRight = getPixel(source, x1, y1);

  return [0, 1, 2, 3].map((channel) => {
    const top = topLeft[channel] * (1 - xWeight) + topRight[channel] * xWeight;
    const bottom = bottomLeft[channel] * (1 - xWeight) + bottomRight[channel] * xWeight;

    return Math.round(top * (1 - yWeight) + bottom * yWeight);
  });
}

function blendPixel(target, x, y, rgba, tint) {
  const index = (target.width * y + x) * 4;
  const sourceAlpha = rgba[3] / 255;
  if (sourceAlpha <= 0) return;

  const sourceRed = tint ? tint[0] : rgba[0];
  const sourceGreen = tint ? tint[1] : rgba[1];
  const sourceBlue = tint ? tint[2] : rgba[2];
  const targetAlpha = target.data[index + 3] / 255;
  const outAlpha = sourceAlpha + targetAlpha * (1 - sourceAlpha);

  if (outAlpha <= 0) {
    target.data[index] = 0;
    target.data[index + 1] = 0;
    target.data[index + 2] = 0;
    target.data[index + 3] = 0;
    return;
  }

  target.data[index] = Math.round(
    (sourceRed * sourceAlpha + target.data[index] * targetAlpha * (1 - sourceAlpha)) /
      outAlpha,
  );
  target.data[index + 1] = Math.round(
    (sourceGreen * sourceAlpha + target.data[index + 1] * targetAlpha * (1 - sourceAlpha)) /
      outAlpha,
  );
  target.data[index + 2] = Math.round(
    (sourceBlue * sourceAlpha + target.data[index + 2] * targetAlpha * (1 - sourceAlpha)) /
      outAlpha,
  );
  target.data[index + 3] = Math.round(outAlpha * 255);
}

function drawFit(target, source, bounds, output) {
  if (!output.scale) return;

  const maxWidth = Math.floor(target.width * output.scale);
  const maxHeight = Math.floor(target.height * output.scale);
  const ratio = Math.min(maxWidth / bounds.width, maxHeight / bounds.height);
  const drawWidth = Math.max(1, Math.round(bounds.width * ratio));
  const drawHeight = Math.max(1, Math.round(bounds.height * ratio));
  const offsetX = Math.floor((target.width - drawWidth) / 2);
  const offsetY = Math.floor((target.height - drawHeight) / 2);

  for (let y = 0; y < drawHeight; y += 1) {
    for (let x = 0; x < drawWidth; x += 1) {
      const sourceX = bounds.x + (x / drawWidth) * bounds.width;
      const sourceY = bounds.y + (y / drawHeight) * bounds.height;
      const rgba = sampleBilinear(source, sourceX, sourceY);
      blendPixel(target, offsetX + x, offsetY + y, rgba, output.tint);
    }
  }
}

function main() {
  const source = readPng(sourcePath);
  const bounds = getTrimBounds(source);

  for (const output of outputs) {
    const canvas = createCanvas(output.width, output.height, output.background);
    drawFit(canvas, source, bounds, output);
    writePng(path.join(rootDir, output.path), canvas);
    console.log(`Generated ${output.path}`);
  }
}

main();
