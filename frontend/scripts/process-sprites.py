"""Détoure le fond grille/blanc des sprites GBA et exporte en PNG transparent."""
from collections import deque
from pathlib import Path

from PIL import Image

ASSETS = Path(__file__).resolve().parent.parent / "src" / "assets"


def matches_background(r: int, g: int, b: int) -> bool:
    mx, mn = max(r, g, b), min(r, g, b)
    # Blanc
    if r > 246 and g > 246 and b > 246:
        return True
    # Grille grise / fond clair peu saturé
    if mx - mn < 32 and mx > 158:
        return True
    # Filigrane magicoloriage (gris texte sur fond clair)
    if mx - mn < 40 and mx > 120 and mn > 90:
        return True
    return False


def flood_remove_background(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA")
    w, h = img.size
    pixels = img.load()
    visited = set()
    queue: deque[tuple[int, int]] = deque()

    for x in range(w):
        queue.append((x, 0))
        queue.append((x, h - 1))
    for y in range(h):
        queue.append((0, y))
        queue.append((w - 1, y))

    while queue:
        x, y = queue.popleft()
        if (x, y) in visited or x < 0 or y < 0 or x >= w or y >= h:
            continue
        visited.add((x, y))
        r, g, b, _a = pixels[x, y]
        if not matches_background(r, g, b):
            continue
        pixels[x, y] = (r, g, b, 0)
        queue.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))

    return img


def remove_stray_grid(img: Image.Image) -> Image.Image:
    """Retire les pixels de grille isolés restants à l'intérieur."""
    img = img.convert("RGBA")
    w, h = img.size
    pixels = img.load()

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            mx, mn = max(r, g, b), min(r, g, b)
            if mx - mn >= 32 or mx <= 158:
                continue
            # Pixel gris clair entouré de transparence → fond résiduel
            transparent_neighbors = 0
            for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and pixels[nx, ny][3] == 0:
                    transparent_neighbors += 1
            if transparent_neighbors >= 2:
                pixels[x, y] = (r, g, b, 0)

    return img


def trim_transparent(img: Image.Image, padding: int = 2) -> Image.Image:
    bbox = img.getbbox()
    if not bbox:
        return img
    left, top, right, bottom = bbox
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(img.width, right + padding)
    bottom = min(img.height, bottom + padding)
    return img.crop((left, top, right, bottom))


def process(src: Path, dest: Path, flip: bool = False) -> None:
    img = Image.open(src)
    img = flood_remove_background(img)
    img = remove_stray_grid(img)
    img = trim_transparent(img)
    if flip:
        img = img.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    img.save(dest, "PNG", optimize=True)
    print(f"{dest.name} -> {img.size}")


def main() -> None:
    process(ASSETS / "drac.webp", ASSETS / "drac.png", flip=False)
    # Retournement appliqué au rendu (GbaBattleScene) pour regarder vers le centre
    process(ASSETS / "tortank.jpg", ASSETS / "tortank.png", flip=False)


if __name__ == "__main__":
    main()
