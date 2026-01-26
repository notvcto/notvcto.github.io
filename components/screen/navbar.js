import React, { Component } from "react";
import Clock from "../util components/clock";
import Status from "../util components/status";
import StatusCard from "../util components/status_card";

export default class Navbar extends Component {
  constructor() {
    super();
    this.state = {
      status_card: false,
    };
  }

  render() {
    return (
      <div className="main-navbar-vp absolute top-0 right-0 w-screen h-8 shadow-sm flex flex-nowrap justify-between items-center bg-ub-grey text-ubt-grey text-sm select-none z-50 px-2">
        <div
          tabIndex="0"
          className={
            "pl-3 pr-3 outline-none transition duration-100 ease-in-out rounded-full hover:bg-white hover:bg-opacity-10 focus:bg-white focus:bg-opacity-10 active:bg-opacity-20 flex items-center h-6 my-1 mx-1 cursor-default"
          }
        >
          Activities
        </div>
        <div
          tabIndex="0"
          className={
            "pl-3 pr-3 text-xs md:text-sm outline-none transition duration-100 ease-in-out rounded-full hover:bg-white hover:bg-opacity-10 focus:bg-white focus:bg-opacity-10 active:bg-opacity-20 flex items-center h-6 my-1 mx-1 cursor-default font-medium"
          }
        >
          <Clock />
        </div>
        <div
          id="status-bar"
          tabIndex="0"
          onFocus={() => {
            this.setState({ status_card: true });
          }}
          className={
            "relative pr-3 pl-3 outline-none transition duration-100 ease-in-out rounded-full hover:bg-white hover:bg-opacity-10 focus:bg-white focus:bg-opacity-10 active:bg-opacity-20 flex items-center h-6 my-1 mx-1 cursor-default"
          }
        >
          <Status />
          <StatusCard
            shutDown={this.props.shutDown}
            lockScreen={this.props.lockScreen}
            visible={this.state.status_card}
            toggleVisible={() => {
              this.setState({ status_card: false });
            }}
          />
        </div>
      </div>
    );
  }
}
