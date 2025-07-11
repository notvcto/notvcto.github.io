import React from 'react'

export default function BackgroundImage(props) {
    return (
        <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 absolute -z-10 top-0 right-0 overflow-hidden h-full w-full">
            {/* macOS-style dynamic wallpaper overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-800/30 to-pink-900/20 animate-pulse"></div>
            
            {/* Subtle texture overlay */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-pulse"></div>
            </div>
            
            {/* Big Sur/Sonoma style abstract shapes */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-green-500/5 to-blue-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
    )
}