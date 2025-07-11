import React, { Component } from 'react';
import Clock from '../util components/clock';
import Status from '../util components/status';
import StatusCard from '../util components/status_card';

export default class Navbar extends Component {
	constructor() {
		super();
		this.state = {
			status_card: false
		};
	}

	render() {
		return (
			<div className="main-navbar-vp absolute top-0 right-0 w-screen shadow-mac-sm flex flex-nowrap justify-between items-center bg-mac-translucent-dark backdrop-blur-mac text-mac-primary text-sm select-none z-50 h-7">
				<div
					className="pl-3 pr-3 py-1 flex items-center"
				>
					<div className="w-4 h-4 rounded-full bg-mac-primary bg-opacity-80 flex items-center justify-center">
						<span className="text-xs font-bold text-black">🍎</span>
					</div>
				</div>
				<div className="pl-2 pr-2 text-xs md:text-sm py-1">
					<Clock />
				</div>
				<div
					id="status-bar"
					tabIndex="0"
					onFocus={() => {
						this.setState({ status_card: true });
					}}
					className="relative pr-3 pl-3 outline-none transition duration-100 ease-in-out py-1 hover:bg-mac-primary hover:bg-opacity-10 rounded-mac-sm"
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
