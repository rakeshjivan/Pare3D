"use client";

import { withBase } from "@/lib/basePath";
import { GuideHelpLink } from "@/components/GuideHelpLink";
import { ShapeMenuPanel } from "@/components/workplane/ShapeMenuPanel";
import { AlertTriangle, Layers3, Magnet, ArrowDownToLine, ArrowUpFromLine, PencilLine, Blend, Check, CircleHelp, Percent, Circle as CircleIcon, Eye, EyeOff, Hexagon as HexagonIcon, ListTree, MoreHorizontal, Pencil, Pentagon as PentagonIcon, Rotate3d, Route as RouteIcon, Search, Square as SquareIcon, Star as StarIcon, Triangle as TriangleIcon, X } from "lucide-react";
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useWheelField } from "@/lib/useWheelField";
import { wheelNextValue } from "@/lib/wheelValueStep";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { getLanguage, t, type MessageKey } from "@/lib/i18n";
import { useLanguage } from "@/lib/useLanguage";
import {
  normalizePolygonSides,
  normalizeStarInnerPercent, SKETCH_POLYGON_MAX_SIDES,
  SKETCH_POLYGON_MIN_SIDES, SKETCH_STAR_MAX_INNER_PERCENT,
  SKETCH_STAR_MIN_INNER_PERCENT
} from "@/lib/sketchPrimitives";
import {
  SketchBoltCircleIcon,
  SketchEllipseIcon,
  SketchHalfCircleIcon,
  SketchPieSliceIcon,
  ToolbarAlignIcon,
  ToolbarCenterOnWorkplaneIcon,
  ToolbarChamferIcon,
  ToolbarCaretDownIcon,
  ToolbarCopyIcon,
  ToolbarDuplicateIcon,
  ToolbarDropToWorkplaneIcon,
  ToolbarBundleIcon,
  ToolbarGroupIcon,
  ToolbarGuideIcon,
  ToolbarHideSelectedIcon, ToolbarImportIcon, ToolbarAttachmentsIcon,
  ToolbarIntersectionIcon, ToolbarKeyboardIcon,
  ToolbarFilletIcon,
  ToolbarHistoryIcon,
  ToolbarHollowIcon,
  ToolbarOffsetIcon,
  ToolbarDeleteFaceIcon,
  ToolbarSimplifyIcon,
  ToolbarMakeExactIcon,
  ToolbarBuildPlatesIcon,
  ToolbarMirrorIcon,
  ToolbarRotationPivotIcon,
  ToolbarPatternIcon,
  ToolbarHolePatternIcon,
  ToolbarThreadInsertIcon,
  ToolbarSupportRibIcon,
  ToolbarFaceToolIcon,
  ToolbarConstructionLineIcon,
  ToolbarMiddleLineIcon,
  ToolbarLayFlatIcon,
  ToolbarMateFacesIcon,
  ToolbarNoteIcon,
  ToolbarSplitIcon,
  ToolbarPasteIcon,
  ToolbarRedoIcon,
  ToolbarSnapGridIcon,
  ToolbarSettingsIcon,
  ToolbarShapeAddIcon,
  ToolbarTrashIcon,
  ToolbarUngroupIcon,
  ToolbarUndoIcon,
  ToolbarVectorExportIcon,
  ToolbarCutOutIcon,
  ToolbarPunchIcon,
  ToolbarLoftSketchesIcon,
  ToolbarMoldIcon,
  ToolbarCableChannelIcon,
  ToolbarSurfaceTextureIcon,
  ToolbarPaintIcon,
  ToolbarStencilBridgeIcon,
  ToolbarPrintCheckIcon
} from "./icons";
import { type SketchPrimitive, type SketchTool } from "./SketchWorkspace";
import { MORE_SHAPE_IDS, moreShapeIcon, type MoreShapeId } from "@/lib/moreShapes";
import { HelpMenu } from "./HelpMenu";
import { InstantTips } from "./InstantTips";
import { SaveStatus } from "./SaveStatus";
import { CUT_BELOW_BED_EVENT, PRINT_CHECK_EVENT, SPLIT_TO_FIT_EVENT } from "./PrintCheckPanel";
import { Brush, ChevronDown, Cookie, Grip, MessageSquareText, PackageOpen, Printer, Worm } from "lucide-react";
import { PareBuildBadge } from "./PareVersionStatus";
import { ArchiveRestore, Signature } from "lucide-react";
import { OPEN_FILE_BACKUPS_EVENT } from "@/lib/fileBackups";
import { OPEN_BAUBLE_EVENT } from "@/lib/baubleLithophane";
import { CommandPalette, type PaletteCommand } from "./workplane/CommandPalette";
import { COMMAND_KEYWORDS, SHAPE_KEYWORDS } from "@/lib/commandKeywords";
import { ExportButton } from "@/components/ExportButton";
import { OPEN_EXPORT_WINDOW_EVENT, readBambuFormat, readSlicer, SEND_TO_BAMBU_EVENT, slicerName } from "@/lib/bambuSend";
import { ForkDraftIcon } from "./forkToolbarIcons";
import { FORK_OVERFLOW_TOOLS, FORK_SHORT_LABELS_EN, FORK_TOOL_HINTS_EN, FORK_TOOL_ICONS, ForkBlendIcon, ForkHomeIcon, ForkReadyPartsIcon, ForkShapesIcon, ForkSpaceOutIcon } from "@/components/forkToolbarIcons";
import { Import, PaintBucket, ScanSearch, Scissors, Settings as LucideSettings, ShieldCheck, Spline, Squircle, Type, Variable } from "lucide-react";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { SimpleModeSwitch } from "@/components/SimpleModeSwitch";
import { HelpMenuItems } from "@/components/HelpMenu";
import { ViewLookSwitch } from "@/components/ViewLookSwitch";
import { libraryShapeAssets, shapeAssetColor, shapeAssetLabel, shapeAssetMenuLabel } from "@/lib/shapeCatalog";
import type { CadModifierKind } from "@/lib/cadModifierTypes";
import type { ShapeAsset, SketchOperation, WorkplaneWorkspaceSettings } from "@/types/layerling";
import { topTip } from "@/components/topTip";
import { type TopPanel } from "@/components/workplane/TopActionPanel";

import { OPEN_PARAMETERS_EVENT, MESH_CHECK_EVENT, FILL_HOLE_EVENT, libraryShapeIds, HISTORY_VIEW_COMMANDS, type ToolbarMode } from "@/lib/editorShared";

/* The editor's second toolbar row - the tool groups (Home, Clipboard, History, Shapes, Visibility, Combine, Modify, Mesh, Arrange, Make) and, in sketch mode, the sketch tools. Moved out of LayerlingEditor (build 55). */

export const sketchReferenceIcons = {
  line: "sketch-tool-line.png",
  arc: "sketch-tool-arc.png",
  bezier: "sketch-tool-bezier-curve.png",
  smooth: "sketch-tool-smooth-curve.png",
  select: "sketch-tool-select.png",
  image: "sketch-tool-add-image.png",
  refine: "sketch-tool-add-or-remove-points.png",
  erase: "sketch-tool-erase.png",
  measure: "sketch-tool-measure.png",
  sketchTo3d: "sketch-tool-sketch-to-3d.png",
  editSketchTo3d: "sketch-tool-edit-sketch-to-3d.png",
} as const;

export type SketchReferenceIconName = keyof typeof sketchReferenceIcons;

export function SketchReferenceIcon({ name }: { name: SketchReferenceIconName }) {
  return (
    <img
      aria-hidden="true"
      className="sketch-reference-icon"
      data-sketch-icon={name}
      draggable={false}
      src={withBase(`/assets/editor/${sketchReferenceIcons[name]}`)}
      alt=""
    />
  );
}

export type SketchShapeOptions = { sides: number; innerPercent: number };

/** A number in the sketch shapes menu: typed freely, tidied to its limits when it is left. */
export function SketchShapeNumberField({ label, value, min, max, suffix, normalize, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  normalize: (value: unknown) => number;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const next = normalize(draft.replace(",", "."));
    setDraft(String(next));
    onChange(next);
  };
  // The mouse wheel in the clicked field (#536): whole numbers, so one notch is one, Shift ten.
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  useWheelField(inputRef, focused, ({ direction, keys }) => {
    const typed = Number(draft.replace(",", "."));
    const next = normalize(wheelNextValue(Number.isFinite(typed) ? typed : value, direction, 1, { shift: keys.shift }));
    setDraft(String(next));
    onChange(next);
  });
  return (
    <label>
      <span>{label}</span>
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        aria-label={label}
        title={`${min} - ${max}`}
        value={draft}
        onFocus={(event) => { setFocused(true); event.currentTarget.select(); }}
        onChange={(event) => setDraft(event.currentTarget.value)}
        onBlur={() => { setFocused(false); commit(); }}
        onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }}
      />
      {suffix ? <span className="unit">{suffix}</span> : null}
    </label>
  );
}

export const sketchShapeMenuItems = [
  { primitive: "rectangle", label: "sketch.rectangle", icon: SquareIcon },
  { primitive: "circle", label: "sketch.circle", icon: CircleIcon },
  { primitive: "ellipse", label: "sketch.ellipse", icon: SketchEllipseIcon },
  { primitive: "halfCircle", label: "sketch.halfCircle", icon: SketchHalfCircleIcon },
  { primitive: "pieSlice", label: "sketch.pieSlice", icon: SketchPieSliceIcon },
  { primitive: "triangle", label: "sketch.triangle", icon: TriangleIcon },
  { primitive: "hexagon", label: "sketch.hexagon", icon: HexagonIcon },
  { primitive: "polygon", label: "sketch.polygon", icon: PentagonIcon },
  { primitive: "star", label: "sketch.star", icon: StarIcon },
  { primitive: "boltCircle", label: "sketch.boltCircle", icon: SketchBoltCircleIcon },
] satisfies Array<{ primitive: SketchPrimitive; label: MessageKey; icon: ComponentType<SVGProps<SVGSVGElement>> }>;

/** The keys that do what a toolbar button does, shown beside it in the command search. */
export const COMMAND_SHORTCUTS: Readonly<Record<string, string>> = {
  copy: "Ctrl+C",
  paste: "Ctrl+V",
  duplicate: "Ctrl+D",
  delete: "Delete",
  undo: "Ctrl+Z",
  redo: "Ctrl+Y",
  outliner: "Ctrl+Shift+O",
  "toggle-hidden": "Ctrl+H",
  "show-hidden": "Ctrl+Shift+H",
  group: "Ctrl+G",
  bundle: "Ctrl+B",
  ungroup: "Ctrl+Shift+G",
  align: "L",
  mirror: "M",
  fillet: "B",
  chamfer: "Shift+B",
  drop: "D",
  note: "N",
  import: "Ctrl+Shift+I",
  intersect: "Ctrl+I",
  "interactive-help": "Shift+F1",
  export: "Ctrl+E",
  "sketch-copy": "Ctrl+C",
  "sketch-paste": "Ctrl+V",
  "sketch-duplicate": "Ctrl+D",
  "sketch-delete": "Delete",
  "sketch-undo": "Ctrl+Z",
  "sketch-redo": "Ctrl+Y",
};

export type SketchIconName = Parameters<typeof SketchReferenceIcon>[0]["name"];

/** A sketch tool's picture as a component of its own, for the command search. */
export function sketchPaletteIcon(name: SketchIconName) {
  return function SketchPaletteIcon() {
    return <SketchReferenceIcon name={name} />;
  };
}

export const SKETCH_PALETTE_ICONS = {
  line: sketchPaletteIcon("line"),
  arc: sketchPaletteIcon("arc"),
  bezier: sketchPaletteIcon("bezier"),
  smooth: sketchPaletteIcon("smooth"),
  select: sketchPaletteIcon("select"),
  image: sketchPaletteIcon("image"),
  refine: sketchPaletteIcon("refine"),
  erase: sketchPaletteIcon("erase"),
};

/** Build 71: the groups folded first when the toolbar would wrap - the least used first. */
const FOLD_ORDER = ["arrange", "combine", "clipboard", "history"] as const;
/** Build 109: groups that are always one button with a drop-down - the mesh tools only work on an imported mesh. */
const ALWAYS_FOLDED: readonly string[] = ["mesh", "print"];

/**
 * Build 125: the top row's less-used items in one menu, so the row holds the design name, Export, Import and Settings.
 * Every item keeps its key (N for a note, Ctrl/Cmd+K for the search, ? for the key list).
 */
function TopMoreMenu({
  noteMode,
  historyViewActive,
  attachmentCount,
  interactiveHelpActive,
  onNote,
  onAttachments,
  onParameters,
  onSearch,
  onGuide,
  onShortcuts,
  onInteractiveHelp,
}: {
  noteMode: boolean;
  historyViewActive: boolean;
  attachmentCount: number;
  interactiveHelpActive: boolean;
  onNote: () => void;
  onAttachments: () => void;
  onParameters: () => void;
  onSearch: () => void;
  onGuide: () => void;
  onShortcuts: () => void;
  onInteractiveHelp: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onResize = () => setOpen(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);
  const mac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const pick = (action: () => void) => () => {
    setOpen(false);
    action();
  };
  return (
    <div className="help-menu top-more" ref={rootRef}>
      <button
        type="button"
        className={`action-icon-button top-more-trigger ${open || interactiveHelpActive || noteMode ? "active" : ""}`}
        aria-label={t("editor.moreMenu")}
        title={t("editor.moreMenu")}
        aria-haspopup="menu"
        aria-expanded={open}
        data-help-exempt
        data-layerling-tool="top-more"
        onClick={() => setOpen((current) => !current)}
      >
        <MoreHorizontal className="title-icon" aria-hidden="true" />
        {attachmentCount > 0 ? <span className="attachments-indicator" aria-hidden="true" /> : null}
      </button>
      {open ? (
        <div className="help-menu-list top-more-menu" role="menu" aria-label={t("editor.moreMenu")}>
          <button type="button" role="menuitem" data-layerling-tool="note" className={noteMode ? "active" : ""} disabled={historyViewActive} onClick={pick(onNote)}>
            <MessageSquareText size={17} aria-hidden="true" />
            <span><strong>{t("editor.tool.note")} <kbd className="fold-menu-keys">{COMMAND_SHORTCUTS.note}</kbd></strong><small>{t("editor.moreNoteHint")}</small></span>
          </button>
          <button type="button" role="menuitem" data-layerling-tool="attachments" disabled={historyViewActive} onClick={pick(onAttachments)}>
            <ToolbarAttachmentsIcon width={17} height={17} aria-hidden="true" />
            <span><strong>{attachmentCount > 0 ? t("editor.attachmentsCount", { count: attachmentCount }) : t("editor.attachments")}</strong><small>{t("editor.moreAttachmentsHint")}</small></span>
          </button>
          <button type="button" role="menuitem" data-layerling-tool="parameters" disabled={historyViewActive} onClick={pick(onParameters)}>
            <Variable size={17} aria-hidden="true" />
            <span><strong>{t("parameters.title")}</strong><small>{t("editor.moreParametersHint")}</small></span>
          </button>
          <button type="button" role="menuitem" data-layerling-tool="command-search" onClick={pick(onSearch)}>
            <Search size={17} aria-hidden="true" />
            <span><strong>{t("palette.field")} <kbd className="fold-menu-keys">{mac ? "⌘K" : "Ctrl K"}</kbd></strong><small>{t("editor.moreSearchHint")}</small></span>
          </button>
          <div className="top-more-divider" role="presentation">{t("helpMenu.title")}</div>
          <HelpMenuItems onClose={() => setOpen(false)} onGuide={onGuide} onShortcuts={onShortcuts} onInteractiveHelp={onInteractiveHelp} />
          <div className="top-more-divider" role="presentation" />
          <div className="top-more-switches">
            <SimpleModeSwitch />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SecondaryToolbar({
  toolbarMode,
  projectId = null,
  projectName,
  onProjectNameChange,
  onToolbarModeChange,
  outlinerOpen,
  onToggleOutliner,
  alignMode,
  canAlign,
  canModifySelection,
  canEdgeModify,
  edgeModifierKind,
  canGroup,
  canIntersect,
  canCookieCutter,
  canFlexi,
  flexiActive,
  canLid,
  lidActive,
  canLoftSketches,
  canRedo,
  canUngroup,
  canUndo,
  undoHint,
  redoHint,
  onUndoRedoHover,
  canHistoryView,
  historyViewActive,
  onHistoryView,
  hasClipboard,
  hasSelection,
  hiddenShapeCount,
  selectionHidden,
  mirrorMode,
  canSplit,
  splitMode,
  sketchActive,
  sketchOperation,
  sketchTool,
  sketchCanUndo,
  sketchCanRedo,
  sketchHasSelection,
  sketchHasClipboard,
  canEditSketch,
  canFilletSketchPoint,
  sketchCornerDialog,
  onSketchCornerDialog,
  sketchConstruction,
  onSketchConstruction,
  sketchFromMiddle,
  onSketchFromMiddle,
  sketchStrokeActive,
  onSketchStroke,
  onStartSketch,
  sketchIsNew,
  onSketchOperation,
  onEditSketch,
  onSketchTool,
  onSketchPrimitive,
  sketchShapeOptions,
  onSketchShapeOptions,
  onSketchImage,
  onSketchCopy,
  onSketchPaste,
  onSketchDuplicate,
  onSketchDelete,
  onSketchUndo,
  onSketchRedo,
  onSketchFinish,
  onSketchCancel,
  onHome,
  onAlign,
  onChamfer,
  onCopy,
  onDelete,
  onDuplicate,
  onCenterOnWorkplane,
  onBuildPlates,
  buildPlatesActive,
  onDropToWorkplane,
  onLayFlat,
  layFlatActive,
  onMateFaces,
  mateFacesActive,
  onHolePattern,
  holePatternActive,
  onLayerCheck,
  layerCheckActive,
  onThreadInsert,
  threadInsertActive,
  onMagnetPocket,
  magnetPocketActive,
  onSupportRib,
  supportRibActive,
  canHolePattern,
  onFaceTool,
  onBlendBodies,
  build33,
  canMold,
  moldActive,
  onMold,
  canCableChannel,
  cableChannelActive,
  onCableChannel,
  canStencilBridges,
  stencilBridgesActive,
  onStencilBridges,
  canPrintCheck,
  printCheckActive,
  onPrintCheck,
  canSurfaceTexture,
  attachmentCount,
  surfaceTextureActive,
  onSurfaceTextureTool,
  canPaint,
  paintActive,
  onPaint,
  canHull,
  onHull,
  blendBodiesActive,
  canBlendBodies,
  faceToolActive,
  canFaceTool,
  onGroup,
  onBundle,
  onIntersect,
  onCookieCutter,
  onFlexi,
  onLid,
  onLoftSketches,
  intersectPreviewActive,
  onFillet,
  onHollow,
  hollowActive,
  onOffset,
  offsetActive,
  onCutOut,
  canCutOut,
  cutOutActive,
  onPunch,
  punchActive,
  onDeleteFace,
  deleteFaceActive,
  canSimplify,
  onSimplify,
  simplifyActive,
  canMakeExact,
  onMakeExact,
  makeExactBusy,
  onMirror,
  onRotationPivot,
  rotationPivotActive,
  onArray,
  arrayActive,
  onScalePercent,
  onCarryOntoFace,
  scalePercentActive,
  onSplit,
  onPaste,
  onRedo,
  onSnap,
  onShowHidden,
  onToggleHidden,
  onUngroup,
  onUndo,
  onTopPanel,
  onAddShape,
  onShortcuts,
  onInteractiveHelp,
  interactiveHelpActive,
  onGuide,
  noteMode,
  notesVisible,
  noteCount,
  onNoteTool,
  onToggleNotes,
  overhangsVisible,
  overhangAngle,
  onToggleOverhangs,
  renderMyShapes,
  renderMoreShapes,
  addMoreShape,
  renderReadyParts,
  onLithophane,
  onTrace,
  traceOpen,
  onVoronoi,
  lithophaneOpen,
  voronoiOpen,
  shapeCustomizations,
  objects,
  onSelectObject,
}: {
  toolbarMode: ToolbarMode;
  /** Build 90: the design open - a different one puts the Shapes panel as its pin says. */
  projectId?: string | null;
  projectName: string;
  onProjectNameChange?: (name: string) => void;
  onToolbarModeChange: (mode: ToolbarMode) => void;
  outlinerOpen: boolean;
  onToggleOutliner: () => void;
  alignMode: boolean;
  canAlign: boolean;
  /** Something is selected and none of it is locked: the Modify and Arrange tools may act on it. */
  canModifySelection: boolean;
  canEdgeModify: boolean;
  edgeModifierKind: CadModifierKind | null;
  canGroup: boolean;
  canIntersect: boolean;
  canCookieCutter: boolean;
  canFlexi: boolean;
  flexiActive: boolean;
  canLid: boolean;
  lidActive: boolean;
  canLoftSketches: boolean;
  canRedo: boolean;
  canUngroup: boolean;
  canUndo: boolean;
  /** What undo would take back, with its measure ("Rounded the edges of Box (5 mm)"), named on its button (#1023). */
  undoHint?: string | null;
  /** What redo would bring again. */
  redoHint?: string | null;
  /** The pointer or the focus came onto undo or redo: time to work out their hints. */
  onUndoRedoHover?: () => void;
  canHistoryView: boolean;
  historyViewActive: boolean;
  onHistoryView: () => void;
  hasClipboard: boolean;
  hasSelection: boolean;
  hiddenShapeCount: number;
  selectionHidden: boolean;
  mirrorMode: boolean;
  canSplit: boolean;
  splitMode: boolean;
  sketchActive: boolean;
  sketchOperation: SketchOperation;
  sketchTool: SketchTool;
  sketchCanUndo: boolean;
  sketchCanRedo: boolean;
  sketchHasSelection: boolean;
  sketchHasClipboard: boolean;
  canEditSketch: boolean;
  canFilletSketchPoint?: boolean;
  sketchCornerDialog?: "fillet" | "chamfer" | null;
  onSketchCornerDialog?: (dialog: "fillet" | "chamfer" | null) => void;
  sketchConstruction?: boolean;
  onSketchConstruction?: () => void;
  sketchFromMiddle?: boolean;
  onSketchFromMiddle?: () => void;
  sketchStrokeActive?: boolean;
  onSketchStroke?: () => void;
  onStartSketch: (operation: SketchOperation) => void;
  sketchIsNew: boolean;
  onSketchOperation: (operation: SketchOperation) => void;
  onEditSketch: () => void;
  onSketchTool: (tool: SketchTool) => void;
  onSketchPrimitive: (primitive: SketchPrimitive) => void;
  sketchShapeOptions: SketchShapeOptions;
  onSketchShapeOptions: (options: SketchShapeOptions) => void;
  onSketchImage: () => void;
  onSketchCopy: () => void;
  onSketchPaste: () => void;
  onSketchDuplicate: () => void;
  onSketchDelete: () => void;
  onSketchUndo: () => void;
  onSketchRedo: () => void;
  onSketchFinish: () => void;
  onSketchCancel: () => void;
  onHome?: () => void;
  onAlign: () => void;
  onChamfer: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onCenterOnWorkplane: () => void;
  onBuildPlates?: () => void;
  buildPlatesActive?: boolean;
  onDropToWorkplane: () => void;
  onLayFlat: () => void;
  layFlatActive: boolean;
  onMateFaces: () => void;
  mateFacesActive: boolean;
  onHolePattern: () => void;
  holePatternActive: boolean;
  onLayerCheck: () => void;
  layerCheckActive: boolean;
  onThreadInsert: () => void;
  threadInsertActive: boolean;
  onMagnetPocket: () => void;
  magnetPocketActive: boolean;
  /** Support rib (from layerling 1.148): a thin rib under the lower face of a part printed tilted. */
  onSupportRib: () => void;
  supportRibActive: boolean;
  canHolePattern: boolean;
  onFaceTool: () => void;
  onBlendBodies: () => void;
  /** Fork (build 33): Hull, Fit check and Round a mesh. */
  /** Tools from layerling the toolbar offers too (Mold, Cable channel, Stencil bridges, Print check, Surface texture, Paint, Hull). */
  canMold?: boolean;
  moldActive?: boolean;
  onMold?: () => void;
  canCableChannel?: boolean;
  cableChannelActive?: boolean;
  onCableChannel?: () => void;
  canStencilBridges?: boolean;
  stencilBridgesActive?: boolean;
  onStencilBridges?: () => void;
  canPrintCheck?: boolean;
  printCheckActive?: boolean;
  onPrintCheck?: () => void;
  /** How many files the design keeps (layerling's attachments). */
  attachmentCount?: number;
  canSurfaceTexture?: boolean;
  surfaceTextureActive?: boolean;
  onSurfaceTextureTool?: () => void;
  canPaint?: boolean;
  paintActive?: boolean;
  onPaint?: () => void;
  canHull?: boolean;
  onHull?: () => void;
  build33: { canHull: boolean; onHull: () => void; fitActive: boolean; onFitCheck: () => void; canRound: boolean; roundActive: boolean; onRound: () => void; sculptActive: boolean; onSculpt: () => void; textActive: boolean; onText: () => void; draftActive: boolean; onDraft: () => void };
  blendBodiesActive: boolean;
  canBlendBodies: boolean;
  faceToolActive: boolean;
  canFaceTool: boolean;
  onGroup: () => void;
  onBundle: () => void;
  onIntersect: () => void;
  onCookieCutter: () => void;
  onFlexi: () => void;
  onLid: () => void;
  onLoftSketches: () => void;

  intersectPreviewActive: boolean;
  onFillet: () => void;
  onHollow: () => void;
  hollowActive: boolean;
  onOffset: () => void;
  offsetActive: boolean;
  onCutOut: () => void;
  canCutOut: boolean;
  cutOutActive: boolean;
  /** Punch: the first body's outline straight through the second; enabled like Cut out, for two solids. */
  onPunch: () => void;
  punchActive: boolean;
  onDeleteFace: () => void;
  deleteFaceActive: boolean;
  canSimplify: boolean;
  onSimplify: () => void;
  simplifyActive: boolean;
  canMakeExact: boolean;
  onMakeExact: () => void;
  makeExactBusy: boolean;
  onMirror: () => void;
  onRotationPivot: () => void;
  rotationPivotActive: boolean;
  onArray: () => void;
  arrayActive: boolean;
  onScalePercent: () => void;
  onCarryOntoFace: () => void;
  scalePercentActive: boolean;
  onSplit: () => void;
  onPaste: () => void;
  onRedo: () => void;
  onSnap: () => void;
  onShowHidden: () => void;
  onToggleHidden: () => void;
  onUngroup: () => void;
  onUndo: () => void;
  onTopPanel: (panel: TopPanel) => void;
  onAddShape: (shape: ShapeAsset) => void;
  onShortcuts: () => void;
  onInteractiveHelp: () => void;
  interactiveHelpActive: boolean;
  onGuide: () => void;
  noteMode: boolean;
  notesVisible: boolean;
  noteCount: number;
  onNoteTool: () => void;
  onToggleNotes: () => void;
  overhangsVisible: boolean;
  overhangAngle: number;
  onToggleOverhangs: () => void;
  /** Custom shapes above the library; gets the way to close the menu. */
  renderMyShapes?: (close: () => void) => ReactNode;
  renderMoreShapes?: (close: () => void, after: string | undefined, present: ReadonlySet<string>) => ReactNode;
  addMoreShape?: (id: MoreShapeId) => void;
  /** Fork: ready-made parts under the library; gets the way to close the menu. */
  renderReadyParts?: (close: () => void) => ReactNode;
  /** Fork: the lithophane and Voronoi makers. */
  onLithophane?: () => void;
  onTrace?: () => void;
  traceOpen?: boolean;
  onVoronoi?: () => void;
  lithophaneOpen?: boolean;
  voronoiOpen?: boolean;
  /** The shape defaults, so each library entry can show the colour it will be added in. */
  shapeCustomizations: WorkplaneWorkspaceSettings["shapeCustomizations"];
  /** The bodies of the design, so the command search can find them by name. */
  objects: ReadonlyArray<{ id: string; name: string; kind: string; hidden: boolean }>;
  onSelectObject: (id: string) => void;
}) {
  const [shapesOpen, setShapesOpen] = useState(false);
  // The Shapes panel kept open while shapes are placed one after the other (#433); remembered in this browser.
  const [geometryShapesPinned, setGeometryShapesPinned] = useState(false);
  // The sketch's panel has its own pin, its own place and its own size (#577).
  const [sketchShapesPinned, setSketchShapesPinned] = useState(false);
  const shapesPinned = toolbarMode === "sketch" ? sketchShapesPinned : geometryShapesPinned;
  const shapesPinnedRef = useRef(false);
  shapesPinnedRef.current = shapesPinned;
  useEffect(() => {
    try {
      // Fork: the Shapes panel is docked on the right unless it was unpinned.
      const pinned = window.localStorage.getItem("layerling.editor.shapeMenuPinned") !== "false";
      setGeometryShapesPinned(pinned);
      setSketchShapesPinned(window.localStorage.getItem("layerling.sketch.shapeMenuPinned") === "true");
      // A pinned panel is there again at the next start, not only its pin (forum, prmod3d).
      // Build 90: open when a design opens only while it is pinned - unpinned, it waits for the Shapes button
      // (build 22 opened it every time, pinned or not).
      setShapesOpen(pinned);
    } catch {
      // Blocked storage: the panel closes after each shape, as it always did.
    }
  }, []);
  // Build 90: another design opened in the same visit - the Shapes panel open only if it is pinned.
  const shownForProject = useRef(projectId);
  useEffect(() => {
    if (shownForProject.current === projectId) return;
    shownForProject.current = projectId;
    setShapesTab("shapes");
    setShapesOpen(shapesPinnedRef.current);
  }, [projectId]);
  const toggleShapesPinned = () => {
    const next = !shapesPinnedRef.current;
    const sketch = toolbarMode === "sketch";
    (sketch ? setSketchShapesPinned : setGeometryShapesPinned)(next);
    try {
      window.localStorage.setItem(sketch ? "layerling.sketch.shapeMenuPinned" : "layerling.editor.shapeMenuPinned", String(next));
    } catch {
      // The pin still works for this visit.
    }
  };
  // Fork: tell the page when the Shapes panel is docked, so the workplane makes room for it.
  const shapeDockOn = toolbarMode === "geometry" && shapesPinned && shapesOpen;
  useEffect(() => {
    const root = document.documentElement;
    if (shapeDockOn) root.dataset.shapeDock = "on";
    else delete root.dataset.shapeDock;
    window.dispatchEvent(new Event("resize"));
    return () => {
      delete root.dataset.shapeDock;
    };
  }, [shapeDockOn]);
  /** Picking a shape closes the panel, unless it is pinned open. */
  const closeShapesAfterPick = () => {
    if (!shapesPinnedRef.current) setShapesOpen(false);
  };
  // On a narrow window the tools wrap onto more rows. Their real height goes
  // into --editor-toolbar-height, which the workplane, the status and the menus
  // below the bar are placed by.
  const toolbarContentRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    const content = toolbarContentRef.current;
    if (!content || typeof ResizeObserver === "undefined") return;
    const root = document.documentElement;
    const apply = () => {
      const styles = getComputedStyle(root);
      const title = parseFloat(styles.getPropertyValue("--editor-toolbar-title-height")) || 44;
      const minimum = parseFloat(styles.getPropertyValue("--editor-toolbar-tools-height")) || 76;
      const tools = content.offsetHeight;
      // A hidden editor measures nothing; it keeps the one-row height.
      root.style.setProperty("--editor-toolbar-height", `${Math.round(title + Math.max(minimum, tools))}px`);
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(content);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--editor-toolbar-height");
    };
  }, []);
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [modifyMoreOpen, setModifyMoreOpen] = useState(false);
  const modifyMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!modifyMoreOpen) return;
    const onDown = (event: PointerEvent) => {
      if (!modifyMoreRef.current?.contains(event.target as Node)) setModifyMoreOpen(false);
    };
    // Build 109: Escape closes it too, and so does a window that opens over it (Settings from a key).
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModifyMoreOpen(false);
    };
    const onSettings = () => setModifyMoreOpen(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("layerling:open-workspace-settings", onSettings);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("layerling:open-workspace-settings", onSettings);
    };
  }, [modifyMoreOpen]);
  // Build 71: when the groups would wrap onto a second row (a 13-inch laptop), the least used ones fold
  // into one button each, with their tools in a drop-down - the row stays one row, the plate stays tall.
  const [foldedGroups, setFoldedGroups] = useState<string[]>([]);
  const [openFold, setOpenFold] = useState<string | null>(null);
  useEffect(() => {
    if (!openFold) return;
    const onDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest?.(`[data-fold="${openFold}"]`)) setOpenFold(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenFold(null);
    };
    const close = () => setOpenFold(null);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", close);
    window.addEventListener("layerling:open-workspace-settings", close);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", close);
      window.removeEventListener("layerling:open-workspace-settings", close);
    };
  }, [openFold]);
  useEffect(() => {
    const reset = () => setFoldedGroups([]);
    window.addEventListener("resize", reset);
    return () => window.removeEventListener("resize", reset);
  }, []);
  useLayoutEffect(() => {
    const content = toolbarContentRef.current;
    if (!content || toolbarMode !== "geometry") return;
    const sections = [...content.querySelectorAll<HTMLElement>(".toolbar-section")];
    if (sections.length < 2) return;
    const first = sections[0].getBoundingClientRect().top;
    const wraps = sections.some((section) => section.getBoundingClientRect().top > first + 12);
    // Build 123: a toolbar that runs past the window's edge without wrapping folds a group too.
    const host = content.closest<HTMLElement>(".editor-secondary-toolbar") ?? content;
    const overflows = content.scrollWidth > content.clientWidth + 2 || sections[sections.length - 1].getBoundingClientRect().right > Math.min(window.innerWidth, host.getBoundingClientRect().right) + 2;
    if (!wraps && !overflows) return;
    const next = FOLD_ORDER.find((group) => !foldedGroups.includes(group));
    if (next) setFoldedGroups((current) => (current.includes(next) ? current : [...current, next]));
  });
  const [visibilityMenuPosition, setVisibilityMenuPosition] = useState({ top: 0, left: 0 });
  const shapesMenuRef = useRef<HTMLDivElement>(null);
  const visibilityMenuRef = useRef<HTMLDivElement>(null);
  const touchShapeStartRef = useRef<{ id: string; x: number; y: number } | null>(null);
  const suppressNextShapeClickRef = useRef(false);
  const cancelProjectNameEditRef = useRef(false);
  const projectNameFieldRef = useRef<HTMLLabelElement>(null);
  const projectNameInputRef = useRef<HTMLInputElement>(null);
  const [projectNameDraft, setProjectNameDraft] = useState(projectName);
  useEffect(() => {
    setProjectNameDraft(projectName);
  }, [projectName]);
  useEffect(() => {
    const finishProjectNameEdit = (event: PointerEvent) => {
      const input = projectNameInputRef.current;
      if (input && document.activeElement === input && !projectNameFieldRef.current?.contains(event.target as Node)) {
        input.blur();
      }
    };
    document.addEventListener("pointerdown", finishProjectNameEdit, true);
    return () => document.removeEventListener("pointerdown", finishProjectNameEdit, true);
  }, []);
  const commitProjectName = (value: string) => {
    const nextName = value.trim().slice(0, 80);
    if (!nextName) {
      setProjectNameDraft(projectName);
      return;
    }
    setProjectNameDraft(nextName);
    if (nextName !== projectName) onProjectNameChange?.(nextName);
  };
  const selectToolbarMode = (mode: "geometry" | "sketch") => {
    setShapesOpen(false);
    setVisibilityOpen(false);
    onTopPanel(null);
    onToolbarModeChange(mode);
  };
  // Fork (build 21): Ready-made parts is a window of its own, opened and closed from its toolbar
  // button. It shares the right-hand dock with Shapes - one at a time - so the two never stack.
  const [shapesTab, setShapesTab] = useState<"shapes" | "parts">("shapes");
  const shapesTabRef = useRef(shapesTab);
  shapesTabRef.current = shapesTab;
  const toggleShapesWindow = () => {
    setVisibilityOpen(false);
    if (shapesOpen && shapesTab === "shapes") {
      setShapesOpen(false);
    } else {
      setShapesTab("shapes");
      setShapesOpen(true);
    }
  };
  const togglePartsWindow = () => {
    setVisibilityOpen(false);
    if (shapesOpen && shapesTab === "parts") {
      // Closing it puts a pinned Shapes panel back, as it stood before.
      setShapesTab("shapes");
      if (!shapesPinnedRef.current) setShapesOpen(false);
    } else {
      setShapesTab("parts");
      setShapesOpen(true);
    }
  };
  const addShapeFromMenu = (shape: ShapeAsset) => {
    onAddShape({ ...shape, name: shapeAssetLabel(shape) });
    closeShapesAfterPick();
  };
  const addSketchShapeFromMenu = (primitive: SketchPrimitive) => {
    onSketchPrimitive(primitive);
    closeShapesAfterPick();
  };
  const startSketch = (operation: SketchOperation) => {
    onStartSketch(operation);
  };
  useEffect(() => {
    if (!historyViewActive) return;
    setShapesOpen(false);
    setVisibilityOpen(false);
  }, [historyViewActive]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const openPalette = () => {
    setShapesOpen(false);
    setVisibilityOpen(false);
    setPaletteOpen(true);
  };
  const openPaletteRef = useRef(openPalette);
  openPaletteRef.current = openPalette;
  useEffect(() => {
    // Ctrl/Cmd+K opens the command search from anywhere in the editor, also
    // while a field has the focus - the browsers' own use of the key (a search
    // bar) is not worth keeping here.
    const openOnShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.shiftKey || event.altKey || event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      openPaletteRef.current();
    };
    window.addEventListener("keydown", openOnShortcut);
    return () => window.removeEventListener("keydown", openOnShortcut);
  }, []);
  // Leaving the sketch closes the sketch's shape palette; at the start there is nothing to close (a pinned panel opens then).
  const sketchWasActiveRef = useRef(sketchActive);
  useEffect(() => {
    if (sketchWasActiveRef.current && !sketchActive) setShapesOpen(false);
    sketchWasActiveRef.current = sketchActive;
  }, [sketchActive]);
  useEffect(() => {
    if (!shapesOpen) return;
    // Pinned open, a click elsewhere is the click that puts the shape, and Esc cancels the placing: neither closes the panel.
    const closeOnPointerDown = (event: PointerEvent) => {
      // Fork: the Ready-made parts button opens and closes its window itself.
      if ((event.target as Element | null)?.closest?.('[data-layerling-tool="readyParts"]')) return;
      if (!shapesPinnedRef.current && !shapesMenuRef.current?.contains(event.target as Node)) setShapesOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Build 104: Esc in Make (shown in the docked Shapes panel's place) goes back to the shapes.
      if (shapesTabRef.current === "parts") { setShapesTab("shapes"); if (!shapesPinnedRef.current) setShapesOpen(false); return; }
      if (!shapesPinnedRef.current) setShapesOpen(false);
    };
    window.addEventListener("pointerdown", closeOnPointerDown);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeOnPointerDown);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [shapesOpen]);
  useEffect(() => {
    if (!visibilityOpen) return;
    const closeOnPointerDown = (event: PointerEvent) => {
      if (!visibilityMenuRef.current?.contains(event.target as Node)) setVisibilityOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setVisibilityOpen(false);
    };
    const closeOnViewportChange = () => setVisibilityOpen(false);
    window.addEventListener("pointerdown", closeOnPointerDown);
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnViewportChange);
    window.addEventListener("scroll", closeOnViewportChange, true);
    return () => {
      window.removeEventListener("pointerdown", closeOnPointerDown);
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnViewportChange);
      window.removeEventListener("scroll", closeOnViewportChange, true);
    };
  }, [visibilityOpen]);
  const toggleVisibilityMenu = () => {
    if (visibilityOpen) {
      setVisibilityOpen(false);
      return;
    }
    const triggerBounds = visibilityMenuRef.current?.getBoundingClientRect();
    if (triggerBounds) {
      const viewportGutter = 12;
      const menuWidth = Math.min(276, Math.max(0, window.innerWidth - viewportGutter * 2));
      setVisibilityMenuPosition({
        top: triggerBounds.bottom + 8,
        left: Math.max(
          viewportGutter,
          Math.min(
            triggerBounds.left + triggerBounds.width / 2 - menuWidth / 2,
            window.innerWidth - menuWidth - viewportGutter,
          ),
        ),
      });
    }
    setShapesOpen(false);
    onTopPanel(null);
    setVisibilityOpen(true);
  };
  // Die Leiste haengt an der Sprache: ohne dieses Abonnement bliebe sie stehen,
  // falls sie spaeter einmal memoisiert wird.
  useLanguage();
  const leftTools = [
    { id: "copy", label: t("editor.tool.copy"), icon: ToolbarCopyIcon, action: onCopy, enabled: hasSelection },
    { id: "paste", label: t("editor.tool.paste"), icon: ToolbarPasteIcon, action: onPaste, enabled: hasClipboard },
    { id: "duplicate", label: t("editor.tool.duplicate"), icon: ToolbarDuplicateIcon, action: onDuplicate, enabled: hasSelection },
    { id: "delete", label: t("editor.tool.delete"), icon: ToolbarTrashIcon, action: onDelete, enabled: canModifySelection },
    { id: "undo", label: t("editor.tool.undo"), icon: ToolbarUndoIcon, action: onUndo, enabled: canUndo, hint: canUndo ? undoHint : null, onHover: onUndoRedoHover },
    { id: "redo", label: t("editor.tool.redo"), icon: ToolbarRedoIcon, action: onRedo, enabled: canRedo, hint: canRedo ? redoHint : null, onHover: onUndoRedoHover },
    { id: "history", label: t("editor.tool.history"), icon: ToolbarHistoryIcon, action: onHistoryView, enabled: canHistoryView, active: historyViewActive },
    { id: "versions", label: t("backups.title"), icon: ArchiveRestore, action: () => window.dispatchEvent(new Event(OPEN_FILE_BACKUPS_EVENT)), enabled: !historyViewActive },
  ];
  const visibilityTools = [
    {
      id: "outliner",
      label: outlinerOpen ? t("editor.tool.hideOutliner") : t("editor.tool.showOutliner"),
      icon: ListTree,
      action: () => {
        setVisibilityOpen(false);
        onToggleOutliner();
      },
      enabled: true,
      active: outlinerOpen,
    },
    {
      id: "toggle-hidden",
      label: selectionHidden ? t("editor.tool.showSelected") : t("editor.tool.hideSelected"),
      icon: ToolbarHideSelectedIcon,
      action: () => {
        setVisibilityOpen(false);
        onToggleHidden();
      },
      enabled: hasSelection,
    },
  ];
  const combineTools = [
    { id: "group", label: t("editor.tool.group"), icon: ToolbarGroupIcon, action: onGroup, enabled: canGroup },
    { id: "bundle", label: t("editor.tool.bundle"), icon: ToolbarBundleIcon, action: onBundle, enabled: canGroup },
    { id: "ungroup", label: t("editor.tool.ungroup"), icon: ToolbarUngroupIcon, action: onUngroup, enabled: canUngroup },
    // Layerling (#372): the first click shows what the shapes share, the second applies it.
    { id: "intersect", label: t("editor.tool.intersect"), icon: ToolbarIntersectionIcon, action: onIntersect, enabled: canIntersect || intersectPreviewActive, active: intersectPreviewActive },
    // Fork (build 25): a smooth piece joining two bodies.
    { id: "blendBodies", label: t("blend.title"), icon: ForkBlendIcon, action: onBlendBodies, enabled: canBlendBodies || blendBodiesActive, active: blendBodiesActive },
    // Fork (build 33).
    { id: "hull", label: t("hull.title"), icon: Spline, action: onHull ?? build33.onHull, enabled: canHull ?? build33.canHull },
  ];
  const modifyTools = [
    { id: "mirror", label: t("editor.tool.mirror"), icon: ToolbarMirrorIcon, action: onMirror, enabled: canModifySelection, active: mirrorMode },
    { id: "pivot", label: t("editor.tool.rotationPivot"), icon: ToolbarRotationPivotIcon, action: onRotationPivot, enabled: canModifySelection, active: rotationPivotActive },
    { id: "array", label: t("editor.tool.array"), icon: ToolbarPatternIcon, action: onArray, enabled: canModifySelection, active: arrayActive },
    { id: "holePattern", label: t("holePattern.title"), icon: ToolbarHolePatternIcon, action: onHolePattern, enabled: canHolePattern, active: holePatternActive },
    { id: "threadInsert", label: t("threadInsert.title"), icon: ToolbarThreadInsertIcon, action: onThreadInsert, enabled: canHolePattern || threadInsertActive, active: threadInsertActive },
    { id: "magnetPocket", label: t("magnetPocket.title"), icon: Magnet, action: onMagnetPocket, enabled: canHolePattern || magnetPocketActive, active: magnetPocketActive },
    { id: "supportRib", label: t("supportRib.title"), icon: ToolbarSupportRibIcon, action: onSupportRib, enabled: canHolePattern || supportRibActive, active: supportRibActive },
    { id: "faceTool", label: t("faceTool.title"), icon: ToolbarFaceToolIcon, action: onFaceTool, enabled: canFaceTool, active: faceToolActive },
    { id: "split", label: t("editor.tool.split"), icon: ToolbarSplitIcon, action: onSplit, enabled: splitMode || canSplit, active: splitMode },
    { id: "flexi", label: t("editor.tool.flexi"), icon: Worm, action: onFlexi, enabled: canFlexi || flexiActive, active: flexiActive },
    { id: "chamfer", label: t("editor.tool.chamfer"), icon: ToolbarChamferIcon, action: onChamfer, enabled: canEdgeModify, active: edgeModifierKind === "chamfer" || edgeModifierKind === "chamfillet" },
    { id: "fillet", label: t("editor.tool.fillet"), icon: ToolbarFilletIcon, action: onFillet, enabled: canEdgeModify, active: edgeModifierKind === "fillet" },
    { id: "hollow", label: t("editor.tool.hollow"), icon: ToolbarHollowIcon, action: onHollow, enabled: canEdgeModify, active: hollowActive },
    { id: "lid", label: t("editor.tool.lid"), icon: PackageOpen, action: onLid, enabled: canLid || lidActive, active: lidActive },
    ...(onMold ? [{ id: "mold", label: t("editor.tool.mold"), icon: ToolbarMoldIcon, action: onMold, enabled: Boolean(canMold ?? canLid) || Boolean(moldActive), active: Boolean(moldActive) }] : []),
    ...(onCableChannel ? [{ id: "cableChannel", label: t("editor.tool.cableChannel"), icon: ToolbarCableChannelIcon, action: onCableChannel, enabled: Boolean(canCableChannel) || Boolean(cableChannelActive), active: Boolean(cableChannelActive) }] : []),
    { id: "offset", label: t("editor.tool.offset"), icon: ToolbarOffsetIcon, action: onOffset, enabled: canEdgeModify, active: offsetActive },
    { id: "deleteFace", label: t("editor.tool.deleteFace"), icon: ToolbarDeleteFaceIcon, action: onDeleteFace, enabled: canEdgeModify, active: deleteFaceActive && !build33.draftActive },
    { id: "draft", label: t("draft.title"), icon: ForkDraftIcon, action: build33.onDraft, enabled: canEdgeModify, active: build33.draftActive },
    { id: "surfaceText", label: t("editor.tool.surfaceText"), icon: Type, action: build33.onText, enabled: true, active: build33.textActive },
    { id: "roundAll", label: t("meshRound.title"), icon: Squircle, action: build33.onRound, enabled: build33.canRound || build33.roundActive, active: build33.roundActive },
    // Fork (build 55): a pattern pressed into or raised out of the surface.
    // Layerling's texture on an exact body, and paint.
    ...(onSurfaceTextureTool ? [{ id: "surfaceTexture", label: t("inspector.surfaceTexture"), icon: ToolbarSurfaceTextureIcon, action: onSurfaceTextureTool, enabled: Boolean(canSurfaceTexture) || Boolean(surfaceTextureActive), active: Boolean(surfaceTextureActive) }] : []),
    ...(onPaint ? [{ id: "paint", label: t("paint.title"), icon: ToolbarPaintIcon, action: onPaint, enabled: Boolean(canPaint) || Boolean(paintActive), active: Boolean(paintActive) }] : []),
    ...(onStencilBridges ? [{ id: "stencilBridges", label: t("stencilBridges.title"), icon: ToolbarStencilBridgeIcon, action: onStencilBridges, enabled: Boolean(canStencilBridges) || Boolean(stencilBridgesActive), active: Boolean(stencilBridgesActive) }] : []),
    { id: "cutOut", label: t("editor.tool.cutOut"), icon: ToolbarCutOutIcon, action: onCutOut, enabled: canCutOut || cutOutActive, active: cutOutActive },
    { id: "punch", label: t("editor.tool.punch"), icon: ToolbarPunchIcon, action: onPunch, enabled: canCutOut || punchActive, active: punchActive },
    { id: "cookieCutter", label: t("editor.tool.cookieCutter"), icon: Cookie, action: onCookieCutter, enabled: canCookieCutter },
    { id: "loftSketches", label: t("editor.tool.loftSketches"), icon: ToolbarLoftSketchesIcon, action: onLoftSketches, enabled: canLoftSketches },
  ];
  // Fork (build 32): the tools for an imported mesh, in a section of their own that shows only while one is selected.
  const meshTools = [
    { id: "meshCheck", label: t("meshCheck.command"), icon: ShieldCheck, action: () => window.dispatchEvent(new Event(MESH_CHECK_EVENT)), enabled: canSimplify },
    { id: "fillHole", label: t("fillHole.command"), icon: PaintBucket, action: () => window.dispatchEvent(new Event(FILL_HOLE_EVENT)), enabled: canSimplify },
    { id: "simplify", label: t("editor.tool.simplify"), icon: ToolbarSimplifyIcon, action: onSimplify, enabled: canSimplify, active: simplifyActive },
    { id: "makeExact", label: t("editor.tool.makeExact"), icon: ToolbarMakeExactIcon, action: onMakeExact, enabled: canMakeExact && !makeExactBusy, active: makeExactBusy },
    { id: "roundMesh", label: t("meshRound.title"), icon: Squircle, action: build33.onRound, enabled: build33.canRound || build33.roundActive, active: build33.roundActive },
    // Build 69: brushes, a painted selection, Remesh / Offset / Thicken.
    { id: "sculpt", label: t("sculpt.title"), icon: Brush, action: build33.onSculpt, enabled: build33.canRound || build33.sculptActive, active: build33.sculptActive },
  ];
  const arrangeTools = [
    { id: "align", label: t("editor.tool.align"), icon: ToolbarAlignIcon, action: onAlign, enabled: canAlign, active: alignMode },
    { id: "snap", label: t("editor.tool.snapToGrid"), icon: ToolbarSnapGridIcon, action: onSnap, enabled: canModifySelection },
    { id: "drop", label: t("editor.tool.dropToWorkplane"), icon: ToolbarDropToWorkplaneIcon, action: onDropToWorkplane, enabled: canModifySelection },
    { id: "layFlat", label: t("editor.tool.layFlat"), icon: ToolbarLayFlatIcon, action: onLayFlat, enabled: canModifySelection, active: layFlatActive },
    { id: "mateFaces", label: t("editor.tool.mateFaces"), icon: ToolbarMateFacesIcon, action: onMateFaces, enabled: canModifySelection, active: mateFacesActive },
    { id: "center", label: t("editor.tool.centerOnWorkplane"), icon: ToolbarCenterOnWorkplaneIcon, action: onCenterOnWorkplane, enabled: canModifySelection },
    // Fork: spacing parts out has its own button (it opens Align with the Space out panel).
    { id: "spaceOut", label: t("distribute.title"), icon: ForkSpaceOutIcon, action: onAlign, enabled: canAlign, active: alignMode },
  ];
  // Build 123: getting a design ready to print, in one group of its own (it was split over Arrange and Mesh).
  const printTools = [
    ...(onPrintCheck ? [{ id: "printCheck", label: t("editor.tool.printCheck"), icon: ToolbarPrintCheckIcon, action: onPrintCheck, enabled: Boolean(canPrintCheck) || Boolean(printCheckActive), active: Boolean(printCheckActive) }] : []),
    { id: "layerCheck", label: t("editor.tool.layerCheck"), icon: Layers3, action: onLayerCheck, enabled: true, active: layerCheckActive },
    { id: "fitCheck", label: t("editor.tool.clearance"), icon: ScanSearch, action: build33.onFitCheck, enabled: true, active: build33.fitActive },
    ...(onBuildPlates ? [{ id: "buildPlates", label: t("editor.tool.buildPlates"), icon: ToolbarBuildPlatesIcon, action: onBuildPlates, enabled: true, active: Boolean(buildPlatesActive) }] : []),
    { id: "cutBelowBed", label: t("cutBelowBed.command"), icon: Scissors, action: () => window.dispatchEvent(new Event(CUT_BELOW_BED_EVENT)), enabled: true },
  ];
  // Fork: the makers - each opens its own panel.
  const makeTools = [
    { id: "readyParts", label: t("readyParts.title"), icon: ForkReadyPartsIcon, action: togglePartsWindow, enabled: !historyViewActive, active: (shapesOpen && shapesTab === "parts") || Boolean(lithophaneOpen || traceOpen || voronoiOpen) },
    // Fork (build 32): Lithophane, Photo to outline and Voronoi moved into this window, under "Make from a picture".
  ];
  const sketchClipboardTools = [
    { id: "sketch-copy", label: t("editor.tool.copy"), icon: ToolbarCopyIcon, action: onSketchCopy, enabled: sketchHasSelection },
    { id: "sketch-paste", label: t("editor.tool.paste"), icon: ToolbarPasteIcon, action: onSketchPaste, enabled: sketchHasClipboard },
    { id: "sketch-duplicate", label: t("editor.tool.duplicate"), icon: ToolbarDuplicateIcon, action: onSketchDuplicate, enabled: sketchHasSelection },
    { id: "sketch-delete", label: t("editor.tool.delete"), icon: ToolbarTrashIcon, action: onSketchDelete, enabled: sketchHasSelection },
  ];
  type FoldTool = { id: string; label: string; icon: ComponentType<{ width?: number; height?: number }>; action: () => void; enabled: boolean; active?: boolean };
  /** A toolbar group: its buttons, or - folded - one button that opens them as a list. */
  const renderGroup = (group: string, label: string, tools: readonly FoldTool[], render: () => ReactNode, extraClass = "", inert?: boolean) => {
    if (!foldedGroups.includes(group) && !ALWAYS_FOLDED.includes(group)) {
      return (
        <div className={`toolbar-section ${extraClass}`} data-group={group} inert={inert}>
          <div className="toolbar-section-label">{label}</div>
          <div className="toolbar-section-tools">{render()}</div>
        </div>
      );
    }
    const FirstIcon = (FORK_TOOL_ICONS[tools[0]?.id ?? ""] ?? tools[0]?.icon ?? MoreHorizontal) as ComponentType<{ width?: number; height?: number }>;
    const active = tools.some((tool) => tool.active);
    return (
      <div className={`toolbar-section toolbar-folded-section ${extraClass}`} data-group={group} data-fold={group} inert={inert}>
        <div className="toolbar-section-label">{label}</div>
        <div className="toolbar-section-tools">
          <button
            className={`toolbar-icon toolbar-more-trigger ${openFold === group || active ? "active" : ""}`}
            type="button"
            data-layerling-tool={`fold-${group}`}
            aria-label={t("editor.foldedGroup", { group: label })}
            data-tip={t("editor.foldedGroup", { group: label })}
            aria-haspopup="menu"
            aria-expanded={openFold === group}
            onClick={() => setOpenFold((current) => (current === group ? null : group))}
          >
            <FirstIcon />
            <ChevronDown className="toolbar-fold-chevron" width={12} height={12} />
            <span className="tool-label" aria-hidden="true">{label}</span>
          </button>
        </div>
        {openFold === group ? (
          <div className="visibility-dropdown mesh-dropdown toolbar-fold-menu" role="menu" aria-label={label}>
            {(() => {
              // Build 123: what can be used now comes first; the rest waits under a small heading instead of
              // standing greyed out between them.
              const ready = tools.filter((tool) => tool.enabled && !historyViewActive);
              const waiting = tools.filter((tool) => !(tool.enabled && !historyViewActive));
              const item = (tool: FoldTool, enabled: boolean) => {
                const Icon = (FORK_TOOL_ICONS[tool.id] ?? tool.icon) as ComponentType<{ width?: number; height?: number }>;
                const keys = COMMAND_SHORTCUTS[tool.id];
                return (
                  <button
                    key={tool.id}
                    className={`visibility-dropdown-action ${tool.active ? "active" : ""}`}
                    type="button"
                    role="menuitem"
                    data-layerling-tool={tool.id}
                    disabled={!enabled}
                    onClick={() => {
                      setOpenFold(null);
                      tool.action();
                    }}
                  >
                    <Icon width={18} height={18} />
                    <span>{tool.label}</span>
                    {keys ? <kbd className="fold-menu-keys">{keys}</kbd> : null}
                  </button>
                );
              };
              return (
                <>
                  {ready.map((tool) => item(tool, true))}
                  {waiting.length ? <div className="fold-menu-waiting" role="presentation">{t(historyViewActive ? "editor.foldWaitingHistory" : "editor.foldWaiting")}</div> : null}
                  {waiting.map((tool) => item(tool, false))}
                </>
              );
            })()}
          </div>
        ) : null}
      </div>
    );
  };
  const renderToolButton = (tool: (typeof leftTools)[number] | (typeof visibilityTools)[number] | (typeof combineTools)[number] | (typeof modifyTools)[number] | (typeof arrangeTools)[number] | (typeof makeTools)[number] | (typeof meshTools)[number]) => {
    const { id, action, label } = tool;
    // Fork: Pare 3D's own icon where there is one, and a short name under it.
    const Icon = FORK_TOOL_ICONS[id] ?? tool.icon;
    const shortLabel = getLanguage() === "en" ? FORK_SHORT_LABELS_EN[id] ?? label : label;
    // Im Verlaufsblick schlaeft jedes Werkzeug ausser dem, das ihn beendet -
    // wirklich, nicht nur im Aussehen: eine Auswahl aus der Zeit davor darf
    // kein Loeschen freischalten, waehrend die Flaeche etwas anderes zeigt.
    const enabled = tool.enabled && (!historyViewActive || id === "history");
    const active = "active" in tool && Boolean(tool.active);
    const hint = "hint" in tool && tool.hint ? tool.hint : null;
    const onHover = "onHover" in tool ? tool.onHover : undefined;
    return (
      <button
        className={`toolbar-icon ${enabled ? "" : "disabled"} ${active ? "active" : ""}`}
        key={id}
        data-layerling-tool={id}
        aria-label={label}
        // Fork (build 16): the name and shortcut show at once on hover (fork.css), even on a greyed-out tool.
        // Ported from layerling 1.122: Undo and Redo name the step they take back.
        data-tip={`${label}${hint ? `: ${hint}` : getLanguage() === "en" && FORK_TOOL_HINTS_EN[id] ? ` – ${FORK_TOOL_HINTS_EN[id]}` : ""}${COMMAND_SHORTCUTS[id] ? ` (${COMMAND_SHORTCUTS[id]})` : ""}`}
        onPointerEnter={onHover}
        onFocus={onHover}
        onClick={action}
        disabled={!enabled}
      >
        <Icon />
        <span className="tool-label" aria-hidden="true">{shortLabel}</span>
      </button>
    );
  };

  // Everything the toolbar and its menus can do, as entries of the command
  // search. Built from the same lists as the buttons, so a new tool shows up in
  // both without a second place to remember; only built while the search is open.
  const buildPaletteCommands = (): PaletteCommand[] => buildAllPaletteCommands().map((command) =>
    historyViewActive && !HISTORY_VIEW_COMMANDS.has(command.id) ? { ...command, enabled: false } : command,
  );
  const buildAllPaletteCommands = (): PaletteCommand[] => {
    const fromTool = (
      tool: { id: string; label: string; icon: PaletteCommand["icon"]; action: () => void; enabled: boolean; active?: boolean },
      group: string,
    ): PaletteCommand => ({
      id: tool.id,
      label: tool.label,
      group,
      keywords: COMMAND_KEYWORDS[tool.id],
      shortcut: COMMAND_SHORTCUTS[tool.id],
      icon: tool.icon,
      enabled: tool.enabled,
      active: tool.active,
      run: () => tool.action(),
    });
    const plain = (
      id: string,
      label: string,
      group: string,
      enabled: boolean,
      run: () => void,
      extra: Partial<PaletteCommand> = {},
    ): PaletteCommand => ({ id, label, group, keywords: COMMAND_KEYWORDS[id], shortcut: COMMAND_SHORTCUTS[id], enabled, run, ...extra });
    const helpGroup = t("editor.group.help");
    const helpCommands = [
      plain("guide", t("editor.guide"), helpGroup, true, onGuide, { icon: ToolbarGuideIcon }),
      plain("shortcuts", t("editor.keyboardShortcuts"), helpGroup, true, onShortcuts, { icon: ToolbarKeyboardIcon }),
      plain("interactive-help", t("interactiveHelp.title"), helpGroup, true, onInteractiveHelp, { icon: CircleHelp, active: interactiveHelpActive }),
    ];
    if (toolbarMode === "sketch") {
      const modeGroup = t("palette.group.mode");
      const modeCommand = plain("mode-geometry", t("palette.switchGeometry"), modeGroup, true, () => selectToolbarMode("geometry"));
      if (!sketchActive) {
        const createGroup = t("sketch.group.create");
        return [
          plain("sketch-extrude", t("sketch.extrude"), createGroup, true, () => startSketch("extrude")),
          plain("sketch-revolve", t("sketch.revolve"), createGroup, true, () => startSketch("revolve")),
          plain("sketch-sweep", t("sketch.sweep"), createGroup, true, () => startSketch("sweep")),
          plain("sketch-edit", t("sketch.editTo3d"), createGroup, canEditSketch, onEditSketch),
          modeCommand,
          ...helpCommands,
        ];
      }
      const drawGroup = t("sketch.group.draw");
      const selectGroup = t("sketch.group.select");
      const finishGroup = t("sketch.group.finish");
      return [
        plain("sketch-line", t("sketch.line"), drawGroup, true, () => onSketchTool("line"), { icon: SKETCH_PALETTE_ICONS.line, active: sketchTool === "line" }),
        plain("sketch-arc", t("sketch.arc"), drawGroup, true, () => onSketchTool("arc"), { icon: SKETCH_PALETTE_ICONS.arc, active: sketchTool === "arc" }),
        plain("sketch-bezier", t("sketch.bezier"), drawGroup, true, () => onSketchTool("bezier"), { icon: SKETCH_PALETTE_ICONS.bezier, active: sketchTool === "bezier" }),
        plain("sketch-smooth", t("sketch.smooth"), drawGroup, true, () => onSketchTool("smooth"), { icon: SKETCH_PALETTE_ICONS.smooth, active: sketchTool === "smooth" }),
        plain("sketch-freehand", t("sketch.freehand"), drawGroup, true, () => onSketchTool("freehand"), { icon: Signature, active: sketchTool === "freehand", keywords: ["scribble", "freehand", "draw", "pen", "pencil", "kritzeln", "freihand"] }),
        plain("sketch-construction", t("sketch.construction"), drawGroup, true, () => onSketchConstruction?.(), { icon: ToolbarConstructionLineIcon, active: Boolean(sketchConstruction), keywords: ["construction", "guide", "helper", "hilfslinie", "hilfs", "konstruktion"] }),
        plain("sketch-from-middle", t("sketch.fromMiddle"), drawGroup, true, () => onSketchFromMiddle?.(), { icon: ToolbarMiddleLineIcon, active: Boolean(sketchFromMiddle), keywords: ["middle", "center", "centre", "mitte", "mittellinie", "symmetric", "symmetrisch"] }),
        ...sketchShapeMenuItems.map(({ primitive, label, icon }) => plain(
          `sketch-shape-${primitive}`,
          t("palette.addShape", { shape: t(label) }),
          t("sketch.group.shapes"),
          true,
          () => onSketchPrimitive(primitive),
          { icon, keywords: [primitive] },
        )),
        plain("sketch-select", t("sketch.select"), selectGroup, true, () => onSketchTool("select"), { icon: SKETCH_PALETTE_ICONS.select, active: sketchTool === "select" }),
        plain("sketch-image", t("sketch.addImage"), selectGroup, sketchTool === "select", onSketchImage, { icon: SKETCH_PALETTE_ICONS.image }),
        plain("sketch-refine", t("sketch.refine"), selectGroup, true, () => onSketchTool("refine"), { icon: SKETCH_PALETTE_ICONS.refine, active: sketchTool === "refine" }),
        plain("sketch-chamfer", t("sketch.chamferCorner"), selectGroup, Boolean(canFilletSketchPoint), () => onSketchCornerDialog?.(sketchCornerDialog === "chamfer" ? null : "chamfer"), { icon: ToolbarChamferIcon, active: sketchCornerDialog === "chamfer" }),
        plain("sketch-fillet", t("sketch.filletCorner"), selectGroup, Boolean(canFilletSketchPoint), () => onSketchCornerDialog?.(sketchCornerDialog === "fillet" ? null : "fillet"), { icon: ToolbarFilletIcon, active: sketchCornerDialog === "fillet" }),
        plain("sketch-erase", t("sketch.erase"), selectGroup, true, () => onSketchTool("erase"), { icon: SKETCH_PALETTE_ICONS.erase, active: sketchTool === "erase" }),
        ...sketchClipboardTools.map((tool) => fromTool(tool, t("editor.group.clipboard"))),
        plain("sketch-undo", t("editor.tool.undo"), t("editor.group.history"), sketchCanUndo, onSketchUndo, { icon: ToolbarUndoIcon }),
        plain("sketch-redo", t("editor.tool.redo"), t("editor.group.history"), sketchCanRedo, onSketchRedo, { icon: ToolbarRedoIcon }),
        plain("sketch-stroke", t("sketch.strokeHint"), finishGroup, true, () => onSketchStroke?.(), { icon: SKETCH_PALETTE_ICONS.line, active: Boolean(sketchStrokeActive) }),
        plain("sketch-finish", sketchOperation === "revolve" ? t("sketch.finishRevolve") : sketchOperation === "sweep" ? t("sketch.finishSweep") : t("sketch.finishSketch"), finishGroup, true, onSketchFinish),
        plain("sketch-cancel", t("sketch.cancel"), finishGroup, true, onSketchCancel),
        modeCommand,
        ...helpCommands,
      ];
    }
    const shapesGroup = t("editor.group.shapes");
    const visibilityGroup = t("editor.group.visibility");
    const manageGroup = t("editor.group.manage");
    return [
      ...leftTools.slice(0, 4).map((tool) => fromTool(tool, t("editor.group.clipboard"))),
      ...leftTools.slice(4).map((tool) => fromTool(tool, t("editor.group.history"))),
      ...libraryShapeAssets.map((shape) => plain(
        `shape-${shape.id}`,
        t("palette.addShape", { shape: shapeAssetMenuLabel(shape) }),
        shapesGroup,
        true,
        () => addShapeFromMenu(shape),
        { image: shape.menuIcon, keywords: [shape.id, shape.name, ...(SHAPE_KEYWORDS[shape.id] ?? [])] },
      )),
      ...(addMoreShape ? MORE_SHAPE_IDS.map((id) => plain(
        `shape-${id}`,
        t("palette.addShape", { shape: t(`moreShapes.${id}`) }),
        shapesGroup,
        true,
        () => addMoreShape(id),
        { image: moreShapeIcon(id), keywords: [id, t(`moreShapes.${id}Hint`)] },
      )) : []),
      ...visibilityTools.map((tool) => fromTool(tool, visibilityGroup)),
      plain(
        "show-hidden",
        hiddenShapeCount === 0 ? t("visibility.nothingHidden") : t("visibility.showAllHidden", { count: hiddenShapeCount }),
        visibilityGroup,
        hiddenShapeCount > 0,
        onShowHidden,
        { icon: Eye },
      ),
      plain("notes", t("visibility.notes"), visibilityGroup, noteCount > 0, onToggleNotes, { icon: notesVisible ? Eye : EyeOff, active: notesVisible }),
      plain("overhangs", t("visibility.overhangs", { angle: overhangAngle }), visibilityGroup, true, onToggleOverhangs, { icon: AlertTriangle, active: overhangsVisible }),
      ...combineTools.map((tool) => fromTool(tool, t("editor.group.combine"))),
      ...modifyTools.map((tool) => fromTool(tool, t("editor.group.modify"))),
      plain("carry", t("contextMenu.carry"), t("editor.group.arrange"), canModifySelection, onCarryOntoFace, { icon: ArrowDownToLine }),
      plain("scalePercent", t("scalePercent.title"), t("editor.group.modify"), canModifySelection, onScalePercent, { icon: Percent, active: scalePercentActive }),
      ...arrangeTools.map((tool) => fromTool(tool, t("editor.group.arrange"))),
      plain("note", t("editor.tool.note"), manageGroup, true, onNoteTool, { icon: ToolbarNoteIcon, active: noteMode }),
      plain("import", t("editor.import"), manageGroup, true, () => onTopPanel("import"), { icon: ToolbarImportIcon }),
      plain("attachments", t("editor.attachments"), manageGroup, true, () => onTopPanel("attachments"), { icon: ToolbarAttachmentsIcon, keywords: ["attachment", "file", "notes", "instructions", "readme"] }),
      plain("export", t("editor.export"), manageGroup, true, () => window.dispatchEvent(new Event(OPEN_EXPORT_WINDOW_EVENT)), { icon: ToolbarVectorExportIcon }),
      plain("print-check", t("printCheck.command"), manageGroup, true, () => window.dispatchEvent(new Event(PRINT_CHECK_EVENT))),
      plain("split-to-fit", t("splitToFit.command"), manageGroup, true, () => window.dispatchEvent(new Event(SPLIT_TO_FIT_EVENT))),
      plain("cut-below-bed", t("cutBelowBed.command"), manageGroup, true, () => window.dispatchEvent(new Event(CUT_BELOW_BED_EVENT))),
      plain("mesh-check", t("meshCheck.command"), manageGroup, hasSelection, () => window.dispatchEvent(new Event(MESH_CHECK_EVENT))),
      plain("bauble", t("bauble.title"), manageGroup, true, () => window.dispatchEvent(new Event(OPEN_BAUBLE_EVENT)), { keywords: ["christmas", "bauble", "ornament", "ball", "lithophane", "sphere", "xmas"] }),
      plain("file-backups", t("backups.title"), manageGroup, true, () => window.dispatchEvent(new Event(OPEN_FILE_BACKUPS_EVENT)), { icon: ArchiveRestore, keywords: ["backup", "backups", "version", "versions", "restore", "earlier"] }),
      plain("fill-hole", t("fillHole.command"), t("editor.group.modify"), hasSelection, () => window.dispatchEvent(new Event(FILL_HOLE_EVENT))),
      // Build 70: the Mesh tools in the search too (Mesh check, Fill hole and Cut below are above).
      ...meshTools.filter((tool) => tool.id === "sculpt" || tool.id === "simplify" || tool.id === "makeExact" || tool.id === "roundMesh").map((tool) => fromTool(tool, t("editor.group.mesh"))),
      plain("send-slicer", t("slicer.sendTo", { app: slicerName(readSlicer()) }), manageGroup, true, () => window.dispatchEvent(new CustomEvent(SEND_TO_BAMBU_EVENT, { detail: { format: readBambuFormat() } })), { icon: Printer }),
      plain("settings", t("editor.workspaceSettings"), manageGroup, true, () => window.dispatchEvent(new Event("layerling:open-workspace-settings")), { icon: ToolbarSettingsIcon }),
      plain("mode-sketch", t("palette.switchSketch"), t("palette.group.mode"), true, () => selectToolbarMode("sketch")),
      ...helpCommands,
      ...objects.map((object) => plain(
        `object-${object.id}`,
        t("palette.selectObject", { name: object.name }),
        t("palette.group.objects"),
        true,
        () => onSelectObject(object.id),
        { keywords: [object.name, object.kind, ...(object.hidden ? ["hidden", "ausgeblendet", "versteckt"] : [])], searchOnly: true, transient: true },
      )),
    ];
  };

  return (
    <div className="secondary-toolbar" data-selection={canModifySelection ? "yes" : "no"}>
      {paletteOpen ? <CommandPalette commands={buildPaletteCommands()} onClose={() => setPaletteOpen(false)} /> : null}
      <div ref={toolbarContentRef} className={`toolbar-mode-content ${toolbarMode}`}>
        {toolbarMode === "geometry" ? (
          <>
      {onHome ? (
        <div className="tool-group editor-nav-group">
          <div className="toolbar-section toolbar-home-section" data-group="home">
            <div className="toolbar-section-label">{t("editor.group.home")}</div>
            <div className="toolbar-section-tools">
              <button className="toolbar-icon editor-home-control" aria-label={t("editor.homeDashboard")} title={t("editor.homeDashboard")} onClick={onHome}>
                <ForkHomeIcon />
                <span className="tool-label" aria-hidden="true">{getLanguage() === "en" ? "Home" : t("editor.group.home")}</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="tool-group left">
        {renderGroup("clipboard", t("editor.group.clipboard"), leftTools.slice(0, 4), () => leftTools.slice(0, 4).map(renderToolButton), "", historyViewActive)}
        {renderGroup("history", t("editor.group.history"), leftTools.slice(4), () => leftTools.slice(4).map(renderToolButton))}
        <div className="toolbar-section toolbar-shapes-section" data-group="shapes" ref={shapesMenuRef} inert={historyViewActive}>
          <div className="toolbar-section-label">{t("editor.group.shapes")}</div>
          <div className="toolbar-section-tools">
            <button
              className={`shape-menu-trigger ${shapesOpen && shapesTab === "shapes" ? "active" : ""}`}
              aria-label={t("editor.addShape")}
              aria-expanded={shapesOpen && shapesTab === "shapes"}
              onClick={toggleShapesWindow}
            >
              <ForkShapesIcon />
              <span className="tool-label" aria-hidden="true">{t("editor.group.shapes")}</span>
            </button>
          </div>
          {shapesOpen ? (
            <ShapeMenuPanel
              className={shapesPinned ? "shape-menu-docked" : ""}
              title={renderReadyParts && shapesTab === "parts" ? t("readyParts.title") : t("shape.basicShapes")}
              helpSection="addShape"
              pinned={shapesPinned}
              onTogglePinned={toggleShapesPinned}
              resizable
            >
              <div className="shape-menu-body">
              {renderReadyParts && shapesTab === "parts" ? renderReadyParts(closeShapesAfterPick) : (<>
              {renderMyShapes ? (
                <>
                  {renderMyShapes(closeShapesAfterPick)}
                  <div className="shape-menu-subtitle">{t("myShapes.basicShapes")}</div>
                </>
              ) : null}
              <div className="shape-menu-list">
                {libraryShapeAssets.map((shape) => (
                  <Fragment key={shape.id}>
                  <button
                    className="shape-menu-item"
                    type="button"
                    title={shapeAssetMenuLabel(shape).replace(/\s+/g, " ")}
                    aria-label={shapeAssetMenuLabel(shape).replace(/\s+/g, " ")}
                    style={{ "--shape-default-color": shapeAssetColor(shape, shapeCustomizations[shape.kind]) } as CSSProperties}
                    draggable
                    onClick={() => {
                      if (suppressNextShapeClickRef.current) {
                        suppressNextShapeClickRef.current = false;
                        return;
                      }
                      addShapeFromMenu(shape);
                    }}
                    onPointerDown={(event) => {
                      if (event.pointerType === "touch") {
                        touchShapeStartRef.current = { id: shape.id, x: event.clientX, y: event.clientY };
                      }
                    }}
                    onPointerUp={(event) => {
                      if (event.pointerType !== "touch") {
                        return;
                      }
                      const start = touchShapeStartRef.current;
                      touchShapeStartRef.current = null;
                      if (!start || start.id !== shape.id || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) {
                        return;
                      }
                      event.preventDefault();
                      suppressNextShapeClickRef.current = true;
                      window.setTimeout(() => {
                        suppressNextShapeClickRef.current = false;
                      }, 350);
                      addShapeFromMenu(shape);
                    }}
                    onTouchStart={(event) => {
                      const touch = event.changedTouches[0];
                      if (touch) {
                        touchShapeStartRef.current = { id: shape.id, x: touch.clientX, y: touch.clientY };
                      }
                    }}
                    onTouchEnd={(event) => {
                      const touch = event.changedTouches[0];
                      const start = touchShapeStartRef.current;
                      touchShapeStartRef.current = null;
                      if (!touch || !start || start.id !== shape.id || Math.hypot(touch.clientX - start.x, touch.clientY - start.y) > 8) {
                        return;
                      }
                      event.preventDefault();
                      suppressNextShapeClickRef.current = true;
                      window.setTimeout(() => {
                        suppressNextShapeClickRef.current = false;
                      }, 350);
                      addShapeFromMenu(shape);
                    }}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "copy";
                      event.dataTransfer.setData("application/x-layerling-shape", JSON.stringify(shape));
                    }}
                    onDragEnd={closeShapesAfterPick}
                  >
                    <span
                      className="shape-menu-thumb"
                      style={{ "--shape-icon": `url(${withBase(`/${shape.menuIcon.replace(/^\/+/, "")}`)})` } as CSSProperties}
                    >
                      <img src={shape.menuIcon} alt="" draggable={false} />
                    </span>
                    <span className={shapeAssetMenuLabel(shape).split(/\s+/).some((word) => word.length > 13) ? "long-word" : undefined}>{shapeAssetMenuLabel(shape)}</span>
                  </button>
                  {renderMoreShapes ? renderMoreShapes(closeShapesAfterPick, shape.id, libraryShapeIds) : null}
                  </Fragment>
                ))}
                {renderMoreShapes ? renderMoreShapes(closeShapesAfterPick, undefined, libraryShapeIds) : null}
              </div>
              </>)}
              </div>
            </ShapeMenuPanel>
          ) : null}
        </div>
      </div>
      <div className="toolbar-spacer" />
      <div className="tool-group right" inert={historyViewActive}>
        <div className="toolbar-section compact toolbar-visibility-section" data-group="visibility" ref={visibilityMenuRef}>
          <div className="toolbar-section-label">{t("editor.group.visibility")}</div>
          <div className="toolbar-section-tools">
            {visibilityTools.map(renderToolButton)}
            <span className="visibility-trigger-wrap">
              <button
                className={`toolbar-icon visibility-menu-trigger ${visibilityOpen ? "active" : ""}`}
                type="button"
                aria-label={t("editor.visibilityOptions")}
                title={t("editor.visibilityOptions")}
                aria-haspopup="menu"
                aria-expanded={visibilityOpen}
                onClick={toggleVisibilityMenu}
              >
                <ToolbarCaretDownIcon />
              </button>
              {hiddenShapeCount > 0 ? (
                // What is hidden is seen without opening the menu; a click shows it all (#489).
                <button
                  className="visibility-hidden-badge"
                  type="button"
                  aria-label={t("visibility.showAllHidden", { count: hiddenShapeCount })}
                  title={t("visibility.showAllHidden", { count: hiddenShapeCount })}
                  onClick={onShowHidden}
                >
                  {hiddenShapeCount}
                </button>
              ) : null}
            </span>
          </div>
          {visibilityOpen ? (
            <div
              className="visibility-dropdown"
              role="menu"
              aria-label={t("editor.visibilityOptions")}
              style={visibilityMenuPosition}
            >
              <button
                className="visibility-dropdown-action"
                type="button"
                role="menuitem"
                onClick={() => {
                  setVisibilityOpen(false);
                  onToggleOutliner();
                }}
              >
                <ListTree size={20} aria-hidden="true" />
                <strong>{outlinerOpen ? t("visibility.hideOutliner") : t("visibility.showOutliner")}</strong>
              </button>
              <button
                className="visibility-dropdown-action"
                type="button"
                role="menuitem"
                disabled={hiddenShapeCount === 0}
                onClick={() => {
                  setVisibilityOpen(false);
                  onShowHidden();
                }}
              >
                <Eye size={20} aria-hidden="true" />
                <strong>{hiddenShapeCount === 0
                  ? t("visibility.nothingHidden")
                  : t("visibility.showAllHidden", { count: hiddenShapeCount })}</strong>
              </button>
              <button
                className="visibility-dropdown-action"
                type="button"
                role="menuitemcheckbox"
                aria-checked={notesVisible}
                disabled={noteCount === 0}
                onClick={() => {
                  setVisibilityOpen(false);
                  onToggleNotes();
                }}
              >
                {notesVisible ? <Eye size={20} aria-hidden="true" /> : <EyeOff size={20} aria-hidden="true" />}
                <strong>{t("visibility.notes")}{noteCount > 0 ? ` (${noteCount})` : ""}</strong>
              </button>
              <button
                className="visibility-dropdown-action"
                type="button"
                role="menuitemcheckbox"
                aria-checked={overhangsVisible}
                onClick={() => {
                  setVisibilityOpen(false);
                  onToggleOverhangs();
                }}
              >
                <AlertTriangle size={20} aria-hidden="true" className={overhangsVisible ? "overhang-menu-icon active" : "overhang-menu-icon"} />
                <strong>{t("visibility.overhangs", { angle: overhangAngle })}</strong>
              </button>
              <div className="visibility-dropdown-help">
                <span>{t("visibility.eyeAgain")}</span>
                <span aria-hidden="true">·</span>
                <span><kbd>Ctrl/Cmd</kbd> + <kbd>Shift</kbd> + <kbd>H</kbd>{t("visibility.allShortcut")}</span>
                <GuideHelpLink section="selecting" iconSize={14} />
              </div>
            </div>
          ) : null}
        </div>
        {renderGroup("combine", t("editor.group.combine"), combineTools, () => combineTools.map(renderToolButton))}
        <div className="toolbar-section toolbar-overflow-section" data-group="modify" ref={modifyMoreRef}>
          <div className="toolbar-section-label">{t("editor.group.modify")}</div>
          <div className="toolbar-section-tools">
            {modifyTools.filter((tool) => !FORK_OVERFLOW_TOOLS.has(tool.id)).map(renderToolButton)}
            {/* Fork (build 33): the less used tools under "More", so the row fits on a laptop screen. */}
            {modifyTools.some((tool) => FORK_OVERFLOW_TOOLS.has(tool.id)) ? <button
              className={`toolbar-icon toolbar-more-trigger ${modifyMoreOpen || modifyTools.some((tool) => FORK_OVERFLOW_TOOLS.has(tool.id) && "active" in tool && tool.active) ? "active" : ""}`}
              type="button"
              data-layerling-tool="modifyMore"
              aria-label={t("editor.moreTools")}
              data-tip={t("editor.moreTools")}
              aria-haspopup="menu"
              aria-expanded={modifyMoreOpen}
              onClick={() => setModifyMoreOpen((open) => !open)}
            >
              <MoreHorizontal />
              <span className="tool-label" aria-hidden="true">{t("editor.more")}</span>
            </button> : null}
          </div>
          {modifyMoreOpen && modifyTools.some((tool) => FORK_OVERFLOW_TOOLS.has(tool.id)) ? (
            <div className="visibility-dropdown mesh-dropdown" role="menu" aria-label={t("editor.moreTools")}>
              {modifyTools.filter((tool) => FORK_OVERFLOW_TOOLS.has(tool.id)).map((tool) => {
                const Icon = FORK_TOOL_ICONS[tool.id] ?? tool.icon;
                return (
                  <button
                    key={tool.id}
                    className={`visibility-dropdown-action ${"active" in tool && tool.active ? "active" : ""}`}
                    type="button"
                    role="menuitem"
                    data-layerling-tool={tool.id}
                    disabled={!tool.enabled}
                    onClick={() => {
                      setModifyMoreOpen(false);
                      tool.action();
                    }}
                  >
                    <Icon width={18} height={18} />
                    <span>{tool.label}</span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
        {/* Fork (build 53): the mesh tools sit on the toolbar as their own buttons, not in a menu.
            They wait for an imported mesh to be selected. */}
        {renderGroup("mesh", t("editor.group.mesh"), meshTools, () => meshTools.map(renderToolButton), "toolbar-mesh-section")}
        {renderGroup("arrange", t("editor.group.arrange"), arrangeTools, () => arrangeTools.map(renderToolButton))}
        {renderGroup("print", t("editor.group.print"), printTools, () => printTools.map(renderToolButton))}
        <div className="toolbar-section" data-group="make">
          <div className="toolbar-section-label">{t("editor.group.make")}</div>
          <div className="toolbar-section-tools">{makeTools.map(renderToolButton)}</div>
        </div>
      </div>
          </>
        ) : (
          <div className="sketch-toolbar-ribbon" aria-label={t("sketch.toolbar")}>
            {sketchActive ? (
              <>
                <div className="toolbar-section sketch-create-section" data-group="draw">
                  <div className="toolbar-section-label">{t("sketch.group.draw")}</div>
                  <div className="toolbar-section-tools">
                    <button className={`toolbar-icon sketch-tool-icon ${sketchTool === "line" ? "active" : ""}`} type="button" aria-label={t("sketch.line")} title={t("sketch.line")} onClick={() => onSketchTool("line")}>
                      <SketchReferenceIcon name="line" />
                    </button>
                    <button className={`toolbar-icon sketch-tool-icon ${sketchTool === "arc" ? "active" : ""}`} type="button" aria-label={t("sketch.arc")} title={t("status.sketchTool.arc")} onClick={() => onSketchTool("arc")}>
                      <SketchReferenceIcon name="arc" />
                    </button>
                    <button className={`toolbar-icon sketch-tool-icon ${sketchTool === "bezier" ? "active" : ""}`} type="button" aria-label={t("sketch.bezier")} title={t("sketch.bezier")} onClick={() => onSketchTool("bezier")}>
                      <SketchReferenceIcon name="bezier" />
                    </button>
                    <button className={`toolbar-icon sketch-tool-icon ${sketchTool === "smooth" ? "active" : ""}`} type="button" aria-label={t("sketch.smooth")} title={t("sketch.smooth")} onClick={() => onSketchTool("smooth")}>
                      <SketchReferenceIcon name="smooth" />
                    </button>
                    <button className={`toolbar-icon sketch-tool-icon ${sketchTool === "freehand" ? "active" : ""}`} type="button" aria-label={t("sketch.freehand")} title={t("sketch.freehandHint")} onClick={() => onSketchTool("freehand")}>
                      <Signature className="sketch-freehand-icon" aria-hidden="true" />
                    </button>
                    <button className={`toolbar-icon sketch-tool-icon sketch-construction-toggle ${sketchConstruction ? "active" : ""}`} type="button" aria-pressed={Boolean(sketchConstruction)} aria-label={t("sketch.construction")} title={t("sketch.constructionHint")} onClick={onSketchConstruction}>
                      <ToolbarConstructionLineIcon />
                    </button>
                    <button className={`toolbar-icon sketch-tool-icon sketch-from-middle-toggle ${sketchFromMiddle ? "active" : ""}`} type="button" aria-pressed={Boolean(sketchFromMiddle)} aria-label={t("sketch.fromMiddle")} title={t("sketch.fromMiddleHint")} onClick={onSketchFromMiddle}>
                      <ToolbarMiddleLineIcon />
                    </button>
                  </div>
                </div>
                <div className="toolbar-section toolbar-shapes-section sketch-shapes-section" data-group="shapes" ref={shapesMenuRef}>
                  <div className="toolbar-section-label">{t("sketch.group.shapes")}</div>
                  <div className="toolbar-section-tools">
                    <button
                      className={`shape-menu-trigger ${shapesOpen ? "active" : ""}`}
                      type="button"
                      aria-label={t("sketch.addShape")}
                      aria-haspopup="menu"
                      aria-expanded={shapesOpen}
                      onClick={() => {
                        setVisibilityOpen(false);
                        setShapesOpen((open) => !open);
                      }}
                    >
                      <ToolbarShapeAddIcon />
                    </button>
                  </div>
                  {shapesOpen ? (
                    <ShapeMenuPanel
                      className="sketch-shape-menu-dropdown"
                      role="menu"
                      ariaLabel={t("sketch.shapesMenu")}
                      title={t("sketch.shapesTitle")}
                      helpSection="sketchDrawing"
                      pinned={shapesPinned}
                      onTogglePinned={toggleShapesPinned}
                      scope="sketch"
                      resizable
                    >
                      <div className="shape-menu-list">
                        {sketchShapeMenuItems.map(({ primitive, label, icon: Icon }) => (
                          <button
                            className="shape-menu-item sketch-primitive-source"
                            key={primitive}
                            type="button"
                            role="menuitem"
                            draggable
                            title={t("sketch.addPrimitiveHint", { shape: t(label) })}
                            onClick={() => addSketchShapeFromMenu(primitive)}
                            onDragStart={(event) => {
                              event.dataTransfer.effectAllowed = "copy";
                              event.dataTransfer.setData("application/x-layerling-sketch-primitive", primitive);
                            }}
                            onDragEnd={closeShapesAfterPick}
                          >
                            <Icon className="sketch-shape-menu-icon" aria-hidden="true" />
                            <span>{t(label)}</span>
                          </button>
                        ))}
                      </div>
                      <div className="sketch-shape-options">
                        <SketchShapeNumberField
                          label={t("sketch.polygonSides")}
                          value={sketchShapeOptions.sides}
                          min={SKETCH_POLYGON_MIN_SIDES}
                          max={SKETCH_POLYGON_MAX_SIDES}
                          normalize={normalizePolygonSides}
                          onChange={(sides) => onSketchShapeOptions({ ...sketchShapeOptions, sides })}
                        />
                        <SketchShapeNumberField
                          label={t("sketch.starInner")}
                          value={sketchShapeOptions.innerPercent}
                          min={SKETCH_STAR_MIN_INNER_PERCENT}
                          max={SKETCH_STAR_MAX_INNER_PERCENT}
                          suffix="%"
                          normalize={normalizeStarInnerPercent}
                          onChange={(innerPercent) => onSketchShapeOptions({ ...sketchShapeOptions, innerPercent })}
                        />
                      </div>
                    </ShapeMenuPanel>
                  ) : null}
                </div>
                <div className="toolbar-section sketch-edit-section" data-group="select">
                  <div className="toolbar-section-label">{t("sketch.group.select")}</div>
                  <div className="toolbar-section-tools">
                    <button className={`toolbar-icon sketch-tool-icon ${sketchTool === "select" ? "active" : ""}`} type="button" aria-label={t("sketch.select")} title={t("sketch.select")} onClick={() => onSketchTool("select")}>
                      <SketchReferenceIcon name="select" />
                    </button>
                    <button
                      className={`toolbar-icon sketch-tool-icon ${sketchTool === "select" ? "" : "disabled"}`}
                      type="button"
                      aria-label={t("sketch.addImage")}
                      title={sketchTool === "select" ? t("sketch.addImageReady") : t("sketch.addImageBlocked")}
                      onClick={onSketchImage}
                      disabled={sketchTool !== "select"}
                    >
                      <SketchReferenceIcon name="image" />
                    </button>
                    <button className={`toolbar-icon sketch-tool-icon ${sketchTool === "refine" ? "active" : ""}`} type="button" aria-label={t("sketch.refine")} title={t("sketch.refine")} onClick={() => onSketchTool("refine")}>
                      <SketchReferenceIcon name="refine" />
                    </button>
                    <button
                      className={`toolbar-icon sketch-tool-icon ${canFilletSketchPoint ? "" : "disabled"} ${sketchCornerDialog === "chamfer" ? "active" : ""}`}
                      type="button"
                      aria-label={t("sketch.chamferCorner")}
                      title={canFilletSketchPoint ? t("sketch.chamferCorner") : t("sketch.chamferCornerDisabled")}
                      onClick={() => {
                        if (!canFilletSketchPoint) return;
                        onSketchCornerDialog?.(sketchCornerDialog === "chamfer" ? null : "chamfer");
                      }}
                      disabled={!canFilletSketchPoint}
                    >
                      <ToolbarChamferIcon />
                    </button>
                    <button
                      className={`toolbar-icon sketch-tool-icon ${canFilletSketchPoint ? "" : "disabled"} ${sketchCornerDialog === "fillet" ? "active" : ""}`}
                      type="button"
                      aria-label={t("sketch.filletCorner")}
                      title={canFilletSketchPoint ? t("sketch.filletCorner") : t("sketch.filletCornerDisabled")}
                      onClick={() => {
                        if (!canFilletSketchPoint) return;
                        onSketchCornerDialog?.(sketchCornerDialog === "fillet" ? null : "fillet");
                      }}
                      disabled={!canFilletSketchPoint}
                    >
                      <ToolbarFilletIcon />
                    </button>
                    <button className={`toolbar-icon sketch-tool-icon ${sketchTool === "erase" ? "active" : ""}`} type="button" aria-label={t("sketch.erase")} title={t("sketch.erase")} onClick={() => onSketchTool("erase")}>
                      <SketchReferenceIcon name="erase" />
                    </button>
                  </div>
                </div>
                <div className="toolbar-section sketch-clipboard-section" data-group="clipboard">
                  <div className="toolbar-section-label">{t("editor.group.clipboard")}</div>
                  <div className="toolbar-section-tools">{sketchClipboardTools.map(renderToolButton)}</div>
                </div>
                <div className="toolbar-section sketch-history-section" data-group="history">
                  <div className="toolbar-section-label">{t("editor.group.history")}</div>
                  <div className="toolbar-section-tools">
                    <button className={`toolbar-icon ${sketchCanUndo ? "" : "disabled"}`} type="button" aria-label={t("sketch.undo")} title={`${t("status.undo")} (${COMMAND_SHORTCUTS["sketch-undo"]})`} onClick={onSketchUndo} disabled={!sketchCanUndo}>
                      <ToolbarUndoIcon />
                    </button>
                    <button className={`toolbar-icon ${sketchCanRedo ? "" : "disabled"}`} type="button" aria-label={t("sketch.redo")} title={`${t("status.redo")} (${COMMAND_SHORTCUTS["sketch-redo"]})`} onClick={onSketchRedo} disabled={!sketchCanRedo}>
                      <ToolbarRedoIcon />
                    </button>
                  </div>
                </div>
                <div className="toolbar-spacer" />
                {/* Fork (build 17): draw first, then choose how the outline becomes 3D. */}
                {sketchIsNew ? (
                  <div className="toolbar-section sketch-operation-section" data-group="create">
                    <div className="toolbar-section-label">{t("sketch.makeAs")}</div>
                    <div className="toolbar-section-tools sketch-operation-choice" role="radiogroup" aria-label={t("sketch.makeAs")}>
                      {([
                        ["extrude", ArrowUpFromLine, "sketch.opExtrude", "sketch.opExtrudeHint"],
                        ["revolve", Rotate3d, "sketch.opRevolve", "sketch.opRevolveHint"],
                        ["sweep", RouteIcon, "sketch.opSweep", "sketch.opSweepHint"],
                      ] as const).map(([operation, Icon, label, hint]) => (
                        <button
                          key={operation}
                          type="button"
                          role="radio"
                          aria-checked={sketchOperation === operation}
                          className={`sketch-command-button sketch-operation-button ${sketchOperation === operation ? "active" : ""}`}
                          data-sketch-operation={operation}
                          title={t(hint)}
                          onClick={() => onSketchOperation(operation)}
                        >
                          <Icon aria-hidden="true" />
                          <span>{t(label)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="toolbar-section sketch-finish-section" data-group="finish">
                  <div className="toolbar-section-label">{t("sketch.group.finish")}</div>
                  <div className="toolbar-section-tools">
                    <button
                      className={`sketch-command-button ${sketchStrokeActive ? "active" : ""}`}
                      type="button"
                      aria-pressed={Boolean(sketchStrokeActive)}
                      title={t("sketch.strokeHint")}
                      onClick={onSketchStroke}
                    >
                      <SketchReferenceIcon name="line" />
                      <span>{t("sketch.stroke")}</span>
                    </button>
                    <button className="sketch-command-button primary" type="button" onClick={onSketchFinish}>
                      <Check />
                      <span>{sketchOperation === "revolve" ? t("sketch.finishRevolve") : sketchOperation === "sweep" ? t("sketch.finishSweep") : t("sketch.finishSketch")}</span>
                    </button>
                    <button className="sketch-command-button cancel" type="button" onClick={onSketchCancel}>
                      <X />
                      <span>{t("sketch.cancel")}</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="toolbar-section sketch-start-section" data-group="create">
                <div className="toolbar-section-label">{t("sketch.group.create")}</div>
                <div className="toolbar-section-tools">
                  {/* Fork (build 17): one way in - draw first; Pull up, Spin round or Follow a path is chosen in the sketch. */}
                  <button
                    className="sketch-command-button primary"
                    type="button"
                    aria-label={t("sketch.newSketch")}
                    title={t("sketch.newSketchHint")}
                    data-layerling-tool="sketch-new"
                    onClick={() => startSketch("extrude")}
                  >
                    <PencilLine aria-hidden="true" />
                    <span>{t("sketch.newSketch")}</span>
                  </button>
                  <GuideHelpLink section="sketchToBody" />
                  <button className={`sketch-command-button ${canEditSketch ? "" : "disabled"}`} type="button" aria-label={t("sketch.editTo3d")} title={t("sketch.editTo3d")} onClick={onEditSketch} disabled={!canEditSketch}>
                    <SketchReferenceIcon name="editSketchTo3d" />
                    <span>{t("sketch.edit")}</span>
                  </button>
                </div>
              </div>
            )}
            {/* Sketch mode has its own keys; the help opens from here too. */}
            <div className="toolbar-section toolbar-actions-section" data-group="help">
              <div className="toolbar-section-label">{t("editor.group.help")}</div>
              <div className="action-buttons">
                <button className="action-icon-button" aria-label={t("palette.open")} title={t("palette.open")} aria-haspopup="dialog" data-layerling-tool="command-search" onClick={openPalette}>
                  <Search className="toolbar-search-icon" aria-hidden="true" />
                </button>
                {/* Fork: the quick guide, shortcuts, and Interactive Help in one menu. */}
                <HelpMenu interactiveHelpActive={interactiveHelpActive} onGuide={onGuide} onShortcuts={onShortcuts} onInteractiveHelp={onInteractiveHelp} />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="toolbar-title-row">
        {/* The brand, in the same corner as on the start page. Not a link:
            leaving the editor is not something to trigger by accident. */}
        <div className="toolbar-brand">
          <img src={withBase("/assets/pare3d/pare3d-icon.svg")} alt="Pare 3D" />
          <span className="toolbar-brand-text">
            <span className="toolbar-brand-name">Pare 3D</span>
            <span className="toolbar-brand-tagline">{t("brand.tagline")} <PareBuildBadge /></span>
          </span>
        </div>
        <div className="toolbar-workspace-tabs" role="tablist" aria-label={t("editor.modeLabel")}>
          <button
            className={toolbarMode === "geometry" ? "active" : ""}
            type="button"
            role="tab"
            aria-selected={toolbarMode === "geometry"}
            onClick={() => selectToolbarMode("geometry")}
          >
            {t("editor.modeGeometry")}
          </button>
          <button
            className={toolbarMode === "sketch" ? "active" : ""}
            type="button"
            role="tab"
            aria-selected={toolbarMode === "sketch"}
            onClick={() => selectToolbarMode("sketch")}
            disabled={historyViewActive}
          >
            {t("editor.modeSketch")}
          </button>
        </div>
        <div className="toolbar-project-name">
          <label ref={projectNameFieldRef} className="toolbar-project-name-field" title={t("editor.renameProject")}>
            <input
              ref={projectNameInputRef}
              aria-label={t("confirm.projectName")}
              value={projectNameDraft}
              maxLength={80}
              spellCheck={false}
              onChange={(event) => setProjectNameDraft(event.target.value)}
              onBlur={(event) => {
                if (cancelProjectNameEditRef.current) {
                  cancelProjectNameEditRef.current = false;
                  setProjectNameDraft(projectName);
                  return;
                }
                commitProjectName(event.currentTarget.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
                if (event.key === "Escape") {
                  cancelProjectNameEditRef.current = true;
                  event.currentTarget.blur();
                }
              }}
            />
            <Pencil size={13} strokeWidth={2.4} aria-hidden="true" />
          </label>
          <SaveStatus />
        </div>
        <div className="toolbar-title-row-actions">
          {/* Fork: Manage and Help sit in the title row, in line, so the tools stay on one row. */}
          {toolbarMode === "geometry" ? (
            <div className="title-row-tools">
              <ExportButton />
            {/* Build 125: Import is a lighter green button beside Export; Settings keeps its place; the rest of the
                top row (note, attachments, parameters, search, help, Simple mode) sits in one More menu. */}
            <button className="import-button" type="button" data-layerling-tool="import" title={`${t("editor.import")} (${COMMAND_SHORTCUTS.import})`} onClick={() => onTopPanel("import")} disabled={historyViewActive}>
              <Import aria-hidden="true" />
              <span>{t("editor.import")}</span>
            </button>
            <div className="toolbar-section toolbar-actions-section" data-group="manage">
              <div className="action-buttons">
                <button className="action-icon-button" aria-label={t("editor.workspaceSettings")} title={t("editor.workspaceSettings")} data-tip={topTip(t("editor.workspaceSettings"), "units, grid, plate and appearance")} onClick={() => window.dispatchEvent(new Event("layerling:open-workspace-settings"))}>
                  <LucideSettings className="title-icon" aria-hidden="true" />
                  <span className="title-label" aria-hidden="true">{t("editor.settingsShort")}</span>
                </button>
                <TopMoreMenu
                  noteMode={noteMode}
                  historyViewActive={historyViewActive}
                  attachmentCount={attachmentCount ?? 0}
                  interactiveHelpActive={interactiveHelpActive}
                  onNote={onNoteTool}
                  onAttachments={() => onTopPanel("attachments")}
                  onParameters={() => window.dispatchEvent(new Event(OPEN_PARAMETERS_EVENT))}
                  onSearch={openPalette}
                  onGuide={onGuide}
                  onShortcuts={onShortcuts}
                  onInteractiveHelp={onInteractiveHelp}
                />
              </div>
            </div>
            </div>
          ) : null}
          {toolbarMode !== "geometry" ? <SimpleModeSwitch /> : null}
          <InstantTips />
        </div>
      </div>
    </div>
  );
}
