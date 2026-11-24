---
title: Preparing for 3D printing
summary: Choosing your printer, checking the design before you print, splitting parts that are too big, holes that fit, and sending the design to Bambu Studio.
---

## Choosing your printer

Open the settings (the cogwheel in the title row, {{ui:editor.workspaceSettings}}) and switch to the area {{ui:workspace.workplane}}. Under {{ui:workspace.printer}} you pick your printer from a list of over 230 common models, including Bambu Lab, Prusa, Creality, Anycubic, Elegoo and many more.

![The workplane settings with a printer chosen. Print bed and maximum print height come from the slicer profile.](shot:settings-workplane)

Three things happen:

- The workplane takes the size of the print bed.
- In the corner of the workplane appear the printer's name and its build volume. If the writing gets in the way, switch it off with {{ui:workspace.showPlateLabels}} under {{ui:workspace.workplane}}; that also goes for the design's name at the front left.
- Pare 3D **warns** when something does not fit.

Most printer profiles come from OrcaSlicer. If you would rather work without a printer, choose {{ui:workspace.printerNone}}. You can also set the size of the workplane by hand.

Delta printers such as those by FLSun or SeeMeCNC, or the Anycubic Predator, print on a round plate. With one of them the workplane is round too, as wide as the plate, and a body is too large as soon as it reaches past the rim. A round body is measured by its own outline, not by the box round it, so a cylinder nearly as wide as the plate still fits.

## When something does not fit

A body that sticks out over the edge of the print plate is marked. A message tells you which sides overhang and by how much. It is the same if the part is **too tall**: the height counts from the lowest body, just as the slicer sets the model down.

![The box is wider than the print bed of the Bambu Lab A1 mini. The message at the bottom says by how much.](shot:printer-overhang)

The warning does not stop you from working on. It is a hint so you do not find out only in the slicer that the part is too big. A part that is too big can be split: {{ui:splitToFit.button}} (in the {{ui:printCheck.title}} check, below, or from [[Ctrl]]+[[K]]) cuts it into as few pieces as fit the plate and adds dowel pins and matching holes so the pieces line up when you glue them. To choose the cut yourself, use {{ui:editor.tool.split}}.

If you park parts beside the plate on purpose, click the small cross in the message. The warning is then gone for exactly these bodies. Once one of them fits again and you move it out later, or another body sticks out, the message comes back. Hidden bodies never count, so hiding the parked parts works as well.

## Laying the part right

How a part lies on the plate decides its strength and looks. Two tools in the {{ui:editor.group.arrange}} area help:

- {{ui:editor.tool.layFlat}}: click a face and the part lies with that side down. The best print direction in one click.
- {{ui:editor.tool.dropToWorkplane}} ([[D]]): sets the part on the workplane when it floats somewhere in the air.

A few rules of thumb for direction:

- Large flat faces down. They stick best.
- Lay long, loaded parts so the layers do not run perpendicular to the load. Layers are the weakest direction.
- Avoid overhangs steeper than 45°, or give them supports in the slicer.

## Finding overhangs

In the menu next to the eye ({{ui:editor.group.visibility}}), **Show overhangs** switches the overhangs on. Every face that points down more steeply than 45° is then hatched red and white - that is where the printer would need supports. What rests on the plate stays clear. So you see while designing whether a sphere, an arch or a horizontal hole prints without supports; the [teardrop hole](chapter:threads-and-mechanics) is made for exactly that. Turn the part or lay it on another face with {{ui:editor.tool.layFlat}}, and the hatching follows at once.

How steep your printer manages is set in the settings under {{ui:workspace.appearance}}: from 30° (careful) to 70° (for printers with good part cooling). A face resting on another body is still marked - Pare 3D only looks at the face itself.

## Cut below the bed

Sometimes you sink a part partly below the plate on purpose, to give a round or uneven part a flat base. The slicer cuts off whatever is below the plate. {{ui:cutBelowBed.button}} does the same in Pare 3D, so you see what will print: each part that sinks below the plate is grouped with a hole box filling everything under the plate beneath it. With nothing selected, every part is cut; otherwise the selected ones. It stays an ordinary group - {{ui:editor.tool.ungroup}} takes the cut back. Find it in {{ui:printCheck.title}}, or search for it with [[Ctrl]]+[[K]].

## Checking clearance

Parts that should move after printing - a flexi dragon, a hinge printed in place, a box and its lid, an axle in its bore - need a gap between them. Too little, and they stick together; overlapping, they print as one piece. {{ui:editor.tool.clearance}}, at the end of {{ui:editor.group.arrange}}, checks that before you print. It takes the selected objects, or every visible object when nothing is selected (the same ones an export takes), and checks each pair:

- **{{ui:clearance.kind.overlap}}** (red): the two share a volume. It shows red inside the bodies, which turn see-through, and the list says how large it is.
- **{{ui:clearance.kind.touching}}** (red): they touch and fuse when printed.
- **{{ui:clearance.kind.tight}}** (orange): the narrowest gap is smaller than {{ui:clearance.threshold}}.
- **{{ui:clearance.kind.fine}}** (green): the narrowest gap is at least that wide.

Each row names the two parts and, for a gap, its width and where it lies: {{ui:clearance.direction.side}} (within one layer) or {{ui:clearance.direction.layer}} (above or below: there the slicer can only leave whole layers free, so a gap thinner than one layer closes). Click a row: the camera goes there, both parts are outlined, and a line with the number marks the narrowest place. Pairs further apart than 5 mm are not listed. Nothing in the design changes: the check saves nothing and leaves nothing to undo.

{{ui:clearance.threshold}} starts at 0.3 mm; 0.3 is tight, 0.4 usual for a print in place. Changing it sorts the list again at once, without a new check, and the browser keeps the value. {{ui:clearance.splitParts}} (on to start) checks the separate parts of one object against each other too: a flexi dragon or a hinge imported as one STL is one object, but its links are separate parts. They are listed as "Name · Part 2". A part inside a cavity of another, a ball in a cage, is a part of its own.

If you change the design while the panel is open, it shows {{ui:clearance.stale}}; click that or {{ui:clearance.checkAgain}}. [[Esc]] or {{ui:clearance.close}} closes the panel. Scaling changes the gaps too: a flexi model scaled to 70 % keeps 70 % of its gaps, so check again after scaling.

The check measures the triangle mesh the slicer gets. A round axle and its bore are polygons with their corners on the circle, so a gap can come out a few hundredths smaller than the round numbers. A pair with too many triangles is listed as {{ui:clearance.kind.unchecked}}. An AI runs the same check with `Pare 3D_check_clearance`.

## Print analysis and layer view

{{ui:editor.tool.layerCheck}}, next to {{ui:editor.tool.clearance}} in the toolbar, goes one step further: it cuts the selected objects (or every visible one) into the layers your printer lays down and compares each layer with the one below, all in one go. You do not have to page through layers to find a problem: the window lists its **findings**, problems (red) first, then hints (yellow), from the bottom up. Each line says where and how bad, for example "Layer 83–97 (16.6–19.4 mm): Overhang 62°, 1.4 cm²", and what helps. Layers in a row with the same problem at the same place make one finding.

Before it looks at layers it checks the whole: a part that reaches into the print bed ({{ui:finding.kind.inBed}}; layers below the workplane are not counted), a part that floats above it, a mesh that is not closed, a part larger than the printer chosen in the settings. Then, layer by layer: {{ui:finding.kind.unsupported}} (a place that starts with nothing under it, such as the arms of a T), {{ui:finding.kind.overhang}} (a hint from 45°, a problem from 60° from the vertical), {{ui:finding.kind.bridge}} (a hint from a span of 10 mm), {{ui:finding.kind.thinWall}} (under two lines of the nozzle), {{ui:finding.kind.smallIsland}} (a separate place under 2 mm² that goes on for 2 mm or more) and {{ui:finding.kind.adhesion}}. Choose {{ui:layerCheck.layerHeight}} and {{ui:layerCheck.nozzle}} at the top; the limits are under {{ui:layerCheck.advanced}}. Places under 0.05 mm², such as a tip or the last layer, are not rated. The check runs in the background with a bar; {{ui:layerCheck.stop}} stops it at once.

Click a finding: the **layer view** opens at the first layer it concerns, the camera goes to the place, the place is painted red or yellow on the layer, and the layers below stay visible. The slider stands upright beside a profile of the cross-section over the height; marks at its side show where findings are, a click on one jumps there. On the slider, [[↑]] and [[↓]] move one layer, [[Page Up]] and [[Page Down]] ten, [[Home]] and [[End]] go to the ends, [[Space]] plays, [[N]] goes to the next finding and [[Shift+N]] to the one before. {{ui:layerCheck.view.mode}} shows {{ui:layerCheck.view.mode.upTo}}, {{ui:layerCheck.view.mode.only}} or {{ui:layerCheck.view.mode.range}}; the layers still to come can show as a faint shadow. Where Pare 3D has a tool for the finding, a button opens it: {{ui:finding.action.dropToPlate}}, {{ui:finding.action.layFlat}} or {{ui:finding.action.supportRib}}. After a change the list is marked as out of date until you click {{ui:layerCheck.checkAgain}}. Closing the window puts the camera back where it was. This is no slicer preview: supports, infill and print time come from your slicer.

## Holes that fit

A printed hole comes out a little smaller than drawn, so a 5 mm peg will not go into a 5 mm hole. Give the hole the clearance in its size - for a 5 mm peg that should slide, make the hole 5.2 to 5.4 mm - or let the slicer do it for every hole at once (in Bambu Studio: X-Y hole compensation, under Quality).

As a rule of thumb:

- about 0.1 mm larger: the part goes in firmly and stays put;
- about 0.2 mm: slides in and out, for lids and pegs;
- about 0.4 mm: turns or moves freely, for hinges and axles.

### Finding your printer's own fit

Every printer is a little different. {{ui:fitTest.title}} in **Ready-made parts** finds yours: {{ui:fitTest.make}} puts a strip of holes, each a little bigger than the last, and a peg on the plate. Print both and try the peg in each hole: the tightest one it slides into without forcing tells you the clearance your printer needs.

Brims and mouse ears against warping are set in the slicer too, so Pare 3D leaves them to it.

## Ready to print?

Before you send a design to the printer, {{ui:printCheck.title}} looks it over for the things that spoil a print, and says which part each one is on:

- a part that goes past the edge of the plate - with {{ui:splitToFit.button}} right there;
- a part that sinks below the plate - the slicer cuts that off - with {{ui:cutBelowBed.button}} right there;
- a part floating in the air with nothing under it;
- a hole on its own, which cuts nothing until it is grouped with a part;
- a wall too thin to print;
- overhangs that will need supports ({{ui:printCheck.showOverhangs}} hatches them);
- hidden parts, which are not exported.

{{ui:printCheck.select}} selects the part in question so you can fix it. It runs before every export while **{{ui:exportWindow.checkFirst}}** is ticked in the {{ui:editor.export}} window; search for {{ui:printCheck.title}} with [[Ctrl]]+[[K]] to run it on its own.

## Sending to Bambu Studio

The blue **{{ui:editor.export}}** button in the title row (or [[Ctrl]]+[[E]]) opens one window for the whole step, filled in with what you chose last:

![The Export window: open in a slicer, file type, file name and folder, and the Export button.](shot:export-window)

- **{{ui:exportWindow.openIn}}**: {{ui:exportWindow.justSave}}, or a slicer - for filament Bambu Studio, OrcaSlicer or PrusaSlicer, for resin PreForm (Formlabs), CHITUBOX or Lychee Slicer. A slicer the app cannot find on this computer is greyed out and marked "{{ui:slicer.notFound}}". In a web browser, or in an app older than its pages, the app cannot tell which slicers are installed: then every slicer can be chosen, the file is saved for it, and the window says how to open it. Tick **{{ui:exportWindow.makeDefault}}** to have the window start on this choice; otherwise it holds for this export only.
- **{{ui:exportWindow.fileType}}**: **3MF** keeps each part with its colour (for multicolour prints; the resin slicers read 3MF too), **STL** is one merged body. {{ui:exportWindow.moreFormats}} opens the full export panel described in [Files and saving](chapter:files-and-saving).
- **{{ui:exportWindow.parts}}** (with more than one part): **{{ui:exportWindow.parts.separate}}** writes one file in which parts that touch become one body and the rest stay bodies of their own, so the slicer can move and orient each, **{{ui:exportWindow.parts.joined}}** makes them one body, and **{{ui:exportWindow.parts.files}}** writes a file for each part, named after it (a slicer opens one file, so this goes with {{ui:exportWindow.justSave}}).
- **{{ui:exportWindow.saveTo}}**: the file name (the design's name to start with) and the folder for exports; {{ui:files.change}} picks another folder, which is then kept, as in the settings.

The button says what happens: {{ui:exportWindow.export}}, or "Export and open in" the slicer. The file is saved in the folder and opened from there; a second export with the same name gets a number instead of replacing the first. In a web browser a page cannot open another program, so the file is downloaded and you open it in the slicer yourself. An app installed before build 70 sends only to Bambu Studio; download the app again once for the others.

Switch on {{ui:printCheck.menuItem}} in the same menu and {{ui:printCheck.title}} runs each time you send. If it finds something, you can fix it first or choose {{ui:printCheck.sendAnyway}}.

## Support ribs for a tilted part

A part printed tilted on one edge, at 45° say, often needs no supports: its faces are steep enough. But it stands on a thin edge and can fall over. The {{ui:supportRib.title}} holds it: a thin rib stands under its lower face a small gap away, on an oval foot, and tiny bridges hold the part to it. Turn the part onto its edge first and let it stand on the plate.

1. Select the part and choose {{ui:supportRib.title}} under the Modify group's More button, right-click the part, or find it with [[Ctrl]]+[[K]].
2. Click the lower face where the rib should stand. The face must look down, slope between 15° and 75° and reach down to the plate; the rib stands straight down the face from your click. If the part's bottom edge is rounded or chamfered, the face may stop up to 3 mm above the plate: click the flat face above the rounding.
3. Set {{ui:supportRib.nozzle}}, {{ui:supportRib.layerHeight}} and {{ui:supportRib.firstLayer}} as in your slicer. The rib is two lines of the nozzle thick, the gap to the part half a line; each bridge is one line wide and exactly one layer high and lies on a layer of the print, so the slicer prints it as one thin line that breaks off cleanly. {{ui:supportRib.height}} is how high the rib reaches up the face (half way to start), {{ui:supportRib.bridgeSpacing}} how far apart the bridges are, in whole layers.
4. Under {{ui:supportRib.more}} the thickness, the gap, the bridges' width and the foot's thickness can be set by hand (until then they follow the nozzle and the layers), as can the foot's width and the roundings where the rib meets the foot and at its top. With {{ui:supportRib.bridgeGap}} above 0 the bridges no longer reach into the part but stop that far before it: the slicer then prints each as a path of its own, which holds the part by the squash of its line and comes off without a mark (half a line, 0.2 mm for a 0.4 mm nozzle, is a good start). Make {{ui:supportRib.gap}} wider with it, so the bridges still cross part of it.
5. {{ui:supportRib.apply}} adds the rib. With {{ui:supportRib.bundle}} (on to start) rib and part are bundled: they move together and go to the slicer as two bodies side by side, joined by the bridges in the print.

The rib is a mesh body: to change it, delete it and make it again. Each click makes one rib; for more, click {{ui:supportRib.repick}}. The rib must not run into the part anywhere, and the part must stand on the plate - otherwise the window says why. Your settings are kept for the next rib. The fit check and the print check leave the rib out: that its bridges reach into the part, and that it is thin, is meant to be so.

## Support ribs for a tilted part

A part printed tilted on one edge, at 45° say, often needs no supports: its faces are steep enough. But it stands on a thin edge and can fall over. The {{ui:supportRib.title}} holds it: a thin rib stands under its lower face a small gap away, on an oval foot, and tiny bridges hold the part to it. Turn the part onto its edge first and let it stand on the plate.

1. Select the part and click {{ui:supportRib.title}} in the {{ui:editor.section.splitShape}} group of the ribbon, right-click the part, or find it with [[Ctrl]]+[[K]].
2. Click the lower face where the rib should stand. The face must look down, slope between 15° and 75° and reach down to the plate; the rib stands straight down the face from your click. If the part's bottom edge is rounded or chamfered, the face may stop up to 3 mm above the plate: click the flat face above the rounding.
3. Set {{ui:supportRib.nozzle}}, {{ui:supportRib.layerHeight}} and {{ui:supportRib.firstLayer}} as in your slicer. The rib is two lines of the nozzle thick, the gap to the part half a line; each bridge is one line wide and exactly one layer high and lies on a layer of the print, so the slicer prints it as one thin line that breaks off cleanly. {{ui:supportRib.height}} is how high the rib reaches up the face (half way to start), {{ui:supportRib.bridgeSpacing}} how far apart the bridges are, in whole layers.
4. Under {{ui:supportRib.more}} the thickness, the gap, the bridges' width and the foot's thickness can be set by hand (until then they follow the nozzle and the layers), as can the foot's width and the roundings where the rib meets the foot and at its top. With {{ui:supportRib.bridgeGap}} above 0 the bridges no longer reach into the part but stop that far before it, measured in the layer: the slicer then prints each as a path of its own, which holds the part by the squash of its line and comes off without a mark (half a line, 0.2 mm for a 0.4 mm nozzle, is a good start). Make {{ui:supportRib.gap}} wider with it, so the bridges still cross part of it.
5. {{ui:supportRib.apply}} adds the rib. With {{ui:supportRib.bundle}} (on to start) rib and part are bundled: they move together and go to the slicer as two bodies side by side, joined by the bridges in the print.

The rib is a mesh body: to change it, delete it and make it again. Each click makes one rib; for more, click {{ui:supportRib.repick}} or repeat it with {{ui:editor.tool.array}}. The rib must not run into the part anywhere, and the part must stand on the plate - otherwise the window says why. Your settings are kept in this browser for the next rib.

{{ui:clearance.title}} and {{ui:printCheck.title}} know the rib: that its bridges reach into the part, and that the rib and its bridges are thin and lie one layer high across the gap, is meant to be so and is not reported. A rib made with layerling 1.148.0 does not carry this mark yet; make it again and the checks leave it out.

## Wall thickness, clearance and chamfers

- Walls should be at least two extrusion lines wide, so 0.8 mm with a 0.4 mm nozzle. Sturdy parts need 1.2 to 2 mm.
- Where two parts fit into each other you need clearance: usually 0.2 to 0.4 mm, depending on the printer. The fit test above tells you what your printer needs.
- Many people lightly chamfer the lower edge that sits on the plate. That keeps the first layer from spreading ("elephant foot").

## Your printer's play: the fit test

Every printer prints holes a little smaller and pins a little thicker than they are drawn, each by its own amount, so the clearance two printed parts need is a guess at first. Measure it once instead. In the settings under {{ui:workspace.workplane}}, {{ui:workspace.fitTestMake}} puts a fit test on the plate: a 60 × 20 × 4 mm plate with seven holes for one 5 mm pin, each drawn 5 mm plus twice 0.05, 0.10, 0.15, 0.20, 0.25, 0.30 or 0.40 mm, the value raised beside it, and the 5 mm pin itself, standing beside the plate with a small chamfer on top. It is made of ordinary shapes, so it prints with the rest of the plate, without supports.

On a printer whose bed moves back and forth, the tall, thin pin can wobble loose or come out wavy at its foot, brim or not. Tick {{ui:workspace.fitTestBase}} before you make the fit test: the pin then stands on a small 10 mm plate that holds on to the bed. It does not touch the plate's socket but rests on a small nub in its floor; once printed, bend the pin to and fro and it snaps off.

Print it as it lies, then push the pin, chamfered end first, into the holes from the tightest on. **The snuggest hole the pin still turns in** gives your printer's play. Type its number under {{ui:workspace.printerPlay}}, or click it among the values below the field. The play is per side, in millimetres, and the browser keeps it for every design; an empty field means not measured.
With several printers, choose the one you print on under {{ui:workspace.printer}} first: each printer keeps a play of its own, and new uses start from the play of the printer the design is set to. A printer without one uses the play set while no printer was chosen.

From then on, new uses start from the play instead of the built-in value: {{ui:lid.gap}} and {{ui:lid.hingePinPlay}} in the {{ui:editor.tool.lid}} tool, the clearance of a new {{ui:shape.dovetail}} and {{ui:shape.snapFit}}, {{ui:prop.clearance}} of a new nut or tapped hole - twice the play, as that is the room across the whole diameter - and {{ui:clearance.threshold}} in {{ui:editor.tool.clearance}}. The same goes for {{ui:split.connectorClearance}} of the dowels, plugs and dovetails in {{ui:editor.tool.split}}. While such a field still holds that value, "{{ui:printerPlay.fromFitTest}}" beside it says where the number comes from. A hinge printed in place and the joints of the {{ui:editor.tool.flexi}} tool keep their 0.4 mm: printed in one piece, their gaps also have to stay open between the layers, which a pin printed apart does not measure. Room for pressing in a magnet or a Gridfinity key, and room for a bought socket or board, keep their own values too. Bodies already in a design never change, nor does a design you open.

## Checking the print

{{ui:editor.tool.printCheck}}, next to {{ui:editor.tool.clearance}} in {{ui:editor.group.combine}}, looks at the selected objects, or at every visible object when nothing is selected, and says in one window what would go wrong when printing. Each of its five lines is green when it found nothing, and orange with what and where when it did:

- **{{ui:printCheck.thin.title}}**: places thinner than two lines of the nozzle - 0.8 mm with a 0.4 mm nozzle. The slicer leaves such a wall out or prints it as one weak line. Choose your nozzle under {{ui:printCheck.nozzle}} at the top of the window (0.2 to 0.8 with one click, any other in the field). The thin places are painted red with a light grid on the bodies, and the line names the thinnest place and how much surface is too thin. Places smaller than 1 mm² and sharp edges, such as the edge of a wedge, are left out.
- **{{ui:printCheck.floating.title}}**: a body, or a separate part of one, that touches neither the plate nor another part (within 0.05 mm). It would be printed in the air. A part resting on a part that stands is fine.
- **{{ui:printCheck.contact.title}}**: a part on the plate whose first layer is very small for its height, such as a sphere or a cone on its tip. It can come loose while it prints. The check warns below 0.5 mm² of footprint, measured 0.1 mm above the plate, for each millimetre of height: a sphere is always below that, a cube of 10 mm has 10.
- **{{ui:printCheck.overhang.title}}**: the same figures as **Show overhangs**, at the angle set there.
- **{{ui:printCheck.openMesh.title}}**: an imported mesh with open edges, or edges that three or more faces share. The slicer has to guess where such a mesh is inside.

![A tray whose right wall is only 0.6 mm thick: Print check paints it red and names it in the window.](shot:print-check)

{{ui:printCheck.show}} on a line takes the camera there; it selects the floating parts, those standing on too little and the open meshes, and for the overhangs it switches **Show overhangs** on. Bodies that overlap are checked joined, as the slicer joins them. If you change the design while the window is open, it shows {{ui:printCheck.stale}}; click that or {{ui:printCheck.checkAgain}}. [[Esc]] closes the window. Nothing in the design changes. An AI runs the same check with `layerling_check_print`. The window only checks, it does not print or save anything: to print, export the design for your slicer with {{ui:editor.export}} in {{ui:editor.group.file}}. {{ui:printCheck.openExport}} in the window closes the check and opens the export.

### Print analysis and layer view

{{ui:editor.tool.layerCheck}}, next to {{ui:editor.tool.printCheck}}, goes one step further: it cuts the selected objects (or every visible one) into the layers your printer lays down and compares each layer with the one below, all in one go. You do not have to page through layers to find a problem: the window lists its **findings**, problems (red) first, then hints (yellow), from the bottom up. Each line says where and how bad, for example "Layer 83–97 (16.6–19.4 mm): Overhang 62°, 1.4 cm²", and what helps. Layers in a row with the same problem at the same place make one finding.

Before it looks at layers it checks the whole: a part that reaches into the print bed ({{ui:finding.kind.inBed}}; layers below the workplane are not counted), a part that floats above it, a mesh that is not closed, a part larger than the printer chosen in the settings. Then, layer by layer: {{ui:finding.kind.unsupported}} (a place that starts with nothing under it, such as the arms of a T), {{ui:finding.kind.overhang}} (a hint from 45°, a problem from 60° from the vertical), {{ui:finding.kind.bridge}} (a hint from a span of 10 mm), {{ui:finding.kind.thinWall}} (under two lines of the nozzle), {{ui:finding.kind.smallIsland}} (a separate place under 2 mm² that goes on for 2 mm or more) and {{ui:finding.kind.adhesion}}. Choose {{ui:layerCheck.layerHeight}} and {{ui:layerCheck.nozzle}} at the top; the limits are under {{ui:layerCheck.advanced}}. Places under 0.05 mm², such as a tip or the last layer, are not rated. The check runs in the background with a bar; {{ui:layerCheck.stop}} stops it at once.

Click a finding: the **layer view** opens at the first layer it concerns, the camera goes to the place, the place is painted red or yellow on the layer, and the layers below stay visible. The slider stands upright beside a profile of the cross-section over the height; marks at its side show where findings are, a click on one jumps there. On the slider, [[↑]] and [[↓]] move one layer, [[Page Up]] and [[Page Down]] ten, [[Home]] and [[End]] go to the ends, [[Space]] plays, [[N]] goes to the next finding and [[Shift+N]] to the one before. {{ui:layerCheck.view.mode}} shows {{ui:layerCheck.view.mode.upTo}}, {{ui:layerCheck.view.mode.only}} or {{ui:layerCheck.view.mode.range}}; the layers still to come can show as a faint shadow. Where Layerling has a tool for the finding, a button opens it: {{ui:finding.action.dropToPlate}}, {{ui:finding.action.layFlat}} or {{ui:finding.action.supportRib}}. After a change the list is marked as out of date until you click {{ui:layerCheck.checkAgain}}. Closing the window puts the camera back where it was. This is no slicer preview: supports, infill and print time come from your slicer.

## When you are ready

Click {{ui:editor.export}} and choose **STL** or **3MF**. STL is the simplest format. 3MF keeps names and colours of the individual bodies and is therefore handy when you print in several colours. The full export panel ({{ui:exportWindow.moreFormats}}) also shows how many grams and metres of filament the part would take printed solid. More in [Files and saving](chapter:files-and-saving).
