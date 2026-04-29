/**
 * BFS flood fill on a 2D canvas context.
 * Fills contiguous same-coloured pixels starting at (startX, startY)
 * with fillHex colour. tolerance = how different a pixel can be and still match.
 */
export const floodFill = (ctx, startX, startY, fillHex, W, H, tolerance = 40) => {
  startX = Math.floor(startX);
  startY = Math.floor(startY);
  if (startX < 0 || startX >= W || startY < 0 || startY >= H) return;

  const imageData = ctx.getImageData(0, 0, W, H);
  const data = imageData.data;

  // Parse fill colour
  const n = parseInt(fillHex.replace('#', ''), 16);
  const fillR = (n >> 16) & 255, fillG = (n >> 8) & 255, fillB = n & 255;

  const si = (startY * W + startX) * 4;
  const tR = data[si], tG = data[si + 1], tB = data[si + 2];

  // Already the same colour
  if (Math.abs(tR - fillR) < 8 && Math.abs(tG - fillG) < 8 && Math.abs(tB - fillB) < 8) return;

  const matches = (pos) => {
    const i = pos * 4;
    return (
      Math.abs(data[i]     - tR) <= tolerance &&
      Math.abs(data[i + 1] - tG) <= tolerance &&
      Math.abs(data[i + 2] - tB) <= tolerance
    );
  };

  const visited = new Uint8Array(W * H);
  const stack   = [startY * W + startX];
  visited[startY * W + startX] = 1;

  while (stack.length) {
    const pos = stack.pop();
    const x   = pos % W;
    const y   = (pos / W) | 0;
    const i   = pos * 4;
    data[i]     = fillR;
    data[i + 1] = fillG;
    data[i + 2] = fillB;
    data[i + 3] = 255;

    // 4-connected neighbours
    if (x > 0     && !visited[pos - 1] && matches(pos - 1)) { visited[pos - 1] = 1; stack.push(pos - 1); }
    if (x < W - 1 && !visited[pos + 1] && matches(pos + 1)) { visited[pos + 1] = 1; stack.push(pos + 1); }
    if (y > 0     && !visited[pos - W] && matches(pos - W)) { visited[pos - W] = 1; stack.push(pos - W); }
    if (y < H - 1 && !visited[pos + W] && matches(pos + W)) { visited[pos + W] = 1; stack.push(pos + W); }
  }

  ctx.putImageData(imageData, 0, 0);
};
