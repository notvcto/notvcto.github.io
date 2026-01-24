import React, { Component } from "react";
import SmallArrow from "./small_arrow";
import onClickOutside from "react-onclickoutside";

class Slider extends Component {
  render() {
    return (
      <input
        type="range"
        onChange={this.props.onChange}
        className={this.props.className}
        name={this.props.name}
        min="0"
        max="100"
        value={this.props.value}
        step="1"
      />
    );
  }
}

export class StatusCard extends Component {
  constructor() {
    super();
    this.wrapperRef = React.createRef();
    this.state = {
      sound_level: 75,
      brightness_level: 100,
    };
  }
  handleClickOutside = () => {
    this.props.toggleVisible();
  };
  componentDidMount() {
    this.setState(
      {
        sound_level:
          typeof window !== "undefined"
            ? localStorage.getItem("sound-level") || 75
            : 75,
        brightness_level:
          typeof window !== "undefined"
            ? localStorage.getItem("brightness-level") || 100
            : 100,
      },
      () => {
        if (typeof document !== "undefined") {
          const screen = document.getElementById("monitor-screen");
          if (screen) {
            screen.style.filter = `brightness(${
              (3 / 400) * this.state.brightness_level + 0.25
            })`;
          }
        }
      }
    );
  }

  handleBrightness = (e) => {
    this.setState({ brightness_level: e.target.value });
    if (typeof window !== "undefined") {
      localStorage.setItem("brightness-level", e.target.value);
    }
    if (typeof document !== "undefined") {
      const screen = document.getElementById("monitor-screen");
      if (screen) {
        screen.style.filter = `brightness(${
          (3 / 400) * e.target.value + 0.25
        })`;
      }
    }
  };

  handleSound = (e) => {
    this.setState({ sound_level: e.target.value });
    if (typeof window !== "undefined") {
      localStorage.setItem("sound-level", e.target.value);
    }
  };

  render() {
    return (
      <div
        ref={this.wrapperRef}
        className={
          "absolute bg-ub-cool-grey bg-opacity-90 backdrop-blur-3xl rounded-3xl py-4 top-9 right-3 shadow-2xl border-white border border-opacity-10 status-card select-none " +
          (this.props.visible ? " visible animateShow" : " invisible")
        }
      >
        <div className="absolute w-0 h-0 -top-1 right-6 top-arrow-up" />

        <div className="w-80 px-4">
             {/* Pills */}
             <div className="grid grid-cols-2 gap-2 mb-4">
                 <div className="flex flex-col justify-center pl-4 pr-2 h-16 rounded-3xl bg-ub-orange cursor-pointer hover:bg-opacity-80 transition-all text-white relative">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                             <img src="./themes/Yaru/status/network-wireless-signal-good-symbolic.svg" alt="wifi" className="w-5" />
                             <span className="font-medium">Wi-Fi</span>
                         </div>
                      </div>
                      <span className="text-xs text-white text-opacity-80 mt-1 truncate">OnePlus 8 Pro</span>
                 </div>

                 <div className="flex flex-col justify-center pl-4 pr-2 h-16 rounded-3xl bg-ub-warm-grey bg-opacity-20 cursor-pointer hover:bg-opacity-30 transition-all text-white">
                      <div className="flex items-center gap-3">
                         <img src="./themes/Yaru/status/bluetooth-symbolic.svg" alt="bt" className="w-5" />
                         <span className="font-medium">Bluetooth</span>
                      </div>
                      <span className="text-xs text-gray-400 mt-1">Off</span>
                 </div>
             </div>

             {/* Sliders */}
             <div className="space-y-4 mb-6 bg-ub-warm-grey bg-opacity-10 rounded-2xl p-4">
                <div className="flex items-center gap-4">
                    <img src="./themes/Yaru/status/audio-headphones-symbolic.svg" alt="sound" className="w-4" />
                    <Slider onChange={this.handleSound} className="ubuntu-slider w-full" value={this.state.sound_level} name="headphone_range" />
                </div>
                <div className="flex items-center gap-4">
                     <img src="./themes/Yaru/status/display-brightness-symbolic.svg" alt="brightness" className="w-4" />
                     <Slider onChange={this.handleBrightness} className="ubuntu-slider w-full" value={this.state.brightness_level} name="brightness_range" />
                </div>
             </div>

             {/* Footer */}
             <div className="flex justify-between items-center px-2">
                 <div className="flex items-center gap-2 text-xs text-gray-400">
                    <img src="./themes/Yaru/status/battery-good-symbolic.svg" className="w-4" alt="battery"/>
                    <span>2:40 (75%)</span>
                 </div>

                 <div className="flex gap-2">
                      <div id="open-settings" className="w-10 h-10 rounded-full bg-ub-warm-grey bg-opacity-10 hover:bg-opacity-20 flex items-center justify-center cursor-pointer">
                          <img src="./themes/Yaru/status/emblem-system-symbolic.svg" className="w-5" alt="settings" />
                      </div>
                      <div onClick={this.props.lockScreen} className="w-10 h-10 rounded-full bg-ub-warm-grey bg-opacity-10 hover:bg-opacity-20 flex items-center justify-center cursor-pointer">
                          <img src="./themes/Yaru/status/changes-prevent-symbolic.svg" className="w-5" alt="lock" />
                      </div>
                      <div onClick={this.props.shutDown} className="w-10 h-10 rounded-full bg-ub-warm-grey bg-opacity-10 hover:bg-opacity-20 flex items-center justify-center cursor-pointer">
                          <img src="./themes/Yaru/status/system-shutdown-symbolic.svg" className="w-5" alt="power" />
                      </div>
                 </div>
             </div>
        </div>
      </div>
    );
  }
}

export default onClickOutside(StatusCard);
