"""
Remove white background from logo image, making it transparent.

Strategy:
1. Use flood-fill from image corners to identify background pixels
   (anything reachable from the edges that is white/near-white).
2. Set alpha=0 only for those background pixels — never touch interior
   pixels, so any white inside the logo (e.g., white ®) is preserved.

Threshold: a pixel is treated as white background if
  R >= 240 AND G >= 240 AND B >= 240
This catches off-white background while leaving brand orange (#EF6C00)
and its anti-aliased edges alone.
"""
from PIL import Image
from collections import deque
from pathlib import Path

SRC = Path(r"C:\Users\Sean xiao\WorkBuddy\2026-08-04-09-49-32\qianfan-website\public\images\logo-tsianfan.png")

def is_white(px, threshold=240):
    r, g, b, *_ = px
    return r >= threshold and g >= threshold and b >= threshold


def flood_fill_background(img, threshold=240):
    """BFS from every edge pixel. Every reachable white pixel becomes
    part of the 'background' mask. Interior whites (e.g. ® symbol) are
    never visited and stay opaque."""
    w, h = img.size
    pixels = img.load()
    mask = [[False] * w for _ in range(h)]
    queue = deque()

    # Seed BFS from all four edges
    for x in range(w):
        for y in (0, h - 1):
            if is_white(pixels[x, y], threshold):
                mask[y][x] = True
                queue.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if is_white(pixels[x, y], threshold):
                mask[y][x] = True
                queue.append((x, y))

    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not mask[ny][nx]:
                if is_white(pixels[nx, ny], threshold):
                    mask[ny][nx] = True
                    queue.append((nx, ny))
    return mask


def main():
    img = Image.open(SRC).convert("RGBA")
    w, h = img.size
    print(f"Loaded {SRC.name}: {w}x{h}, mode={img.mode}")

    mask = flood_fill_background(img, threshold=240)
    pixels = img.load()

    transparent = 0
    for y in range(h):
        for x in range(w):
            if mask[y][x]:
                r, g, b, a = pixels[x, y]
                if a != 0:
                    pixels[x, y] = (r, g, b, 0)
                    transparent += 1

    total = w * h
    print(f"Set {transparent} pixels to transparent "
          f"({transparent / total * 100:.1f}% of {total} pixels)")

    img.save(SRC, "PNG", optimize=True)
    print(f"Saved to {SRC}")


if __name__ == "__main__":
    main()