import { FSNode } from "../store/filesystem";

export const GRID_SIZE = 100;

export interface Position {
    x: number;
    y: number;
}

export function calculateLayout(
    windowWidth: number,
    windowHeight: number,
    nodes: FSNode[]
): Record<string, Position> {
    const layout: Record<string, Position> = {};

    // 1. Separate Manual vs Auto
    const manualNodes: FSNode[] = [];
    const autoNodes: FSNode[] = [];

    nodes.forEach(node => {
        if (node.metadata?.position) {
            manualNodes.push(node);
        } else {
            autoNodes.push(node);
        }
    });

    // 2. Sort Auto Nodes (Deterministic)
    // Rule: Creation timestamp (createdAt), then name (alphabetical)
    autoNodes.sort((a, b) => {
        if (a.createdAt !== b.createdAt) {
            return a.createdAt - b.createdAt;
        }
        return a.name.localeCompare(b.name);
    });

    // 3. Define Grid Dimensions
    // Ensure at least 1 col/row to avoid div by zero
    const cols = Math.max(1, Math.floor(windowWidth / GRID_SIZE));
    const rows = Math.max(1, Math.floor(windowHeight / GRID_SIZE));

    // Helper to check if a grid slot is occupied by a manual node
    // Manual nodes are positioned by pixels. We check if they overlap the cell.
    // A cell (c, r) corresponds to x=[c*100, (c+1)*100), y=[r*100, (r+1)*100)
    // A manual node at (mx, my) (top-left) occupies a slot if its box overlaps.
    // Spec: "Manual icons rendered first -> Auto icons fill remaining grid slots"
    // "Auto-layout must not override manually placed icons."

    // We can pre-calculate the "occupied" grid slots.
    // Since manual icons snap to grid usually, they will likely align.
    // But if they are slightly off (clamped visual?), we treat the cell as taken.
    const occupied = new Set<string>(); // key: "col,row"

    manualNodes.forEach(node => {
        // Clamp manual node to visible area
        // Spec: "If a manually placed icon would fall outside the visible area: Clamp it back inside view"
        // Note: We clamp here for the *layout output*. We do NOT modify the node metadata itself here.
        let x = node.metadata!.position.x;
        let y = node.metadata!.position.y;

        // Clamp
        x = Math.max(0, Math.min(x, windowWidth - GRID_SIZE));
        y = Math.max(0, Math.min(y, windowHeight - GRID_SIZE));

        layout[node.id] = { x, y };

        // Mark occupied slots
        // Identify which grid cell represents this position roughly
        // We act conservatively: if a manual icon covers the center of a cell, or top-left, it takes it.
        // Given 100x100 grid and 100x100 icons, we can just map to closest grid index.
        // Or rather, any cell that intersects?
        // Let's assume snapped logic for occupancy to keep it clean.
        // col = round(x / 100), row = round(y / 100)

        const col = Math.round(x / GRID_SIZE);
        const row = Math.round(y / GRID_SIZE);

        if (col >= 0 && col < cols && row >= 0 && row < rows) {
            occupied.add(`${col},${row}`);
        }
    });

    // 4. Place Auto Nodes
    // Direction: Right -> Left (cols-1 to 0)
    // Inner: Top -> Bottom (0 to rows-1)

    let autoIndex = 0;

    // Iterate columns Right to Left
    for (let c = cols - 1; c >= 0; c--) {
        // Iterate rows Top to Bottom
        for (let r = 0; r < rows; r++) {
            if (autoIndex >= autoNodes.length) break;

            if (!occupied.has(`${c},${r}`)) {
                // Place current auto node
                const node = autoNodes[autoIndex];
                layout[node.id] = {
                    x: c * GRID_SIZE,
                    y: r * GRID_SIZE
                };
                // console.log(`Placed auto node ${node.id} at ${c},${r} (${layout[node.id].x},${layout[node.id].y})`);
                autoIndex++;
            }
        }
        if (autoIndex >= autoNodes.length) break;
    }

    // If we still have auto nodes but ran out of space?
    // They will be hidden or we could stack them at 0,0?
    // Spec says "Once the column reaches the bottom: Create a new column to the left".
    // If we run out of columns (off screen to left), we effectively stop placing visible ones.
    // Or we continue negative.
    // "Icons may not be placed outside the visible desktop area"
    // So we probably stop. Or we just keep stacking them off-screen.
    // Given the loop `c >= 0`, we stop at 0.
    // Extra nodes will effectively disappear from the layout map (or we should handle them?)
    // If they are not in layout map, they won't render (or will render at 0,0 default?).
    // Better to provide *some* position.
    // Let's stack remaining at (0,0) or last valid pos?
    // Current loop just omits them.
    // I'll leave them omitted for now, they just won't be in the map.
    // The calling code should handle missing layout keys (default to 20,40? or 0,0).

    return layout;
}
