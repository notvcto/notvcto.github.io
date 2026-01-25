import React from "react";

interface DesktopMenuProps {
    active: boolean;
    position: { x: number, y: number };
    addNewFolder: () => void;
    openSettings: () => void;
}

export default function DesktopMenu({ active, position, addNewFolder, openSettings }: DesktopMenuProps) {
    if (!active) return null;

    return (
        <div
            id="desktop-menu"
            className="cursor-default w-52 context-menu-bg border text-left border-gray-900 rounded text-white py-4 absolute z-50 text-sm font-medium shadow-md bg-ub-grey"
            style={{ top: position.y, left: position.x }}
        >
            <div
                onClick={addNewFolder}
                className="w-full py-1.5 hover:bg-ub-orange pl-4 cursor-pointer"
            >
                New Folder
            </div>
            <div className="w-full py-0.5 bg-gray-900 my-1.5 border-b border-gray-900 border-opacity-50"></div>
            <div
                onClick={openSettings}
                className="w-full py-1.5 hover:bg-ub-orange pl-4 cursor-pointer"
            >
                Change Background...
            </div>
            <div className="w-full py-0.5 bg-gray-900 my-1.5 border-b border-gray-900 border-opacity-50"></div>
            <div
                onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                }}
                className="w-full py-1.5 hover:bg-ub-orange pl-4 cursor-pointer"
            >
                Reset Ubuntu
            </div>
        </div>
    );
}
