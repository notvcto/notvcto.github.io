import { FSNode } from "../store/filesystem";

export const GRID_SIZE = 100;
// Offset to account for the top system status bar (~30px)
export const TOP_OFFSET = 30;

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
    // Available height is reduced by TOP_OFFSET
    const availableHeight = Math.max(0, windowHeight - TOP_OFFSET);

    const cols = Math.max(1, Math.floor(windowWidth / GRID_SIZE));
    const rows = Math.max(1, Math.floor(availableHeight / GRID_SIZE));

    // Helper to check if a grid slot is occupied by a manual node
    const occupied = new Set<string>(); // key: "col,row"

    manualNodes.forEach(node => {
        // Clamp manual node to visible area
        // Spec: "If a manually placed icon would fall outside the visible area: Clamp it back inside view"
        // Also clamp top to TOP_OFFSET
        let x = node.metadata!.position.x;
        let y = node.metadata!.position.y;

        // Clamp
        x = Math.max(0, Math.min(x, windowWidth - GRID_SIZE));
        y = Math.max(TOP_OFFSET, Math.min(y, windowHeight - GRID_SIZE));

        layout[node.id] = { x, y };

        // Mark occupied slots
        // Map Y coordinate back to grid row index relative to TOP_OFFSET
        // row = round((y - TOP_OFFSET) / GRID_SIZE)

        const col = Math.round(x / GRID_SIZE);
        const row = Math.round((y - TOP_OFFSET) / GRID_SIZE);

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
                    y: r * GRID_SIZE + TOP_OFFSET
                };
                autoIndex++;
            }
        }
        if (autoIndex >= autoNodes.length) break;
    }

    return layout;
}
