const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const root = process.cwd();
const publicDir = path.join(root, "public");
const iosAssetDir = path.join(root, "ios", "App", "App", "Assets.xcassets");
const appIconSetDir = path.join(iosAssetDir, "AppIcon.appiconset");
const splashSetDir = path.join(iosAssetDir, "Splash.imageset");

fs.mkdirSync(publicDir, { recursive: true });
fs.mkdirSync(appIconSetDir, { recursive: true });
fs.mkdirSync(splashSetDir, { recursive: true });

const swiftSource = String.raw`
import AppKit
import Foundation

enum RenderMode: String {
  case icon
  case splash
}

func savePNG(
  outputPath: String,
  size: CGFloat,
  fontSize: CGFloat,
  mode: RenderMode
) throws {
  let pixelSize = Int(size.rounded())
  guard let bitmap = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: pixelSize,
    pixelsHigh: pixelSize,
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: 0,
    bitsPerPixel: 0
  ) else {
    throw NSError(domain: "GameDayMapIconGen", code: 1)
  }

  bitmap.size = NSSize(width: size, height: size)

  NSGraphicsContext.saveGraphicsState()
  guard let context = NSGraphicsContext(bitmapImageRep: bitmap) else {
    throw NSError(domain: "GameDayMapIconGen", code: 2)
  }
  NSGraphicsContext.current = context

  let background = NSColor(
    calibratedRed: 10.0 / 255.0,
    green: 22.0 / 255.0,
    blue: 40.0 / 255.0,
    alpha: 1.0
  )
  background.setFill()

  if mode == .icon {
    let radius = size * (220.0 / 1024.0)
    let path = NSBezierPath(
      roundedRect: NSRect(x: 0, y: 0, width: size, height: size),
      xRadius: radius,
      yRadius: radius
    )
    path.fill()
  } else {
    NSBezierPath(rect: NSRect(x: 0, y: 0, width: size, height: size)).fill()
  }

  let paragraph = NSMutableParagraphStyle()
  paragraph.alignment = .center

  let textColor = NSColor(
    calibratedRed: 244.0 / 255.0,
    green: 185.0 / 255.0,
    blue: 66.0 / 255.0,
    alpha: 1.0
  )

  let attributes: [NSAttributedString.Key: Any] = [
    .font: NSFont.systemFont(ofSize: fontSize, weight: .bold),
    .foregroundColor: textColor,
    .paragraphStyle: paragraph
  ]

  let text = "GM" as NSString
  let textSize = text.size(withAttributes: attributes)
  let textRect = NSRect(
    x: (size - textSize.width) / 2.0,
    y: ((size - textSize.height) / 2.0) - (fontSize * 0.04),
    width: textSize.width,
    height: textSize.height
  )
  text.draw(in: textRect, withAttributes: attributes)

  NSGraphicsContext.restoreGraphicsState()

  guard let pngData = bitmap.representation(using: .png, properties: [:]) else {
    throw NSError(domain: "GameDayMapIconGen", code: 3)
  }

  try pngData.write(to: URL(fileURLWithPath: outputPath))
}

let args = CommandLine.arguments
guard args.count >= 5 else {
  fputs("Usage: swift render.swift <output> <size> <fontSize> <mode>\n", stderr)
  exit(1)
}

let output = args[1]
let size = CGFloat(Double(args[2]) ?? 1024)
let fontSize = CGFloat(Double(args[3]) ?? 480)
let mode = RenderMode(rawValue: args[4]) ?? .icon

do {
  try savePNG(outputPath: output, size: size, fontSize: fontSize, mode: mode)
} catch {
  fputs("Render failed: \(error)\n", stderr)
  exit(1)
}
`;

const swiftFile = path.join(os.tmpdir(), "gamedaymap-render.swift");
fs.writeFileSync(swiftFile, swiftSource);

function runSwift(outputPath, size, fontSize, mode) {
  const result = spawnSync("swift", [swiftFile, outputPath, String(size), String(fontSize), mode], {
    stdio: "pipe",
    encoding: "utf8"
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `Swift render failed for ${outputPath}`);
  }
}

const masterIcon = path.join(publicDir, "app-icon.png");
const publicSplash = path.join(publicDir, "splash.png");

runSwift(masterIcon, 1024, 480, "icon");
runSwift(publicSplash, 2732, 300, "splash");

const iconSpecs = [
  { idiom: "iphone", size: "20x20", scale: "2x", filename: "icon-20@2x.png", pixels: 40 },
  { idiom: "iphone", size: "20x20", scale: "3x", filename: "icon-20@3x.png", pixels: 60 },
  { idiom: "iphone", size: "29x29", scale: "2x", filename: "icon-29@2x.png", pixels: 58 },
  { idiom: "iphone", size: "29x29", scale: "3x", filename: "icon-29@3x.png", pixels: 87 },
  { idiom: "iphone", size: "40x40", scale: "2x", filename: "icon-40@2x.png", pixels: 80 },
  { idiom: "iphone", size: "40x40", scale: "3x", filename: "icon-40@3x.png", pixels: 120 },
  { idiom: "iphone", size: "60x60", scale: "2x", filename: "icon-60@2x.png", pixels: 120 },
  { idiom: "iphone", size: "60x60", scale: "3x", filename: "icon-60@3x.png", pixels: 180 },
  { idiom: "ipad", size: "20x20", scale: "1x", filename: "icon-20@1x.png", pixels: 20 },
  { idiom: "ipad", size: "20x20", scale: "2x", filename: "icon-20@2x-ipad.png", pixels: 40 },
  { idiom: "ipad", size: "29x29", scale: "1x", filename: "icon-29@1x.png", pixels: 29 },
  { idiom: "ipad", size: "29x29", scale: "2x", filename: "icon-29@2x-ipad.png", pixels: 58 },
  { idiom: "ipad", size: "40x40", scale: "1x", filename: "icon-40@1x.png", pixels: 40 },
  { idiom: "ipad", size: "40x40", scale: "2x", filename: "icon-40@2x-ipad.png", pixels: 80 },
  { idiom: "ipad", size: "76x76", scale: "1x", filename: "icon-76@1x.png", pixels: 76 },
  { idiom: "ipad", size: "76x76", scale: "2x", filename: "icon-76@2x.png", pixels: 152 },
  { idiom: "ipad", size: "83.5x83.5", scale: "2x", filename: "icon-83.5@2x.png", pixels: 167 },
  { idiom: "ios-marketing", size: "1024x1024", scale: "1x", filename: "icon-1024.png", pixels: 1024 }
];

for (const spec of iconSpecs) {
  const fontSize = Math.round(spec.pixels * (480 / 1024));
  runSwift(path.join(appIconSetDir, spec.filename), spec.pixels, fontSize, "icon");
}

const appIconContents = {
  images: iconSpecs.map(({ idiom, size, scale, filename }) => ({
    idiom,
    size,
    scale,
    filename
  })),
  info: {
    version: 1,
    author: "xcode"
  }
};

fs.writeFileSync(
  path.join(appIconSetDir, "Contents.json"),
  JSON.stringify(appIconContents, null, 2)
);

const splashFiles = [
  "splash-2732x2732.png",
  "splash-2732x2732-1.png",
  "splash-2732x2732-2.png"
];

for (const file of splashFiles) {
  fs.copyFileSync(publicSplash, path.join(splashSetDir, file));
}

const splashContents = {
  images: [
    { idiom: "universal", filename: "splash-2732x2732-2.png", scale: "1x" },
    { idiom: "universal", filename: "splash-2732x2732-1.png", scale: "2x" },
    { idiom: "universal", filename: "splash-2732x2732.png", scale: "3x" }
  ],
  info: {
    version: 1,
    author: "xcode"
  }
};

fs.writeFileSync(
  path.join(splashSetDir, "Contents.json"),
  JSON.stringify(splashContents, null, 2)
);

console.log("Generated app-icon.png, splash.png, AppIcon.appiconset, and Splash.imageset");
