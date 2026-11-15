import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { Page } from "@playwright/test";

const here = path.dirname(fileURLToPath(import.meta.url));
const EVIDENCE_ROOT = path.resolve(here, "../../../docs/testing/evidence");

/** Report / thesis screenshots — normal desktop monitor */
export const EVIDENCE_VIEWPORT = { width: 1920, height: 1080 } as const;

export type EvidenceOwner = "CoM" | "CCC" | "JJ" | "Parttime";

export function evidenceDir(owner: EvidenceOwner): string {
  const dir = path.join(EVIDENCE_ROOT, owner);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * Capture evidence for the report.
 * Default: viewport 1920×1080 (not fullPage) so PNGs match a normal screen.
 * Pass `fullPage: true` only when the whole scrollable page is required.
 */
export async function snapEvidence(
  page: Page,
  owner: EvidenceOwner,
  file: string,
  opts?: { fullPage?: boolean; preserveViewport?: boolean }
): Promise<string> {
  if (!opts?.preserveViewport) {
    const current = page.viewportSize();
    if (
      !current ||
      current.width !== EVIDENCE_VIEWPORT.width ||
      current.height !== EVIDENCE_VIEWPORT.height
    ) {
      await page.setViewportSize(EVIDENCE_VIEWPORT);
    }
  }
  const out = path.join(evidenceDir(owner), file);
  await page.screenshot({
    path: out,
    fullPage: opts?.fullPage === true,
  });
  return out;
}
