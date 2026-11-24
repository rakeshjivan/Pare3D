---
title: Selecting and arranging
summary: Selecting shapes, finding them in the object list, aligning, mirroring, rotating, laying flat on a face and multiplying in patterns.
---

## Selecting

A click on a shape selects it. With [[Shift]] you add more or take them away again. While [[Shift]] is held and two or more shapes are selected, a small number below the mouse pointer counts them. A click on empty space clears the selection, and so does [[Esc]]. Drag a frame on the empty workplane to select everything it touches; with [[Shift]] held, the frame adds what was not selected and takes away what was. If you would rather pick one part out of a cluster, switch on {{ui:workspace.frameByDirection}} in the settings (area {{ui:workspace.appearance}}): a frame dragged to the right then takes only what lies completely inside it, one dragged to the left still everything it touches, and its line is dashed. Hold [[Alt]] while you drag to turn the frame around for that one drag, for example to take whole bodies from the side where the direction would not allow it. And [[Ctrl]]+[[A]] selects all visible bodies. While you drag a body or a handle of the frame, [[Esc]] cancels as long as the mouse button is still held: everything goes back as it was, and nothing is added to the history.

A shape behind another one, such as a hole inside a body, you reach without turning the view: right-click the spot and choose {{ui:contextMenu.selectOther}}. The menu then lists every shape under the pointer, from front to back. The one your pointer is on is outlined in the view, even through the shapes in front of it; a click selects it, and with [[Shift]] it is added to the selection. The entry is there whenever more than one shape lies under the pointer; on a tablet, a long press opens the same menu.

What is in your way you hide ({{ui:editor.tool.hideSelected}}, [[Ctrl]]+[[H]]). Hidden shapes stay in the design, they are just not visible and stay out of the export; the export window says beforehand how many there are. [[Ctrl]]+[[Shift]]+[[H]] brings them all back. What should stay put you lock with the padlock at the top of the settings or with [[Ctrl]]+[[L]]. A locked shape cannot be moved, resized, turned, recoloured or deleted: its handles turn grey, a padlock shows beside the arrow on top, and the tools that would change it are greyed out. Hovering a handle still shows its sizes, and a key that would change it says "Object locked". While one locked shape is in the selection, nothing changes for the others either. Hiding, renaming, copying and duplicating still work.

A number on the button of the group {{ui:editor.group.visibility}} says how many shapes are hidden, and a click on it shows them all again. A design that is opened with hidden shapes says so once, with a button to show them.

## The object list

With many parts it is easy to lose track in the view. The object list ({{ui:editor.tool.showOutliner}} or [[Ctrl]]+[[Shift]]+[[O]]) shows all shapes as a list. It stays open or closed as you left it, for every design, until you close it; the choice is kept in the browser.

![The object list: the group "Group" with two parts and a sphere beside it. A folder icon opens the group.](shot:object-list)

- A click on an entry selects the shape, including parts inside a group. With [[Shift]] held you add more entries or take them away again, just as in the view. The arrows fold groups open and shut.
- The label shows whether a part is {{ui:outliner.solid}} or {{ui:outliner.hole}}.
- Padlock and eye lock and hide single parts.
- {{ui:outliner.rename}} gives a part a name of its own; the pencil beside the name at the top of the settings does the same for the selected shape. Sensible names help enormously in larger designs.
- The search field finds shapes by name and by kind, so also "cylinder" or "hole". It also looks inside groups, however deeply nested: a group holding a match stays in the list and folds open to show the matching parts and the groups that lead to them. A group found by its own name shows all its parts when you open it.
- The arrow on the far left of the title bar folds the list down to its title bar and back.

The list sits docked just right of the view cube. Drag it by its title bar to put it anywhere on the workplane; it passes underneath the view cube and the camera bar. Drop it back beside the view cube, or double-click the title bar, and it docks again. Where it was and whether it was folded are remembered in this browser.

## Typing a position

The card {{ui:inspector.position}} in the properties panel shows where the selected body stands, and you can type it: {{ui:prop.positionX}} and {{ui:prop.positionY}} are the middle of its box on the plate, with the same signs as the distances shown on the workplane, and {{ui:prop.positionZ}} is the height of its underside. X counts to the right, Y towards the back and Z up, by the right-hand rule and CAD programs; the axis arrows on the plate show the directions. The values go in the unit you set, and the sliders reach as far as dragging does.

## Parking parts beside the plate

You can drag a shape past the edge of the plate and leave it there, about one plate width beyond each side, to keep it for later. The arrow keys move it as far as you like. A parked part still belongs to the design and goes into the export with everything else. To leave it out, hide it or export only the selection. If you have picked a printer, Pare 3D warns at export when something sits outside its plate.

## Snapping while moving

When you drag a shape across the workplane, it snaps to other shapes: its left, right, front or back edge or its centre lands exactly on an edge or centre of another shape. A pink guide line shows what it is holding on to. That way two parts sit flush side by side or centred one behind the other without typing numbers. It works with the grid switched off, too.

While you drag, a dashed pink line also runs to the nearest part beside the one you are moving, with the gap between them in millimetres. Let go when it shows the gap you want.

Hold [[Shift]] while dragging to keep the move on one axis: the shape follows whichever direction, X or Y, you have dragged further in, and leaves the other alone. Best press [[Shift]] once you are already dragging; on a shape that is not selected yet, a click with [[Shift]] only adds it to the selection.

With [[Alt]] already held when the drag begins, you drag a copy: the shape stays where it is and the copy lands where you let go. Pressing [[Alt]] only on the way pauses snapping; the shape then follows the grid only. A copy, too, snaps only once you let go of [[Alt]] on the way. To switch snapping off for good, use the grid menu in the bottom right ({{ui:inspector.objectSnap}}) or the settings. For now only moving on the normal workplane snaps, not lifting and not resizing.

## Aligning

Two or more selected shapes are lined up with {{ui:editor.tool.align}}: points appear around the selection for left, centre and right, front, centre and back, and top, centre and bottom. A click on a point moves all shapes there. If you first click one of the selected shapes, it stays in place and the others line up with it. A locked shape in the selection is that fixed shape by itself. Left, right, front, back, top and bottom go by the box round a shape; the centre of a triangle, a pentagon or a star is its own middle, so a hole centred on one sits in the middle of the shape and not of its box.

A shape turned at an angle, say by 45°, has its box round it to line up with, not its own edges. To line up with the edges, set a workplane on a face of that shape first ({{ui:camera.placeWorkplane}}, then click the face): the points then stand on the axes of that plane, and the shapes are measured and moved along them. Reset the workplane to line up along the plate again.

![Align shows the possible targets as dots around the selection.](shot:align)

The key is [[L]]. [[Esc]] cancels.

### Equal gaps

Beside the middle point of each line stands a wider dot with a bar on each side. It spreads three or more shapes in that direction so that the space between neighbouring edges is the same everywhere, whatever size each shape is. The first and the last shape stay where they are, the ones between move. A row of holes of different sizes gets the same wall between them, for example. Move over the dot and you see beforehand where the shapes go; the status bar then tells you the gap. Where there is not enough room between the outer shapes, the gap becomes negative and the shapes overlap evenly, as nested cups do.

If a board (a base the others stand on, such as a flat box, not an SBC board) is among the selected shapes, longer in that direction than all the others, the shapes are spread on it: the gap at its edges is as large as the one between them, and a single shape comes to its middle. Shapes in several rows, such as the animals of a peg puzzle, are spread row by row; shapes whose boxes overlap across the direction form one row. Where the shapes stand in no clean columns, as the animals do from front to back, the shapes standing side by side move as a whole row instead. The whole puzzle then takes one click from left to right and one from front to back.

Without a board, hold [[Shift]] and click an empty spot of the plate first: the plate is then the fixed shape, equal gaps spread the shapes over the whole plate with the same gap to its edges, and the other dots line them up on its edges or its middle. Another click with [[Shift]] on the empty plate lets it go. A click on empty space without [[Shift]] ends Align, as [[L]] and [[Esc]] do.

Hold [[Alt]] and click the dot to type the gap yourself, say 5 mm: the shapes line up that far apart, starting at the first shape or at the one you clicked first; on a board the row comes to its middle. A locked shape stays where it is, so one between the outer shapes stops the equal gaps. On a tablet, which has no Alt key, the switch {{ui:align.sizeSwitch}} beside the dots does the same: switch it on and the dots stay squares and the gap dot opens its field, until you switch it off.

## The Align menu

Right-click a selection and choose **{{ui:contextMenu.groupArrange}} ›** for the moves that otherwise take several clicks:

- **{{ui:contextMenu.centreTogether}}** (two or more parts) - every part on the middle of the whole selection, across the plate (X and Y); heights stay as they are.
- **{{ui:contextMenu.alignTool}}** opens Align with its dots, for edges and other alignments ([[L]]).
- **{{ui:contextMenu.centrePlate}}** - the selection, as it stands, on the middle of the workplane.
- **{{ui:contextMenu.flip}}** turns the selection upside down about its left-right axis; **{{ui:contextMenu.turnAround}}** turns it about the vertical, front to back. Something standing on the workplane is set back down on it, in the same step of undo - an upper model printed teeth up, say.
- **{{ui:contextMenu.mirrorLeftRight}}** and **{{ui:contextMenu.mirrorFrontBack}}** mirror at once, without choosing an axis; **{{ui:contextMenu.mirrorTool}}** opens Mirror with its arrows ([[M]]).
- **{{ui:contextMenu.drop}}** sets the selection down on the workplane ([[D]]).

Each is one step of undo.

## Mirroring

{{ui:editor.tool.mirror}} ([[M]], or right-click the selection and choose {{ui:contextMenu.groupArrange}} ›) flips the selection across a plane: {{ui:mirror.leftRight}}, {{ui:mirror.frontBack}} or {{ui:mirror.topBottom}}. Click the matching axis arrow. That is handy for symmetric parts: build one half, copy it and mirror the copy.

## Rotating and setting the pivot

You rotate with the curved arrows on the shape, with the numbers in the settings or with [[R]] in 45° steps. When you drag on the rotation circle, the turn snaps to every tick, that is every 22.5°; hold [[Shift]] for finer steps, and extra ticks appear every 11.25°. Drag outside the circle to turn freely in 1° steps, or in 45° steps with [[Shift]]. Normally the selection turns about its centre. Sometimes it should not, for example when a tilted tube is to be turned further at its end. For that there is {{ui:editor.tool.rotationPivot}} (under {{ui:editor.more}} in the {{ui:editor.group.modify}} group): afterwards click on a face. A flat face supplies its centre, for example the axis of a tube end. The selection now turns about that point. A second click on the tool removes it again.

The angles stay with the body. In its settings, {{ui:inspector.rotation}} shows them as {{ui:prop.rotateX}}, {{ui:prop.rotateY}} and {{ui:prop.rotateZ}}, named like the position: Y runs across the plate, Z is up. Each row has the colour of the arrow on the workplane that turns the body the same way - red about X, green about Y, blue about Z - and the arrows keep those colours from every side you look. Type an angle there and the body turns to it - about its centre, or about its own pivot if it has one. While a turned body is selected, its angles also show below it on the workplane; {{ui:workspace.showRotationAngles}} in the settings switches that off.

![A body turned about two axes: its angles stand under it, and the Rotation card in its settings takes them as numbers.](shot:rotation-card)

With **one body** selected, the pivot belongs to that body: select other parts and come back, and it is still there. It moves, turns and scales with the body, is saved in the project and comes back with Undo. Under {{ui:inspector.position}} the pivot has its own X, Y and Z, which you can type or nudge, and {{ui:inspector.pivotRemove}} takes it away. You can also drag the pivot's red marker with the mouse: it slides over the surface of the bodies and snaps to corners, edge midpoints and edges, so a hinge pin lands exactly on a corner. With several bodies selected the pivot is only for that selection, and a new selection removes it.

## Laying flat on a face

Should a part lie on its best side for printing? Select it, click {{ui:editor.tool.layFlat}} and then the face that should go down. While you move the pointer over the part, the face under it lights up, so you see which one you are about to pick; turn the view to check the other sides. The part turns so that this face rests on the workplane.

Two parts should meet face to face, or line up flush? Select the part that should move, click {{ui:editor.tool.mateFaces}}, then click its face and after that the face of the other part. In the panel, {{ui:mate.mode.against}} puts the faces against each other (back to back, touching), {{ui:mate.mode.flush}} lays them in one plane side by side; {{ui:mate.gap}} leaves room between them, for example for clearance. {{ui:mate.apply}} moves the part: it turns the shortest way until the faces are parallel - not at all if they already are - and then slides only towards the other face, so it keeps its place sideways. The other part stays where it is, and one Undo takes it all back.

![The Align faces panel: the part that moves is picked, a face of the other part comes next, then face to face or flush, and an optional gap.](shot:mate-faces)

**Holes on one axis:** {{ui:mate.mode.concentric}} lines up round faces instead: a hole over a hole, a pin in a hole, a screw in its clearance hole. Choose it before you click the faces. Then click the round inside of a hole (or the outside of a pin) on the part that moves, and a round face of the other part; the whole round face lights up while you point at it. {{ui:mate.apply}} turns the part the shortest way until the two axes are parallel and slides it straight across onto the other axis. Along the axis it stays where it was, so a pin keeps its height; push it in afterwards. This works on imported meshes too, as long as the hole is made of facets around one axis.

**An exact angle between two faces:** {{ui:editor.tool.mateFaces}} leaves the faces parallel; there is no tool of its own for an angle between them, but this gets you there. First bring the faces together with {{ui:editor.tool.mateFaces}}, so they are parallel. Then set the pivot on the edge where they meet ({{ui:editor.tool.rotationPivot}}, click the edge or a corner) and type the angle, 15 or 30 say, in the {{ui:inspector.rotation}} card of the part. It turns about that pivot. The card's axes are the axes of the plate, so this works when the edge runs along X, Y or Z.

Just as simple are {{ui:editor.tool.dropToWorkplane}} ([[D]]), which drops the selection onto the workplane, and {{ui:editor.tool.centerOnWorkplane}}. With the workplane on a face, it centres on the point you picked with [[W]] and moves the selection only along that face, so what stands on it stays on it.

[[C]] picks the selection up: it follows the mouse pointer and lies down on the face of another body you are over, sloped ones too. A click sets it down there, [[Esc]] leaves it where it was. Its underside then rests on the face, lined up with the face's edges as a new shape would be; it keeps its own turn about its up axis. Several parts travel together and keep their spacing. Over the empty plate, [[C]] stands a tilted part upright on the workplane again. Without a keyboard, the menu of a long press has {{ui:contextMenu.carry}} for the same.

## Patterns: row, grid and circle

For hole grids, bolt circles, rings of teeth or a row of pegs there is the {{ui:editor.tool.array}}. Select the shapes to be multiplied and click it in the {{ui:editor.group.modify}} group of the toolbar.

![The pattern in "Circle" mode: the copies first appear as a preview.](shot:pattern-tool)

Choose the {{ui:array.mode}}:

- **{{ui:array.mode.row}}:** the selection repeats in a line. Under {{ui:array.measure}} choose {{ui:array.measure.gap}} - the same gap between the pieces, edge to edge, whatever their size - or {{ui:array.measure.centre}}, where the row can step along X, Y and Z at once: one of them gives a straight row, two or three a diagonal row or a staircase. A negative spacing lays the row the other way.
- **{{ui:array.mode.grid}}:** copies in {{ui:array.columns}} and {{ui:array.rows}}, with the gap (or centre spacing) between them - a tray of pegs, a block of holes.
- **{{ui:array.mode.circle}}:** the selection is spread around a centre. {{ui:array.count}} sets how many there are, and the {{ui:array.angle}} is 360° for a full circle. Choose whether the copies turn with the circle or keep their orientation. {{ui:array.rise}} lifts every copy a little more than the one before (a screw or an ascending spiral), and {{ui:array.radiusChange}} moves it further from the centre or closer to it (a flat spiral); together they give a conical spiral. A spiral winds once around at most, and there are at most 100 copies.

### Dragging the copies

You do not have to type the numbers. The copies show at once as a preview, and you can grab one with the mouse:

- In a row or a grid, drag a copy further away or closer: the spacing follows, and the readout beside the pointer shows it. Copies further along keep in step.
- In a circle, drag a copy round: the total angle follows, so a half circle or a fan of teeth is one drag.
- While dragging, [[+]] and [[-]] add a copy or take one away.
- [[Enter]] or {{ui:array.apply}} makes the copies; [[Esc]] closes the tool without them.

Tip: first set the pivot on a face with {{ui:editor.tool.rotationPivot}}, then the centre of the circle lies exactly there.

![The pattern in "Circle" mode with a rise and a radius change per copy: the copies climb and widen like a spiral.](shot:pattern-spiral)

Only {{ui:array.apply}} (or [[Enter]]) creates the copies. If they are holes, group them afterwards with the body they should cut into.

## Hole pattern on a face

For vents, speaker grilles, baskets and enclosures the {{ui:holePattern.title}} spreads holes evenly over a flat face or round the wall of a cylinder. You no longer have to make one hole, repeat it and set it onto the wall. Select exactly one body and click {{ui:holePattern.title}} in the toolbar. You can also right-click the body, or find it with [[Ctrl]]+[[K]].

1. Click a flat face of the body. The whole flat face around your click counts, not just the triangle under the pointer. The round wall of a cylinder, a tube or a bore works too, see below; any other curved face does not: you get a hint and click a flat one instead. On a group or a bundle a face runs on across parts that meet, as on one body; on a bundle only when no hole is among them. The parts are joined shortly after the tool opens; until then only one part's face lights up under the pointer, and a click waits for the join. On a group or bundle with text in it, only one part's face lights up, and the click joins the parts.
2. In the window, set how the holes look and lie:
   - **{{ui:holePattern.form}}:** {{ui:holePattern.form.round}}, {{ui:holePattern.form.square}}, {{ui:holePattern.form.rectangle}}, {{ui:holePattern.form.hexagon}} or {{ui:holePattern.form.slot}}.
   - **Size:** the {{ui:holePattern.size.diameter}} of a round hole, the {{ui:holePattern.size.side}} of a square one, {{ui:holePattern.size.width}} and {{ui:holePattern.size.height}} for a rectangle and a slot. For the hexagon the size is the {{ui:holePattern.size.corners}}.
   - **{{ui:holePattern.holeAngle}}:** {{ui:holePattern.form.square}}, {{ui:holePattern.form.rectangle}}, {{ui:holePattern.form.hexagon}}, {{ui:holePattern.form.slot}} (a square at 45 is a diamond): turns every hole in the face by that many degrees, counter-clockwise as you look at the face, from -90 to 90. The rows stay straight; if turned holes would come too close, even diagonally, Pare 3D widens the spacing and the row spacing so a wall stays between them.
   - **{{ui:holePattern.holeTilt}}:** flat faces only, not with a counterbore, countersink or own shape: slopes every hole through the wall, from -60 to 60 degrees. On a standing wall a positive slope puts the inner end higher, so rain runs back out. The size stays the hole's own, so it shows a little longer on the face; both ends of each hole keep the margin. A slope only hides the inside when the wall thickness times sin(angle) is at least the hole's height, so use low slots or a thicker wall for that.
   - **{{ui:holePattern.form.custom}}:** repeats a shape from the scene in place of a hole: a rivet, a stud or the tread of a diamond plate. Choose it under {{ui:holePattern.customShape}}. Its width and depth are the room it takes; it stands upright on the face as it was made, without its own turn. A body is set onto the face and joins it, a hole is cut in as deep as it is high. The shape itself stays where it is.
   - **{{ui:holePattern.holeType}}:** round holes only. {{ui:holePattern.holeType.plain}} is a straight hole, {{ui:shape.counterbore}} adds a pocket for a cap screw's head, {{ui:shape.countersink}} a 90° cone for a countersunk screw. The size is then the {{ui:prop.screwHoleShaft}}; {{ui:prop.screwHoleHead}} and, for the counterbore, {{ui:prop.screwHoleHeadDepth}} set the head. {{ui:prop.screwHoleSize}} fills them all in for a metric screw. On a countersink it also offers the inch sizes #2 to #14, whose cone has 82°.
   - **{{ui:holePattern.spacing}}:** the distance from one hole's middle to the next. If it is smaller than the holes allow, Pare 3D raises it to the smallest possible value so a wall stays between the holes. For rectangles and slots it counts along the row, from left to right.
   - **{{ui:holePattern.rowSpacing}}:** rectangles and slots only: the distance from one row to the next. So narrow, tall holes stand close side by side while the rows keep apart. A hole 2 mm wide and 14 mm high needs 4 mm along the row and 16 mm from row to row with a 2 mm wall.
   - **{{ui:holePattern.wall}}:** the same distance said another way: the wall left between two neighbouring holes, which is the wall thickness in the print. Set it and the spacing centre to centre follows (for rectangles and slots the row spacing too), and the other way round. For hexagons, rectangles and slots Pare 3D measures the least distance between their edges.
   - **{{ui:holePattern.arrangement}}:** {{ui:holePattern.arrangement.grid}} puts the holes in rows and columns. {{ui:holePattern.arrangement.staggered}} shifts every second row by half a spacing and moves the rows closer, so every hole has neighbours at the same distance - with hexagons that makes a honeycomb.
   - **{{ui:holePattern.arrangement.perimeter}}:** a ring of holes along the outer edge of the face instead, {{ui:holePattern.margin}} in from it - screw holes round a lid or a plate. {{ui:holePattern.perimeterBy}} {{ui:holePattern.perimeterBy.spacing}} keeps about the spacing, {{ui:holePattern.perimeterBy.count}} sets the {{ui:holePattern.perimeterCount}}; either way the spacing is evened out so the ring closes without a gap. {{ui:holePattern.perimeterCorners}} (on at first) puts a hole on each corner and shares every side out evenly between them. On a round face, or with the box unticked, the holes go evenly round from the top, and {{ui:holePattern.perimeterStart}} moves the whole ring along the edge.
   - **{{ui:holePattern.centerHole}}:** with {{ui:holePattern.arrangement.perimeter}} and on the {{ui:holePattern.mode.mounting}} tab (not for a 19-inch rack). Tick it for one more hole in the middle of the face, like the others - the drain holes in the floor of a plant pot, say. It does not count in the number of holes. For plain round, square and hexagon holes, {{ui:holePattern.centerHoleOwnSize}} lets you set the {{ui:holePattern.centerHoleSize}}. Where the middle of the face is open, or the hole would come too close to the others, it is left out and a line says so.
   - **{{ui:holePattern.margin}}:** the clear distance between the holes and the edge of the face. Only holes that lie wholly inside the face minus this margin are made; anything that would reach beyond it is left out. The margin also holds around openings in the face. At 0, plain through holes in a grid or staggered pattern are cut off by the edge instead of left out, so a grille or a honeycomb runs right to the edge (a hole that would only scratch the edge is left out; counterbores, countersinks, blind holes, own shapes and the round wall keep to the face). A line under the field says so.
   - **{{ui:holePattern.edgeBorder}}:** shown only at margin 0, 0 to 10 mm. Above 0 a solid frame that wide stays along the edge and round the face's openings, and the holes are cut off where it starts, so the edge is smooth. The frame is a body of its own ("Frame"), as thick as the body behind the face, grouped with the perforated body. Of the ways to lay the lattice the one leaving the fewest strips thinner than the walls between the holes wins; a line counts any that are left, and a slightly different size or spacing moves them.
   - **{{ui:holePattern.topLayer}}:** for flat faces and plain holes. Tick it and give {{ui:holePattern.topLayerThickness}} (1 mm to start with) and {{ui:holePattern.topLayerColor}}: the holes go through that layer only. On Create the body becomes a bundle of two bodies, the net in the chosen colour (with the frame, if any) and the body less the net in its own colour, solid below and filling the net's holes up to the face. So the face is flat, and printed face down both colours start on the first layers, with nothing to bridge and no supports in the cells. The 3MF holds the two as separate bodies in their colours.
   - **{{ui:holePattern.depth}}:** {{ui:holePattern.depth.through}} (the default) cuts through the whole wall. With {{ui:holePattern.depth.custom}} you give the depth in millimetres, for recesses, say.
3. The holes show at once as a preview on the face and follow every value. The window says how many holes fit. {{ui:holePattern.repick}} chooses another face, [[Esc]] closes the tool, and like the other tool windows it moves by its title bar.
4. Only {{ui:holePattern.apply}} makes the holes.

The holes are ordinary holes grouped with the body, just as after {{ui:editor.tool.group}}: nothing is baked in. {{ui:editor.tool.ungroup}} dissolves the group again and frees every hole, which you can then move, change or delete one by one. The whole thing is one step for {{ui:editor.tool.undo}}. The tool does not make more than 400 holes at once; make the holes bigger or the spacing wider then.

The round wall of a cylinder, a tube or a bore takes holes too: a pen holder, a lamp shade, a tube with vents. Click the wall instead of a flat face; the whole wall lights up under the pointer. Every hole then points straight at the axis, and the rows go round the wall. On a wall that goes all the way round, each row holds a whole number of holes, evened out so the ring closes without a gap and never closer than the spacing; the window says how many go round and how far apart. The margin holds to the rims at the top and the bottom and to openings in the wall, on a part of a wall (a rounded edge, say) to its sides as well. {{ui:holePattern.depth.throughWall}} cuts through the one wall you clicked and leaves the far side of a tube whole; on a solid cylinder the holes go in to its middle. Clicked inside a bore, the holes go outward through its wall. {{ui:holePattern.arrangement.perimeter}} is for flat faces and is not offered on a wall.


On a plate or lid with notches in its sides, {{ui:holePattern.arrangement.perimeter}} spreads the holes unevenly. For that the {{ui:holePattern.title}} has a second tab next to {{ui:holePattern.mode.pattern}}, {{ui:holePattern.mode.mounting}}: it puts the holes in the corners of the smallest rectangle round the picked face, the same distance from its sides, even on a turned or notched plate. The {{ui:holePattern.mounting.distance}} is measured to the hole's edge, a screw head included, or with {{ui:holePattern.mounting.toCenter}} to its middle. With the {{ui:holePattern.mounting.count}}, four go in the corners and the rest in pairs, evenly spaced along the sides, for example for a watertight lid. On a round face, such as the lid of a round box, they go evenly round a circle, three or more. Hole type and sizes are the same as for the pattern: plain, counterbore or countersink, through or to a depth.
On the {{ui:holePattern.mode.mounting}} tab, {{ui:holePattern.mounting.for}} offers {{ui:holePattern.rack.screws}} (as above) or {{ui:holePattern.rack.option}}, for a front panel that goes into a 19-inch rack. Four slots of 10.3 × 6.8 mm go in the corners, lying along the panel's long side, 465.1 mm apart across, so they meet the rack's rails; the hole type, sizes and distance do not apply then. {{ui:holePattern.rack.size}} is {{ui:holePattern.rack.fit}} to start with: the panel takes the fewest whole rack units it fits in and sits in their middle, so the upper and lower holes are the same distance from its edges and meet the rail's holes on any unit. Or pick a standard panel from 1U to 6U, with its holes as IEC 60297-3-100 has them; a note says when the face is not that height. A line under the choice tells where the holes came out, and on a face too narrow or too low, why there are none.

## Hole for a thread insert

A heat-set thread insert is pressed into a plastic part with a soldering iron and gives screws a thread that does not wear out. The {{ui:threadInsert.title}} makes the hole for it where you click and tells you first whether the part has enough material there. Select exactly one body, click {{ui:threadInsert.title}} in the toolbar, next to {{ui:holePattern.title}}. You can also find it with [[Ctrl]]+[[K]]. Unlike the other shapes it cannot be dragged into the design, because it works on the body you selected.

1. Choose the {{ui:threadInsert.size}} in the window: M2 to M8, the short M3, M4 and M5, or 1/4-20. With {{ui:threadInsert.custom}} you type the hole diameter and the length of the insert; the wall that has to stay round the hole follows from the diameter. The window shows the hole's diameter and depth and that wall.
2. Click the spot on the part. A flat face works, and so does the outside wall of a cylinder or tube; any other curve is refused with a hint. A ring shows the hole: green where the part has the wall beside the hole and the depth behind it that the insert needs, red where one of them falls short. Red says which one and by how much, and how wide the part has to be round the hole.
3. Move the ring by dragging over the part, or type the distance from the left and the bottom edge of a flat face under {{ui:threadInsert.position}}. {{ui:threadInsert.center}} puts it on the middle of the face, where the purple mark shows it. Every move is measured again.
4. {{ui:threadInsert.repick}} chooses another spot, and [[Esc]] closes the tool. Only {{ui:threadInsert.apply}} makes the hole, and only where the ring is green.


## Magnet pocket

Figure painters set small round magnets into the joints of a multi-part figure instead of gluing it, so it comes apart for painting and shipping; boxes and lids hold the same way. The {{ui:magnetPocket.title}} tool cuts the pocket for one: as deep as the magnet and 0.2 mm more, so it sits just below the face, and below it a narrower glue well, so the glue has room and the magnet rests on a ledge and cannot slide on into a hollow print. Cut out of the part, pocket and well are an inverted top hat. Select exactly one body, click {{ui:magnetPocket.title}} in the toolbar, next to {{ui:threadInsert.title}}, or find it with [[Ctrl]]+[[K]].

1. Choose the {{ui:magnetPocket.size}}, from 2 × 1 to 12 × 3 mm, or type the magnet's diameter and height. {{ui:magnetPocket.gap}} is the room round the magnet on each side, 0.1 mm to begin with. {{ui:magnetPocket.well}} is on at first. The window shows the pocket's measures.
2. Click the spot on the part, a flat face or the outside wall of a cylinder or tube, as for the thread insert. A ring shows the pocket: green where the part has a 1 mm wall beside it and its depth behind it, red where not, with the reason. Drag it over the part, type its place, or move it to the middle of the face.
3. {{ui:magnetPocket.both}} (on at first) looks for the part that meets the face at that spot, at most 1 mm away: the other half of the joint, standing where it fits, as the parts of a figure come from the sculptor. That part gets the same pocket facing this one, so the two magnets meet; a second ring shows it. A line in the window names the part, or says why it gets none (no part there, a curved face, too little material). To reach a face the other part covers, hide that part: it still gets its pocket.
4. Only {{ui:magnetPocket.apply}} cuts the pockets.


## Pushing a face out or in

For a thicker wall, a raised pad on a face or a pocket cut into it, the {{ui:faceTool.title}} tool works on one flat face, the way Press/Pull does in Fusion. It works on an imported STL too, where there is no sketch to change. Select exactly one body and click {{ui:faceTool.title}} under {{ui:editor.more}} in the {{ui:editor.group.modify}} group of the toolbar. You can also right-click the body, or find it with [[Ctrl]]+[[K]].

### With the mouse

1. Press on a flat face of the body and hold the button down. The whole flat face around the pointer counts, not just one triangle; a curved face does not work.
2. Drag out of the body to add material, or into it to cut a pocket. The body changes as you move, and a label beside the pointer shows the distance: **+** going out, **−** going in. It follows the grid's snap step; hold [[Shift]] for steps of 0.1 mm.
3. Want an exact number? Type it while you are still holding the button - say 12, or -3 for a pocket - and the label shows it with ↵. [[Backspace]] takes back a digit. A number without a sign keeps the way you were dragging.
4. Let go. The new part stays as a preview, still open to change: grab the face again and drag on, or use the controls in the window. [[Esc]] while dragging puts the face back where it was.
5. [[Enter]] or {{ui:faceTool.apply}} makes it.

### With the window

Instead of dragging, click the face once and set it in the window:

- **{{ui:faceTool.direction}}:** {{ui:faceTool.direction.out}} for material standing on the face or {{ui:faceTool.direction.in}} for a pocket cut into it. A pocket goes no deeper than the body behind the face; on a hollow body it can still reach the cavity.
- **{{ui:faceTool.inset}}:** how far the new outline stays inside the face's edge. Going out, 0 takes the whole face, which makes a wall thicker. Openings in the face grow by the same amount.
- **{{ui:faceTool.radius}}:** rounds every corner of the outline, the inner ones too, so a sharp tip ends in an arc. A notch narrower than twice the radius closes, and a part of the face narrower than twice the inset and the radius together is left out.
- **{{ui:faceTool.height}}** (out) or **{{ui:faceTool.depth}}** (in): how far the new part stands out of the face, or how deep the pocket goes.
- **{{ui:faceTool.separate}}:** with the switch on, the new part (or the hole of a pocket) is a body of its own beside the body instead of a group with it, so you can resize it, move it or use it to cut at once.
- **{{ui:faceTool.offsetX}}** and **{{ui:faceTool.offsetY}}:** slide the shape across the face to fine-tune where it sits - right and up as you look at the face from the front of it (on a face that looks up or down, up is towards the back). {{ui:faceTool.recentre}} puts it back.

The drag and the window work together: drag the depth roughly, then round the corners with the radius, and the preview follows each change. {{ui:faceTool.repick}} chooses another face.

### What you get

What the tool adds is an ordinary sketch body, grouped with the body unless {{ui:faceTool.separate}} is on (then the part is free to resize, move or use as a hole): nothing is baked in. {{ui:group.edit}} opens the group, and {{ui:inspector.editSketch}} on the new part shows the outline it follows. On the top or the bottom of a plain sketch body - one area, not grouped, mirrored, tapered, twisted or leaning, and without a stroke, key ring, fillet or chamfer - that is the body's own outline, so its lines and arcs stay exact for the edge tools and the STEP export. On any other face, and on every face of an imported mesh, the outline follows the face's triangles, and a curve is made of short straight pieces. A pocket that runs right across the face takes off exactly the depth you set. The whole thing is one step for {{ui:editor.tool.undo}}.

To round the new edges afterwards, use {{ui:editor.tool.fillet}} on the group and click the top face of the new part to pick its edges (see [Chamfering and filleting edges](chapter:edges-and-hollowing)). Like every edge treatment on a group, it joins the group into one body.


## Spacing parts out

{{ui:distribute.title}} in the arrange group of the toolbar lines up several parts with even gaps. Select the parts, click it and choose the axis under {{ui:distribute.along}}:

- **{{ui:distribute.even}}:** the two outer parts stay put; the ones between get equal gaps. It needs at least three parts.
- **A set {{ui:distribute.gap}}:** every part the gap you type from the next, edge to edge, starting from the first one.
- **{{ui:distribute.arrange}}:** all the selected parts in tidy rows on the plate, centred, with the gap between them - handy before exporting a plate of parts.

## Changing several parts at once

With several parts selected, a {{ui:selectionSize.title}} card shows how wide, deep and tall they are together. Type a new size there and every part scales with it, the gaps between them too, as if the selection were one part.

With several parts selected, the properties panel on the right shows how many there are and offers what applies to all of them together: {{ui:inspector.solid}} or {{ui:inspector.hole}}, one colour for all (a click on {{ui:inspector.solid}} opens the colours) and the lock. With a mixed selection, one click makes them all solids or all holes. If any of the parts is locked, only the lock can be used. Sizes are changed with the handles, with {{ui:scalePercent.title}} or by typing a number into a size label. With several parts the number is the size of the whole selection: every part grows with it, the spaces between them too, as when you drag a handle. Solid and hole also work with a right-click or the [[S]] and [[H]] keys.

To work on a scan or another mesh without resizing it by accident, right-click and choose {{ui:contextMenu.hideHandles}}: the resize and turn handles, the sizes and their lines are put away, and the part can still be selected, moved and worked on with the mesh tools. {{ui:contextMenu.showHandles}} in the same menu brings them back, and they are back anyway the next time Pare 3D opens. While {{ui:sculpt.title}} is open they are put away by themselves and come back when it closes.

## Scaling by percent

To make one or several parts larger or smaller by the same share, say all the parts of a print file by 20 %, use {{ui:scalePercent.title}}. Select the parts, right-click them and choose {{ui:scalePercent.title}}, or search for it with [[Ctrl]]+[[K]].

Under {{ui:scalePercent.percent}} you type the new size as a percentage of the current one: 120 % is a fifth larger, 50 % half the size. Width, depth and height change alike, so the proportions stay. The bottom stays where it is, so nothing sinks into the plate.

With several parts you choose how they grow:

- **{{ui:scalePercent.mode.together}}:** The parts grow around their common centre, and the gaps grow with them. The whole becomes larger as if it were one part.
- **{{ui:scalePercent.mode.each}}:** Every part grows where it stands, and the gaps between them stay the same.

The percentage field has the focus when the window opens, so from the keyboard it is [[Ctrl]]+[[K]], the percentage, [[Enter]]; [[Esc]] closes the window. Only {{ui:scalePercent.apply}} (or [[Enter]] in the field) changes the design, and one step back undoes it. With a locked part in the selection it does not open.

## Undoing

{{ui:editor.tool.undo}} ([[Ctrl]]+[[Z]]) and {{ui:editor.tool.redo}} ([[Ctrl]]+[[Shift]]+[[Z]] or [[Ctrl]]+[[Y]]) step through your history. How many steps travel with the saved design you set in the settings under {{ui:workspace.history}}. Point at either button and its tooltip names the step it would take back or bring again, with the measure where the step has one, such as "Rounded the edges of Box (5 mm)" or "Moved 3 objects (12 mm)"; the message after the step says the same. To go back several steps at once, use the history view below.

## Looking back: the history view

{{ui:editor.tool.history}}, next to undo and redo, opens a view of your history without changing anything. The work area shows the design as it was, and a slider at the bottom runs through every undo step: all the way to the right is the current state, each step to the left is one undo earlier, and states you have undone sit to the right of the current one. The arrow keys step through the states, [[Esc]] returns to the current state. The mouse wheel over the slider does the same, one state per notch, up to an earlier one; [[Page Up]] and [[Page Down]] jump ten states, [[Home]] goes to the oldest state and [[End]] back to the current one. You can turn and zoom the view meanwhile and click objects to bring them back (see below), but nothing can be moved; the design itself stays exactly as it is. If the bar covers something, drag it away by its title bar; a double-click on it brings it back. The list button in the title bar shows every step by name in a list, the newest at the top: a click on a step goes to that state, the state the design is at is marked {{ui:historyView.listNow}}, and steps you have undone are grey. The list stays open the next time if you leave it open.

Two things you can take along from an earlier state. {{ui:historyView.createProject}} puts that state into a new design in the overview, named after this one with the time of that state in brackets - a design saved before Pare 3D recorded times says "copy" instead - and with the history up to that point, so undo keeps working there. {{ui:historyView.export}} opens the usual export with that state as the design, so you can save it as STL, 3MF, STEP, a picture or a LYL file with the history up to that state.

You can also bring single objects back into the design. Click an object in the state shown - [[Shift]]+click adds more or takes one off again, a click on empty space picks nothing - and choose {{ui:historyView.bringBack}}. The view closes and a copy of each object lands in the current design exactly as it was in that state and at the spot it had there, selected, next to whatever the design holds now; nothing else changes. It is one step, so undo takes it back. Use it for a version of a part you changed since, or for one you deleted. A group comes back whole; notes and reference points on an object stay behind. Its name carries the time of that state, such as “Box (12:32)”, so it is easy to tell from the version the design has now. To bring back a part from inside a group, select the group and choose {{ui:historyView.openGroup}} or press [[E]], as in the design: its parts are laid out where editing the group would put them, ready to pick, and the bar says which group you are in. {{ui:historyView.backOut}} closes it again. This is only to look - the group, the design and the history stay as they are.

{{ui:historyView.delete}} sits alone at the bottom left of the bar. After a question it removes every earlier step for good: the design keeps the state it has now (not the one shown), Undo has nothing to go back to and a file saved afterwards carries no history. Use it to share a design without its past, or to start the undo steps over. It cannot be undone; to share a file without touching your own design, choose {{ui:export.historyNone}} when exporting instead.
