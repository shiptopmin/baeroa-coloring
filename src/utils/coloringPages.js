// SVG coloring page line art — outline only, no fill, for kids to color in.
// Canvas uses multiply blend so black lines are always preserved on top of any paint.

const S = (content, vw = '400 500') =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw}" fill="none" stroke="#222" stroke-linecap="round" stroke-linejoin="round">${content}</svg>`
  )}`;

export const coloringPages = [
  {
    id: 'balloon',
    label: '풍선',
    emoji: '🎈',
    src: S(`
      <ellipse cx="200" cy="195" rx="135" ry="160" stroke-width="7"/>
      <ellipse cx="153" cy="138" rx="28" ry="46" stroke-width="3" stroke="#555" opacity="0.35"/>
      <path d="M175 348 Q200 365 225 348" stroke-width="7"/>
      <path d="M200 365 C188 395 213 415 200 470" stroke-width="5" stroke-dasharray="10 7"/>
      <circle cx="200" cy="475" r="6" stroke-width="4"/>
    `),
  },
  {
    id: 'flower',
    label: '꽃',
    emoji: '🌸',
    src: S(`
      <line x1="200" y1="310" x2="200" y2="480" stroke-width="7"/>
      <path d="M200 420 Q155 390 145 355 Q178 375 200 420Z" stroke-width="5"/>
      <path d="M200 390 Q245 360 255 325 Q222 345 200 390Z" stroke-width="5"/>
      ${[0,60,120,180,240,300].map(a => {
        const r = a * Math.PI / 180;
        const cx = 200 + 72 * Math.sin(r);
        const cy = 220 - 72 * Math.cos(r);
        return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="32" ry="62" stroke-width="6" transform="rotate(${a} ${cx.toFixed(1)} ${cy.toFixed(1)})"/>`;
      }).join('')}
      <circle cx="200" cy="220" r="42" stroke-width="7"/>
      <circle cx="200" cy="220" r="18" stroke-width="4" stroke="#555"/>
    `),
  },
  {
    id: 'fish',
    label: '물고기',
    emoji: '🐟',
    src: S(`
      <ellipse cx="200" cy="250" rx="155" ry="105" stroke-width="7"/>
      <path d="M355 250 Q410 190 440 250 Q410 310 355 250Z" stroke-width="6"/>
      <path d="M355 200 Q385 230 355 250" stroke-width="5" stroke="#555"/>
      <path d="M355 300 Q385 270 355 250" stroke-width="5" stroke="#555"/>
      <circle cx="130" cy="215" r="18" stroke-width="6"/>
      <circle cx="130" cy="215" r="7" stroke-width="4" stroke="#555"/>
      <path d="M80 250 Q90 240 80 230" stroke-width="6"/>
      <path d="M180 185 Q200 172 220 185" stroke-width="5" stroke="#555"/>
      <path d="M180 315 Q200 328 220 315" stroke-width="5" stroke="#555"/>
      <path d="M240 200 Q255 215 240 230" stroke-width="5" stroke="#aaa" stroke-dasharray="5 4"/>
      <path d="M270 210 Q285 225 270 240" stroke-width="5" stroke="#aaa" stroke-dasharray="5 4"/>
    `, '500 500'),
  },
  {
    id: 'dino',
    label: '공룡',
    emoji: '🦕',
    src: S(`
      <ellipse cx="230" cy="310" rx="145" ry="95" stroke-width="7"/>
      <path d="M85 310 Q55 340 50 380 Q70 360 100 365" stroke-width="6"/>
      <path d="M375 310 Q400 340 405 375 Q385 355 360 360" stroke-width="6"/>
      <path d="M230 218 Q200 160 170 100 Q185 95 195 85 Q200 110 215 115 Q220 95 232 80 Q245 100 240 118 Q260 115 270 135 Q252 140 248 158 Q260 175 255 215" stroke-width="6"/>
      <circle cx="175" cy="98" r="12" stroke-width="5"/>
      <circle cx="175" cy="95" r="4" stroke-width="3" stroke="#555"/>
      <path d="M165 110 Q175 118 185 110" stroke-width="4"/>
      <path d="M230 218 Q265 200 255 215" stroke-width="6"/>
      <path d="M100 355 Q110 390 105 420 Q120 420 122 390 Q135 415 145 415 Q140 385 130 360" stroke-width="6"/>
      <path d="M330 355 Q340 390 335 420 Q350 420 352 390 Q365 415 375 415 Q370 385 360 360" stroke-width="6"/>
      ${[0,1,2,3,4].map(i => `<path d="M${195+i*18} 230 Q${200+i*18} 215 ${205+i*18} 230" stroke-width="5" stroke="#888"/>`).join('')}
    `, '460 460'),
  },
];
