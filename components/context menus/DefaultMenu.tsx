import React from "react";

interface DefaultMenuProps {
    active: boolean;
    position: { x: number, y: number };
}

export default function DefaultMenu({ active, position }: DefaultMenuProps) {
    if (!active) return null;

    return (
        <div
            id="default-menu"
            className="cursor-default w-52 context-menu-bg border text-left border-gray-900 rounded text-white py-4 absolute z-50 text-sm font-medium shadow-md bg-ub-grey"
             style={{ top: position.y, left: position.x }}
        >
            <div className="w-full py-1.5 hover:bg-ub-orange pl-4 cursor-pointer">
                About
            </div>
            <div className="w-full py-0.5 bg-gray-900 my-1.5 border-b border-gray-900 border-opacity-50"></div>
            <div className="w-full py-1.5 hover:bg-ub-orange pl-4 cursor-pointer">
                Properties
            </div>
        </div>
    );
}
