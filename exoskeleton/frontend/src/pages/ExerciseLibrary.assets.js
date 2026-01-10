// Sample exercise metadata and small SVG poster data URIs used as a fallback when backend has no exercises
export const SAMPLE_EXERCISES = [
  {
    id: 101,
    name: 'Finger Flexion - Demo',
    description: 'Controlled finger flexion exercise with wrist stability.',
    // tiny silent WebM placeholder (very small, low-res). Replace with real sample when available.
    video_data: 'data:video/webm;base64,GkXfo0AgQoaBAAAABQAAABQbG9uZwAAAA1lbWJlZGMBAAAACnZpZGVvGQAAAAAA',
    image_url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'>
        <rect width='100%' height='100%' fill='#121212'/>
        <text x='50%' y='50%' fill='#00d4ff' font-size='28' font-family='Arial' text-anchor='middle' alignment-baseline='middle'>Finger Flexion (sample)</text>
      </svg>
    `)
  },
  {
    id: 102,
    name: 'Wrist Extension - Demo',
    description: 'Wrist extension with finger tracking for rehabilitation.',
    video_data: 'data:video/webm;base64,GkXfo0AgQoaBAAAABQAAABQbG9uZwAAAA1lbWJlZGMBAAAACnZpZGVvGQAAAAAB',
    image_url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'>
        <rect width='100%' height='100%' fill='#0b132b'/>
        <text x='50%' y='50%' fill='#ffb86b' font-size='28' font-family='Arial' text-anchor='middle' alignment-baseline='middle'>Wrist Extension (sample)</text>
      </svg>
    `)
  },
  {
    id: 103,
    name: 'Wrist Flexion - Demo',
    description: 'Wrist flexion exercise with optical sensing support.',
    video_data: 'data:video/webm;base64,GkXfo0AgQoaBAAAABQAAABQbG9uZwAAAA1lbWJlZGMBAAAACnZpZGVvGQAAAAAC',
    image_url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'>
        <rect width='100%' height='100%' fill='#1a1a1a'/>
        <text x='50%' y='50%' fill='#ff6b6b' font-size='28' font-family='Arial' text-anchor='middle' alignment-baseline='middle'>Wrist Flexion (sample)</text>
      </svg>
    `)
  },
  {
    id: 104,
    name: 'Finger Abduction - Demo',
    description: 'Finger abduction with exoskeleton assistance.',
    video_data: 'data:video/webm;base64,GkXfo0AgQoaBAAAABQAAABQbG9uZwAAAA1lbWJlZGMBAAAACnZpZGVvGQAAAAAD',
    image_url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'>
        <rect width='100%' height='100%' fill='#2d2d2d'/>
        <text x='50%' y='50%' fill='#4ecdc4' font-size='28' font-family='Arial' text-anchor='middle' alignment-baseline='middle'>Finger Abduction (sample)</text>
      </svg>
    `)
  }
];
