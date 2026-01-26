"use client";
import React, { useState } from "react";

interface SideBarAppProps {
    id: string;
    title: string;
    icon: string;
    isOpen: boolean;
    isFocused: boolean;
    openApp: () => void;
}

export default function SideBarApp({ id, title, icon, isOpen, isFocused, openApp }: SideBarAppProps) {
    const [showTitle, setShowTitle] = useState(false);
    const [scaleImage, setScaleImage] = useState(false);

    const handleOpen = () => {
        if (!isOpen) {
            setScaleImage(true);
            setTimeout(() => setScaleImage(false), 1000);
        }
        openApp();
        setShowTitle(false);
    }

    return (
        <div
            tabIndex={0}
            onClick={handleOpen}
            onMouseEnter={() => setShowTitle(true)}
            onMouseLeave={() => setShowTitle(false)}
             className={
                (isOpen
                    ? "bg-white bg-opacity-5 "
                    : "") +
                " w-auto p-2 outline-none relative transition hover:bg-white hover:bg-opacity-10 rounded-md m-1 transform duration-200 cursor-pointer flex items-center justify-center"
            }
            id={"sidebar-" + id}
        >
             <img
                width="32px"
                height="32px"
                className="w-8 h-8"
                src={icon}
                alt={title}
            />
             <img
                className={
                    (scaleImage ? " scale " : "") +
                    " scalable-app-icon w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                }
                src={icon}
                alt=""
            />
            {isOpen && (
                 <div className="w-1 h-1 absolute left-0.5 top-1/2 transform -translate-y-1/2 bg-ub-orange rounded-full"></div>
            )}
             <div
                className={
                    (showTitle ? " visible " : " invisible ") +
                    " w-max py-0.5 px-1.5 absolute top-1.5 left-full ml-3 m-1 text-ubt-grey text-opacity-90 text-sm bg-ub-grey bg-opacity-70 border-gray-400 border border-opacity-40 rounded-md z-50 shadow-md"
                }
            >
                {title}
            </div>
        </div>
    )
}
