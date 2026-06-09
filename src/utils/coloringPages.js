// SVG coloring page line art — outline only, no fill, for kids to color in.
// Canvas uses multiply blend so black lines are always preserved on top of any paint.

// base64 encoding is more universally supported on mobile browsers than percent-encoding
const S = (content, vw = '500 500') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw}" fill="none" stroke="#222" stroke-linecap="round" stroke-linejoin="round">${content}</svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

export const coloringPages = [
  // ── 1. 풍선 ────────────────────────────────────────────────────────────────
  {
    id: 'balloon',
    label: '풍선',
    emoji: '🎈',
    src: S(`
      <ellipse cx="250" cy="210" rx="155" ry="180" stroke-width="8"/>
      <ellipse cx="193" cy="148" rx="34" ry="54" stroke-width="3" stroke="#666" opacity="0.4"/>
      <path d="M215 382 Q250 402 285 382" stroke-width="8"/>
      <path d="M250 402 C234 438 262 462 250 500" stroke-width="6" stroke-dasharray="12 8"/>
      <circle cx="250" cy="505" r="7" stroke-width="5"/>
    `),
  },

  // ── 2. 꽃 ─────────────────────────────────────────────────────────────────
  {
    id: 'flower',
    label: '꽃',
    emoji: '🌸',
    src: S(`
      <line x1="250" y1="340" x2="250" y2="490" stroke-width="8"/>
      <path d="M250 430 Q195 398 183 358 Q222 383 250 430Z" stroke-width="6"/>
      <path d="M250 395 Q305 363 318 323 Q279 348 250 395Z" stroke-width="6"/>
      ${[0,51,102,154,205,257].map(a => {
        const r = a * Math.PI / 180;
        const cx = 250 + 82 * Math.sin(r);
        const cy = 240 - 82 * Math.cos(r);
        return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="36" ry="70" stroke-width="7" transform="rotate(${a} ${cx.toFixed(1)} ${cy.toFixed(1)})"/>`;
      }).join('')}
      <circle cx="250" cy="240" r="50" stroke-width="8"/>
      <circle cx="250" cy="240" r="22" stroke-width="5" stroke="#666"/>
      ${[0,60,120,180,240,300].map(a => {
        const r = a * Math.PI / 180;
        return `<circle cx="${(250+34*Math.sin(r)).toFixed(1)}" cy="${(240-34*Math.cos(r)).toFixed(1)}" r="5" stroke-width="3" stroke="#888"/>`;
      }).join('')}
    `),
  },

  // ── 3. 물고기 ──────────────────────────────────────────────────────────────
  {
    id: 'fish',
    label: '물고기',
    emoji: '🐟',
    src: S(`
      <ellipse cx="230" cy="260" rx="175" ry="115" stroke-width="8"/>
      <path d="M405 260 Q468 188 500 260 Q468 332 405 260Z" stroke-width="7"/>
      <path d="M405 205 Q442 235 405 260" stroke-width="5" stroke="#666"/>
      <path d="M405 315 Q442 285 405 260" stroke-width="5" stroke="#666"/>
      <circle cx="145" cy="222" r="22" stroke-width="7"/>
      <circle cx="145" cy="222" r="9" stroke-width="5" stroke="#444"/>
      <circle cx="140" cy="218" r="4" fill="#222" stroke="none"/>
      <path d="M90 260 Q104 247 90 235" stroke-width="6"/>
      <path d="M215 195 Q240 180 265 195" stroke-width="5" stroke="#666"/>
      <path d="M215 325 Q240 340 265 325" stroke-width="5" stroke="#666"/>
      <path d="M290 210 Q308 228 290 246" stroke-width="5" stroke="#aaa" stroke-dasharray="6 4"/>
      <path d="M325 220 Q343 238 325 256" stroke-width="5" stroke="#aaa" stroke-dasharray="6 4"/>
      <path d="M358 230 Q376 248 358 266" stroke-width="5" stroke="#aaa" stroke-dasharray="6 4"/>
      <path d="M162 290 Q200 310 238 295" stroke-width="4" stroke="#888" stroke-dasharray="5 4"/>
    `),
  },

  // ── 4. 공룡 ────────────────────────────────────────────────────────────────
  {
    id: 'dino',
    label: '공룡',
    emoji: '🦕',
    src: S(`
      <ellipse cx="280" cy="330" rx="160" ry="105" stroke-width="8"/>
      <path d="M120 330 Q82 362 76 408 Q100 385 132 392" stroke-width="7"/>
      <path d="M440 330 Q468 362 472 408 Q448 385 420 392" stroke-width="7"/>
      <path d="M280 230 Q245 165 208 98 Q225 92 237 80 Q243 108 260 112 Q266 90 280 74 Q294 90 300 112 Q317 108 323 80 Q335 92 352 98 Q315 165 308 232" stroke-width="7"/>
      <circle cx="212" cy="102" r="14" stroke-width="6"/>
      <circle cx="212" cy="98" r="5" stroke-width="4" stroke="#555"/>
      <circle cx="209" cy="96" r="3" fill="#222" stroke="none"/>
      <path d="M200 118 Q212 128 224 118" stroke-width="5"/>
      <path d="M280 230 Q318 210 308 228" stroke-width="7"/>
      <path d="M130 382 Q142 422 136 456 Q154 456 156 420 Q172 448 184 448 Q178 414 165 388" stroke-width="7"/>
      <path d="M388 382 Q400 422 394 456 Q412 456 414 420 Q430 448 442 448 Q436 414 423 388" stroke-width="7"/>
      ${[0,1,2,3,4,5].map(i => `<path d="M${248+i*16} 248 Q${254+i*16} 230 ${260+i*16} 248" stroke-width="5" stroke="#888"/>`).join('')}
      <path d="M185 300 Q200 285 215 300" stroke-width="5" stroke="#aaa" stroke-dasharray="5 4"/>
      <path d="M300 300 Q320 285 340 300" stroke-width="5" stroke="#aaa" stroke-dasharray="5 4"/>
    `),
  },

  // ── 5. 나비 ────────────────────────────────────────────────────────────────
  {
    id: 'butterfly',
    label: '나비',
    emoji: '🦋',
    src: S(`
      <ellipse cx="250" cy="295" rx="16" ry="85" stroke-width="7"/>
      <circle cx="250" cy="200" r="24" stroke-width="7"/>
      <path d="M242 182 Q214 152 202 120" stroke-width="5"/>
      <circle cx="199" cy="114" r="9" stroke-width="5"/>
      <path d="M258 182 Q286 152 298 120" stroke-width="5"/>
      <circle cx="301" cy="114" r="9" stroke-width="5"/>
      <path d="M237 248 Q155 185 108 218 Q72 248 105 302 Q138 356 237 318" stroke-width="7"/>
      <path d="M237 318 Q175 358 162 408 Q152 450 200 452 Q242 454 248 370" stroke-width="7"/>
      <path d="M263 248 Q345 185 392 218 Q428 248 395 302 Q362 356 263 318" stroke-width="7"/>
      <path d="M263 318 Q325 358 338 408 Q348 450 300 452 Q258 454 252 370" stroke-width="7"/>
      <circle cx="168" cy="265" r="30" stroke-width="6"/>
      <circle cx="168" cy="265" r="13" stroke-width="4"/>
      <circle cx="332" cy="265" r="30" stroke-width="6"/>
      <circle cx="332" cy="265" r="13" stroke-width="4"/>
      <ellipse cx="192" cy="395" rx="22" ry="16" stroke-width="5"/>
      <ellipse cx="308" cy="395" rx="22" ry="16" stroke-width="5"/>
      <path d="M140 230 Q155 240 140 250" stroke-width="4" stroke="#888"/>
      <path d="M360 230 Q375 240 360 250" stroke-width="4" stroke="#888"/>
    `),
  },

  // ── 6. 집 ─────────────────────────────────────────────────────────────────
  {
    id: 'house',
    label: '집',
    emoji: '🏠',
    src: S(`
      <rect x="80" y="268" width="340" height="222" rx="6" stroke-width="8"/>
      <path d="M52 280 L250 98 L448 280" stroke-width="8"/>
      <rect x="340" y="140" width="48" height="92" stroke-width="7"/>
      <path d="M352 140 Q348 116 358 98 Q368 116 364 140" stroke-width="5" stroke="#888"/>
      <path d="M205 490 L205 360 Q205 328 236 328 L264 328 Q295 328 295 360 L295 490" stroke-width="7"/>
      <circle cx="286" cy="415" r="9" stroke-width="5"/>
      <rect x="100" y="305" width="88" height="75" rx="6" stroke-width="7"/>
      <line x1="144" y1="305" x2="144" y2="380" stroke-width="4"/>
      <line x1="100" y1="342" x2="188" y2="342" stroke-width="4"/>
      <rect x="312" y="305" width="88" height="75" rx="6" stroke-width="7"/>
      <line x1="356" y1="305" x2="356" y2="380" stroke-width="4"/>
      <line x1="312" y1="342" x2="400" y2="342" stroke-width="4"/>
      <rect x="210" y="160" width="80" height="68" rx="6" stroke-width="6"/>
      <line x1="250" y1="160" x2="250" y2="228" stroke-width="4"/>
      <line x1="210" y1="194" x2="290" y2="194" stroke-width="4"/>
      <path d="M130 490 Q115 490 108 478" stroke-width="5"/>
      <path d="M370 490 Q385 490 392 478" stroke-width="5"/>
    `),
  },

  // ── 7. 아이스크림 ──────────────────────────────────────────────────────────
  {
    id: 'icecream',
    label: '아이스크림',
    emoji: '🍦',
    src: S(`
      <path d="M152 308 L250 492 L348 308Z" stroke-width="8"/>
      ${[0,1,2,3].map(i => `<line x1="${170+i*22}" y1="308" x2="${220+i*22}" y2="490" stroke-width="3" stroke="#aaa"/>`).join('')}
      ${[0,1,2,3].map(i => `<line x1="${348-i*22}" y1="308" x2="${298-i*22}" y2="490" stroke-width="3" stroke="#aaa"/>`).join('')}
      <line x1="155" y1="340" x2="345" y2="340" stroke-width="3" stroke="#aaa"/>
      <line x1="152" y1="368" x2="348" y2="368" stroke-width="3" stroke="#aaa"/>
      <line x1="154" y1="396" x2="346" y2="396" stroke-width="3" stroke="#aaa"/>
      <ellipse cx="250" cy="282" rx="100" ry="60" stroke-width="8"/>
      <ellipse cx="250" cy="205" rx="88" ry="58" stroke-width="8"/>
      <ellipse cx="250" cy="132" rx="74" ry="56" stroke-width="8"/>
      <circle cx="250" cy="78" r="28" stroke-width="7"/>
      <path d="M250 52 Q272 34 268 18" stroke-width="5"/>
      <line x1="222" y1="130" x2="235" y2="116" stroke-width="5" stroke-linecap="round"/>
      <line x1="262" y1="114" x2="275" y2="128" stroke-width="5" stroke-linecap="round"/>
      <line x1="240" y1="150" x2="253" y2="136" stroke-width="5" stroke-linecap="round"/>
      <line x1="220" y1="205" x2="233" y2="191" stroke-width="5" stroke-linecap="round"/>
      <line x1="268" y1="194" x2="255" y2="208" stroke-width="5" stroke-linecap="round"/>
      <line x1="244" y1="224" x2="257" y2="210" stroke-width="5" stroke-linecap="round"/>
    `),
  },

  // ── 8. 로켓 ────────────────────────────────────────────────────────────────
  {
    id: 'rocket',
    label: '로켓',
    emoji: '🚀',
    src: S(`
      <path d="M250 42 Q204 72 194 192 L194 368 Q194 394 250 394 Q306 394 306 368 L306 192 Q296 72 250 42Z" stroke-width="8"/>
      <circle cx="250" cy="230" r="44" stroke-width="7"/>
      <circle cx="250" cy="230" r="24" stroke-width="5" stroke="#666"/>
      <path d="M194 295 Q146 316 132 380 Q132 408 166 396 L194 378" stroke-width="7"/>
      <path d="M306 295 Q354 316 368 380 Q368 408 334 396 L306 378" stroke-width="7"/>
      <path d="M210 394 Q222 438 206 472 Q232 452 250 482 Q268 452 294 472 Q278 438 290 394" stroke-width="7"/>
      <path d="M226 394 Q233 424 222 452 Q244 438 250 462 Q256 438 278 452 Q267 424 274 394" stroke-width="5" stroke="#888"/>
      <path d="M220 140 L224 128 L228 140 L240 140 L231 148 L234 160 L224 152 L214 160 L217 148 L208 140Z" stroke-width="4"/>
      <path d="M268 162 L271 153 L274 162 L283 162 L276 168 L279 177 L271 171 L263 177 L266 168 L259 162Z" stroke-width="3"/>
      <path d="M218 310 Q220 322 218 330" stroke-width="4" stroke="#888"/>
      <path d="M282 310 Q284 322 282 330" stroke-width="4" stroke="#888"/>
    `),
  },

  // ── 9. 곰 ─────────────────────────────────────────────────────────────────
  {
    id: 'bear',
    label: '곰돌이',
    emoji: '🐻',
    src: S(`
      <circle cx="250" cy="295" r="185" stroke-width="8"/>
      <circle cx="108" cy="148" r="72" stroke-width="8"/>
      <circle cx="108" cy="148" r="44" stroke-width="6"/>
      <circle cx="392" cy="148" r="72" stroke-width="8"/>
      <circle cx="392" cy="148" r="44" stroke-width="6"/>
      <circle cx="185" cy="255" r="32" stroke-width="7"/>
      <circle cx="185" cy="255" r="14" stroke-width="5" stroke="#555"/>
      <circle cx="178" cy="248" r="6" fill="#222" stroke="none"/>
      <circle cx="315" cy="255" r="32" stroke-width="7"/>
      <circle cx="315" cy="255" r="14" stroke-width="5" stroke="#555"/>
      <circle cx="308" cy="248" r="6" fill="#222" stroke="none"/>
      <ellipse cx="250" cy="360" rx="95" ry="70" stroke-width="7"/>
      <ellipse cx="250" cy="328" rx="36" ry="24" stroke-width="7"/>
      <path d="M250 352 Q222 382 205 388" stroke-width="7"/>
      <path d="M250 352 Q278 382 295 388" stroke-width="7"/>
      <ellipse cx="160" cy="345" rx="34" ry="20" stroke-width="4" stroke="#dda0dd" stroke-dasharray="5 4"/>
      <ellipse cx="340" cy="345" rx="34" ry="20" stroke-width="4" stroke="#dda0dd" stroke-dasharray="5 4"/>
      <path d="M215 420 Q230 432 250 432 Q270 432 285 420" stroke-width="5" stroke="#888"/>
    `),
  },

  // ── 10. 무지개 ────────────────────────────────────────────────────────────
  {
    id: 'rainbow',
    label: '무지개',
    emoji: '🌈',
    src: S(`
      ${[0,1,2,3,4,5].map(i => {
        const r = 220 - i * 32;
        return `<path d="M${50+i*26} 340 A${r} ${r} 0 0 1 ${450-i*26} 340" stroke-width="18" stroke-linecap="butt"/>`;
      }).join('')}
      <ellipse cx="95" cy="370" rx="78" ry="55" stroke-width="7"/>
      <ellipse cx="62" cy="355" rx="55" ry="42" stroke-width="7"/>
      <ellipse cx="130" cy="358" rx="58" ry="44" stroke-width="7"/>
      <ellipse cx="405" cy="370" rx="78" ry="55" stroke-width="7"/>
      <ellipse cx="438" cy="355" rx="55" ry="42" stroke-width="7"/>
      <ellipse cx="370" cy="358" rx="58" ry="44" stroke-width="7"/>
      <circle cx="388" cy="88" r="48" stroke-width="7"/>
      ${[0,1,2,3,4,5,6,7].map(i => {
        const a = i * 45 * Math.PI / 180;
        return `<line x1="${388+52*Math.cos(a)}" y1="${88+52*Math.sin(a)}" x2="${388+72*Math.cos(a)}" y2="${88+72*Math.sin(a)}" stroke-width="5"/>`;
      }).join('')}
      <path d="M215 460 Q230 448 250 450 Q270 448 285 460" stroke-width="5" stroke="#aaa" stroke-dasharray="6 4"/>
    `, '500 480'),
  },

  // ── 11. 기차 ──────────────────────────────────────────────────────────────
  {
    id: 'train',
    label: '기차',
    emoji: '🚂',
    src: S(`
      <rect x="40" y="200" width="300" height="190" rx="20" stroke-width="8"/>
      <rect x="310" y="240" width="140" height="150" rx="16" stroke-width="8"/>
      <rect x="62" y="225" width="88" height="80" rx="10" stroke-width="7"/>
      <line x1="106" y1="225" x2="106" y2="305" stroke-width="4"/>
      <line x1="62" y1="265" x2="150" y2="265" stroke-width="4"/>
      <rect x="176" y="225" width="88" height="80" rx="10" stroke-width="7"/>
      <line x1="220" y1="225" x2="220" y2="305" stroke-width="4"/>
      <line x1="176" y1="265" x2="264" y2="265" stroke-width="4"/>
      <rect x="330" y="262" width="100" height="72" rx="10" stroke-width="6"/>
      <circle cx="105" cy="420" r="42" stroke-width="8"/>
      <circle cx="105" cy="420" r="20" stroke-width="6"/>
      <circle cx="105" cy="420" r="7" stroke-width="4" stroke="#666"/>
      <circle cx="255" cy="420" r="42" stroke-width="8"/>
      <circle cx="255" cy="420" r="20" stroke-width="6"/>
      <circle cx="255" cy="420" r="7" stroke-width="4" stroke="#666"/>
      <circle cx="390" cy="420" r="36" stroke-width="7"/>
      <circle cx="390" cy="420" r="17" stroke-width="5"/>
      <rect x="310" y="160" width="44" height="82" rx="8" stroke-width="7"/>
      <path d="M318 160 Q313 136 322 116 Q332 136 328 160" stroke-width="5" stroke="#888" stroke-dasharray="7 5"/>
      <path d="M40 388 L490 388" stroke-width="6" stroke="#666"/>
      <line x1="40" y1="388" x2="40" y2="460" stroke-width="5" stroke="#999"/>
      <line x1="120" y1="388" x2="120" y2="460" stroke-width="5" stroke="#999"/>
      <line x1="200" y1="388" x2="200" y2="460" stroke-width="5" stroke="#999"/>
      <line x1="280" y1="388" x2="280" y2="460" stroke-width="5" stroke="#999"/>
      <line x1="360" y1="388" x2="360" y2="460" stroke-width="5" stroke="#999"/>
      <line x1="440" y1="388" x2="440" y2="460" stroke-width="5" stroke="#999"/>
    `, '500 480'),
  },

  // ── 12. 왕관 ──────────────────────────────────────────────────────────────
  {
    id: 'crown',
    label: '왕관',
    emoji: '👑',
    src: S(`
      <path d="M60 340 L60 200 L160 290 L250 90 L340 290 L440 200 L440 340Z" stroke-width="9"/>
      <path d="M60 340 L440 340 L420 430 Q410 460 380 460 L120 460 Q90 460 80 430Z" stroke-width="9"/>
      <circle cx="250" cy="100" r="28" stroke-width="7"/>
      <circle cx="250" cy="100" r="14" stroke-width="5" stroke="#888"/>
      <circle cx="82" cy="215" r="22" stroke-width="6"/>
      <circle cx="82" cy="215" r="10" stroke-width="4" stroke="#888"/>
      <circle cx="418" cy="215" r="22" stroke-width="6"/>
      <circle cx="418" cy="215" r="10" stroke-width="4" stroke="#888"/>
      <circle cx="160" cy="295" r="16" stroke-width="5"/>
      <circle cx="340" cy="295" r="16" stroke-width="5"/>
      <ellipse cx="250" cy="395" rx="42" ry="30" stroke-width="7"/>
      <ellipse cx="250" cy="395" rx="20" ry="14" stroke-width="5" stroke="#888"/>
      <ellipse cx="148" cy="395" rx="28" ry="20" stroke-width="6"/>
      <ellipse cx="352" cy="395" rx="28" ry="20" stroke-width="6"/>
      <path d="M80 460 Q80 490 120 490 L380 490 Q420 490 420 460" stroke-width="7"/>
      ${[-2,-1,0,1,2].map(i => {
        const x = 250 + i * 70;
        return `<line x1="${x}" y1="460" x2="${x}" y2="490" stroke-width="4" stroke="#888"/>`;
      }).join('')}
    `),
  },
];
