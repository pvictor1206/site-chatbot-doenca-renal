import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

function trackedFiles() {
  const out = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" });
  return out.split("\0").filter(Boolean).sort();
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

const files = trackedFiles();
const manifest = files
  .map((file) => `${sha256(readFileSync(file))}  ${file}`)
  .join("\n");

const projectHash = sha256(manifest);

console.log(manifest);
console.log("\n# hash do projeto (SHA-256 sobre o manifesto de arquivos rastreados pelo git)");
console.log(projectHash);
