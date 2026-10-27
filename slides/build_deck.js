// build_deck.js - "Containers for HPC: Pre-built Scientific Software with E4S"
// RCC workshop, Midway3, Oct 27 2026.
//
//   npm install && node build_deck.js      -> E4S_Workshop_RCC_2026-10-27.pptx
//
// Portions adapted from E4S tutorials by Sameer Shende (U. Oregon / ParaTools),
// used with permission. Performance numbers were measured on Midway3 caslake nodes.

const path = require("path");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");

const OUT = "E4S_Workshop_RCC_2026-10-27.pptx";
const ASSETS = path.join(__dirname, "assets");

const THEME = {
  name: "E4S Workshop",
  headFontFace: "Calibri",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "1B2631", lt1: "FFFFFF", dk2: "1F2D3A", lt2: "EEF2F5",
    accent1: "E0731F",  // E4S orange
    accent2: "4E8A3C",  // E4S green
    accent3: "800000",  // UChicago maroon
    accent4: "2F6E9E",  // steel blue
    accent5: "8996A3",  // slate gray
    accent6: "F0B429",  // amber
    hlink: "2F6E9E", folHlink: "6B4E9B",
  },
};
const HEX = THEME.colors;
const MONO = "Courier New";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.author = "Research Computing Center, University of Chicago";
pres.title = "Containers for HPC: Pre-built Scientific Software with E4S";
const C = pres.SchemeColor;

// ---------------------------------------------------------------- icons
async function icon(Comp, color = "FFFFFF", size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// ---------------------------------------------------------------- layouts
const FOOT = "Containers for HPC with E4S  ·  RCC Midway3  ·  Oct 27, 2026";
pres.defineSlideMaster({
  title: "TITLE",
  background: { color: HEX.dk2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 2.0, w: 11.7, h: 1.9, fontSize: 44, bold: true, color: C.background1, valign: "bottom", align: "left", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "subtitle", type: "body", x: 0.8, y: 4.1, w: 11.7, h: 0.8, fontSize: 22, color: C.accent1, margin: 0 }, text: "" } },
    { placeholder: { options: { name: "details", type: "body", x: 0.8, y: 5.3, w: 11.7, h: 1.4, fontSize: 16, color: C.background2, margin: 0, valign: "top" }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "SECTION",
  background: { color: HEX.dk2 },
  objects: [
    { placeholder: { options: { name: "kicker", type: "body", x: 0.8, y: 2.2, w: 8, h: 0.6, fontSize: 20, bold: true, color: C.accent1, margin: 0, charSpacing: 4 }, text: "" } },
    { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 2.8, w: 9.2, h: 1.7, fontSize: 44, bold: true, color: C.background1, margin: 0, valign: "top", align: "left" }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 4.6, w: 9.2, h: 1.4, fontSize: 20, color: C.background2, margin: 0, valign: "top" }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: HEX.lt1 },
  margin: [0.5, 0.6, 0.6, 0.6],
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.35, w: 12.1, h: 0.85, fontSize: 34, bold: true, color: C.text1, margin: 0, valign: "middle", align: "left" }, text: "" } },
    { text: { text: FOOT, options: { x: 0.6, y: 7.05, w: 9, h: 0.3, fontSize: 10, color: C.accent5, margin: 0 } } },
  ],
  slideNumber: { x: 12.2, y: 7.05, w: 0.5, h: 0.3, fontSize: 10, color: HEX.accent5, align: "right" },
});

// ---------------------------------------------------------------- helpers
function content(title, section) {
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: section });
  s.addText(title, { placeholder: "title" });
  return s;
}

// Terminal-style code card: lines starting with "$ " get an orange prompt.
function terminal(s, lines, o) {
  const fs = o.fontSize || 14;
  if (!o.h) o.h = 0.34 + lines.length * fs * 0.0188;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: o.x, y: o.y, w: o.w, h: o.h, fill: { color: C.text1 }, rectRadius: 0.08, line: { type: "none" }, objectName: o.name || "terminal" });
  const runs = [];
  lines.forEach((ln, i) => {
    const last = i === lines.length - 1;
    if (ln.startsWith("$ ")) {
      runs.push({ text: "$ ", options: { color: C.accent1, bold: true, fontFace: MONO, fontSize: fs } });
      runs.push({ text: ln.slice(2), options: { color: C.background1, fontFace: MONO, fontSize: fs, breakLine: !last } });
    } else if (ln.startsWith("# ")) {
      runs.push({ text: ln, options: { color: C.accent5, fontFace: MONO, fontSize: fs, breakLine: !last } });
    } else {
      runs.push({ text: ln || " ", options: { color: "B8C4CE", fontFace: MONO, fontSize: fs, breakLine: !last } });
    }
  });
  s.addText(runs, { x: o.x + 0.2, y: o.y + 0.12, w: o.w - 0.4, h: o.h - 0.24, valign: "top", isTextBox: true, margin: 0, paraSpaceAfter: 2, objectName: (o.name || "terminal") + "-text" });
}

function bullets(s, items, o) {
  const runs = items.map((t, i) => {
    const last = i === items.length - 1;
    if (Array.isArray(t)) { // [bold lead, rest]
      return [
        { text: t[0], options: { bold: true, color: C.text1, bullet: true, breakLine: false } },
        { text: t[1], options: { color: C.text1, breakLine: !last } },
      ];
    }
    return [{ text: t, options: { color: C.text1, bullet: true, breakLine: !last } }];
  }).flat();
  s.addText(runs, { x: o.x, y: o.y, w: o.w, h: o.h, fontSize: o.fontSize || 18, valign: "top", isTextBox: true, margin: 0, paraSpaceAfter: o.gap || 10, objectName: o.name || "bullets" });
}

function handsOn(s, where) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 6.3, w: 1.75, h: 0.46, fill: { color: C.accent1 }, rectRadius: 0.23, line: { type: "none" }, objectName: "hands-on-pill" });
  s.addText("HANDS-ON", { x: 0.6, y: 6.3, w: 1.75, h: 0.46, fontSize: 14, bold: true, color: C.background1, align: "center", valign: "middle", isTextBox: true, margin: 0, objectName: "hands-on-label" });
  s.addText(where, { x: 2.55, y: 6.3, w: 8, h: 0.46, fontSize: 15, bold: true, color: C.accent1, valign: "middle", isTextBox: true, margin: 0, objectName: "hands-on-where" });
}

function iconCircle(s, data, x, y, d, color, name) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color }, line: { type: "none" }, objectName: name + "-circle" });
  const p = d * 0.24;
  s.addImage({ data, x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p, objectName: name + "-icon", altText: name });
}

function card(s, o) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: o.x, y: o.y, w: o.w, h: o.h, fill: { color: o.fill || C.background2 }, rectRadius: 0.08, line: { type: "none" }, objectName: o.name });
}

function caption(s, text, x, y, w) {
  s.addText(text, { x, y, w, h: 0.3, fontSize: 11, italic: true, color: C.accent5, isTextBox: true, margin: 0, objectName: "caption" });
}

// pptxgenjs writes a second <a:pPr> (with <a:buNone/>) before every run that
// continues a bulleted paragraph; renderers then drop the bullet for the whole
// paragraph. A paragraph may only have one pPr, first, so strip the extras.
async function fixRunParagraphProps(file) {
  const fs = require("fs");
  const JSZip = require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  for (const name of Object.keys(zip.files).filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n))) {
    const xml = await zip.file(name).async("string");
    zip.file(name, xml.replace(/(<\/a:r>)<a:pPr\b[^>]*?(?:\/>|>.*?<\/a:pPr>)/g, "$1"));
  }
  fs.writeFileSync(file, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}

// pptxgenjs sets the theme fonts but always writes Office's stock color scheme, so
// scheme colors (C.accent1, ...) would render in Office blue/orange. Write THEME's
// colors and name into ppt/theme/theme1.xml after the deck is saved.
async function applyThemeColors(file, theme) {
  const fs = require("fs");
  const JSZip = require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const part = "ppt/theme/theme1.xml";
  let xml = await zip.file(part).async("string");
  for (const [slot, hex] of Object.entries(theme.colors)) {
    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) throw new Error(`theme color ${slot}=${hex} is not 6 hex digits`);
    const re = new RegExp(`<a:${slot}>[\\s\\S]*?</a:${slot}>`);
    if (!re.test(xml)) throw new Error(`theme slot ${slot} not found in ${part}`);
    xml = xml.replace(re, `<a:${slot}><a:srgbClr val="${hex.toUpperCase()}"/></a:${slot}>`);
  }
  const name = theme.name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  xml = xml.replace(/(<a:theme\b[^>]*\bname=")[^"]*"/, `$1${name}"`).replace(/(<a:clrScheme\b[^>]*\bname=")[^"]*"/, `$1${name}"`);
  zip.file(part, xml);
  fs.writeFileSync(file, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}

// ---------------------------------------------------------------- slides
(async () => {
  const I = {
    lock: await icon(fa.FaUserLock), box: await icon(fa.FaBox), cubes: await icon(fa.FaCubes),
    server: await icon(fa.FaServer), docker: await icon(fa.FaDocker), net: await icon(fa.FaNetworkWired),
    bolt: await icon(fa.FaBolt), search: await icon(fa.FaSearch), dl: await icon(fa.FaDownload),
    term: await icon(fa.FaTerminal), layers: await icon(fa.FaLayerGroup), tools: await icon(fa.FaTools),
    rocket: await icon(fa.FaRocket), clock: await icon(fa.FaClock), file: await icon(fa.FaFileAlt),
    flask: await icon(fa.FaFlask), puzzle: await icon(fa.FaPuzzlePiece), warn: await icon(fa.FaExclamationTriangle),
    check: await icon(fa.FaCheck), cogs: await icon(fa.FaCogs), book: await icon(fa.FaBook),
    users: await icon(fa.FaUsers), hdd: await icon(fa.FaHdd), plus: await icon(fa.FaPlusSquare),
  };

  // ============================================================ OPENING
  pres.addSection({ title: "Opening" });

  // 1. Title
  let s = pres.addSlide({ masterName: "TITLE", sectionTitle: "Opening" });
  s.addText("Containers for HPC: Pre-built Scientific Software with E4S", { placeholder: "title" });
  s.addText("Apptainer · Slurm · MPI · E4S 26.06 on Midway3", { placeholder: "subtitle" });
  s.addText([
    { text: "Research Computing Center, University of Chicago", options: { breakLine: true } },
    { text: "John Crerar Library, Kathleen A. Zar Room  ·  Tuesday, October 27, 2026  ·  3–5 PM" },
  ], { placeholder: "details" });
  s.addNotes("Welcome. Two hours, hands-on. Everyone should have a Midway3 account and a terminal open. Parts of today's material are adapted from E4S tutorials by Sameer Shende (University of Oregon / ParaTools), used with his permission.");

  // 2. Agenda
  s = content("Today: three parts, all hands-on", "Opening");
  const parts = [
    ["20 min", "Part 1", "Containers on shared HPC systems", "Why Apptainer, not Docker; the rootless model", HEX.accent4, I.lock],
    ["35 min", "Part 2", "Pull, inspect, run", "E4S images, what is inside, Slurm batch jobs", HEX.accent2, I.search],
    ["25 min", "Part 3a", "Swap MPI at launch", "e4s-cl: container binary, host MPI, full speed", HEX.accent1, I.bolt],
    ["20 min", "Part 3b", "Add software to an image", "e4s-alc: YAML → definition file → new image", HEX.accent3, I.plus],
  ];
  parts.forEach((p, i) => {
    const x = 0.6 + i * 3.08;
    card(s, { x, y: 1.55, w: 2.85, h: 3.9, name: "part-card-" + i });
    iconCircle(s, p[5], x + 0.3, 1.85, 0.9, p[4], "part-" + i);
    s.addText(p[0], { x: x + 1.4, y: 1.95, w: 1.3, h: 0.7, fontSize: 22, bold: true, color: C.accent5, align: "right", isTextBox: true, margin: 0 });
    s.addText(p[1], { x: x + 0.3, y: 2.95, w: 2.4, h: 0.4, fontSize: 16, bold: true, color: C.accent1, isTextBox: true, margin: 0 });
    s.addText(p[2], { x: x + 0.3, y: 3.35, w: 2.4, h: 0.9, fontSize: 20, bold: true, color: C.text1, isTextBox: true, margin: 0, valign: "top" });
    s.addText(p[3], { x: x + 0.3, y: 4.3, w: 2.4, h: 1.0, fontSize: 15, color: C.text1, isTextBox: true, margin: 0, valign: "top" });
  });
  s.addText("Out of scope: building images from source — see RCC's general container workshops.", { x: 0.6, y: 5.65, w: 12.1, h: 0.4, fontSize: 15, italic: true, color: C.accent5, isTextBox: true, margin: 0 });
  s.addText([
    { text: "Your own research problem? ", options: { bold: true, color: C.accent1 } },
    { text: "Note it. Today we stay on the shared labs; afterwards email help@rcc.uchicago.edu with [E4S workshop] in the subject and I'll follow up.", options: { color: C.text1 } },
  ], { x: 0.6, y: 6.1, w: 12.1, h: 0.55, fontSize: 15, isTextBox: true, margin: 0, valign: "top", objectName: "own-problem" });
  s.addNotes("Set expectations now: \"Many of you came with a specific problem. Today we stay on the shared labs so everyone finishes; for your own case, email help@rcc.uchicago.edu with [E4S workshop] in the subject. That opens a ticket and I'll follow up this week.\" Timing (elapsed, for you): 0:00 welcome & setup, 0:10 Part 1, 0:30 Part 2, ~1:05 short break, 1:10 Part 3a e4s-cl, 1:35 Part 3b e4s-alc, 1:55 wrap-up. The cards show each part's length (talk + hands-on); the hands-on pills show the hands-on share: Part 1 10 of 20 min, Part 2 25 of 35, Part 3a 15 of 25, Part 3b 15 of 20. Learning objectives: explain why Apptainer rather than Docker; pull and inspect E4S images; run containerized apps under Slurm; run a containerized MPI app with the host MPI via e4s-cl; customize an image with e4s-alc.");

  // 3. Setup
  s = content("Before we start: a compute node and the labs", "Opening");
  terminal(s, [
    "$ ssh <cnetid>@midway3.rcc.uchicago.edu",
    "$ source /project/rcc/workshops/e4s/env.sh",
    "$ sinteractive -c 4 -t 2:00:00",
    "# ... now on a compute node: set up again",
    "$ source /project/rcc/workshops/e4s/env.sh",
    "$ cp -r $E4S_WORKSHOP/labs $E4S_SCRATCH/e4s-labs",
    "$ cd $E4S_SCRATCH/e4s-labs",
    "$ less LAB_GUIDE.md",
  ], { x: 0.6, y: 1.5, w: 7.4, fontSize: 15 });
  handsOn(s, "LAB_GUIDE.md · Part 0  ·  5 minutes");
  bullets(s, [
    ["env.sh ", "loads apptainer/1.4.1, puts e4s-cl and e4s-alc on your PATH, sets $E4S_IMAGE"],
    ["Image cache → scratch: ", "a single E4S image would fill your 30 GB home quota"],
    ["Run containers on compute nodes, ", "not login nodes"],
  ], { x: 8.4, y: 1.6, w: 4.3, h: 3.8, fontSize: 17, gap: 14 });
  s.addNotes("Give everyone 5 minutes. Common problems: no Slurm account with SUs on caslake (use the workshop account/reservation set in env.sh); forgetting to re-source env.sh inside the sinteractive shell; running out of home quota because APPTAINER_CACHEDIR was not set.");

  // 4. Motivation
  s = content("Why pre-built scientific software?", "Opening");
  s.addText("“Your software environment should not be your first research project.”", { x: 0.6, y: 1.3, w: 12.1, h: 0.6, fontSize: 22, italic: true, color: C.accent4, isTextBox: true, margin: 0, objectName: "quote" });
  const stats = [
    ["Dozens", "of interdependent libraries behind one scientific application"],
    ["× compiler × MPI × GPU", "every combination has to be built and tested again"],
    ["Days–weeks", "to configure a complex HPC software stack correctly"],
  ];
  stats.forEach((st, i) => {
    const x = 0.6 + i * 4.1;
    s.addText(st[0], { x, y: 2.05, w: 3.8, h: 1.0, fontSize: i === 1 ? 28 : 44, bold: true, color: C.accent1, isTextBox: true, margin: 0, valign: "bottom" });
    s.addText(st[1], { x, y: 3.15, w: 3.7, h: 0.9, fontSize: 17, color: C.text1, isTextBox: true, margin: 0, valign: "top" });
  });
  card(s, { x: 0.6, y: 4.4, w: 12.1, h: 1.9, name: "answer-card" });
  iconCircle(s, I.box, 0.95, 4.75, 1.2, HEX.accent2, "answer");
  s.addText([
    { text: "E4S answers with pre-built, co-tested images. ", options: { bold: true, breakLine: true } },
    { text: "Pull one file, and LAMMPS, GROMACS, PETSc, hypre, Trilinos and 600+ other packages are ready, built consistently against one compiler and MPI." },
  ], { x: 2.45, y: 4.6, w: 10.0, h: 1.5, fontSize: 19, color: C.text1, isTextBox: true, margin: 0, valign: "middle" });
  caption(s, "Message adapted from S. Shende, “E4S” tutorial, MVAPICH Users Group (MUG'26), Aug 2026.", 0.6, 6.55, 12);
  s.addNotes("This is Sameer Shende's framing from his MUG'26 E4S tutorial. Research groups pay the cost of building and maintaining software stacks over and over. E4S turns that into a download. The cost of today's approach is image size (tens of GB), which we will deal with explicitly.");

  // ============================================================ PART 1
  pres.addSection({ title: "Part 1: Containers on HPC" });
  s = pres.addSlide({ masterName: "SECTION", sectionTitle: "Part 1: Containers on HPC" });
  s.addText("PART 1  ·  20 MIN", { placeholder: "kicker" });
  s.addText("Containers on shared HPC systems", { placeholder: "title" });
  s.addText("What a container is, why HPC centers use Apptainer instead of Docker, and what “rootless” means in practice.", { placeholder: "body" });
  s.addImage({ data: await icon(fa.FaCubes, HEX.accent1), x: 10.4, y: 2.6, w: 2.0, h: 2.0, objectName: "section-icon" });

  // 6. What is a container
  s = content("A container is a different userland on the same kernel", "Part 1: Containers on HPC");
  // stack diagram
  const stack = (x, label, layers) => {
    const top = 1.95 + (5 - layers.length) * 0.78;
    s.addText(label, { x, y: top - 0.5, w: 3.6, h: 0.4, fontSize: 16, bold: true, color: C.text1, align: "center", isTextBox: true, margin: 0 });
    layers.forEach((L, i) => {
      const y = top + i * 0.78;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 3.6, h: 0.66, fill: { color: L[1] }, rectRadius: 0.06, line: { type: "none" }, objectName: label + "-" + i });
      s.addText(L[0], { x, y, w: 3.6, h: 0.66, fontSize: 15, bold: true, color: L[2] || C.background1, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    });
  };
  stack(0.6, "Virtual machine", [["App + libraries", HEX.accent2], ["Guest OS + kernel", HEX.accent5], ["Hypervisor", HEX.accent5], ["Host kernel", HEX.dk2], ["Hardware", HEX.dk1]]);
  stack(4.6, "Container (Apptainer)", [["App + libraries", HEX.accent2], ["Ubuntu 24.04 userland", HEX.accent1], ["Host kernel  (Midway3)", HEX.dk2], ["Hardware: CPUs, IB, GPUs", HEX.dk1]]);
  bullets(s, [
    ["Inside: ", "files — OS libraries, compilers, MPI, applications"],
    ["Outside: ", "kernel, CPUs, memory, network, GPUs, file systems"],
    ["No hypervisor, ", "so no performance tax: processes run directly on the hardware"],
    ["Portable, ", "with a caveat: the kernel and drivers come from the host"],
  ], { x: 8.7, y: 1.6, w: 4.0, h: 4.6, fontSize: 17, gap: 14 });
  caption(s, "After S. Shende, “What are containers / Hypervisors and Containers”, MUG'24.", 0.6, 6.55, 12);
  s.addNotes("Containers are 'chroot on steroids' (Sameer's phrase): a packaged userland, minus the kernel. Everything the program loads from disk comes from the image; everything it gets from the kernel (devices, network, scheduling) comes from the host. That's why hardware-specific pieces like the MPI network stack are interesting in Part 3.");

  // 7. Why not Docker
  s = content("Why Apptainer, not Docker, on a shared cluster", "Part 1: Containers on HPC");
  const rows = [
    ["Who runs it", "A root-owned daemon starts your container", "You do; it is just your process"],
    ["Privileges", "docker group ≈ root on the node", "Same UID inside and out; no escalation"],
    ["Image format", "Layers under /var/lib/docker", "One read-only .sif file on GPFS"],
    ["Scheduler", "Outside Slurm's view", "srun / sbatch launch it like any program"],
    ["MPI and GPUs", "Network namespace gets in the way", "Host network and devices; --nv / --rocm"],
  ];
  s.addTable([
    [{ text: "", options: { fill: { color: HEX.lt1 } } },
     { text: "Docker", options: { bold: true, color: HEX.lt1, fill: { color: HEX.accent5 } } },
     { text: "Apptainer", options: { bold: true, color: HEX.lt1, fill: { color: HEX.accent2 } } }],
    ...rows.map(r => [
      { text: r[0], options: { bold: true, color: HEX.dk1 } },
      { text: r[1], options: { color: HEX.dk1 } },
      { text: r[2], options: { color: HEX.dk1, bold: true } }]),
  ], { x: 0.6, y: 1.5, w: 12.1, colW: [2.4, 4.85, 4.85], fontSize: 17, fontFace: THEME.bodyFontFace, border: { type: "solid", pt: 1, color: "D5DCE2" }, rowH: 0.62, valign: "middle", objectName: "docker-vs-apptainer" });
  s.addText("Docker images still matter: apptainer pull docker://… converts them, so everything on Docker Hub (including E4S) is usable.", { x: 0.6, y: 5.6, w: 12.1, h: 0.7, fontSize: 16, italic: true, color: C.text1, isTextBox: true, margin: 0 });
  s.addNotes("Key point for the objective 'explain why Apptainer rather than Docker'. On a shared system the security model is the deciding factor: membership in the docker group is effectively root. Apptainer runs as the user, has no daemon, keeps images as single files that suit parallel file systems, and integrates with Slurm, MPI and GPUs. Apptainer is the Linux Foundation continuation of Singularity; the 'singularity' command still works.");

  // 8. Rootless model
  s = content("The rootless execution model", "Part 1: Containers on HPC");
  const facts = [
    [I.users, HEX.accent4, "Same user", "id -un inside = outside. Files you create are yours; Slurm accounting just works."],
    [I.lock, HEX.accent3, "Read-only image", "The .sif is mounted read-only. --writable-tmpfs adds a throwaway layer in RAM."],
    [I.hdd, HEX.accent2, "Your files are mounted", "$HOME, /tmp and the current directory appear automatically; add more with -B."],
    [I.cogs, HEX.accent1, "Environment flows in", "Host variables pass through (needed by MPI); --cleanenv starts from a minimal set."],
    [I.tools, HEX.accent5, "Root only in builds", "--fakeroot maps you to root inside a build namespace, so apt-get works; the host is untouched."],
  ];
  facts.forEach((f, i) => {
    const y = 1.5 + i * 1.04;
    iconCircle(s, f[0], 0.6, y, 0.75, f[1], "fact-" + i);
    s.addText(f[2], { x: 1.6, y, w: 3.2, h: 0.75, fontSize: 19, bold: true, color: C.text1, valign: "middle", isTextBox: true, margin: 0 });
    s.addText(f[3], { x: 4.8, y, w: 7.9, h: 0.75, fontSize: 16, color: C.text1, valign: "middle", isTextBox: true, margin: 0 });
  });
  s.addNotes("Walk through each row; participants will verify every one of these in Hands-on 1. On Midway3 there are no /etc/subuid entries, so --fakeroot uses a root-mapped user namespace plus the fakeroot command. That works for building from small base images; we'll see a limitation with the big E4S image in Part 3b.");

  // 9. Apptainer in 6 commands
  s = content("Apptainer in six commands", "Part 1: Containers on HPC");
  terminal(s, [
    "$ apptainer pull e4s.sif docker://ecpe4s/e4s-cpu:26.06",
    "$ apptainer exec e4s.sif <command>",
    "$ apptainer shell e4s.sif",
    "$ apptainer run e4s.sif",
    "$ apptainer inspect e4s.sif",
    "$ apptainer build --fakeroot new.sif recipe.def",
  ], { x: 0.6, y: 1.5, w: 7.6, fontSize: 15 });
  bullets(s, [
    ["pull: ", "Docker/OCI image → single SIF file"],
    ["exec: ", "run one command inside"],
    ["shell: ", "interactive shell inside"],
    ["run: ", "the image's default action (runscript)"],
    ["inspect: ", "labels, runscript, definition"],
    ["build: ", "new image from a recipe (Part 3b)"],
  ], { x: 8.6, y: 1.55, w: 4.1, h: 2.9, fontSize: 17, gap: 6 });
  terminal(s, [
    "# useful flags",
    "-B /host:/ctr      bind a directory      --cleanenv       don't pass host env",
    "--writable-tmpfs   scratch layer in RAM   --nv / --rocm   NVIDIA / AMD GPUs",
  ], { x: 0.6, y: 4.75, w: 12.1, fontSize: 14, name: "flags" });
  s.addNotes("These six commands cover today. Note 'run' executes the image's runscript; with the E4S images that sources the image's /etc/bash.bashrc, which writes npm settings into $HOME, so we prefer exec and shell.");

  // 10. Hands-on 1
  s = content("Hands-on 1: poke at the E4S image", "Part 1: Containers on HPC");
  terminal(s, [
    "$ apptainer exec $E4S_IMAGE grep PRETTY_NAME /etc/os-release",
    "PRETTY_NAME=\"Ubuntu 24.04.4 LTS\"      # host: CentOS Linux 8",
    "$ id -un; apptainer exec $E4S_IMAGE id -un",
    "<cnetid> / <cnetid>                     # same user, same UID",
    "$ apptainer exec $E4S_IMAGE touch /opt/hello",
    "touch: cannot touch '/opt/hello': Read-only file system",
    "$ apptainer exec --writable-tmpfs $E4S_IMAGE touch /opt/hello",
    "$ apptainer exec $E4S_IMAGE touch ~/hi && ls ~/hi",
    "$ apptainer exec --cleanenv $E4S_IMAGE env | wc -l",
    "28                                      # instead of ~245",
    "$ apptainer inspect --runscript $E4S_IMAGE",
  ], { x: 0.6, y: 1.5, w: 8.4, fontSize: 13.5 });
  bullets(s, [
    "A different Linux, the same kernel and hardware",
    "No root: you are you, inside and out",
    "The image never changes; your home does",
    "--cleanenv: tidy, but breaks MPI",
  ], { x: 9.4, y: 1.6, w: 3.3, h: 4.4, fontSize: 17, gap: 16 });
  handsOn(s, "LAB_GUIDE.md · Part 1  ·  10 minutes");
  s.addNotes("Expected: CentOS Linux 8 vs Ubuntu 24.04.4 LTS; same user; 'Read-only file system'; the tmpfs touch succeeds but the file disappears afterwards; home is writable; env shrinks from ~245 to 28 variables with --cleanenv. Mention that --cleanenv breaks MPI because it strips the PMI_* variables Slurm sets.");

  // ============================================================ PART 2
  pres.addSection({ title: "Part 2: Pull, inspect, run" });
  s = pres.addSlide({ masterName: "SECTION", sectionTitle: "Part 2: Pull, inspect, run" });
  s.addText("PART 2  ·  35 MIN", { placeholder: "kicker" });
  s.addText("E4S images: pull, inspect, run under Slurm", { placeholder: "title" });
  s.addText("Get an image, find out exactly what is inside it, and run an application as a batch job.", { placeholder: "body" });
  s.addImage({ data: await icon(fa.FaSearch, HEX.accent1), x: 10.4, y: 2.6, w: 2.0, h: 2.0, objectName: "section-icon" });

  // 12. What is E4S
  s = content("E4S: the Extreme-scale Scientific Software Stack", "Part 2: Pull, inspect, run");
  const e4sStats = [["140+", "HPC and AI products in the E4S catalog"], ["26.06", "current release, June 22, 2026"], ["2 / yr", "co-tested releases, frozen Spack environments"]];
  e4sStats.forEach((st, i) => {
    const x = 0.6 + i * 4.1;
    s.addText(st[0], { x, y: 1.45, w: 3.8, h: 1.0, fontSize: 54, bold: true, color: C.accent1, isTextBox: true, margin: 0, valign: "bottom" });
    s.addText(st[1], { x, y: 2.5, w: 3.6, h: 0.7, fontSize: 16, color: C.text1, isTextBox: true, margin: 0, valign: "top" });
  });
  bullets(s, [
    ["A curated Spack distribution: ", "math libraries, data & I/O, performance tools, programming models, AI frameworks, and applications"],
    ["Delivered as binaries: ", "Docker/Apptainer images and a Spack build cache (cache.e4s.io)"],
    ["26.06: ", "Spack 1.1.1 · CUDA 13.2 · ROCm 7.2.3 · oneAPI 2026.0 · Ubuntu 24.04 and Rocky 9 · x86_64, aarch64, ppc64le"],
    ["Community-maintained, ", "led by Sameer Shende (U. Oregon); part of the High Performance Software Foundation"],
  ], { x: 0.6, y: 3.5, w: 12.1, h: 3.0, fontSize: 18, gap: 12 });
  caption(s, "Sources: e4s.io product catalog; S. Shende, “E4S 26.06 release” slides, June 2026.", 0.6, 6.55, 12);
  s.addNotes("E4S grew out of the DOE Exascale Computing Project and is now part of HPSF. The release decks say '125+ HPC-AI packages'; the e4s.io catalog lists 143 products (counted Oct 24, 2026). Semi-annual releases: 26.06 is current, 26.11 is in CI.");

  // 13. Image family
  s = content("Which E4S image? Full, base, or cache-backed", "Part 2: Pull, inspect, run");
  s.addTable([
    [{ text: "Image", options: { bold: true, color: HEX.lt1, fill: { color: HEX.dk2 } } },
     { text: "What is inside", options: { bold: true, color: HEX.lt1, fill: { color: HEX.dk2 } } },
     { text: "Size", options: { bold: true, color: HEX.lt1, fill: { color: HEX.dk2 } } },
     { text: "Today", options: { bold: true, color: HEX.lt1, fill: { color: HEX.dk2 } } }],
    [{ text: "Full  (cpu, cuda, rocm, oneapi)", options: { bold: true } }, "The whole stack: 600+ Spack packages, apps, tools", "22–34 GB", { text: "e4s-cpu 26.06, pre-pulled", options: { bold: true, color: HEX.accent2 } }],
    [{ text: "Base  (e4s-base-*)", options: { bold: true } }, "MPICH, CMake and a GPU SDK, for building your own", "5–8 GB", "—"],
    [{ text: "Cache-backed  (e4s-spack-cpu)", options: { bold: true } }, "Spack + MPICH; install anything else from the build cache", "1.5 GB", { text: "You pull it", options: { bold: true, color: HEX.accent2 } }],
    [{ text: "Minimal  (ecpe4s/ubuntu24.04)", options: { bold: true } }, "Ubuntu + Spack, a starting point for e4s-alc", "1.2 GB", { text: "Part 3b base", options: { bold: true, color: HEX.accent2 } }],
  ], { x: 0.6, y: 1.5, w: 12.1, colW: [3.6, 4.9, 1.4, 2.2], fontSize: 16, fontFace: THEME.bodyFontFace, color: HEX.dk1, border: { type: "solid", pt: 1, color: "D5DCE2" }, rowH: 0.7, valign: "middle", objectName: "image-family" });
  bullets(s, [
    ["Where: ", "Docker Hub (docker://ecpe4s/…) or ready-made SIFs at e4s.io/container-download"],
    ["Match your hardware: ", "cuda80 = A100, cuda90 = H100; Midway3 caslake nodes are CPU-only, hence e4s-cpu"],
  ], { x: 0.6, y: 5.25, w: 12.1, h: 1.3, fontSize: 17, gap: 10 });
  s.addNotes("Sizes measured Oct 2026: e4s-cpu-x86_64-26.06.sif 25.5 GB, e4s-cuda80 34 GB, e4s-spack-cpu 1.5 GB, ecpe4s/ubuntu24.04 1.2 GB. The CUDA images also run on CPU nodes for most packages, but applications built with CUDA (e.g. LAMMPS +cuda) need libcuda.so from the driver, so they fail on CPU-only nodes. That's why we use the CPU image.");

  // 14. Getting images (screenshot)
  s = content("Getting the images", "Part 2: Pull, inspect, run");
  s.addImage({ path: path.join(ASSETS, "e4s_download_page.png"), x: 0.6, y: 1.45, w: 5.0 * 1072 / 1265, h: 5.0, objectName: "download-page", altText: "Screenshot of the E4S container download page at e4s.io" });
  terminal(s, [
    "# Docker Hub -> SIF (2-4 min for 1.5 GB)",
    "$ apptainer pull e4s-spack-cpu_26.06.sif \\",
    "      docker://ecpe4s/e4s-spack-cpu:26.06",
    "",
    "# Ready-made SIF from the E4S project",
    "$ curl -LO https://oaciss.nic.uoregon.edu/\\",
    "      e4s/images/26.06/e4s-cpu-x86_64-26.06.sif",
  ], { x: 5.3, y: 1.5, w: 7.4, fontSize: 14 });
  bullets(s, [
    ["pull = ", "download layers into $APPTAINER_CACHEDIR, then squash into one SIF (CPU-heavy: use a compute node)"],
    ["Docker Hub limit: ", "100 anonymous pulls / hour / IP — a room of 30 is fine, a script in a loop is not"],
  ], { x: 5.3, y: 4.0, w: 7.4, h: 2.2, fontSize: 17, gap: 14 });
  caption(s, "Screenshot: e4s.io/container-download, from S. Shende, “E4S 26.06 release” slides.", 0.6, 6.55, 12);
  s.addNotes("The 25 GB CPU image took ~33 minutes to download at ~13 MB/s from Oregon, which is why it is pre-staged. The cache-backed image pulls from Docker Hub in 1.7 min on a 32-core node and ~4 min on a 4-core job.");

  // 15. What's inside
  s = content("Inside e4s-cpu 26.06: 127 explicit, 685 total packages", "Part 2: Pull, inspect, run");
  const cats = [
    ["Math libraries", "PETSc · hypre · Trilinos · SUNDIALS · SuperLU-DIST · MFEM · SLEPc · STRUMPACK · Ginkgo · libCEED", HEX.accent4],
    ["Applications", "LAMMPS · GROMACS · OpenFOAM · Quantum ESPRESSO · CP2K · WarpX · WRF · Nek5000 · Xyce · Laghos", HEX.accent2],
    ["Data & I/O", "HDF5 · ADIOS2 · NetCDF · PnetCDF · Conduit · Ascent · zfp · SZ3 · Darshan", HEX.accent1],
    ["Programming models", "MPICH · Open MPI · Kokkos · RAJA · Umpire · Legion · HPX · UPC++ · Chapel", HEX.accent3],
    ["Performance tools", "TAU · HPCToolkit · PAPI · Caliper · Dyninst", HEX.accent5],
    ["E4S tools", "e4s-cl 1.0.9 · e4s-alc 1.0.3 · Spack 1.1.1", HEX.accent6],
  ];
  cats.forEach((c, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.6 + col * 6.15, y = 1.5 + row * 1.6;
    card(s, { x, y, w: 5.95, h: 1.4, name: "cat-" + i });
    s.addShape(pres.shapes.OVAL, { x: x + 0.25, y: y + 0.25, w: 0.3, h: 0.3, fill: { color: c[2] }, line: { type: "none" }, objectName: "cat-dot-" + i });
    s.addText(c[0], { x: x + 0.7, y: y + 0.15, w: 5.0, h: 0.5, fontSize: 18, bold: true, color: C.text1, isTextBox: true, margin: 0, valign: "middle" });
    s.addText(c[1], { x: x + 0.7, y: y + 0.62, w: 5.05, h: 0.7, fontSize: 14, color: C.text1, isTextBox: true, margin: 0, valign: "top" });
  });
  s.addNotes("Counted with 'spack find -x' (127) and 'spack find' (685) inside the image. All built with gcc 13.3 for x86_64_v3 (AVX2), against MPICH 4.3.2. Point out that e4s-cl and e4s-alc are themselves inside the image, though today we run them from the host install.");

  // 16. How to inspect
  s = content("How to find out what is inside", "Part 2: Pull, inspect, run");
  terminal(s, [
    "$ apptainer inspect $E4S_IMAGE",
    "$ apptainer shell --writable-tmpfs $E4S_IMAGE",
    "Apptainer> source /spack/share/spack/setup-env.sh",
    "Apptainer> spack find -x            # 127 packages",
    "Apptainer> spack find -v petsc@3.25.1",
    "petsc@3.25.1 ~cuda+double+fortran~hypre+mpi",
    "             ~superlu-dist ...",
    "Apptainer> spack find -d hypre      # dependencies",
    "Apptainer> spack location -i lammps",
  ], { x: 0.6, y: 1.5, w: 7.6, fontSize: 14 });
  iconCircle(s, I.warn, 8.6, 1.6, 0.6, HEX.accent6, "gotcha-1");
  s.addText([{ text: "Spack wants a lock file. ", options: { bold: true, breakLine: true } }, { text: "The image is read-only, so add --writable-tmpfs or spack find fails." }], { x: 9.4, y: 1.5, w: 3.3, h: 1.3, fontSize: 15, color: C.text1, isTextBox: true, margin: 0, valign: "top" });
  iconCircle(s, I.warn, 8.6, 3.1, 0.6, HEX.accent6, "gotcha-2");
  s.addText([{ text: "Read the variants. ", options: { bold: true, breakLine: true } }, { text: "+ is on, ~ is off. This PETSc has no SuperLU_DIST and no hypre." }], { x: 9.4, y: 3.0, w: 3.3, h: 1.3, fontSize: 15, color: C.text1, isTextBox: true, margin: 0, valign: "top" });
  iconCircle(s, I.warn, 8.6, 4.6, 0.6, HEX.accent6, "gotcha-3");
  s.addText([{ text: "Prefer shell/exec over run. ", options: { bold: true, breakLine: true } }, { text: "run sources the image's bashrc, which writes into $HOME." }], { x: 9.4, y: 4.5, w: 3.3, h: 1.3, fontSize: 15, color: C.text1, isTextBox: true, margin: 0, valign: "top" });
  s.addNotes("Verifying the libraries you need — and how they were built — is one of the stated objectives. Real example from this image: there are two PETSc builds (3.21.6 and 3.25.1), so queries must name a version; 3.25.1 is ~superlu-dist, which breaks the ParaTools ex50 example's solver options. The PETSc challenge in Part 2 turns that into an exercise.");

  // 17. Slurm model
  s = content("Running containers under Slurm", "Part 2: Pull, inspect, run");
  // flow diagram
  const flow = [["sbatch job.sbatch", HEX.dk2], ["srun --mpi=pmi2", HEX.accent4], ["one container per rank", HEX.accent2], ["container MPICH ↔ Slurm PMI2", HEX.accent1]];
  flow.forEach((f, i) => {
    const y = 1.55 + i * 1.1;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y, w: 4.2, h: 0.8, fill: { color: f[1] }, rectRadius: 0.08, line: { type: "none" }, objectName: "flow-" + i });
    s.addText(f[0], { x: 0.6, y, w: 4.2, h: 0.8, fontSize: 17, bold: true, color: C.background1, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    if (i < flow.length - 1) s.addShape(pres.shapes.DOWN_ARROW, { x: 2.5, y: y + 0.82, w: 0.4, h: 0.26, fill: { color: C.accent5 }, line: { type: "none" }, objectName: "flow-arrow-" + i });
  });
  terminal(s, [
    "#!/bin/bash",
    "#SBATCH --nodes=1 --ntasks=8",
    "#SBATCH --time=00:10:00",
    "source $E4S_WORKSHOP/env.sh",
    "",
    "LMP=$(apptainer exec --writable-tmpfs \\",
    "  $E4S_IMAGE bash -c '. /spack/share/spack/\\",
    "  setup-env.sh && spack location -i lammps')/bin/lmp",
    "",
    "srun --mpi=pmi2 apptainer exec $E4S_IMAGE \\",
    "     $LMP -in in.lj -var x 2 -var y 2 -var z 2",
  ], { x: 5.3, y: 1.5, w: 7.4, fontSize: 13.5 });
  s.addText("Don't add --cleanenv here: the ranks find each other through PMI_* variables set by Slurm.", { x: 0.6, y: 6.15, w: 12.1, h: 0.4, fontSize: 15, italic: true, color: C.accent3, isTextBox: true, margin: 0 });
  s.addNotes("This is the 'hybrid' model: the host launcher (srun) starts one container per MPI rank and the MPI inside the container talks to Slurm via PMI2. Within a node this is efficient (shared memory). Across nodes, the container's MPICH doesn't know Midway3's InfiniBand stack — that's Part 3a. Measured: LAMMPS LJ melt, 256,000 atoms, 8 ranks: 13.9 M atom-steps/s.");

  // 18. Hands-on 2
  s = content("Hands-on 2: pull, inspect, run LAMMPS", "Part 2: Pull, inspect, run");
  terminal(s, [
    "$ cd $E4S_SCRATCH/e4s-labs/part2",
    "$ apptainer pull e4s-spack-cpu_26.06.sif \\",
    "      docker://ecpe4s/e4s-spack-cpu:26.06",
    "$ ./inspect.sh                # or explore with shell",
    "$ sbatch lammps.sbatch",
    "$ cat lammps-<jobid>.out",
    "Loop time of 1.86 on 8 procs for 100 steps",
    "Performance: ... 13.8 Matom-step/s",
  ], { x: 0.6, y: 1.5, w: 7.6, fontSize: 14.5 });
  bullets(s, [
    "Is HDF5 in the image? Is GROMACS built with MPI?",
    "Change --ntasks or the box size; compare Performance",
    ["Challenge: ", "petsc/ex50.sbatch compiles your own code against the image's PETSc"],
  ], { x: 8.6, y: 1.6, w: 4.1, h: 4.0, fontSize: 17, gap: 16 });
  handsOn(s, "LAB_GUIDE.md · Part 2  ·  25 minutes");
  s.addNotes("Start the pull first (it takes 2-4 minutes), then inspect while it runs. The LAMMPS job takes seconds once scheduled. PETSc challenge: GAMG works; ask them to try '-pc_type lu -pc_factor_mat_solver_type superlu_dist' and explain the failure from 'spack find -v petsc@3.25.1'. Suggest a 5-minute break after this slide.");

  // ============================================================ PART 3
  pres.addSection({ title: "Part 3: e4s-cl and e4s-alc" });
  s = pres.addSlide({ masterName: "SECTION", sectionTitle: "Part 3: e4s-cl and e4s-alc" });
  s.addText("PART 3  ·  45 MIN", { placeholder: "kicker" });
  s.addText("Two E4S tools: swap MPI at launch, add software to an image", { placeholder: "title" });
  s.addText("e4s-cl runs a container-built MPI program on the host's MPI. e4s-alc turns a short YAML recipe into a new image.", { placeholder: "body" });
  s.addImage({ data: await icon(fa.FaTools, HEX.accent1), x: 10.4, y: 2.6, w: 2.0, h: 2.0, objectName: "section-icon" });

  // 20. The MPI problem (charts)
  s = content("The container's MPI does not know Midway3's network", "Part 3: e4s-cl and e4s-alc");
  const labels = ["Container MPICH", "e4s-cl + host Intel MPI", "Host Intel MPI (native)"];
  s.addChart(pres.charts.BAR, [{ name: "Latency (µs)", labels, values: [12.4, 1.6, 1.6] }], {
    x: 0.6, y: 1.45, w: 5.9, h: 4.5, barDir: "bar", showTitle: true, title: "8-byte latency, µs (lower is better)", titleFontSize: 16, dataLabelFormatCode: "0.0", valAxisMinVal: 0, titleColor: HEX.dk1, titleFontFace: "+mn-lt",
    chartColors: [HEX.accent5, HEX.accent1, HEX.accent2],  showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 14, dataLabelColor: HEX.dk1, dataLabelFontFace: "+mn-lt",
    catAxisLabelColor: HEX.dk1, catAxisLabelFontSize: 13, catAxisLabelFontFace: "+mn-lt", valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, showLegend: false, catAxisOrientation: "maxMin", objectName: "latency-chart",
  });
  s.addChart(pres.charts.BAR, [{ name: "Bandwidth (GB/s)", labels, values: [2.2, 11.8, 11.7] }], {
    x: 6.8, y: 1.45, w: 5.9, h: 4.5, barDir: "bar", showTitle: true, title: "4 MB bandwidth, GB/s (higher is better)", titleFontSize: 16, dataLabelFormatCode: "0.0", valAxisMinVal: 0, titleColor: HEX.dk1, titleFontFace: "+mn-lt",
    chartColors: [HEX.accent5, HEX.accent1, HEX.accent2],  showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 14, dataLabelColor: HEX.dk1, dataLabelFontFace: "+mn-lt",
    catAxisLabelColor: HEX.dk1, catAxisLabelFontSize: 13, catAxisLabelFontFace: "+mn-lt", valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, showLegend: false, catAxisOrientation: "maxMin", objectName: "bandwidth-chart",
  });
  s.addText("Same container-built binary in all three bars. Ping-pong between two caslake nodes, measured Oct 24, 2026.", { x: 0.6, y: 6.15, w: 12.1, h: 0.4, fontSize: 14, italic: true, color: C.accent5, isTextBox: true, margin: 0 });
  s.addNotes("The container's MPICH 4.3.2 uses libfabric but doesn't have Midway3's verbs/mlx5 provider stack configured, so between nodes it falls back to TCP: ~12 µs latency and ~2.2 GB/s. Midway3's Intel MPI uses InfiniBand HDR: 1.6 µs and 11.7 GB/s. e4s-cl gives the container binary the host's numbers. Within one node the container's MPICH is already fast (0.6 µs, 7.8 GB/s through shared memory): the gap is the network.");

  // 21. MPICH ABI
  s = content("Why swapping works: the MPICH ABI", "Part 3: e4s-cl and e4s-alc");
  s.addTable([
    [{ text: "MPI implementation", options: { bold: true, color: HEX.lt1, fill: { color: HEX.dk2 } } },
     { text: "Library", options: { bold: true, color: HEX.lt1, fill: { color: HEX.dk2 } } },
     { text: "Swap into an MPICH-built container", options: { bold: true, color: HEX.lt1, fill: { color: HEX.dk2 } } }],
    ["MPICH (in the E4S images)", { text: "libmpi.so.12", options: { fontFace: MONO } }, { text: "directly", options: { bold: true, color: HEX.accent2 } }],
    ["Intel MPI  (Midway3: intelmpi/2021.5)", { text: "libmpi.so.12", options: { fontFace: MONO } }, { text: "directly", options: { bold: true, color: HEX.accent2 } }],
    ["MVAPICH, Cray MPICH", { text: "libmpi.so.12", options: { fontFace: MONO } }, { text: "directly", options: { bold: true, color: HEX.accent2 } }],
    ["Open MPI", { text: "libmpi.so.40", options: { fontFace: MONO } }, { text: "via Wi4MPI translation (e4s-cl --from mpich)", options: { bold: true, color: HEX.accent1 } }],
  ], { x: 0.6, y: 1.5, w: 12.1, colW: [4.6, 2.6, 4.9], fontSize: 17, fontFace: THEME.bodyFontFace, color: HEX.dk1, border: { type: "solid", pt: 1, color: "D5DCE2" }, rowH: 0.66, valign: "middle", objectName: "abi-table" });
  bullets(s, [
    ["Applications and libraries stay in the container; ", "only the MPI library and its network stack come from the host"],
    ["Goal: ", "build an MPI binary once, run it unmodified on any x86_64 cluster at native speed"],
  ], { x: 0.6, y: 5.0, w: 12.1, h: 1.4, fontSize: 18, gap: 12 });
  caption(s, "After S. Shende, “Running MPI applications on other systems”, E4S at NERSC, 2022; MPICH ABI initiative, mpich.org/abi.", 0.6, 6.55, 12);
  s.addNotes("The MPICH ABI compatibility initiative means MPICH-family libraries share symbol names and type layouts, so a program linked against libmpi.so.12 can load any of them. Midway3's mpich modules are also ABI-compatible but use TCP between nodes in our tests; Intel MPI is the one with the fast verbs path.");

  // 22. How e4s-cl works
  s = content("How e4s-cl works", "Part 3: e4s-cl and e4s-alc");
  s.addImage({ path: path.join(ASSETS, "e4scl_diagram.png"), x: 0.6, y: 1.5, w: 7.6, h: 7.6 * 990 / 2353, objectName: "e4scl-diagram", altText: "e4s-cl architecture: e4s-cl launch on the login host invokes the MPI launcher, which starts e4s-cl execute on each work host; each resolves host libraries and launches a container with host libraries layered over the MPI program" });
  const steps = [
    ["Profile", "which host MPI libraries and files to inject"],
    ["Launch", "e4s-cl launch wraps your launcher (mpirun / srun)"],
    ["Bind", "on each node, host libraries are mounted at /.e4s-cl/hostlibs"],
    ["Preload", "LD_PRELOAD/LD_LIBRARY_PATH point libmpi.so.12 at the host's"],
  ];
  steps.forEach((st, i) => {
    const y = 1.55 + i * 1.05;
    s.addShape(pres.shapes.OVAL, { x: 8.6, y, w: 0.6, h: 0.6, fill: { color: C.accent1 }, line: { type: "none" }, objectName: "step-" + i });
    s.addText(String(i + 1), { x: 8.6, y, w: 0.6, h: 0.6, fontSize: 18, bold: true, color: C.background1, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    s.addText([{ text: st[0] + ": ", options: { bold: true } }, { text: st[1] }], { x: 9.35, y: y - 0.08, w: 3.35, h: 0.85, fontSize: 15, color: C.text1, isTextBox: true, margin: 0, valign: "middle" });
  });
  terminal(s, ["$ e4s-cl launch mpirun -np 8 -ppn 4 ./hypre_test"], { x: 0.6, y: 5.0, w: 7.6, h: 0.7, fontSize: 15, name: "launch-cmd" });
  caption(s, "Diagram: S. Shende, “e4s-cl Container Launcher”, E4S at NERSC training, Aug 2022.", 0.6, 6.55, 12);
  s.addNotes("e4s-cl is a thin wrapper over the launcher. On each node it resolves the profile's libraries (and their dependencies), binds them into the container, and preloads them so the host's libmpi wins even over RPATHs in the guest. glibc always comes from the container; host libraries built for an older glibc (CentOS 8: 2.28) run fine on the container's newer one (2.39).");

  // 23. e4s-cl on Midway3
  s = content("e4s-cl on Midway3", "Part 3: e4s-cl and e4s-alc");
  terminal(s, [
    "# usual way: trace a test program (uses ptrace)",
    "$ module load intelmpi/2021.5",
    "$ e4s-cl init --backend apptainer --image $E4S_IMAGE",
    "",
    "# Midway3 disables ptrace -> build the profile by hand",
    "$ e4s-cl profile create midway3-impi \\",
    "      --backend apptainer --image $E4S_IMAGE",
    "$ e4s-cl profile edit midway3-impi --add-libraries \\",
    "      $I_MPI_ROOT/lib/release/libmpi.so.12 ...",
    "$ e4s-cl profile edit midway3-impi --add-files ...",
    "$ e4s-cl profile select midway3-impi",
    "",
    "$ e4s-cl launch mpirun -np 2 -ppn 1 ./pingpong",
  ], { x: 0.6, y: 1.5, w: 7.6, fontSize: 13.5 });
  bullets(s, [
    ["make_e4scl_profile.sh ", "does the hand-built profile for you"],
    ["Library list ", "= what Intel MPI loads on Midway3 (captured with LD_DEBUG): libmpi, libfabric + providers, verbs, mlx5, UCX, Slurm PMI"],
    ["Launch with mpirun ", "(Intel MPI's hydra). e4s-cl + srun --mpi=pmi2 hung at startup in our tests"],
  ], { x: 8.6, y: 1.6, w: 4.1, h: 4.9, fontSize: 15.5, gap: 14 });
  s.addNotes("kernel.yama.ptrace_scope=3 on Midway3 login and compute nodes, so 'e4s-cl init' and 'e4s-cl profile detect' cannot trace. The hand-built profile is equivalent. Without e4s-cl, srun --mpi=pmi2 with the same libraries bound manually works too — the hang is specific to e4s-cl's srun path, so we use mpirun, which is also the form in Sameer's slides (e4s-cl mpirun -np 4 ./a.out).");

  // 24. Hands-on 3a
  s = content("Hands-on 3a: same binary, two MPIs", "Part 3: e4s-cl and e4s-alc");
  terminal(s, [
    "$ cd $E4S_SCRATCH/e4s-labs/part3-mpi",
    "$ ./compile.sh                 # inside the container",
    "$ sbatch 01_container_mpi.sbatch",
    "$ ./make_e4scl_profile.sh",
    "$ sbatch 02_e4s-cl.sbatch",
    "$ grep -A7 'MPI library' mpi-*.out",
  ], { x: 0.6, y: 1.5, w: 7.6, fontSize: 15 });
  handsOn(s, "LAB_GUIDE.md · Part 3a  ·  15 minutes");
  terminal(s, [
    "MPI library : MPICH Version: 4.3.2",
    "           8     12.39 us       0.6 MB/s",
    "     4194304   1883.41 us    2227.0 MB/s",
    "MPI library : Intel(R) MPI Library 2021.5",
    "           8      1.61 us       5.0 MB/s",
    "     4194304    356.68 us   11759.4 MB/s",
  ], { x: 0.6, y: 3.85, w: 7.6, fontSize: 14, name: "expected" });
  bullets(s, [
    "The binary never changed — the reported MPI library did",
    "~8× lower latency, ~5× higher bandwidth",
    "02 also runs a hypre AMG solve on 8 ranks across 2 nodes",
  ], { x: 8.6, y: 1.6, w: 4.1, h: 4.8, fontSize: 17, gap: 16 });
  s.addNotes("compile.sh builds pingpong and hypre_test (from the ParaTools tutorial) inside the image against its MPICH and hypre 3.1.0. 01 uses srun --mpi=pmi2 with the container's MPICH; 02 loads intelmpi/2021.5 and runs 'e4s-cl launch mpirun'. hypre_test: 120^3 Laplacian, AMG-PCG, 30 iterations, residual 9.5e-09.");

  // 25. Three ways to add software
  s = content("Adding software to an existing image: three ways", "Part 3: e4s-cl and e4s-alc");
  const ways = [
    [I.layers, HEX.accent4, "e4s-chain-spack.sh", "No rebuild", "Chain a Spack in your home directory to the image's Spack; spack install adds packages on top, reusing everything inside.", "/etc/e4s/e4s-chain-spack.sh ~/spack"],
    [I.file, HEX.accent1, "e4s-alc", "New image", "A YAML recipe → Apptainer definition file → apptainer build. Reproducible; share or archive the SIF.", "e4s-alc create -f recipe.yaml"],
    [I.puzzle, HEX.accent2, "Your app in the full image", "New image, big", "Same e4s-alc recipe with the 25 GB E4S image as the base: your code compiled against the whole stack.", "extras/e4s-plus-app.yaml"],
  ];
  ways.forEach((w, i) => {
    const x = 0.6 + i * 4.1;
    card(s, { x, y: 1.5, w: 3.85, h: 4.9, name: "way-" + i });
    iconCircle(s, w[0], x + 0.3, 1.8, 0.85, w[1], "way-" + i);
    s.addText(w[3], { x: x + 1.3, y: 1.9, w: 2.35, h: 0.6, fontSize: 15, bold: true, color: C.accent5, align: "right", isTextBox: true, margin: 0 });
    s.addText(w[2], { x: x + 0.3, y: 2.85, w: 3.3, h: 0.6, fontSize: 20, bold: true, color: C.text1, isTextBox: true, margin: 0 });
    s.addText(w[4], { x: x + 0.3, y: 3.45, w: 3.3, h: 1.9, fontSize: 15, color: C.text1, isTextBox: true, margin: 0, valign: "top" });
    s.addText(w[5], { x: x + 0.3, y: 5.5, w: 3.3, h: 0.6, fontSize: 12, fontFace: MONO, color: C.accent3, isTextBox: true, margin: 0, valign: "top" });
  });
  caption(s, "e4s-alc and e4s-chain-spack.sh: S. Shende, “E4S Tools”, E4S 25.11 release slides.", 0.6, 6.55, 12);
  s.addNotes("e4s-chain-spack.sh is the fastest path for a single user — no image rebuild, packages land in $HOME and reuse the image's installs as an upstream. e4s-alc is the path to a reproducible artifact. Customizing the full 25 GB image works but is slow and needs ~80 GB of node-local disk; on Midway3 it also needs a sandbox step (see next slides).");

  // 26. e4s-alc flow
  s = content("e4s-alc: from YAML to a new image", "Part 3: e4s-cl and e4s-alc");
  terminal(s, [
    "# hypre.yaml",
    "backend: singularity",
    "bootstrap: localimage",
    "image: .../ecpe4s-ubuntu24.04.sif",
    "os-packages:",
    "  - nano",
    "post-system-stage-commands:",
    "  - . /spack/share/spack/setup-env.sh",
    "  - spack mirror add e4s-alc-example \\",
    "      https://cache.e4s.io/e4s-alc-example-1",
    "  - spack buildcache keys --install --trust",
    "  - spack install hypre",
    "spack: False",
  ], { x: 0.6, y: 1.5, w: 6.2, fontSize: 13.5 });
  const af = [["e4s-alc create -f hypre.yaml", "writes hypre.def", HEX.accent4], ["apptainer build --fakeroot", "hypre.sif, 1.2 GB", HEX.accent1], ["≈ 2 minutes on 8 cores", "binaries from the E4S cache, nothing compiled", HEX.accent2]];
  af.forEach((a, i) => {
    const y = 1.55 + i * 1.65;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.2, y, w: 5.5, h: 1.3, fill: { color: a[2] }, rectRadius: 0.08, line: { type: "none" }, objectName: "alc-flow-" + i });
    s.addText([{ text: a[0], options: { bold: true, breakLine: true, fontSize: 18 } }, { text: a[1], options: { fontSize: 15 } }], { x: 7.45, y, w: 5.1, h: 1.3, color: C.background1, valign: "middle", isTextBox: true, margin: 0 });
    if (i < af.length - 1) s.addShape(pres.shapes.DOWN_ARROW, { x: 9.75, y: y + 1.32, w: 0.4, h: 0.3, fill: { color: C.accent5 }, line: { type: "none" }, objectName: "alc-arrow-" + i });
  });
  caption(s, "Recipe adapted from the E4S/ParaTools tutorial (github.com/ParaToolsInc/e4s-cloud-examples).", 0.6, 6.55, 12);
  s.addNotes("This is Sameer's hypre example with one change: bootstrap from the shared local copy of ecpe4s/ubuntu24.04 instead of Docker Hub, so 30 people don't re-download it. e4s-alc also adds a list of default Ubuntu packages (build-essential, cmake, ...). Measured: 83 s on 32 cores, 2 min on 8 cores; result 1.2 GB with hypre 2.33.0 + MPICH 4.3.1.");

  // 27. Hands-on 3b
  s = content("Hands-on 3b: build an image, then run it with e4s-cl", "Part 3: e4s-cl and e4s-alc");
  terminal(s, [
    "$ cd $E4S_SCRATCH/e4s-labs/part3-alc",
    "$ e4s-alc create -f hypre.yaml",
    "$ less hypre.def",
    "$ sbatch build.sbatch           # ~2 min",
    "$ sbatch 03_run_custom.sbatch   # 2 nodes, e4s-cl",
    "$ tail -3 alc-run-<jobid>.out",
    "Iterations = 30",
    "Final Relative Residual Norm = 9.525616e-09",
  ], { x: 0.6, y: 1.5, w: 7.6, fontSize: 14.5 });
  bullets(s, [
    "Read the generated hypre.def: which parts came from your YAML?",
    ["Try: ", "add htop to os-packages, or spack install sundials; rebuild"],
    ["Note: ", "e4s-cl launch --image hypre.sif reuses the same host-MPI profile with a different image"],
  ], { x: 8.6, y: 1.6, w: 4.1, h: 4.4, fontSize: 16, gap: 14 });
  handsOn(s, "LAB_GUIDE.md · Part 3b  ·  15 minutes");
  s.addNotes("If the build queue is slow, a pre-built hypre.sif can be copied from $E4S_WORKSHOP/images (if staged). The run job compiles hypre_test against the new image's hypre 2.33 and runs it with e4s-cl on 8 ranks / 2 nodes.");

  // 28. Customizing the full image
  s = content("Customizing the full 25 GB E4S image (demo)", "Part 3: e4s-cl and e4s-alc");
  terminal(s, [
    "# extras/e4s-plus-app.yaml (excerpt)",
    "bootstrap: localimage",
    "image: .../e4s-cpu-x86_64-26.06.sif",
    "add-files:",
    "  - hypre_test.c /opt/app/",
    "os-packages:",
    "  - htop",
    "post-system-stage-commands:",
    "  - spack load mpich hypre",
    "  - cd /opt/app && mpicc ... -lHYPRE",
    "spack: False   # keep the image's Spack",
  ], { x: 0.6, y: 1.5, w: 6.2, fontSize: 13.5 });
  bullets(s, [
    ["Same tool, same recipe format: ", "your application baked into the full stack"],
    ["Cost: ", "measured ~15 min on 32 cores (2 min unpack, 12 min build) and ~160 GB of node-local disk; result 25.6 GB"],
    ["Midway3 detail: ", "no /etc/subuid, so --fakeroot can't unpack files owned by other users. Unpack to a sandbox first, then build from the sandbox"],
    ["For one-off additions, ", "e4s-chain-spack.sh avoids the rebuild entirely"],
  ], { x: 7.2, y: 1.6, w: 5.5, h: 4.8, fontSize: 16, gap: 12 });
  s.addNotes("Show the pre-built result rather than building live: $E4S_WORKSHOP/images/demo-e4s-plus-app.sif. Try: apptainer exec $E4S_WORKSHOP/images/demo-e4s-plus-app.sif /opt/app/hypre_test -n 30 30 30, and apptainer exec ... which htop. Measured on the build partition (32 cores, local /tmp): sandbox unpack 118 s (76 GB), build from sandbox 736 s, output 25.6 GB. The direct --fakeroot build from the SIF fails on Midway3 because there are no /etc/subuid entries, so unsquashfs cannot restore files owned by other users (postfix, mail). Note the customized image also replaces the E4S runscript, so apptainer run no longer sources the npm-writing bashrc.");

  // 29. Optional: layered E4S (Parm Sinha's SC26 research poster; manuscript with S. Shende)
  // Figures are only those published in the poster abstract (sc26 rpost284).
  s = content("What's next: layered E4S", "Part 3: e4s-cl and e4s-alc");
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 11.3, y: 0.55, w: 1.4, h: 0.42, fill: { color: C.accent5 }, rectRadius: 0.21, line: { type: "none" }, objectName: "optional-tag" });
  s.addText("OPTIONAL", { x: 11.3, y: 0.55, w: 1.4, h: 0.42, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle", isTextBox: true, margin: 0, objectName: "optional-tag-text" });
  // layer diagram
  ["AMReX sm_80", "AMReX sm_90", "heFFTe"].forEach((t, i) => {
    const x = 0.6 + i * 1.95;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.6, w: 1.8, h: 0.8, fill: { color: C.accent1 }, rectRadius: 0.08, line: { type: "none" }, objectName: "spec-layer-" + i });
    s.addText(t, { x, y: 1.6, w: 1.8, h: 0.8, fontSize: 15, bold: true, color: C.background1, align: "center", valign: "middle", isTextBox: true, margin: 0 });
  });
  s.addText("Specialized layers: only the GPU-compiled packages, one per target", { x: 0.6, y: 2.45, w: 5.7, h: 0.4, fontSize: 13, italic: true, color: C.text1, isTextBox: true, margin: 0 });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 2.95, w: 5.7, h: 1.05, fill: { color: C.accent2 }, rectRadius: 0.08, line: { type: "none" }, objectName: "provider-layer" });
  s.addText([{ text: "Shared provider", options: { bold: true, fontSize: 17, breakLine: true } }, { text: "architecture-generic dependencies, built once", options: { fontSize: 14 } }], { x: 0.85, y: 2.95, w: 5.3, h: 1.05, color: C.background1, valign: "middle", isTextBox: true, margin: 0 });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 4.15, w: 5.7, h: 0.85, fill: { color: C.text2 }, rectRadius: 0.08, line: { type: "none" }, objectName: "base-layer" });
  s.addText([{ text: "Base image", options: { bold: true, fontSize: 17, breakLine: true } }, { text: "OS, compiler, MPI, CUDA", options: { fontSize: 14 } }], { x: 0.85, y: 4.15, w: 5.3, h: 0.85, color: C.background1, valign: "middle", isTextBox: true, margin: 0 });
  s.addText("Layers compose at run time through absolute RPATHs under fixed paths, with no search-path setup. e4s-alc repacks a whole image; layering rebuilds only the layer that changed.", { x: 0.6, y: 5.15, w: 5.7, h: 1.0, fontSize: 14, color: C.text1, isTextBox: true, margin: 0, valign: "top" });
  // results (as published in the SC26 poster abstract)
  const res2 = [
    ["Midway3 and NSF ACCESS Anvil", "1 of 20", "buildable packages compiled per specialized layer", "The rest are reused from the shared provider; the same trees run under Apptainer and Charliecloud"],
    ["Each extra GPU target (Anvil)", "1,412", "files added, vs. 10,772 for a monolithic build", "Rebuilding a layer is 1.8–2.8× faster; application performance unchanged on A100 and H100"],
  ];
  res2.forEach((r, i) => {
    const y = 1.5 + i * 2.4;
    card(s, { x: 6.85, y, w: 5.85, h: 2.2, name: "layered-result-" + i });
    s.addText(r[0], { x: 7.15, y: y + 0.18, w: 5.3, h: 0.35, fontSize: 13, bold: true, color: C.accent5, isTextBox: true, margin: 0 });
    s.addText(r[1], { x: 7.15, y: y + 0.55, w: 2.5, h: 0.85, fontSize: 40, bold: true, color: C.accent1, isTextBox: true, margin: 0, valign: "middle" });
    s.addText(r[2], { x: 9.7, y: y + 0.55, w: 2.8, h: 0.85, fontSize: 15, color: C.text1, isTextBox: true, margin: 0, valign: "middle" });
    s.addText(r[3], { x: 7.15, y: y + 1.45, w: 5.35, h: 0.65, fontSize: 14, color: C.text1, isTextBox: true, margin: 0, valign: "top" });
  });
  s.addText("P. Sinha, “Union of Containers: Layered Software Stacks with Cross-Container Dependency Reuse for HPC,” SC26 research poster, Tue Nov 17, 2026. Manuscript in preparation with S. Shende. Not part of the hands-on.", { x: 0.6, y: 6.3, w: 12.1, h: 0.6, fontSize: 11, italic: true, color: C.accent5, isTextBox: true, margin: 0, valign: "top", objectName: "poster-citation" });
  s.addNotes("Optional, 1-2 minutes, only if time allows. This is my own research on top of E4S: an accepted SC26 research poster, \"Union of Containers: Layered Software Stacks with Cross-Container Dependency Reuse for HPC\" (on display Tuesday Nov 17, 10 AM-5 PM, Skyline Ballroom North Pre-Function), part of a manuscript in preparation with Sameer Shende as second author. Idea: HPC stacks usually ship one container image per accelerator target, and each image duplicates the CPU-generic majority of the stack. Instead, a shared provider holds the architecture-generic dependencies and thin specialized layers hold only the GPU-compiled packages, reusing the provider's builds instead of recompiling them. The layers compose at run time through absolute RPATH entries under fixed paths, so no LD_LIBRARY_PATH or other search-path setup is needed. Results, as published in the poster abstract: with Spack and E4S recipes each specialized layer compiled 1 of 20 buildable packages, at both Midway3 and NSF ACCESS Anvil; on Anvil each further GPU target adds 1,412 files where a monolithic build adds 10,772, rebuilding a layer is 1.8 to 2.8 times faster, and application performance is unchanged on A100 and H100 GPUs; the same install trees run unmodified under Apptainer and Charliecloud. The poster also reports four constraints on where reuse holds. Contrast with Part 3b: e4s-alc produces a new full image, while layering rebuilds only the layer that changed. Invite anyone interested to the poster.");

  // ============================================================ WRAP-UP
  pres.addSection({ title: "Wrap-up" });
  s = content("Takeaways", "Wrap-up");
  const take = [
    [I.lock, HEX.accent4, "Apptainer runs containers as you", "No daemon, no root, one SIF file, works with Slurm."],
    [I.box, HEX.accent2, "E4S images replace installs", "600+ co-tested packages; inspect variants before relying on them."],
    [I.bolt, HEX.accent1, "e4s-cl gives container MPI native speed", "Same binary, host MPI: 1.6 µs and 11.8 GB/s across nodes."],
    [I.plus, HEX.accent3, "e4s-alc customizes images", "YAML recipe, binaries from the E4S cache, a new image in minutes."],
  ];
  take.forEach((t, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.6 + col * 6.15, y = 1.55 + row * 2.4;
    card(s, { x, y, w: 5.95, h: 2.15, name: "take-" + i });
    iconCircle(s, t[0], x + 0.3, y + 0.35, 0.9, t[1], "take-" + i);
    s.addText(t[2], { x: x + 1.45, y: y + 0.3, w: 4.3, h: 0.9, fontSize: 19, bold: true, color: C.text1, isTextBox: true, margin: 0, valign: "middle" });
    s.addText(t[3], { x: x + 1.45, y: y + 1.2, w: 4.3, h: 0.8, fontSize: 15, color: C.text1, isTextBox: true, margin: 0, valign: "top" });
  });
  s.addNotes("Mirrors Sameer Shende's conclusions (MUG'26): using E4S containers saves time; customize full-featured or base containers with e4s-alc; substitute the container's MPI with the system MPI using e4s-cl.");

  s = content("Keep going", "Wrap-up");
  const res = [
    ["E4S", "e4s.io  ·  e4s.io/container-download  ·  e4s.io/e4s-buildcache"],
    ["E4S tools", "e4s-cl.readthedocs.io  ·  e4s-alc.readthedocs.io  ·  github.com/E4S-Project"],
    ["Examples", "github.com/ParaToolsInc/e4s-cloud-examples (LAMMPS, PETSc, OSU, hypre, …)"],
    ["Apptainer", "apptainer.org/docs/user/latest"],
    ["Today's labs", "/project/rcc/workshops/e4s/labs  ·  LAB_GUIDE.md"],
    ["RCC help", "help@rcc.uchicago.edu  ·  RCC container workshops for building images"],
  ];
  res.forEach((r, i) => {
    const y = 1.45 + i * 0.6;
    s.addText(r[0], { x: 0.6, y, w: 2.4, h: 0.5, fontSize: 18, bold: true, color: C.accent1, isTextBox: true, margin: 0, valign: "middle" });
    s.addText(r[1], { x: 3.0, y, w: 9.7, h: 0.5, fontSize: 17, color: C.text1, isTextBox: true, margin: 0, valign: "middle" });
  });
  // SC26 follow-ups (both sessions confirmed on sc26.conference-program.com)
  card(s, { x: 0.6, y: 5.1, w: 12.1, h: 1.55, name: "sc26-card" });
  iconCircle(s, I.users, 0.9, 5.42, 0.9, HEX.accent4, "sc26");
  s.addText("Continue at SC26", { x: 2.05, y: 5.22, w: 10.4, h: 0.4, fontSize: 18, bold: true, color: C.text1, isTextBox: true, margin: 0, valign: "middle" });
  s.addText([
    { text: "Mon Nov 16, 9:00 AM, W175a: ", options: { bold: true } },
    { text: "S. Shende, “E4S: An HPC-AI Software Ecosystem for Science”", options: { breakLine: true } },
    { text: "Tue Nov 17, poster session: ", options: { bold: true } },
    { text: "P. Sinha, “Union of Containers” (the layered E4S work on slide 29)" },
  ], { x: 2.05, y: 5.68, w: 10.5, h: 0.85, fontSize: 15, color: C.text1, isTextBox: true, margin: 0, valign: "top", paraSpaceAfter: 4, objectName: "sc26-sessions" });
  s.addNotes("The shared install stays in place after the workshop; participants can keep using env.sh and the image for their own work. Two SC26 follow-ups: Sameer Shende presents \"E4S: An HPC-AI Software Ecosystem for Science\" in the Sovereign AI Supercomputing Cloud Workshop on Monday Nov 16, 9:00-9:30 AM CST, room W175a (workshop or technical-program registration needed); my poster \"Union of Containers\" (the layered-E4S work on slide 29) is on display Tuesday Nov 17, 10 AM-5 PM, Skyline Ballroom North Pre-Function.");

  s = pres.addSlide({ masterName: "TITLE", sectionTitle: "Wrap-up" });
  s.addText("Thank you", { placeholder: "title" });
  s.addText("Questions?", { placeholder: "subtitle" });
  s.addText([
    { text: "Portions of this workshop are adapted from E4S tutorials by Sameer Shende (University of Oregon / ParaTools, Inc.) and the ParaTools e4s-cloud-examples, used with permission.", options: { breakLine: true } },
    { text: "E4S is supported by DOE ASCR and the High Performance Software Foundation. Measurements: RCC Midway3, October 2026." },
  ], { placeholder: "details" });
  s.addNotes("Credits slide. Then advance to the last slide and leave it up during Q&A.");

  // Q&A: how personal cases get followed up
  s = content("Questions? Your own case after today", "Wrap-up");
  terminal(s, [
    "To:      help@rcc.uchicago.edu",
    "Subject: [E4S workshop] <software>: <one-line problem>",
    "",
    "CNetID and PI account:",
    "Software and version:",
    "What you ran (command or sbatch script):",
    "Full error text (copied, not a screenshot):",
    "Image you used, if any:",
  ], { x: 0.6, y: 1.5, w: 7.3, fontSize: 15, name: "followup-email" });
  const fu = [
    [I.file, HEX.accent4, "Becomes an RCC ticket", "Nothing gets lost, and other RCC staff can pick it up."],
    [I.clock, HEX.accent2, "Follow-up this week", "Similar cases get one shared answer or a short clinic."],
    [I.users, HEX.accent1, "Quick ones at the break", "If it takes under two minutes, ask me in person."],
  ];
  fu.forEach((f, i) => {
    const y = 1.55 + i * 1.3;
    iconCircle(s, f[0], 8.3, y, 0.75, f[1], "followup-" + i);
    s.addText(f[2], { x: 9.25, y: y - 0.05, w: 3.45, h: 0.45, fontSize: 18, bold: true, color: C.text1, isTextBox: true, margin: 0, valign: "middle" });
    s.addText(f[3], { x: 9.25, y: y + 0.4, w: 3.45, h: 0.75, fontSize: 15, color: C.text1, isTextBox: true, margin: 0, valign: "top" });
  });
  s.addText([
    { text: "help@rcc.uchicago.edu", options: { bold: true, color: C.accent1 } },
    { text: "   ·   subject: ", options: { color: C.text1 } },
    { text: "[E4S workshop] …", options: { bold: true, color: C.accent1 } },
  ], { x: 0.6, y: 5.55, w: 12.1, h: 0.7, fontSize: 28, isTextBox: true, margin: 0, valign: "middle", objectName: "followup-address" });
  s.addNotes("Leave this up during Q&A. When someone raises their own problem: if a lab part covers it, say which; if it takes under two minutes, do it at the end; otherwise ask them to email help@ with [E4S workshop] and note their name in instructor/followup_tracker.csv. Afterwards: rt_cli.py list --queue general --subject \"E4S workshop\" pulls every case.");

  await pres.writeFile({ fileName: path.join(__dirname, OUT) });
  await fixRunParagraphProps(path.join(__dirname, OUT));
  await applyThemeColors(path.join(__dirname, OUT), THEME);
  console.log("wrote", OUT);
})().catch(e => { console.error(e); process.exit(1); });
