export type GalleryItem = {
  type: 'image' | 'video';
  src: string;
  /** Poster frame for videos (also the fallback if the video is missing). */
  poster?: string;
  label: string;
  /** Which parallax row it belongs to. */
  row: 0 | 1;
};

// Archive — eight motion studies riding two rows that drift opposite ways on
// scroll. Sources live in public/videos/archive/ as lossless-VP9 .webm with a
// matching .webp poster so the grid paints instantly and the clips stream in.
type Clip = { name: string; label: string; row: 0 | 1 };

const CLIPS: Clip[] = [
  // Column 1
  { name: 'scene-06', label: 'Scene study', row: 0 },
  { name: 'robotexon', label: 'Robotexon', row: 0 },
  { name: 'screen-01', label: 'Interface study', row: 0 },
  { name: 'planet-earth', label: 'Logo reveal', row: 0 },
  // Column 2
  { name: 'pixe', label: 'Pixel play', row: 1 },
  { name: 'screen-02', label: 'Flow test', row: 1 },
  { name: 'screen-04', label: 'Prototype', row: 1 },
  { name: 'screen-03', label: 'Detail pass', row: 1 },
];

export const GALLERY: GalleryItem[] = CLIPS.map(({ name, label, row }) => ({
  type: 'video',
  src: `/videos/archive/${name}.webm`,
  poster: `/videos/archive/${name}.webp`,
  label,
  row,
}));
