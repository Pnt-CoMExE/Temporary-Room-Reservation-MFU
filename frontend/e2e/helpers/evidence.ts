import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { Page } from "@playwright/test";

const here = path.dirname(fileURLToPath(import.meta.url));
const EVIDENCE_ROOT = path.resolve(here, "../../../docs/testing/evidence");

export type EvidenceOwner = "CoM" | "CCC" | "JJ" | "Parttime";

export function evidenceDir(owner: EvidenceOwner): string {
  const dir = path.join(EVIDENCE_ROOT, owner);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export async function snapEvidence(
  page: Page,
  owner: EvidenceOwner,
  file: string,
  opts?: { fullPage?: boolean }
): Promise<string> {
  const out = path.join(evidenceDir(owner), file);
  await page.screenshot({ path: out, fullPage: opts?.fullPage !== false });
  return out;
}
