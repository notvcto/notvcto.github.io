import { Component } from "react";

export default class Clock extends Component {
<<<<<<< Updated upstream
    constructor() {
        super();
        this.month_list = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        this.day_list = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        this.state = {
            hour_12: true,
            current_time: null
        };
    }

    componentDidMount() {
        // Set initial time after component mounts to avoid hydration mismatch
        this.setState({ current_time: new Date() });
        
        this.update_time = setInterval(() => {
            this.setState({ current_time: new Date() });
        }, 10 * 1000);
=======
  constructor() {
    super();
    this.month_list = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    this.day_list = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    this.state = {
      hour_12: true,
      current_time: null,
    };
  }

  componentDidMount() {
    // Set initial time after component mounts to avoid hydration mismatch
    this.setState({ current_time: new Date() });

    this.update_time = setInterval(() => {
      this.setState({ current_time: new Date() });
    }, 10 * 1000);
  }

  componentWillUnmount() {
    clearInterval(this.update_time);
  }

  render() {
    const { current_time } = this.state;

    // Return empty span during server-side rendering or before hydration
    if (!current_time) {
      return <span></span>;
    }

    let day = this.day_list[current_time.getDay()];
    let hour = current_time.getHours();
    let minute = current_time.getMinutes();
    let month = this.month_list[current_time.getMonth()];
    let date = current_time.getDate().toLocaleString();
    let meridiem = hour < 12 ? "AM" : "PM";

    if (minute.toLocaleString().length === 1) {
      minute = "0" + minute;
>>>>>>> Stashed changes
    }

    if (this.state.hour_12 && hour > 12) hour -= 12;

<<<<<<< Updated upstream
    render() {
        const { current_time } = this.state;

        // Return empty span during server-side rendering or before hydration
        if (!current_time) {
            return <span></span>;
        }

        let day = this.day_list[current_time.getDay()];
        let hour = current_time.getHours();
        let minute = current_time.getMinutes();
        let month = this.month_list[current_time.getMonth()];
        let date = current_time.getDate().toLocaleString();
        let meridiem = (hour < 12 ? "AM" : "PM");

        if (minute.toLocaleString().length === 1) {
            minute = "0" + minute
        }

        if (this.state.hour_12 && hour > 12) hour -= 12;

        let display_time;
        if (this.props.onlyTime) {
            display_time = hour + ":" + minute + " " + meridiem;
        }
        else if (this.props.onlyDay) {
            display_time = day + " " + month + " " + date;
        }
        else display_time = day + " " + month + " " + date + " " + hour + ":" + minute + " " + meridiem;
        return <span>{display_time}</span>;
    }
=======
    let display_time;
    if (this.props.onlyTime) {
      display_time = hour + ":" + minute + " " + meridiem;
    } else if (this.props.onlyDay) {
      display_time = day + " " + month + " " + date;
    } else
      display_time =
        day +
        " " +
        month +
        " " +
        date +
        " " +
        hour +
        ":" +
        minute +
        " " +
        meridiem;
    return <span>{display_time}</span>;
  }
>>>>>>> Stashed changes
}
