import React, { Component } from "react";

export class SideBarApp extends Component {
    constructor() {
        super();
        this.id = null;
        this.state = {
            showTitle: false,
            scaleImage: false,
        };
    }

    componentDidMount() {
        this.id = this.props.id;
    }

    scaleImage = () => {
        setTimeout(() => {
            this.setState({ scaleImage: false });
        }, 1000);
        this.setState({ scaleImage: true });
    }

    openApp = () => {
        if (!this.props.isMinimized[this.id] && !this.props.isClose[this.id]) {
            this.scaleImage();
        }
        this.props.openApp(this.id);
        this.setState({ showTitle: false });
    };

    render() {
        return (
            <div
                tabIndex="0"
                onClick={this.openApp}
                onMouseEnter={() => {
                    this.setState({ showTitle: true });
                }}
                onMouseLeave={() => {
                    this.setState({ showTitle: false });
                }}
                className="w-12 h-12 outline-none relative transition-all duration-200 hover:bg-white hover:bg-opacity-10 rounded-mac hover:scale-110 flex items-center justify-center group"
                id={"sidebar-" + this.props.id}
            >
                <img width="32px" height="32px" className="w-8 h-8" src={this.props.icon} alt="App Icon" />
                <img className={(this.state.scaleImage ? " scale " : "") + " scalable-app-icon w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"} src={this.props.icon} alt="" />
                {
                    (
                        this.props.isClose[this.id] === false
                            ? <div className="w-1 h-1 absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-mac-primary rounded-full"></div>
                            : null
                    )
                }
                <div
                    className={
                        (this.state.showTitle ? " visible " : " invisible ") +
                        " w-max py-1 px-2 absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 text-mac-primary text-sm bg-mac-gray bg-opacity-90 border-mac-border border border-opacity-40 rounded-mac-sm backdrop-blur-sm"
                    }
                >
                    {this.props.title}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-mac-gray border-t-opacity-90"></div>
                </div>
            </div>
        );
    }
}

export default SideBarApp;
