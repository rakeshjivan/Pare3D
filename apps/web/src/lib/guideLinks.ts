import { withBase } from "@/lib/basePath";
import { LANGUAGE_INFO, type Language } from "@/lib/i18n";
import type { ShapeKind } from "@/types/layerling";

/**
 * The chapters of the user guide (docs/guide) by what they are about, with the
 * file name each language gave them. The pages are static files next to the
 * program, so a link is a plain path. A test compares this table with the
 * chapters on disk - a chapter renamed there without a change here would leave
 * every question mark pointing nowhere.
 */
export const GUIDE_CHAPTERS = {
  start: { en: "getting-started" },
  view: { en: "view-and-workplane" },
  shapes: { en: "shapes" },
  select: { en: "select-and-arrange" },
  solids: { en: "solids-and-holes" },
  edges: { en: "edges-and-hollowing" },
  sketches: { en: "sketches" },
  text: { en: "text" },
  threads: { en: "threads-and-mechanics" },
  measuring: { en: "measuring-and-notes" },
  printing: { en: "printing" },
  files: { en: "files-and-saving" },
  shortcuts: { en: "shortcuts" },
  ai: { en: "ai-with-mcp" },
  tablet: { en: "tablet-and-touch" },
  offline: { en: "offline-and-install" },
} as const satisfies Record<string, { en: string } & Partial<Record<Language, string>>>;

export type GuideChapter = keyof typeof GUIDE_CHAPTERS;

/**
 * Sections inside a chapter that a question mark jumps to directly: the chapter
 * and the id each language's heading gets (slugify in build-guide.mjs). The
 * same test checks every id against the headings on disk.
 */
export const GUIDE_SECTIONS = {
  sectionView: { chapter: "view", en: "looking-inside-the-section-view" },
  viewCube: { chapter: "view", en: "the-view-cube" },
  cameraBar: { chapter: "view", en: "the-camera-bar" },
  detailLevel: { chapter: "view", en: "detail-level" },
  buildPlates: { chapter: "view", en: "build-plates" },
  gridAndSnapping: { chapter: "view", en: "grid-and-snapping" },
  // The tabs of the settings window. Languages whose chapter explains the window in one go, under
  // "Grid and snapping", land there.
  settingsSearch: { chapter: "view", en: "the-settings-window" },
  settingsAppearance: { chapter: "view", en: "appearance-theme-toolbar-and-view-cube" },
  // Controls: the mouse and the camera.
  settingsControls: { chapter: "view", en: "appearance-selecting-and-moving" },
  // Appearance: the view - start view, scrollbars, view bar, the message after each step (#1708).
  settingsView: { chapter: "view", en: "appearance-the-view" },
  ribbonButtons: { chapter: "view", en: "appearance-theme-toolbar-and-view-cube" },
  settingsMeasurement: { chapter: "view", en: "measurement-units-scale-and-snap-steps" },
  settingsWorkplane: { chapter: "view", en: "workplane-plate-and-printer" },
  colorCard: { chapter: "shapes", en: "choosing-colours" },
  shapeSettings: { chapter: "shapes", en: "the-shape-s-settings" },
  wrapCylinder: { chapter: "shapes", en: "wrapping-around-a-cylinder" },
  paint: { chapter: "shapes", en: "painting-in-several-colours" },
  surfaceTexture: { chapter: "shapes", en: "a-surface-texture" },
  stencilBridges: { chapter: "text", en: "stencils-bridges-for-the-middle-of-letters" },
  textFill: { chapter: "text", en: "outline-silhouette-and-wider" },
  textLayers: { chapter: "text", en: "layers-and-name-tags" },
  iconTag: { chapter: "text", en: "icon-tags" },
  qrCode: { chapter: "text", en: "qr-codes" },
  myShapes: { chapter: "shapes", en: "custom-shapes" },
  objectList: { chapter: "select", en: "the-object-list" },
  pattern: { chapter: "select", en: "patterns-row-grid-and-circle" },
  holePattern: { chapter: "select", en: "hole-pattern-on-a-face" },
  threadInsert: { chapter: "select", en: "hole-for-a-thread-insert" },
  magnetPocket: { chapter: "select", en: "magnet-pocket" },
  faceTool: { chapter: "select", en: "pushing-a-face-out-or-in" },
  alignSpread: { chapter: "select", en: "equal-gaps" },
  scaleByPercent: { chapter: "select", en: "scaling-by-percent" },
  selectionProperties: { chapter: "select", en: "changing-several-parts-at-once" },
  historyView: { chapter: "select", en: "looking-back-the-history-view" },
  grouping: { chapter: "solids", en: "grouping" },
  groupResize: { chapter: "solids", en: "resizing-a-group-keeping-holes-and-small-parts" },
  bundling: { chapter: "solids", en: "bundling" },
  intersection: { chapter: "solids", en: "intersection" },
  splitting: { chapter: "solids", en: "splitting" },
  edgeTreatment: { chapter: "edges", en: "chamfering-and-filleting-edges" },
  hollowing: { chapter: "edges", en: "hollowing-bodies" },
  lid: { chapter: "edges", en: "a-lid-for-an-open-body" },
  cableChannel: { chapter: "edges", en: "a-cable-channel-through-a-body" },
  mold: { chapter: "edges", en: "molds-and-dies" },
  cutOut: { chapter: "solids", en: "cutting-one-body-out-of-another" },
  punch: { chapter: "solids", en: "punching-an-outline-through-a-body" },
  offset: { chapter: "edges", en: "offsetting-bodies" },
  deleteFace: { chapter: "edges", en: "deleting-faces" },
  threads: { chapter: "threads", en: "threads" },
  gears: { chapter: "threads", en: "gears" },
  springs: { chapter: "threads", en: "springs" },
  bentTubes: { chapter: "threads", en: "bent-tubes" },
  loft: { chapter: "threads", en: "loft" },
  vase: { chapter: "shapes", en: "a-vase" },
  gridfinity: { chapter: "threads", en: "gridfinity" },
  hinge: { chapter: "threads", en: "hinge" },
  flexi: { chapter: "threads", en: "flexi-joints" },
  knurl: { chapter: "threads", en: "knurling" },
  dovetail: { chapter: "threads", en: "dovetail" },
  screwBoss: { chapter: "threads", en: "screw-boss" },
  snapFit: { chapter: "threads", en: "snap-fit" },
  ribs: { chapter: "threads", en: "ribs" },
  teardrop: { chapter: "threads", en: "teardrop-hole" },
  ports: { chapter: "threads", en: "port-openings" },
  sbcBoard: { chapter: "threads", en: "sbc-boards" },
  screwHoles: { chapter: "threads", en: "counterbore-and-countersink" },
  ruler: { chapter: "measuring", en: "the-ruler" },
  printer: { chapter: "printing", en: "choosing-your-printer" },
  designFolders: { chapter: "files", en: "folders-for-your-designs" },
  backingUp: { chapter: "files", en: "backing-up-and-passing-on" },
  yourBackup: { chapter: "files", en: "your-designs-your-backup" },
  fileBackups: { chapter: "files", en: "earlier-versions" },
  exporting: { chapter: "files", en: "exporting" },
  attachments: { chapter: "files", en: "attachments" },
  importing: { chapter: "files", en: "importing" },
  largeMeshes: { chapter: "files", en: "large-meshes" },
  simplifyMesh: { chapter: "files", en: "simplifying-an-imported-mesh" },
  clearanceCheck: { chapter: "printing", en: "checking-clearance" },
  supportRib: { chapter: "printing", en: "support-ribs-for-a-tilted-part" },
  layerCheck: { chapter: "printing", en: "print-analysis-and-layer-view" },
  printCheck: { chapter: "printing", en: "checking-the-print" },
  protractor: { chapter: "measuring", en: "the-protractor" },
  tapeMeasure: { chapter: "measuring", en: "the-tape-measure" },
  notes: { chapter: "measuring", en: "notes" },
  sketchCorners: { chapter: "sketches", en: "rounding-or-chamfering-corners" },
  sketchImage: { chapter: "sketches", en: "a-picture-as-template" },
  sketchStroke: { chapter: "sketches", en: "building-as-a-stroke" },
  customFonts: { chapter: "text", en: "your-own-fonts" },
  sketchFill: { chapter: "sketches", en: "fill-and-silhouette" },
  sketchDrawing: { chapter: "sketches", en: "drawing" },
  sketchSweep: { chapter: "sketches", en: "sweeping-along-a-path" },
  sketchToBody: { chapter: "sketches", en: "making-a-body-from-it" },
  addShape: { chapter: "shapes", en: "adding-a-shape" },
  rotating: { chapter: "select", en: "rotating-and-setting-the-pivot" },
  selecting: { chapter: "select", en: "selecting" },
  layFlat: { chapter: "select", en: "laying-flat-on-a-face" },
  referencePoints: { chapter: "measuring", en: "reference-points" },
  referenceImage: { chapter: "measuring", en: "reference-images" },
  addingText: { chapter: "text", en: "adding-text" },
  sketchMirror: { chapter: "sketches", en: "mirroring" },
  sketchCurve: { chapter: "sketches", en: "curving-a-straight-side" },
  commandSearch: { chapter: "shortcuts", en: "command-search" },
  customKeys: { chapter: "shortcuts", en: "your-own-keys" },
  interactiveHelp: { chapter: "shortcuts", en: "interactive-help" },
  whatsNew: { chapter: "start", en: "new-since-your-last-visit" },
  focusMode: { chapter: "start", en: "the-editor-at-a-glance" },
  blend: { chapter: "solids", en: "blend" },
  readyParts: { chapter: "shapes", en: "ready-made-parts" },
  hull: { chapter: "solids", en: "hull-wrapping-parts-in-one-body" },
  fitCheck: { chapter: "printing", en: "checking-clearance" },
  meshRound: { chapter: "files", en: "rounding-a-mesh" },
  meshSculpt: { chapter: "files", en: "sculpting-a-mesh" },
  texture: { chapter: "files", en: "surface-textures" },
  surfaceText: { chapter: "text", en: "text-on-any-surface" },
  parameters: { chapter: "measuring", en: "parameters-named-sizes" },
  draft: { chapter: "edges", en: "draft-angle" },
  makeFromPhoto: { chapter: "shapes", en: "making-from-a-photo-or-a-pattern" },
  spaceOut: { chapter: "select", en: "spacing-parts-out" },
  printFit: { chapter: "printing", en: "holes-that-fit" },
} as const satisfies Record<string, { chapter: GuideChapter; en: string } & Partial<Record<Language, string>>>;

export type GuideSection = keyof typeof GUIDE_SECTIONS;

/** The address of a chapter or one of its sections, or of the guide's overview when neither is named. */
export function guideHref(requested: Language, chapter?: GuideChapter, section?: GuideSection): string {
  // Fork (Pare 3D build 26): the guide is English only, whatever language the program is in.
  void requested;
  const language: Language = "en";
  const directory = LANGUAGE_INFO[language].guideDir;
  const target = section ? GUIDE_SECTIONS[section] : null;
  const page = target?.chapter ?? chapter;
  if (!page) return withBase(`/${directory}/index.html`);
  // A language without names of its own in the tables above names its chapters like the English
  // ones, and a chapter it has not translated shows the English text under that same name.
  const chapterSlug = (GUIDE_CHAPTERS[page] as { en: string } & Partial<Record<Language, string>>)[language] ?? GUIDE_CHAPTERS[page].en;
  const anchor = target ? (target as { en: string } & Partial<Record<Language, string>>)[language] ?? target.en : null;
  return withBase(`/${directory}/${chapterSlug}.html${anchor ? `#${anchor}` : ""}`);
}

/**
 * Where in its chapter a shape is explained - the heading its question mark
 * jumps to. Text and sketches have a chapter of their own and open its top.
 */
type GuideShape = {
  kind: ShapeKind;
  groupedShapes?: readonly unknown[];
  groupOperation?: string;
  sketchProfile?: unknown;
  sketchOperation?: string;
  importedMesh?: { sourceFormat?: string };
  layeredText?: boolean;
  layeredIcon?: boolean;
  qrCode?: unknown;
  sbcBoard?: unknown;
  imagePlate?: unknown;
};

export function guideSectionForShape(shape: GuideShape): GuideSection | undefined {
  // A name tag (#215) is a bundle, but its panel is explained with the text.
  if (shape.layeredText && shape.groupedShapes?.length) return "textLayers";
  // An icon tag is a bundle too; its card is explained next to the name tag.
  if (shape.layeredIcon && shape.groupedShapes?.length) return "iconTag";
  // A QR code (#553), alone or on its plate, is explained with the texts and tags.
  if (shape.qrCode) return "qrCode";
  // An SBC board (#1098) is a group, but it is explained next to the port openings.
  if (shape.sbcBoard) return "sbcBoard";
  // A reference image (#680) is explained with the other measuring aids.
  if (shape.imagePlate) return "referenceImage";
  if (shape.groupedShapes?.length) {
    if (shape.groupOperation === "bundle") return "bundling";
    // A loft between two sketches is explained next to the hull and the cookie cutter.
    if (shape.groupOperation === "intersection" || shape.groupOperation === "hull" || shape.groupOperation === "loft") return "intersection";
    return "grouping";
  }
  // A body made from a sketch, or a file brought in, is explained where it was made.
  // An extruded one shows its fill in the properties (#197); a revolved one, how it was made.
  if (shape.sketchProfile) return shape.sketchOperation === "revolve" ? "sketchToBody" : shape.sketchOperation === "sweep" ? "sketchSweep" : "sketchFill";
  if (shape.kind === "mesh" && shape.importedMesh && shape.importedMesh.sourceFormat !== "json") return "importing";
  switch (shape.kind) {
    case "text":
      return "addingText";
    case "sketch":
    case "scribble":
      return "sketchToBody";
    case "thread":
      return "threads";
    case "gear":
    case "hirth":
    case "pulley":
      return "gears";
    case "spring":
      return "springs";
    case "bentTube":
      return "bentTubes";
    case "loft":
      return "loft";
    case "vase":
      return "vase";
    case "honeycomb":
      // No longer a shape of its own: the hole pattern tool took its place (#223).
      return "holePattern";
    case "gridfinity":
      return "gridfinity";
    case "hinge":
      return "hinge";
    case "knurl":
      return "knurl";
    case "dovetail":
      return "dovetail";
    case "screwBoss":
      return "screwBoss";
    case "snapFit":
      return "snapFit";
    case "rib":
      return "ribs";
    case "teardrop":
      return "teardrop";
    case "port":
      return "ports";
    case "counterbore":
    case "countersink":
    case "doubleCountersink":
    case "finishingWasher":
      return "screwHoles";
    case "ruler":
      return "ruler";
    default:
      return "shapeSettings";
  }
}

/** Which chapter explains a shape - the one its question mark opens. */
export function guideChapterForShape(shape: GuideShape): GuideChapter {
  // The chapter always matches the section the question mark jumps to.
  const section = guideSectionForShape(shape);
  if (section) return GUIDE_SECTIONS[section].chapter;
  if (shape.groupedShapes?.length) return "solids";
  switch (shape.kind) {
    case "text":
      return "text";
    case "thread":
    case "spring":
    case "gear":
    case "hirth":
    case "pulley":
    case "bentTube":
    case "loft":
    case "gridfinity":
    case "hinge":
    case "knurl":
    case "dovetail":
    case "screwBoss":
    case "snapFit":
    case "rib":
    case "teardrop":
    case "port":
    case "counterbore":
    case "countersink":
    case "doubleCountersink":
    case "finishingWasher":
      return "threads";
    case "ruler":
      return "measuring";
    case "sketch":
    case "scribble":
      return "sketches";
    default:
      return "shapes";
  }
}
