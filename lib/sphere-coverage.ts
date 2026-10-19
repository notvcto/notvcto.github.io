type Bounds = { top: number; bottom: number; left: number; right: number };

export function isViewportCovered(rectangles: Bounds[], width: number, height: number) {
    let coveredTo = 0;
    const fullWidth = rectangles.filter(rect => rect.left <= 0 && rect.right >= width);
    for (const rect of fullWidth.sort((a, b) => a.top - b.top)) {
        if (rect.bottom <= coveredTo) continue;
        if (rect.top > coveredTo) return false;
        coveredTo = rect.bottom;
        if (coveredTo >= height) return true;
    }
    return false;
}
