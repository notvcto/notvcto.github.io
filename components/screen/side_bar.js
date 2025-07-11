import React, { useState } from 'react'
import SideBarApp from '../base/side_bar_app';

let renderApps = (props) => {
    let sideBarAppsJsx = [];
    props.apps.forEach((app, index) => {
        if (props.favourite_apps[app.id] === false) return;
        sideBarAppsJsx.push(
            <SideBarApp key={index} id={app.id} title={app.title} icon={app.icon} isClose={props.closed_windows} isFocus={props.focused_windows} openApp={props.openAppByAppId} isMinimized={props.isMinimized} />
        );
    });
    return sideBarAppsJsx;
}

export default function SideBar(props) {
    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 select-none">
            <div className="bg-mac-dock backdrop-blur-mac rounded-mac-lg shadow-mac-dock px-2 py-2 flex flex-row items-center space-x-1 border border-mac-border border-opacity-20">
                {
                    (
                        Object.keys(props.closed_windows).length !== 0
                            ? renderApps(props)
                            : null
                    )
                }
                <AllApps showApps={props.showAllApps} />
            </div>
        </div>
    )
}

export function AllApps(props) {

    const [title, setTitle] = useState(false);

    return (
        <div
            className="w-12 h-12 rounded-mac hover:bg-white hover:bg-opacity-10 flex items-center justify-center transition-all duration-200 hover:scale-110 relative group"
            onMouseEnter={() => {
                setTitle(true);
            }}
            onMouseLeave={() => {
                setTitle(false);
            }}
            onClick={props.showApps}
        >
            <div className="relative">
                <img width="32px" height="32px" className="w-8 h-8" src="./themes/Yaru/system/view-app-grid-symbolic.svg" alt="Show Applications" />
                <div
                    className={
                        (title ? " visible " : " invisible ") +
                        " w-max py-1 px-2 absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 text-mac-primary text-sm bg-mac-gray bg-opacity-90 border-mac-border border border-opacity-40 rounded-mac-sm backdrop-blur-sm"
                    }
                >
                    Show Applications
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-mac-gray border-t-opacity-90"></div>
                </div>
            </div>
        </div>
    );
}