// Coordinates in the original mechanism PNG, before the existing SVG crop.
// Each half of a shared diamond is a separate finger attached to a fixed pin.
export const pointerMounts = [
  { id: 'left', x: 251, y: 405 },
  { id: 'middle-left', x: 800, y: 405 },
  { id: 'middle-right', x: 1357, y: 405 },
  { id: 'right', x: 1912, y: 405 },
] as const

// Rebuild a continuous band of the frame underneath each former pointer.
// The clean strip immediately below the heads contains the real brass posts,
// dark arcs and transparent drum windows, rather than a pointer-shaped hole.
export const pointerBackgroundPatches = [
  { id: 'left', x: 245, width: 88, y: 360, height: 90, donorY: 444, donorHeight: 18 },
  { id: 'middle-left', x: 737, width: 126, y: 360, height: 90, donorY: 444, donorHeight: 18 },
  { id: 'middle-right', x: 1294, width: 126, y: 360, height: 90, donorY: 444, donorHeight: 18 },
  { id: 'right', x: 1825, width: 96, y: 360, height: 90, donorY: 444, donorHeight: 18 },
] as const

export const pointerDefinitions = [
  { id: 'left', drum: 0, side: 1, x: 251, y: 405, path: 'M266 374 L325 404 L266 435Z' },
  { id: 'middle-left-topic', drum: 0, side: -1, x: 800, y: 405, path: 'M800 370 L744 404 L800 439Z' },
  { id: 'middle-left-format', drum: 1, side: 1, x: 800, y: 405, path: 'M800 370 L856 404 L800 439Z' },
  { id: 'middle-right-format', drum: 1, side: -1, x: 1357, y: 405, path: 'M1357 370 L1301 404 L1357 439Z' },
  { id: 'middle-right-angle', drum: 2, side: 1, x: 1357, y: 405, path: 'M1357 370 L1413 404 L1357 439Z' },
  { id: 'right', drum: 2, side: -1, x: 1912, y: 405, path: 'M1897 373 L1832 404 L1897 436Z' },
] as const
