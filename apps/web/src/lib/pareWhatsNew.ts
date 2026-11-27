/*
 * Fork (build 20): what each build brought, shown once after an update ("What's new") and from
 * the Help menu. Plain words, the few things a person would notice; English, as release notes.
 */
export const WHATS_NEW: ReadonlyArray<{ build: number; items: readonly string[] }> = [
  {
    build: 133,
    items: [
      "Mesh from a picture is about 14% quicker (8 steps instead of 12) and may use more of the Mac's memory before stopping, so a large picture is less likely to run out of memory.",
      "When mesh making stops, the panel shows the reason it gave, and the full log is kept beside the picture.",
    ],
  },
  {
    build: 132,
    items: [
      "No more dashed frame or Drop to import card while dragging files in. Build 131 could leave them stuck on screen after a picture was dropped on the AI panel.",
      "No Fast mode offer popping up; Fast mode stays in Settings.",
      "The AI panel lists each mesh-making step once.",
    ],
  },
  {
    build: 131,
    items: [
      "Calmer screen: no hint on an empty workplane, and dragging files in shows only a light outline instead of a message.",
      "The mesh-making setup in the AI panel now installs uv first, which brings the Python version the model needs.",
    ],
  },
  {
    build: 130,
    items: [
      "A picture can become a real mesh, made free on your Mac: drop a photo in the AI panel and choose Mesh. Pare 3D uses TRELLIS.2, Microsoft's open image-to-3D model, through its Apple Silicon version (24 GB of memory or more; set it up once from the panel). What you type with the picture, such as a size, goes to the AI once the mesh is in.",
      "Or choose From shapes, and the AI builds a simpler model from Pare's shapes.",
      "GLB files import as meshes, standing up as they should.",
    ],
  },
  {
    build: 129,
    items: [
      "AI design: after Pare 3D updates itself while open, the AI panel now says to quit and reopen before sending a picture. Build 128 could send it to AI code that was still the older one, which left the picture out.",
    ],
  },
  {
    build: 128,
    items: [
      "AI design takes pictures: drop, paste or pick a photo or drawing in the AI panel, and the AI builds a 3D model of it from shapes you can edit. Say how big it should be, or it picks a sensible size.",
      "Drop an STL, OBJ, 3MF or GLB made elsewhere on the AI panel: it goes into your design, and the AI works on that mesh next (scale it, flatten the base, cut it, combine it).",
    ],
  },
  {
    build: 127,
    items: [
      "AI design with ChatGPT now finds your plan's models: build 126 signed in but then said no model was offered.",
      "The AI design code now updates with the app, so later AI fixes arrive by themselves. This app needs downloading once more.",
    ],
  },
  {
    build: 126,
    items: [
      "AI design: click AI in the top row, say or type what to make or change, and the AI builds it in your design. Every change can be undone.",
      "The switch beside the AI button picks the engine: ChatGPT on your own Plus or Pro plan (Continue with ChatGPT signs in through your browser), or Gemini through Google's free Gemini CLI.",
      "The microphone button types what you say.",
      "AI design needs the new app: download it from the releases page. The web version has no AI design.",
    ],
  },
  {
    build: 125,
    items: [
      "Dark mode: Settings > Appearance > Theme offers Light, Dark or Same as my computer. Dark gives charcoal bars and panels, a graphite view with a grey grid and light type, in the manner of desktop CAD programs, and works with the Fresh look too.",
      "A cleaner top row: the design name, Export, Import and Settings. Import is now a lighter green button beside Export.",
      "Note, Attachments, Parameters, the search, Help and Simple mode moved into the ⋯ More button at the end of the top row. Their keys still work: N for a note, Ctrl/⌘K for the search, ? for the list of keys.",
      "The folded toolbar groups (Mesh, Print and others) carry the same small tab with an arrow as Shapes.",
    ],
  },
  {
    build: 124,
    items: [
      "A cleaner toolbar: tools that wait for a selection are now a readable grey instead of nearly invisible, so you can see what is there and what you can use right now.",
      "Toolbar groups have one quiet frame and a grey label instead of a colour each, so the tool that is on (shown in blue) stands out.",
      "The small buttons on the settings panel's title row (help, lock, shield, eye) are bigger and easier to hit.",
    ],
  },
  {
    build: 123,
    items: [
      "A new Print group in the toolbar holds everything for getting a design ready to print: Print check, Print analysis, Check clearance, Build plates and Cut below the bed. Arrange is now only for placing parts, and Mesh only for meshes.",
      "In the toolbar's menus the tools you can use right now come first. The ones that wait for a selection sit below a small heading instead of standing greyed out between them, and each tool shows its key.",
      "Press ? for the list of every key. On a wide window the search in the top bar is a box you can click, with its key (Ctrl K or ⌘K).",
      "The toolbar folds a group into a menu whenever it would otherwise run past the edge of the window.",
    ],
  },
  {
    build: 122,
    items: [
      "The toolbar's drop-down menus (Mesh, Arrange, Make, More and Visibility) use smaller text and shorter rows, so they take less room and are quicker to scan.",
    ],
  },
  {
    build: 121,
    items: [
      "Smoother on Mac Retina screens: with Fast mode on (the default) the view now stays at standard resolution, as Fast mode intends. Before, it went back to full Retina sharpness after every move and while a new shape followed the mouse, four times the pixels to draw. For the sharpest picture, turn Fast mode off in Settings: the view still drops to standard resolution while anything moves.",
      "Selecting a large imported mesh no longer freezes the window for a moment.",
    ],
  },
  {
    build: 120,
    items: [
      "Pare 3D is now built on layerling's latest version, with Pare's own look, toolbar, right-click menu and home screen kept. Your designs open as before.",
      "Surface texture (Modify, or right-click > Surface): 21 patterns, text and your own pictures, more than one layer, and only on the faces you pick or a region you draw. It replaces the old Texture tool.",
      "New in Modify: Mold & die, Cable channel, Stencil bridges and Paint (colour parts of a body for a multi-colour print). Right-click > Edges and faces adds Offset.",
      "Attachments (top bar): keep files with a design, such as instructions, a datasheet or notes.",
      "Settings has new tabs (Controls, Saving and export, Ribbon, Backups) and a search box that finds any setting.",
    ],
  },
  {
    build: 119,
    items: [
      "Print analysis (Arrange): checks every layer of your parts in one go and lists what could fail, such as overhangs, thin walls, floating parts or parts in the bed. Click a finding to see that layer.",
      "Thread insert and Magnet pocket (Modify): click a spot on a part for a heat-set insert hole or a magnet pocket. A ring shows green where there is enough material.",
      "Split a screw: a screw or threaded rod's settings can split it lengthwise to print lying down, with centring pins or pieces of filament.",
      "Hole pattern brought up to date: holes round a cylinder's wall, a Mounting holes tab (corners, pairs, 19-inch rack), a hole in the middle, turned squares and hexagons, and a top layer in a second colour.",
      "Rotation fields go past 180°, a fillet on a large round edge no longer dents the mesh, and a 3MF coloured at almost every point comes in as one body.",
    ],
  },
  {
    build: 118,
    items: [
      "Gridfinity: a few hints in the baseplate settings now give the right sizes for the Large plate switch and the drawer limits.",
    ],
  },
  {
    build: 117,
    items: [
      "Gridfinity brought up to date: trays of any size for board games, baseplates that split to fit your printer with Swallowtail keys to join them, a baseplate fitted into any drawer outline, and bins that overhang the grid.",
      "Bins can have raised text on their label shelves, in any font and in a colour of their own for a second filament, lower dividers, and rounded or square outer corners.",
    ],
  },
  {
    build: 116,
    items: [
      "Each corner of a rounded box can have its own radius: tick \"Each corner its own radius\" and every corner gets its own orange dot and its own field.",
      "Slope Along lowers one end of a shape, and Narrow Along makes one end narrower. Both have an orange dot to drag. A sloped or narrowed shape is a mesh, so it cannot take fillets or export as STEP.",
    ],
  },
  {
    build: 115,
    items: [
      "Round a box's corners by dragging: an orange dot on the top edge of a box or rounded box. Drag it along the edge, away from the corner, for rounder corners. A plain box becomes a rounded box on the first pull.",
    ],
  },
  {
    build: 114,
    items: [
      "Imported STL models take less memory: a 400,000-triangle scan now uses about a fifth less, and designs that hold one save smaller. Designs made earlier shrink the next time they are opened.",
    ],
  },
  {
    build: 113,
    items: [
      "Pare 3D now also runs in a web browser, at rakeshjivan.github.io/Pare3D, for example on an iPad with a mouse or trackpad. It is the same program; files are downloaded instead of going to a folder or straight to a slicer.",
    ],
  },
  {
    build: 112,
    items: [
      "Bauble: the picture is now on the outside of the ball, so you see it on screen. Tick \"Smooth outside\" to put it inside instead; it lights up the same.",
      "Bauble: round underneath by default. Tick the small flat if you want to print it without supports.",
    ],
  },
  {
    build: 111,
    items: [
      "Christmas bauble: your photo all the way round a hollow ball, lit from inside by a fairy light, a Christmas-tree light bulb or an LED base. Search for \"bauble\", or find it under Ready parts > Pictures.",
      "The photo wraps shape-true: faces and circles keep their proportions on the ball. A template at the exact pixel size (for Canva or any photo editor) shows where it prints at full size and where the seam is.",
      "The photo can go round the ball once or repeat two to four times, so an ordinary photo fits.",
    ],
  },
  {
    build: 110,
    items: [
      "Build plates: lay a design out on several plates side by side, move parts between them, arrange them, and export all plates or one plate at a time. Under Arrange, and Onto plate in the right-click menu.",
      "Clearance check: shows the gap between two parts, and where they touch or overlap. It replaces the old fit check and checks again as you move parts.",
      "Punch cuts one part's outline straight through another, even when they don't touch.",
      "Make exact turns an imported STL into exact faces, so fillets, chamfers and STEP export work on it. In the Mesh menu.",
      "New shapes: screw boss, snap-fit and rib.",
      "Threads: NPT pipe threads, bottle necks, multi-start threads, and wing, star-knob, flange and square heads and nuts.",
      "Lids: bayonet caps, click bumps and more lid types. Hollow can make stackable boxes with a collar and groove.",
      "Loft: extra sections between the bottom and the top, with smooth or straight walls.",
      "The size boxes can show in the axis colours (Settings).",
      "Earlier versions: a state of each design is kept every 10 minutes while you work. Under History.",
    ],
  },
  {
    build: 109,
    items: [
      "Smoother view: shadows are drawn again only when a part changes, and dragging no longer makes the page work out its layout on every frame.",
      "The mesh tools are one Mesh button with a menu, so the toolbar has more room.",
      "Note, Import, Parameters and Settings show their names on a wide window.",
      "The column on the left is split into view, plate and measuring.",
      "Menus in the toolbar close with Escape and never stay open over a window.",
      "No more \"Selection cleared\" message when you press Escape.",
    ],
  },
  {
    build: 108,
    items: [
      "Dark build plate: the plate and its grid can be drawn in dark greys while the rest of the screen stays light. Use the moon button in the view controls, or Settings.",
      "Support ribs for a part printed tilted: under Modify > More and in the right-click menu. The ribs are left out of the fit and print checks.",
      "The \"Your plate is empty\" card no longer covers the top of an empty plate.",
    ],
  },
  {
    build: 107,
    items: [
      "Pare 3D is now CAD Studio only.",
      "Pare 3D is in English only.",
      "Updates now come from the new home of Pare 3D on GitHub: rakeshjivan/Pare3D.",
    ],
  },
  {
    build: 106,
    items: [
      "A cleaner screen: the strip of links along the bottom of the start pages and of CAD Studio is gone, so the work goes right to the bottom of the window.",
      "Its links moved into the menus: on the start pages, the Learn (book) menu now ends with Report a problem / suggest, Open source and Licences & credits; in CAD Studio they are in the Help menu.",
      "The build you are using is shown beside the Pare 3D name at the top left of the start pages.",
    ],
  },
  {
    build: 105,
    items: [
      "The update check is in the top bar of the start page, between the search and the guides: Up to date (click to check again), or the new build, ready to get.",
      "CAD Studio: undo and redo are much quicker in larger designs - the plate is no longer drawn again from scratch on every step.",
      "CAD Studio has a fresh look to try: white bars, quiet grey labels and one teal accent, with every tool where it was. Turn it on or off in Settings (Fresh look).",
      "Sculpt shows its Symmetry choice once (it was listed twice).",
    ],
  },
  {
    build: 104,
    items: [
      "New in CAD Studio, brought over from layerling 1.125 (under Modify > More): Offset (grow or shrink a body by one distance - for press-fit clearances), Cut out (one body out of another with a clearance), Cookie cutter, Loft between two sketches, Flexi joints and Lid.",
      "New shapes: Paraboloid, Vase (vases, pots and lampshades, with patterns, drainage, lamp sockets and accessories), Hirth joint, and Port openings for USB-C, Micro USB, USB-A, HDMI, DisplayPort and RJ45. Screws can now have a hex socket, Torx or Phillips drive and a set head diameter.",
      "Undo and Redo name the step they take back, the History view lists its steps, the section view's cut is hatched, the font list previews each font, and delta printers get a round plate.",
      "STEP files with several solids come in as one body each, in their colours; STEP import and export run off the page. Shading of round bodies is several times faster, the edge tool's preview is about a third quicker, large filleted bodies respond sooner, and the offline copy downloads about 10 MB less. The CAD kernel is updated (occt-wasm 5.11, brepjs 20) and the shared-folder server script has layerling's latest hardening.",
      "Start page: the ⋮ menu is smaller and no longer cut off, and Select lets you tick several designs and delete them together.",
      "Home welcomes you back after a week or more away, and shows a tip of the day (Next tip for another, × to hide them).",
      "CAD Studio always opens with the box and handles. The gimbal is on the right-click menu (Use the gimbal).",
    ],
  },
  {
    build: 99,
    items: [
      "A gimbal: switch Box / Gimbal beside Snap Grid. Gimbal gives three arrows to move a part along (red, green up, blue) and three rings to turn it on, about its middle - no box, sizes or distances on the part. Box keeps the usual handles. Your choice is remembered.",
    ],
  },
  {
    build: 96,
    items: [
      "Sculpt's selection bar no longer follows the selection round the model: it sits on one row below the toolbar, shows how much is selected, and can be dragged anywhere by its grip (double-click the grip to put it back).",
      "Smooth, Soft transform and Delete clear the selection once done, and Done on the bar clears it and closes the bar - no Esc needed to start a new selection. Grow, Shrink, Smooth edge and Invert keep the bar open.",
    ],
  },
  {
    build: 94,
    items: [
      "The Sculpt brush ring has a dot at its centre: exactly where the brush works.",
    ],
  },
  {
    build: 92,
    items: [
      "Face groups: the surface split into patches at its creases, shown in colour; Select > Group picks a whole patch with one click.",
      "Deviation from the original: the part coloured by what was added (warm) and taken away (cool) since Sculpt opened, updated after every stroke.",
      "Remesh selection and Reduce selection make only the selected triangles again, the rest of the part untouched.",
      "Every Sculpt tool, button and setting is explained when the pointer rests on it, and the list button at the top of the panel shows what each one does.",
      "Faster sculpting: Smooth about a third faster, fewer pauses on refining strokes, and the panel no longer copies the whole mesh at every slider step while something is selected.",
    ],
  },
  {
    build: 91,
    items: [
      "Sculpt makes far less garbage for the browser to clear up: a brush gathers the surface under it into the same arrays every time instead of new ones for every dab, and the editor is no longer drawn again after every stroke - the pause when you let go is gone.",
      "Refining strokes do less work: the triangles a stroke changes are put back in their place in the search grid once, when it is next used, not every time they change.",
    ],
  },
  {
    build: 90,
    items: [
      "Freeze in Sculpt (Meshmixer's mask): paint over what the brushes must leave alone and it turns blue - no brush moves it and refining leaves its triangles be. Ctrl frees it again; Freeze selection, Invert freeze and Clear freeze in the panel.",
      "Pinch matched to Meshmixer: it draws a ridge in gently and keeps its height (it took away half a ridge's width at 50 before).",
      "The Shapes panel opens by itself when a design opens only while it is pinned; unpinned, it stays closed until you click Shapes.",
    ],
  },
  {
    build: 89,
    items: [
      "More of Meshmixer's sculpt brushes: Draw 2 (an even layer, however often you go over it), Drag (pulls the surface along the stroke), Shrink smooth and Bubble smooth (keeps the volume, so rounded shapes stay rounded).",
      "Flatten grows with the strength as Meshmixer's does - gentle at low settings, nearly flat in one stroke at 100 (it flattened almost everything even at 25 before).",
    ],
  },
  {
    build: 88,
    items: [
      "The 3D view draws no more pixels than it needs, whatever the display setting - with a Mac set to More Space it filled 40% more every frame, and Sculpt lagged.",
    ],
  },
  {
    build: 87,
    items: [
      "Sculpt strokes show in the same frame as your hand moves - they were drawn a frame late (about 17 ms behind).",
      "While you sculpt, the handles, measures and other on-screen marks are not worked out again every frame, and the brush ring moves without redrawing the panel around it.",
      "No change of sharpness at the start and end of a stroke (build 85 drew strokes at a lower resolution; switching cost a hitch).",
      "On a 120 Hz ProMotion screen the Mac app can now draw at 120 frames a second where macOS allows it, and the brush paces its work to the screen.",
      "Less memory thrown away at the start of each stroke.",
    ],
  },
  {
    build: 86,
    items: [
      "Sculpt's brushes are twice as strong again: side by side with Meshmixer they still did too little at the same setting, because a hand stroke sends Meshmixer far more dabs than a quick test does. At Strength 29 a Draw stroke with a 3 mm brush now raises the surface about 0.14 mm.",
      "The speed readout has a button (the gauge at the top of the Sculpt panel), and the key also works where ` is § or an accent key.",
    ],
  },
  {
    build: 85,
    items: [
      "While a Sculpt stroke goes on the view draws at standard resolution, as when turning it, and is sharp again the moment you stop.",
      "Strokes are evenly spaced however fast you move, and a quick stroke catches up a frame later instead of leaving gaps.",
      "Sculpt opens as Meshmixer's brushes do: Strength 29, Refine Coarse - and the brushes are as strong as Meshmixer's at an ordinary, unhurried stroke (about 1.7 times build 84's; they felt weak beside it).",
      "A switch at the top of the window sets the view's look: the workplane, no workplane, or Meshmixer's dark grey background with a light that follows the camera.",
      "Press ` in Sculpt for a speed readout of the last stroke - frames a second, the longest wait, and where the time went.",
    ],
  },
  {
    build: 83,
    items: [
      "Select in Sculpt has Meshmixer's extras: Connected (the whole of every piece the selection touches), Tidy edge (single triangles sticking out let go, notches filled), Invert connected, and the keys > < E I Shift+I O.",
    ],
  },
  {
    build: 82,
    items: [
      "Meshmixer's brush keys: [ and ] for the brush size, Ctrl + wheel for the strength, Ctrl while stroking for the opposite effect, Shift to smooth.",
      "Sculpt's brush strength now works like Meshmixer's, measured side by side on the same test plates: Draw grows with about the square of the strength (fine control at low settings; the old brushes were up to seven times stronger), Inflate more gently, and Smooth takes away what Meshmixer's does at the same setting. Strength runs 1 to 100 in steps of 1. A stroke does the same whatever its speed.",
    ],
  },
  {
    build: 81,
    items: [
      "Sculpt has Meshmixer's edit tools for a selection: Extrude and Offset (a patch moved out or in, joined back by a wall), Bridge (two holes joined into a tube, or two open edges bridged) and Face down on the plate (the part turned so the selected surface sits on the plate).",
      "The selection can be shrunk by a ring and its outline smoothed, as well as grown.",
      "Make solid (under Whole part) rebuilds any part as one closed solid at a chosen detail - holes capped, overlapping shells joined - ready to print or combine.",
    ],
  },
  {
    build: 79,
    items: [
      "Cancel now stops the models being made, at once, leaving everything as it was.",
    ],
  },
  {
    build: 78,
    items: [
      "English is now the master of the interface's wording: other languages show the English sentence wherever theirs has not caught up.",
    ],
  },
  {
    build: 76,
    items: [
      "Right-click a selection for a new Align menu: centre parts on one another or on the workplane (X and Y) in one click, flip over or turn around 180° (set back down on the workplane), mirror left-right or front-back without picking an axis, and the Align, Mirror and Drop tools.",
    ],
  },
  {
    build: 75,
    items: [
      "Drag files from your desktop straight onto the editor to import them - no trip through the Import window. A frame shows while you hold them over it; a .lyl design dropped this way opens.",
      "What's new has its own button on the start page, and opens with every build to scroll back through, newest first.",
      "Change the base after choosing a model and the model is marked custom; solid or hollow is chosen with the model, not hidden under more settings.",
    ],
  },
  {
    build: 74,
    items: [
      "Hollow models are made faster with about 30% fewer triangles: the hidden cavity is simplified, and set a little further in so the wall is never thinner than you asked.",
      "Hollow models with a clean base keep their full wall round the locator notches - cut straight into the shell, the wall there was left about 1 mm.",
    ],
  },
  {
    build: 73,
    items: [
      "Sculpt's Refine adds triangles where the brush works (Fine, Medium or Coarse), so detail can be shaped on a coarse part, and Symmetry repeats each stroke on the other side, left-right or front-back. Ctrl+Z and Ctrl+Y step through strokes at once, and the view cube can be clicked between strokes.",
    ],
  },
  {
    build: 72,
    items: [
      "The Export window's slicers can always be chosen. Where the app could not say which slicers are installed - in a web browser, or in a Pare 3D app older than its pages - build 71 greyed them all out. Now the window says which it is: in a browser the file is downloaded for the slicer you pick; an older app is asked to be downloaded again once.",
      "Export has a Parts choice for 3MF and STL: Separate (one file; parts that touch become one, the rest stay apart - the default), Joined (one body) or A file per part (an upper and a lower model as two files, say).",
    ],
  },
  {
    build: 71,
    items: [
      "Export is one blue button now (or Ctrl+E): its window asks where the file opens - a slicer, or nowhere - with Make default to keep that choice, then 3MF or STL, then the file name and folder (Change... picks another), and Export. With a slicer chosen the file is saved in your folder and opened from there. More formats opens the full panel for STEP, OBJ, SVG, DXF, drawings, pictures and design files.",
      "On a laptop the toolbar stays in one row: when the groups would wrap, the least used (Arrange, then Mesh, Combine, ...) fold into one button each with their tools in a list. The plate keeps its height.",
      "The right-click menu is about half as long: the tools sit in four sub-menus - Edges and faces, Surface, Mesh and Mark points.",
      "Split has a Dovetail connector: a key on one half and a slot across the other, so the halves slide together from the side and hold without glue.",
    ],
  },
  {
    build: 70,
    items: [
      "Send to your slicer, not only Bambu Studio: the menu beside the Send button now picks OrcaSlicer or PrusaSlicer for filament, or PreForm (Formlabs), CHITUBOX or Lychee Slicer for resin. The button says where it sends, and a slicer that is not on this computer is marked. (An app installed before this build sends only to Bambu Studio - download it again once.)",
    ],
  },
  {
    build: 68,
    items: [
      "3MF files - for export and for Send to Bambu Studio - are now made in the background, so the editor keeps answering while a large model is packed.",
    ],
  },
  {
    build: 67,
    items: [
      "An open mesh with small holes in it has them closed before it is cut, split or grouped, and you are told how many; deeply nested groups no longer run out of memory.",
      "Placing and measuring: a new shape snaps to the middle of a face (hold Alt not to), Center on workplane works on a face, Align faces lines up holes on one axis, the right-click menu can select a body hidden behind another, a length typed in the tape measure moves the body, a stood-up ruler measures along itself, and Up and Down (Shift larger, Alt finer) change the number in a field.",
      "Also new: Curve through points in a sketch, Alt and the lift arrow makes a copy upwards, a pattern can group its pieces, a multi-colour SVG comes in as one body per colour, a start view of your own (Settings), a search in the keyboard shortcuts, Shift+N shows or hides notes, and Paste in the middle.",
      "Gridfinity: wall thickness, a chamfer on the stacking lip, sides opened fully or partly, and baseplates padded, fitted to a drawer and with rounded or square corners.",
      "Safer when Pare 3D is hosted on a web server: the store folder refuses direct requests and every saved file is checked.",
    ],
  },
  {
    build: 63,
    items: [
      "A ball joint fit test joins the hinge fit test (Ready-made parts, and the link beside Hinge fit, which prints the test for the joint you have chosen).",
    ],
  },
  {
    build: 63,
    items: [
      "Ball, drop-in: the same balls slide into their cups through a channel slanting down and back, and lift out the same way. Nothing snaps or flexes, so nothing can crack; the upper's weight keeps it seated, and it lifts off if pulled. Clip and axle: the hinge of builds 58 to 62.",
    ],
  },
  {
    build: 62,
    items: [
      "Tighter hinge: clips are 14 mm long (they were 9.6), so they cannot rock on the axle, and the room along the axle is the fit itself (it was 0.2 mm each side), so they cannot slide from side to side. The standard fit is 0.10 mm, with 0.05 and 0.075 mm offered for printers that can hold them; the hinge fit test prints 0.05 to 0.2 mm."
    ],
  },
  {
    build: 58,
    items: [
      "The hinge fits close: 0.15 mm round the axle by default (a Hinge fit setting offers 0.1 to 0.3 mm for your printer), 0.2 mm along it, and a firmer snap.",
    ],
  },
  {
    build: 57,
    items: [
      "Clicker top is the inset clicker kit's top cutter again: a recess with a dowel in the middle whose cross hole pushes onto the switch's stem (build 56's post standing out of the face was wrong).",
      "The gap between the clicker's halves is now chosen on the Clicker base: the pocket sinks the switch so only that much stands out - 2.5 mm by default, enough for a blue switch to click, up to 4.5 mm.",
    ],
  },
  {
    build: 56,
    items: [
      "Clicker in one click each: Add the Clicker base, click the base's flat face, and the pocket goes into the middle of the face and is cut in at once; the same for the Clicker top. No moving, centring or grouping by hand.",
      "The clicker now hides the switch: the base pocket takes the whole switch, its top level with the face (build 54's held only the part under a keyboard plate, so the switch stood out). The top is a post that pushes onto the stem, as long as the gap you choose between the halves: 2.5 mm by default (enough for a blue switch to click), up to 4.5 mm for the full 4 mm press.",
    ],
  },
  {
    build: 55,
    items: [
      "Texture: a new Modify tool presses a pattern into a part's surface, or raises it out of it - knurl, ribs, dimples, hexagons, bricks, weave, stone, leather, wood, fuzzy, or a picture of your own. The faces it stands on stay flat and sharp edges stay crisp.",
      "DXF: import DXF drawings from CAD programs and laser files (lines, arcs, circles, polylines, splines and blocks become a body at real size, holes and all), and export DXF outlines for laser cutters and CNC from the Export window.",
      "Pictures (PNG, JPG) and SVGs import straight away: they no longer wait up to 10 seconds when the geometry engine cannot load.",
      "Under the hood: the editor's biggest file was split into smaller ones (the toolbar, the top bar, clipboard, align and mirror, files), with no change in how anything works.",
    ],
  },
  {
    build: 54,
    items: [
      "Make a clicker: Ready-made parts has a new Clicker group with a Clicker base (the pocket a keyboard switch presses into) and a Clicker top (the recess over the switch, with a keycap socket for its stem). Click Add, then click the flat face of each half: the cutter goes in level with it. Group to cut.",
      "The clicker cutters keep their size so they fit standard Cherry MX style switches: no resize handles, and no taper, twist or wrap.",
    ],
  },
  {
    build: 53,
    items: [
      "The Mesh tools (Repair, Fill hole, Simplify, Cut below, Round) sit on the toolbar as their own buttons instead of in a menu; Repair, Fill hole and Simplify are for imported meshes; Round works on any one solid part, and Cut below on any solid parts, or on every part when nothing is selected.",
    ],
  },
  {
    build: 50,
    items: [
      "Choose what fills a hollow model: Empty, a Honeycomb base (the bottom 6 mm only) or a full Honeycomb - now with two or three drain slots at the foot of every wall.",
    ],
  },
  {
    build: 49,
    items: [
      "Hollow models get a honeycomb inside: as stiff as solid for a fraction of the resin or filament, with slots so resin drains through the vents.",
      "Make solid now runs Pare's own STL repair engine (from Pare's STL View, Repair & Resize): holes, broken and doubled triangles, folds, pinches and loose crumbs. The Mesh group stays on the toolbar.",
      "Cut below the workplane is in the right-click menu of every solid part.",
    ],
  },
  {
    build: 46,
    items: [
      "PLY files can be imported.",
    ],
  },
  {
    build: 45,
    items: [
      "The best of layerling 1.100 to 1.103, picked for Pare 3D: the view cube turns the view smoothly instead of jumping, the shape library shows each shape in the colour it will be added in, and the sketch reads and types in your unit (inches too).",
      "Push/pull face: As a body of its own (not grouped) leaves the new part beside the body, ready to resize, move or use as a hole.",
      "Scale by percent works from the keyboard (Ctrl+K, the number, Enter), and the export window works out the material estimate only when you click Calculate, so it opens at once.",
      "Fixes: a cone keeps its radius after ungrouping a resized group, a star keeps its shape when scaled, a text's height no longer changes its letters with Keep proportions on, STEP export includes groups, a turned hollow body and a bent tube keep their stretch, the mouse wheel zooms properly in Firefox and Edge, a fillet no longer leaves a strip over a bay of an imported part or shifts a tapered and leaned body, and OBJ files are written much faster.",
    ],
  },
  {
    build: 44,
    items: [
      "Brought across from layerling 1.96 to 1.99, on top of everything Pare 3D adds: Shift+7, 8, 9 or 0 saves the view, and 7, 8, 9 or 0 brings it back.",
      "Sketches: change a sketch between extrude, revolve and sweep from the badge at the top; close a gap by dragging one open end onto the other; Separate Parts splits a sketch body by its outlines; Esc puts the drawing tool down first.",
      "Key ring holes on name and icon tags can sit on a tab of their own (Free) and be fixed to the tag where you put it, or slide along their side.",
      "Fixes: tall parts follow the mouse when dragged, trackpad pinch zooms properly in Chrome, imported parts thinner than 1 mm keep their size, SVG files saved as UTF-16 open, deleted designs stay deleted after a backup is restored, a renamed design keeps its name in backups, and phones and tablets get a minus key for negative values.",
    ],
  },
  {
    build: 43,
    items: [
      "Smoother first moments: the brief pause the first time you drag, undo or open a tool in a session (while the graphics card prepares what it draws) is gone or much shorter.",
      "Round a mesh opens straight away on big imported models, the second time and after.",
    ],
  },
  {
    build: 42,
    items: [
      "Push/pull face: the Depth slider is called Height when pulling out, and two new sliders - Move left or right, Move up or down - slide the pulled shape across the face for fine tuning (Back to the middle resets them).",
    ],
  },
  {
    build: 41,
    items: [
      "Detailed parts are much quicker to work with: selecting a sphere at the highest step count, typing a new size or undoing no longer freezes the window for a second or two, and Split opens faster.",
    ],
  },
  {
    build: 40,
    items: [
      "Text that runs past an edge now folds over onto the next face, like a sticker pressed round a corner, instead of sticking out into the air - handy for a short label near the corner of a box.",
      "Dragging text over a detailed part is far smoother: on a sphere at the highest step count each update is about 25 times quicker. The letters are laid a little coarser while you drag and at full detail when you let go.",
    ],
  },
  {
    build: 39,
    items: [
      "Turn a part and the text on it turns with it, exactly - round, tipped over or both. Hollow, fillet or resize the part and the text is laid again on the same spot.",
    ],
  },
  {
    build: 38,
    items: [
      "Placed text sticks to surfaces like a magnet: drag it and it slides over the part under the pointer - curved or flat, round a sphere or onto another part - and is laid there when you let go. No double-click needed.",
      "Move or resize the part and its text goes with it. Text nudged with the arrow keys or the Position fields is laid again on the part where it ends up.",
    ],
  },
  {
    build: 37,
    items: [
      "Thank you for testing Pare 3D! Please try everything - and when something breaks or could be better, use Report a problem / suggest (bottom left, in the Help menu, or the button that appears when a tool shows an error). It goes straight to the person who makes Pare 3D.",
      "Parameters (title row, next to Export): name a size - wall = 2, width = 60 - and type the name into any number field, alone or in a sum (width - 2 * wall). Change it once and every part that uses it follows.",
      "Draft angle (Modify): pick side walls and lean them in by a few degrees, so a part comes out of a mould or a press cleanly.",
      "More sketch rules: hold the angle between two lines, keep a point on a line, and keep two points mirrored about a line.",
      "Fit check runs in the background, so a big assembly keeps the window working; tool windows are tidier and match the properties panel.",
    ],
  },
  {
    build: 36,
    items: [
      "Sketch rules, as in Fusion: select a line (or right-click it) to keep it Horizontal or Vertical or to Lock its length; with two lines selected, keep them Parallel, at right angles or the Same length. Drag a point and the rest of the sketch moves just enough to keep every rule - one corner of a rectangle moves, the far corner stays put.",
      "Each rule shows as a small mark beside its line; click a mark to remove it. Typing a new length on a locked line changes the locked length.",
      "Round a mesh says straight away when a part is only a few millimetres across (usually imported at the wrong scale) instead of working for minutes and failing.",
      "Every guide picture is up to date with the new toolbar, including the sketch pictures.",
    ],
  },
  {
    build: 35,
    items: [
      "A new look for the toolbar: every icon drawn the same way - a thin dark line and a grey fill - each group framed in its own colour, and the tool in use tinted softly in that colour.",
      "Text on a surface works like Bambu Studio's: double-click placed text to change anything - raised or cut in, font, size, depth - drag the letters to slide them across the part, and choose Follow surface, Flat or Wrap around (right round a mug or bottle). A Curve slider bends the line into an arc, and you can add a font file of your own.",
      "Text that runs past an edge no longer falls apart or cuts through the model, and the window says plainly that the text is a preview until you press Add.",
      "Hollow now works after rounding or chamfering the edges, even with walls thicker than the rounding.",
      "Fillet: a size too big for the picked edges drops to the largest that fits by itself, and says so.",
      "Sketches: drag any point with whichever tool is picked (no need to press Select first), double-click a line to add a point, and right-click a line or a point for add, remove, curve, straighten, corner, smooth, fillet and chamfer.",
      "A smaller, tidier properties panel: Properties, Position, Rotation, Taper, Twist & Lean, then Wrap around a cylinder. Print helpers is gone - brims and hole compensation are set in the slicer.",
      "Every Modify tool has its own button again (Push/pull face is back in view), Round a mesh keeps the window working while it runs, and Make it flexi and the duplicate Text on a face are gone.",
    ],
  },
  {
    build: 34,
    items: [
      "Text on any surface, like Bambu Studio: click the T in Modify (or right-click a part > Add text here), type, click anywhere on a part - the letters hug flat, curved, domed and imported surfaces, raised or cut in. Click elsewhere to move it; font, size, depth and turn change it at once.",
      "The text stays editable: select it and click T again to change the words or move it, then Update. Group it with the part when it is final.",
      "On the side of a cylinder or tube the text wraps exactly round it; raised text now sits a little into the wall so it always joins it.",
    ],
  },
  {
    build: 33,
    items: [
      "Tool tracing into a Gridfinity bin: lay several tools on one sheet of paper, photograph them, and Photo to outline > Gridfinity bin makes a bin just big enough, with a pocket (and a finger notch) for each tool.",
      "Make it flexi: cut any model into segments joined by print-in-place joints - a flexi toy that prints in one go (Modify, or right-click).",
      "Hull (Combine): wrap the selected parts in one smooth body - two cylinders become a rounded slot.",
      "Fit check (Arrange): overlaps show in red, and pairs closer than the clearance are listed; it checks again as you move parts.",
      "Text on curved faces: Text on a face set down on the side of a cylinder or tube now wraps round it, raised or cut in.",
      "The Mesh tools are one button with a menu, so the toolbar no longer wraps when an imported model is selected.",
    ],
  },
  {
    build: 32,
    items: [
      "Saving no longer runs out of room in the Mac and Windows app: designs are now kept as files on your disk, and those saved before are moved there by themselves. (This needs the new download once - the auto-update cannot replace the part that stores them.)",
      "Fillet and chamfer in one window: switch between Round, Chamfer and Chamfillet at the top; click a size (0.5 to 5 mm) or Largest that fits; pick Outside edges or Inside edges in one click. The last size you used comes back next time.",
      "For fine work, under More options: a chamfer with two different distances (and Swap sides), and a fillet whose radius changes along the edge.",
      "property rows: the value box rides on its slider - drag it, or click it and type. Length, width, height and the rest take half the room.",
      "One Make button: ready-made parts in groups (fixings, containers, moving parts, print helpers), with Lithophane, Photo to outline and Voronoi in the same window.",
      "A Mesh group appears in the toolbar while an imported model is selected: Make solid, Fill hole, Simplify and Cut below.",
      "Blend, Hollow and Pattern show the main settings first; the rest is under More options.",
      "A Linux version: Pare-3D-Linux.tar.gz on the releases page, beside the Mac and Windows downloads.",
    ],
  },
  {
    build: 31,
    items: [
      "Blend: Keep the diameter - every slice stands square to the path like a pipe, so an S-bend between two offset parts stays as thick as the parts instead of thinning. If the parts are too close for that, the Blend window says how many mm further apart they need to be.",
    ],
  },
  {
    build: 30,
    items: [
      "Imported meshes are checked: if an STL, OBJ or 3MF is not watertight, a card says so and Make solid repairs it (a face with a hole in it closes as a ring, the hole stays open). Right-click > Check and make solid runs it any time.",
      "Fill a hole: right-click an imported part > Fill a hole, then click the inside wall of a screw hole, bore or nut trap - it is filled flush. Round, square and hex holes, through or blind.",
      "New ready-made parts: a jar with a screw-on lid, and a flexi chain of segments with print-in-place joints.",
      "An STL whose file has no normals no longer shows up black.",
    ],
  },
  {
    build: 29,
    items: [
      "Blend makes an exact CAD piece: fillet, chamfer and hollow now work on blended parts (before, they stopped at \"This mesh has 16,512 triangles\"), and STEP keeps the blend exact.",
      "Change a blend later: select it and click Blend again - its settings and faces come back; change them and click Update.",
      "Smoothness per end: switch off \"Same at both ends\" to flare out square from one part and ease gently into the other, like the tangency weight of a Fusion loft.",
      "Join into one part, or keep the piece separate (Fusion's Join / New body).",
      "Opening Pare 3D after installing a new download no longer shows an older build: an older copy still running in the background is replaced. (If an app from before build 29 shows an old build, restart your computer once.)",
    ],
  },
  {
    build: 28,
    items: [
      "Blend keeps hollows: blending two hollow parts (tubes, a hollowed box and a hollowed cylinder) makes a sleeve, so the result is one tube open all the way through. \"Hollow through\" in the Blend window switches it off for a solid piece.",
      "Hollow at will: on a part that is already hollow, clicking another face adds that side - a cup open at the top can be opened at the bottom too, without the top filling in.",
      "The sides Hollow will leave open stay shaded grey on the part until you press Hollow.",
      "Rotation rows match the arrows: About X is red, About Y green, About Z blue - the same colours as the turning arrows on the workplane.",
    ],
  },
  {
    build: 27,
    items: [
      "Hollow fixed: clicking a face of the part now opens that side. Before, clicking the top (already open by default) closed it, so the box came out sealed and looked unchanged.",
      "Hollowing a part that is already hollow - or one hollowed and then resized - now replaces its hollowing instead of failing with \"This body cannot be hollowed\".",
      "A sealed hollow (no side open) says so after hollowing, since it looks solid from outside.",
    ],
  },
  {
    build: 26,
    items: [
      "Pare 3D is now English only: the language menu is gone, and the app and its guide speak one language.",
      "The user guide (in Help) is rewritten for every tool: push/pull by dragging, Blend, Pattern by dragging, fillet and hollow on faces, Space out, Ready-made parts, Lithophane, Voronoi, Photo to outline, Ready to print?, Print fit and the fit test, Send to Bambu Studio, and where files and backups go.",
      "The ? in the Blend, Lithophane, Voronoi and Photo to outline windows opens the part of the guide about them.",
    ],
  },
  {
    build: 25,
    items: [
      "Blend (Combine group): select two parts and get a smooth piece joining their facing flat faces - two cylinders of different sizes flare into each other, square to both ends. Set the smoothness, then Enter.",
      "Fillet and chamfer: click a face to pick all its edges, and drag a picked edge into the part to set the size, with the live preview.",
      "Hollow: click a face of the part to open or close that side, and drag a face inward to set the wall thickness. Enter hollows.",
      "Pattern: drag a copy to space a row out or swing a circle round; + and − while dragging change the count. Enter creates.",
    ],
  },
  {
    build: 24,
    items: [
      "Push/pull works like Fusion's Press Pull: after you drag a face and let go, the new part stays a live preview. Change the depth, corner radius or inset, or drag it again, then Create (or Enter). Esc cancels.",
      "The preview keeps up with the drag much more smoothly.",
    ],
  },
  {
    build: 23,
    items: [
      "Push/pull by dragging: with Push/pull face on, press on a flat face and drag it out to add material or in to cut a pocket. The depth shows beside the pointer; Shift for fine steps, type a number for an exact depth, Esc to stop.",
      "The \"older app\" note is gone from the home screen. Settings > Files mentions it only where choosing folders needs the newer app.",
    ],
  },
  {
    build: 22,
    items: [
      "A calmer home screen: the backup box is now one quiet line, and the examples panel is gone.",
      "Choose where exports and backups are saved (Settings > Files), or have Pare 3D ask each time. After a save, \"Show in folder\" takes you there.",
      "The Shapes panel is open whenever a design opens.",
      "Round shapes start with \"Sides follow the size\" off, so the Sides slider works straight away for smoother curves.",
    ],
  },
  {
    build: 21,
    items: [
      "Eight new basic shapes, each next to its nearest relative: rounded and bevelled cylinders, pie slice, ring segment, gusset, arrow, spiral ramp and a geodesic ball.",
      "Photo to outline (Make > Trace): turn a photo of a tool or template into a cut-out for a tray, or a solid shape.",
      "Electronics enclosure in Ready-made parts: a box for a circuit board with standoffs, port cut-outs and a vented lid.",
      "Fit test: print it once, pick the hole that fits, and Print fit offers it as \"My printer\".",
      "Split to fit: a part too big for the plate is cut into pieces with dowel holes, from Ready to print?",
      "Ready-made parts has its own window: its button in the Make group opens and closes it, with clearer pictures.",
      "A part's settings start folded up: open only the sections you need.",
    ],
  },
  {
    build: 20,
    items: [
      "A calmer toolbar: quiet group tiles instead of coloured frames.",
      "Smart guides: while you drag, lines show when edges or centres line up, with the gap in mm.",
      "\"Saved\" next to the design name, so you can see your work is kept.",
      "A spinner while slow jobs (grouping, fillets, exports) are working.",
      "The view glides when you use the view cube, Home or Center view.",
      "Clearer greyed-out tools, stronger keyboard focus, and Send feedback in the Help menu.",
      "A search box in Settings, and Multicolour, Centre and Colour spelt the Australian way.",
    ],
  },
  {
    build: 19,
    items: [
      "Ready to print? - Send to Bambu Studio first checks for floating parts, loose holes, thin walls, big overhangs and parts past the plate.",
      "Select several parts to see their overall size, and type a new size to scale them all together.",
      "Examples open zoomed to fit; clearer \"over the left edge\" warnings.",
    ],
  },
  {
    build: 18,
    items: [
      "Instant tips with plain words on every toolbar and camera button.",
      "The shape panel floats over the view; Push/pull face; Open or import.",
      "Origin distances are off by default (turn them on in Settings).",
    ],
  },
  {
    build: 17,
    items: [
      "One Help menu, tool names under icons (Help > Show tool names), and a \"New to 3D design?\" start.",
      "Three examples to start from: a box with a lid, a name keyring and a phone stand.",
      "Sketch: draw first, then choose Pull up, Spin round or Follow a path.",
      "Settings: the everyday choices first, the rest under Show advanced settings.",
    ],
  },
];

/** The notes for the builds after `since` up to `current`, newest first. */
export function whatsNewSince(since: number, current: number) {
  return WHATS_NEW.filter((entry) => entry.build > since && entry.build <= current).sort((a, b) => b.build - a.build);
}
