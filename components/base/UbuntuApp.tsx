"use client";
import React, { forwardRef } from 'react';

interface UbuntuAppProps {
    id: string;
    name: string;
    icon: string;
    openApp: (id: string) => void;
    selected?: boolean;
    display?: 'desktop' | 'grid';
}

const UbuntuApp = forwardRef<HTMLDivElement, UbuntuAppProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ id, name, icon, openApp, selected, className, style, display = 'desktop', ...props }, ref) => {
    const positionClass = display === 'desktop' ? 'absolute' : 'relative';

    return (
       <div
            ref={ref}
            className={`${positionClass} flex flex-col items-center justify-start p-1 z-10 bg-white bg-opacity-0 hover:bg-opacity-20 focus:bg-ub-orange focus:bg-opacity-50 focus:border-opacity-100 border border-transparent outline-none rounded-md cursor-pointer text-center duration-100 ${className || ''} ${selected ? "bg-ub-orange bg-opacity-50 border-white border-opacity-100" : ""}`}
            style={{ width: '100px', height: '100px', ...style }}
            id={"app-" + id}
            onDoubleClick={() => openApp(id)}
            onClick={(e) => {
                if (props.onClick) props.onClick(e);
            }}
            {...props}
        >
            <div className="w-12 h-12 relative flex-shrink-0">
                <img
                    src={icon}
                    alt={name}
                    className="w-full h-full object-contain"
                    draggable={false}
                />
            </div>
             <span className="text-white text-xs mt-1 drop-shadow-md line-clamp-2 px-1 rounded-sm bg-black bg-opacity-40 break-words w-full">
                {name}
            </span>
        </div>
    )
  }
)

export default UbuntuApp;
