import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const partsDir = path.join(root, ".portrait-hd-parts");
const outputDir = path.join(root, "assets");
const target = path.join(outputDir, "aayan-aitchison-hd.webp");

const expectedBase64Length = 93628;
const expectedByteLength = 70220;
const files = Array.from({ length: 12 }, (_, i) =>
  path.join(partsDir, "part-" + String(i).padStart(2, "0") + ".b64")
);

for (const file of files) {
  if (!fs.existsSync(file)) {
    throw new Error("Missing staged portrait segment: " + path.basename(file));
  }
}

const encoded = files.map(file => fs.readFileSync(file, "utf8").trim()).join("");
if (encoded.length !== expectedBase64Length) {
  throw new Error("Portrait data length mismatch: " + encoded.length);
}
const bytes = Buffer.from(encoded, "base64");
if (bytes.length !== expectedByteLength ||
    bytes.subarray(0, 4).toString("ascii") !== "RIFF" ||
    bytes.subarray(8, 12).toString("ascii") !== "WEBP") {
  throw new Error("The assembled portrait is not the expected WebP image.");
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(target, bytes);
console.log("Assembled verified HD Aitchison portrait: " + bytes.length + " bytes.");

// The upload fragments and assembly script are build-only inputs, not public files.
fs.rmSync(partsDir, { recursive: true, force: true });
