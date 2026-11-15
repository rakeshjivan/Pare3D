"use client";

import { baubleTemplate } from "@/lib/baubleLithophane";
import { downloadBlobFile } from "@/lib/editorFiles";
import { t } from "@/lib/i18n";

/*
 * Build 111: the bauble template as a PNG, at the exact size the photo should be. Put it as the
 * bottom layer of a design that size (Canva's "Custom size", or any photo editor), lay the photo
 * over it, and take the template away before saving. The lines say how big each height prints.
 */
export async function downloadBaubleTemplate(o: { diameter: number; copies: number }, degrees: number) {
  const template = baubleTemplate(o, degrees);
  const { widthPx: width, heightPx: height } = template;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error(t("bauble.templateFailed"));
  const unit = width / 160;
  const font = (size: number, weight = 600) => `${weight} ${Math.round(size)}px system-ui, -apple-system, "Segoe UI", sans-serif`;

  // The zone that prints at 90% or more: faces and words.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#e7f6ec";
  context.fillRect(0, template.safeTop, width, template.safeBottom - template.safeTop);
  context.fillStyle = "#1f7a3d";
  context.font = font(unit * 1.7, 700);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(t("bauble.templateSafe"), width / 2, template.safeTop + unit * 2.2);

  // Height lines with how big the picture prints there, labelled at the right, clear of the title and the seam.
  context.textAlign = "right";
  for (const line of template.lines) {
    context.strokeStyle = line.degrees === 0 ? "#2563eb" : "#9ca3af";
    context.lineWidth = line.degrees === 0 ? unit * 0.18 : unit * 0.1;
    context.setLineDash(line.degrees === 0 ? [] : [unit, unit * 0.8]);
    context.beginPath();
    context.moveTo(0, line.y);
    context.lineTo(width, line.y);
    context.stroke();
    context.fillStyle = line.degrees === 0 ? "#2563eb" : "#4b5563";
    context.font = font(unit * 1.25);
    const label = line.degrees === 0 ? t("bauble.templateMiddle") : t("bauble.templateLine", { degrees: Math.abs(line.degrees), percent: Math.round(line.scale * 100) });
    context.fillText(label, width - unit * 3.5, line.y + (line.y < unit * 2 ? unit * 1.2 : -unit * 1.1));
  }
  context.setLineDash([]);

  // The seam: the left and right edges meet on the ball, so the picture should flow across them.
  context.strokeStyle = "#dc2626";
  context.lineWidth = unit * 0.35;
  for (const x of [unit * 0.18, width - unit * 0.18]) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (const [x, turn] of [[unit * 1.6, -Math.PI / 2], [width - unit * 1.6, Math.PI / 2]] as const) {
    context.save();
    context.fillStyle = "#dc2626";
    context.font = font(unit * 1.2, 700);
    context.translate(x, height / 2);
    context.rotate(turn);
    context.textAlign = "center";
    context.fillText(t("bauble.templateSeam"), 0, 0);
    context.restore();
  }

  // The front: the middle of the picture faces you when the ball hangs.
  context.strokeStyle = "#2563eb";
  context.lineWidth = unit * 0.12;
  context.setLineDash([unit * 0.5, unit * 0.5]);
  context.beginPath();
  context.moveTo(width / 2, 0);
  context.lineTo(width / 2, height);
  context.stroke();
  context.setLineDash([]);
  context.fillStyle = "#2563eb";
  context.textAlign = "center";
  context.font = font(unit * 1.3, 700);
  context.fillText(t("bauble.templateFront"), width / 2, height - unit * 1.6);

  // What it is and how to use it.
  context.textAlign = "left";
  context.fillStyle = "#111827";
  context.font = font(unit * 1.5, 700);
  context.fillText(t("bauble.templateTitle", { diameter: Math.round(o.diameter), width, height }), unit * 3.5, unit * 2.6);
  context.font = font(unit * 1.1, 500);
  context.fillStyle = "#4b5563";
  context.fillText(t(template.copies > 1 ? "bauble.templateHowCopies" : "bauble.templateHow", { copies: template.copies }), unit * 3.5, unit * 4.4);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error(t("bauble.templateFailed"));
  // Into the folder chosen in Settings, or where the save dialog says, like every export.
  await downloadBlobFile(`bauble-template-${Math.round(o.diameter)}mm-${width}x${height}.png`, blob);
  return template;
}
