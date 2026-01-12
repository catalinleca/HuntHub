/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_PLAYER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// SVG imports
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.svg?react' {
  import React from 'react';
  const SVGComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  export default SVGComponent;
}
