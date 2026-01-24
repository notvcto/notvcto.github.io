import React, { Component } from "react";
import BackgroundImage from "../util components/background-image";
import SideBar from "./side_bar";
import apps from "../../apps.config";
import Window from "../base/window";
import UbuntuApp from "../base/ubuntu_app";
import AllApplications from "../screen/all-applications";
import DesktopMenu from "../context menus/desktop-menu";
import DefaultMenu from "../context menus/default";
import $ from "jquery";
import ReactGA from "react-ga4";
import Draggable from "react-draggable";

export class Desktop extends Component {
  constructor() {
    super();
    this.app_stack = [];
    this.initFavourite = {};
    this.allWindowClosed = false;
    this.gridSize = { w: 100, h: 100 };
    this.state = {
      focused_windows: {},
      closed_windows: {},
      allAppsView: false,
      overlapped_windows: {},
      disabled_apps: {},
      favourite_apps: {},
      hideSideBar: false,
      minimized_windows: {},
      desktop_apps: [],
      context_menus: {
        desktop: false,
        default: false,
      },
      showNameBar: false,
      // Icon & Selection State
      desktop_icon_positions: {},
      selected_icons: [],
      selection_box: null, // {x, y, w, h}
    };
    this.selectionStart = null;
  }

  componentDidMount() {
    // google analytics
    ReactGA.send({
      hitType: "pageview",
      page: "/desktop",
      title: "Custom Title",
    });

    this.fetchAppsData();
    this.setContextListeners();
    this.setEventListeners();
    this.checkForNewFolders();
    this.loadIconPositions();

    // Global mouse up to end selection if it happens outside
    if (typeof window !== "undefined") {
        window.addEventListener("mouseup", this.handleGlobalMouseUp);
    }
  }

  componentWillUnmount() {
    this.removeContextListeners();
    if (typeof window !== "undefined") {
        window.removeEventListener("mouseup", this.handleGlobalMouseUp);
    }
  }

  loadIconPositions = () => {
    if (typeof window !== "undefined") {
      let positions = localStorage.getItem("desktop_icon_positions");
      if (positions) {
        this.setState({ desktop_icon_positions: JSON.parse(positions) });
      } else {
        const defaultPositions = this.generateDefaultPositions();
        this.setState({ desktop_icon_positions: defaultPositions });
        localStorage.setItem("desktop_icon_positions", JSON.stringify(defaultPositions));
      }
    }
  };

  generateDefaultPositions = () => {
    let positions = {};
    let row = 0;
    let col = 0;
    let startY = 40;
    let cellH = 100;
    let cellW = 100;

    // Grid alignment: x = 20 + n * 100
    // We want to start from the right side.
    const screenW = window.innerWidth;
    const maxCols = Math.floor((screenW - 20) / cellW);
    // maxCols is the number of columns that fit.
    // e.g. Width 1280. (1280-20)/100 = 12.6 -> 12 columns (indices 0..11).
    // X positions: 20, 120, ..., 20 + 11*100 = 1120.
    // We want to fill starting from col = maxCols - 1 (Rightmost).

    let gridCol = maxCols - 1;

    let maxRows = Math.floor((window.innerHeight - startY) / cellH);
    if (maxRows < 1) maxRows = 1;

    apps.forEach((app) => {
      if (app.desktop_shortcut) {
        positions[app.id] = {
          x: 20 + gridCol * cellW,
          y: startY + row * cellH,
        };
        row++;
        if (row >= maxRows) {
          row = 0;
          gridCol--; // Move left
        }
      }
    });
    return positions;
  };

  checkForNewFolders = () => {
    if (typeof window !== "undefined") {
      var new_folders = localStorage.getItem("new_folders");
      if (new_folders === null || new_folders === undefined) {
        localStorage.setItem("new_folders", JSON.stringify([]));
      } else {
        new_folders = JSON.parse(new_folders);
        new_folders.forEach((folder) => {
          apps.push({
            id: `new-folder-${folder.id}`,
            title: folder.name,
            icon: "./themes/Yaru/system/folder.png",
            disabled: true,
            favourite: false,
            desktop_shortcut: true,
            screen: () => {},
          });
        });
        this.updateAppsData();
      }
    }
  };

  setEventListeners = () => {
    if (typeof document !== "undefined") {
      const settingsBtn = document.getElementById("open-settings");
      if (settingsBtn) {
        settingsBtn.addEventListener("click", () => {
          this.openApp("settings");
        });
      }
    }
  };

  setContextListeners = () => {
    if (typeof document !== "undefined") {
      document.addEventListener("contextmenu", this.checkContextMenu);
      document.addEventListener("click", this.hideAllContextMenu);
    }
  };

  removeContextListeners = () => {
    if (typeof document !== "undefined") {
      document.removeEventListener("contextmenu", this.checkContextMenu);
      document.removeEventListener("click", this.hideAllContextMenu);
    }
  };

  checkContextMenu = (e) => {
    // If selecting, don't show context menu
    if (this.state.selection_box) return;

    e.preventDefault();
    this.hideAllContextMenu();
    switch (e.target.dataset.context) {
      case "desktop-area":
        ReactGA.event({
          category: `Context Menu`,
          action: `Opened Desktop Context Menu`,
        });
        this.showContextMenu(e, "desktop");
        break;
      default:
        ReactGA.event({
          category: `Context Menu`,
          action: `Opened Default Context Menu`,
        });
        this.showContextMenu(e, "default");
    }
  };

  showContextMenu = (e, menuName /* context menu name */) => {
    let { posx, posy } = this.getMenuPosition(e);
    if (typeof document !== "undefined") {
      let contextMenu = document.getElementById(`${menuName}-menu`);
      if (contextMenu) {
        if (posx + $(contextMenu).width() > window.innerWidth)
          posx -= $(contextMenu).width();
        if (posy + $(contextMenu).height() > window.innerHeight)
          posy -= $(contextMenu).height();

        posx = posx.toString() + "px";
        posy = posy.toString() + "px";

        contextMenu.style.left = posx;
        contextMenu.style.top = posy;
      }
    }

    this.setState({
      context_menus: { ...this.state.context_menus, [menuName]: true },
    });
  };

  hideAllContextMenu = () => {
    const menus = this.state.context_menus;
    // optimization: only update state if a menu is actually open
    const hasOpenMenu = Object.values(menus).some((isOpen) => isOpen);
    if (!hasOpenMenu) return;

    let newMenus = { ...menus };
    Object.keys(newMenus).forEach((key) => {
      newMenus[key] = false;
    });
    this.setState({ context_menus: newMenus });
  };

  getMenuPosition = (e) => {
    var posx = 0;
    var posy = 0;

    if (!e) e = window.event;

    if (e.pageX || e.pageY) {
      posx = e.pageX;
      posy = e.pageY;
    } else if (e.clientX || e.clientY) {
      if (typeof document !== "undefined") {
        posx =
          e.clientX +
          document.body.scrollLeft +
          document.documentElement.scrollLeft;
        posy =
          e.clientY +
          document.body.scrollTop +
          document.documentElement.scrollTop;
      }
    }
    return {
      posx,
      posy,
    };
  };

  fetchAppsData = () => {
    let focused_windows = {},
      closed_windows = {},
      disabled_apps = {},
      favourite_apps = {},
      overlapped_windows = {},
      minimized_windows = {};
    let desktop_apps = [];
    apps.forEach((app) => {
      focused_windows = {
        ...focused_windows,
        [app.id]: false,
      };
      closed_windows = {
        ...closed_windows,
        [app.id]: true,
      };
      disabled_apps = {
        ...disabled_apps,
        [app.id]: app.disabled,
      };
      favourite_apps = {
        ...favourite_apps,
        [app.id]: app.favourite,
      };
      overlapped_windows = {
        ...overlapped_windows,
        [app.id]: false,
      };
      minimized_windows = {
        ...minimized_windows,
        [app.id]: false,
      };
      if (app.desktop_shortcut) desktop_apps.push(app.id);
    });
    this.setState({
      focused_windows,
      closed_windows,
      disabled_apps,
      favourite_apps,
      overlapped_windows,
      minimized_windows,
      desktop_apps,
    });
    this.initFavourite = { ...favourite_apps };
  };

  updateAppsData = () => {
    let focused_windows = {},
      closed_windows = {},
      favourite_apps = {},
      minimized_windows = {},
      disabled_apps = {};
    let desktop_apps = [];
    apps.forEach((app) => {
      focused_windows = {
        ...focused_windows,
        [app.id]:
          this.state.focused_windows[app.id] !== undefined ||
          this.state.focused_windows[app.id] !== null
            ? this.state.focused_windows[app.id]
            : false,
      };
      minimized_windows = {
        ...minimized_windows,
        [app.id]:
          this.state.minimized_windows[app.id] !== undefined ||
          this.state.minimized_windows[app.id] !== null
            ? this.state.minimized_windows[app.id]
            : false,
      };
      disabled_apps = {
        ...disabled_apps,
        [app.id]: app.disabled,
      };
      closed_windows = {
        ...closed_windows,
        [app.id]:
          this.state.closed_windows[app.id] !== undefined ||
          this.state.closed_windows[app.id] !== null
            ? this.state.closed_windows[app.id]
            : true,
      };
      favourite_apps = {
        ...favourite_apps,
        [app.id]: app.favourite,
      };
      if (app.desktop_shortcut) desktop_apps.push(app.id);
    });
    this.setState({
      focused_windows,
      closed_windows,
      disabled_apps,
      minimized_windows,
      favourite_apps,
      desktop_apps,
    });
    this.initFavourite = { ...favourite_apps };
  };

  // --- Drag & Drop Logic ---

  handleDragStart = (e, id) => {
    // If dragging an unselected icon, select only that one
    if (!this.state.selected_icons.includes(id)) {
      this.setState({ selected_icons: [id] });
    }
    // If dragging a selected icon, keep selection as is (for group drag)
  };

  handleDrag = (e, data, id) => {
    const { deltaX, deltaY } = data;

    // Update position of all selected icons
    const newPositions = { ...this.state.desktop_icon_positions };
    this.state.selected_icons.forEach(iconId => {
      if (newPositions[iconId]) {
        newPositions[iconId] = {
          x: newPositions[iconId].x + deltaX,
          y: newPositions[iconId].y + deltaY
        };
      }
    });

    this.setState({ desktop_icon_positions: newPositions });
  };

  handleDragStop = (e, data, id) => {
    const newPositions = { ...this.state.desktop_icon_positions };
    const { w: cellW, h: cellH } = this.gridSize;

    // Snap all selected icons to grid
    this.state.selected_icons.forEach(iconId => {
      if (newPositions[iconId]) {
        let { x, y } = newPositions[iconId];

        // Snap logic
        x = Math.round(x / cellW) * cellW + 20; // Offset startX? Wait, default startX was 20.
        // My generateDefaultPositions uses startX=20.
        // So I should snap to (20 + n*100).
        // x - 20 = n * 100
        x = Math.round((x - 20) / cellW) * cellW + 20;

        // y - 40 = m * 100
        y = Math.round((y - 40) / cellH) * cellH + 40;

        if (x < 0) x = 20;
        if (y < 0) y = 40;

        newPositions[iconId] = { x, y };
      }
    });

    this.setState({ desktop_icon_positions: newPositions });
    localStorage.setItem("desktop_icon_positions", JSON.stringify(newPositions));
  };

  // --- Selection Logic ---

  handleDesktopMouseDown = (e) => {
    // Only handle if clicking directly on the desktop area (not windows)
    if (e.target.dataset.context !== "desktop-area") return;
    if (e.button !== 0) return; // Only allow left click for selection

    this.selectionStart = { x: e.clientX, y: e.clientY };
    this.setState({
        selection_box: { x: e.clientX, y: e.clientY, w: 0, h: 0 },
        selected_icons: [] // Clear selection on click bg
    });
  };

  handleDesktopMouseMove = (e) => {
    if (!this.selectionStart) return;

    const currentX = e.clientX;
    const currentY = e.clientY;
    const startX = this.selectionStart.x;
    const startY = this.selectionStart.y;

    const x = Math.min(startX, currentX);
    const y = Math.min(startY, currentY);
    const w = Math.abs(currentX - startX);
    const h = Math.abs(currentY - startY);

    this.setState({ selection_box: { x, y, w, h } }, this.updateSelectionIntersection);
  };

  handleGlobalMouseUp = () => {
    if (this.selectionStart) {
        this.selectionStart = null;
        this.setState({ selection_box: null });
    }
  };

  updateSelectionIntersection = () => {
    if (!this.state.selection_box) return;

    const { x: boxX, y: boxY, w: boxW, h: boxH } = this.state.selection_box;
    const selected = [];

    // Check intersection with all icons
    // We need DOM refs or assume dimensions.
    // Icons are at this.state.desktop_icon_positions
    // Icon size ~ 96x80.
    const iconW = 96;
    const iconH = 80;

    Object.keys(this.state.desktop_icon_positions).forEach(id => {
        const pos = this.state.desktop_icon_positions[id];
        // Check rectangle overlap
        // Box: [boxX, boxX+boxW] x [boxY, boxY+boxH]
        // Icon: [pos.x, pos.x+iconW] x [pos.y, pos.y+iconH]

        if (
            boxX < pos.x + iconW &&
            boxX + boxW > pos.x &&
            boxY < pos.y + iconH &&
            boxY + boxH > pos.y
        ) {
            selected.push(id);
        }
    });

    this.setState({ selected_icons: selected });
  };

  renderDesktopApps = () => {
    if (Object.keys(this.state.closed_windows).length === 0) return;
    let appsJsx = [];
    apps.forEach((app, index) => {
      if (this.state.desktop_apps.includes(app.id)) {
        const props = {
          name: app.title,
          id: app.id,
          icon: app.icon,
          openApp: this.openApp,
          // New prop
          selected: this.state.selected_icons.includes(app.id),
        };

        const pos = this.state.desktop_icon_positions[app.id] || { x: 0, y: 0 };

        // We use Draggable in 'controlled' mode via position prop
        appsJsx.push(
          <Draggable
            key={app.id}
            position={{x: pos.x, y: pos.y}}
            onStart={(e) => this.handleDragStart(e, app.id)}
            onDrag={(e, data) => this.handleDrag(e, data, app.id)}
            onStop={(e, data) => this.handleDragStop(e, data, app.id)}
          >
              <div style={{position: 'absolute'}}>
                <UbuntuApp {...props} />
              </div>
          </Draggable>
        );
      }
    });
    return appsJsx;
  };

  renderWindows = () => {
    let windowsJsx = [];
    apps.forEach((app, index) => {
      if (this.state.closed_windows[app.id] === false) {
        let screen = app.screen;
        if (app.id === "blog") {
          screen = (props) =>
            app.screen({ ...props, blogPosts: this.props.blogPosts });
        }

        const props = {
          title: app.title,
          id: app.id,
          screen: screen,
          addFolder: this.addToDesktop,
          closed: this.closeApp,
          openApp: this.openApp,
          focus: this.focus,
          isFocused: this.state.focused_windows[app.id],
          hideSideBar: this.hideSideBar,
          hasMinimised: this.hasMinimised,
          minimized: this.state.minimized_windows[app.id],
          changeBackgroundImage: this.props.changeBackgroundImage,
          bg_image_name: this.props.bg_image_name,
          changeAccentColor: this.props.changeAccentColor,
          accentColor: this.props.accentColor,
        };

        windowsJsx.push(<Window key={app.id} {...props} />);
      }
    });
    return windowsJsx;
  };

  hideSideBar = (objId, hide) => {
    if (hide === this.state.hideSideBar) return;

    if (objId === null) {
      if (hide === false) {
        this.setState({ hideSideBar: false });
      } else {
        for (const key in this.state.overlapped_windows) {
          if (this.state.overlapped_windows[key]) {
            this.setState({ hideSideBar: true });
            return;
          } // if any window is overlapped then hide the SideBar
        }
      }
      return;
    }

    if (hide === false) {
      for (const key in this.state.overlapped_windows) {
        if (this.state.overlapped_windows[key] && key !== objId) return; // if any window is overlapped then don't show the SideBar
      }
    }

    let overlapped_windows = this.state.overlapped_windows;
    overlapped_windows[objId] = hide;
    this.setState({ hideSideBar: hide, overlapped_windows });
  };

  hasMinimised = (objId) => {
    let minimized_windows = this.state.minimized_windows;
    var focused_windows = this.state.focused_windows;

    // remove focus and minimise this window
    minimized_windows[objId] = true;
    focused_windows[objId] = false;
    this.setState({ minimized_windows, focused_windows });

    this.hideSideBar(null, false);

    this.giveFocusToLastApp();
  };

  giveFocusToLastApp = () => {
    // if there is atleast one app opened, give it focus
    if (!this.checkAllMinimised()) {
      for (const index in this.app_stack) {
        if (!this.state.minimized_windows[this.app_stack[index]]) {
          this.focus(this.app_stack[index]);
          break;
        }
      }
    }
  };

  checkAllMinimised = () => {
    let result = true;
    for (const key in this.state.minimized_windows) {
      if (!this.state.closed_windows[key]) {
        // if app is opened
        result = result & this.state.minimized_windows[key];
      }
    }
    return result;
  };

  openApp = (objId) => {
    // google analytics
    ReactGA.event({
      category: `Open App`,
      action: `Opened ${objId} window`,
    });

    // if the app is disabled
    if (this.state.disabled_apps[objId]) return;

    if (this.state.minimized_windows[objId]) {
      // focus this app's window
      this.focus(objId);

      // set window's last position
      var r = document.querySelector("#" + objId);
      r.style.transform = `translate(${r.style.getPropertyValue(
        "--window-transform-x"
      )},${r.style.getPropertyValue("--window-transform-y")}) scale(1)`;

      // tell childs that his app has been not minimised
      let minimized_windows = this.state.minimized_windows;
      minimized_windows[objId] = false;
      this.setState({ minimized_windows: minimized_windows });
      return;
    }

    //if app is already opened
    if (this.app_stack.includes(objId)) this.focus(objId);
    else {
      let closed_windows = this.state.closed_windows;
      let favourite_apps = this.state.favourite_apps;
      var frequentApps = [];
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("frequentApps");
        if (stored) {
          frequentApps = JSON.parse(stored);
        }
      }
      var currentApp = frequentApps.find((app) => app.id === objId);
      if (currentApp) {
        frequentApps.forEach((app) => {
          if (app.id === currentApp.id) {
            app.frequency += 1; // increase the frequency if app is found
          }
        });
      } else {
        frequentApps.push({ id: objId, frequency: 1 }); // new app opened
      }

      frequentApps.sort((a, b) => {
        if (a.frequency < b.frequency) {
          return 1;
        }
        if (a.frequency > b.frequency) {
          return -1;
        }
        return 0; // sort according to decreasing frequencies
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("frequentApps", JSON.stringify(frequentApps));
      }

      setTimeout(() => {
        favourite_apps[objId] = true; // adds opened app to sideBar
        closed_windows[objId] = false; // openes app's window
        this.setState(
          { closed_windows, favourite_apps, allAppsView: false },
          this.focus(objId)
        );
        this.app_stack.push(objId);
      }, 200);
    }
  };

  closeApp = (objId) => {
    // remove app from the app stack
    this.app_stack.splice(this.app_stack.indexOf(objId), 1);

    this.giveFocusToLastApp();

    this.hideSideBar(null, false);

    // close window
    let closed_windows = this.state.closed_windows;
    let favourite_apps = this.state.favourite_apps;

    if (this.initFavourite[objId] === false) favourite_apps[objId] = false; // if user default app is not favourite, remove from sidebar
    closed_windows[objId] = true; // closes the app's window

    this.setState({ closed_windows, favourite_apps });
  };

  focus = (objId) => {
    // removes focus from all window and
    // gives focus to window with 'id = objId'
    var focused_windows = this.state.focused_windows;
    focused_windows[objId] = true;
    for (let key in focused_windows) {
      if (focused_windows.hasOwnProperty(key)) {
        if (key !== objId) {
          focused_windows[key] = false;
        }
      }
    }
    this.setState({ focused_windows });
  };

  addNewFolder = () => {
    this.setState({ showNameBar: true });
  };

  addToDesktop = (folder_name) => {
    folder_name = folder_name.trim();
    let folder_id = folder_name.replace(/\s+/g, "-").toLowerCase();
    apps.push({
      id: `new-folder-${folder_id}`,
      title: folder_name,
      icon: "./themes/Yaru/system/folder.png",
      disabled: true,
      favourite: false,
      desktop_shortcut: true,
      screen: () => {},
    });
    // store in local storage
    if (typeof window !== "undefined") {
      var new_folders = JSON.parse(localStorage.getItem("new_folders") || "[]");
      new_folders.push({ id: `new-folder-${folder_id}`, name: folder_name });
      localStorage.setItem("new_folders", JSON.stringify(new_folders));
    }

    // Assign a position for the new folder
    let positions = { ...this.state.desktop_icon_positions };
    const getNextPosition = () => {
        let row = 0;
        let col = 0;
        let cellW = 100;
        let cellH = 100;
        let startX = 20;
        let startY = 40;
        let maxRows = Math.floor((window.innerHeight - startY) / cellH) || 1;

        while (true) {
            const x = startX + col * cellW;
            const y = startY + row * cellH;

            const occupied = Object.values(positions).some(pos =>
                Math.abs(pos.x - x) < 10 && Math.abs(pos.y - y) < 10
            );

            if (!occupied) return { x, y };

            row++;
            if (row >= maxRows) {
                row = 0;
                col++;
            }
            if (col > 100) return { x: 0, y: 0 }; // Safety break
        }
    }

    positions[`new-folder-${folder_id}`] = getNextPosition();
    localStorage.setItem("desktop_icon_positions", JSON.stringify(positions));

    this.setState({ showNameBar: false, desktop_icon_positions: positions }, this.updateAppsData);
  };

  showAllApps = () => {
    this.setState({ allAppsView: !this.state.allAppsView });
  };

  renderNameBar = () => {
    let addFolder = () => {
      if (typeof document !== "undefined") {
        const input = document.getElementById("folder-name-input");
        if (input) {
          let folder_name = input.value;
          this.addToDesktop(folder_name);
        }
      }
    };

    let removeCard = () => {
      this.setState({ showNameBar: false });
    };

    return (
      <div className="absolute rounded-md top-1/2 left-1/2 text-center text-white font-light text-sm bg-ub-cool-grey transform -translate-y-1/2 -translate-x-1/2 sm:w-96 w-3/4 z-50">
        <div className="w-full flex flex-col justify-around items-start pl-6 pb-8 pt-6">
          <span>New folder name</span>
          <input
            className="outline-none mt-5 px-1 w-10/12  context-menu-bg border-2 border-yellow-700 rounded py-0.5"
            id="folder-name-input"
            type="text"
            autoComplete="off"
            spellCheck="false"
            autoFocus={true}
          />
        </div>
        <div className="flex">
          <div
            onClick={addFolder}
            className="w-1/2 px-4 py-2 border border-gray-900 border-opacity-50 border-r-0 hover:bg-ub-warm-grey hover:bg-opacity-10 hover:border-opacity-50"
          >
            Create
          </div>
          <div
            onClick={removeCard}
            className="w-1/2 px-4 py-2 border border-gray-900 border-opacity-50 hover:bg-ub-warm-grey hover:bg-opacity-10 hover:border-opacity-50"
          >
            Cancel
          </div>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div
        className={
          " h-full w-full bg-transparent relative overflow-hidden overscroll-none window-parent"
        }
        onMouseDown={this.handleDesktopMouseDown}
        onMouseMove={this.handleDesktopMouseMove}
      >
        {/* Window Area */}
        <div
          className="absolute h-full w-full bg-transparent"
          data-context="desktop-area"
        >
          {this.renderWindows()}
        </div>

        {/* Background Image */}
        <BackgroundImage img={this.props.bg_image_name} />

        {/* Ubuntu Side Menu Bar */}
        <SideBar
          apps={apps}
          hide={this.state.hideSideBar}
          hideSideBar={this.hideSideBar}
          favourite_apps={this.state.favourite_apps}
          showAllApps={this.showAllApps}
          allAppsView={this.state.allAppsView}
          closed_windows={this.state.closed_windows}
          focused_windows={this.state.focused_windows}
          isMinimized={this.state.minimized_windows}
          openAppByAppId={this.openApp}
        />

        {/* Desktop Apps */}
        {this.renderDesktopApps()}

        {/* Selection Box */}
        {this.state.selection_box && (
            <div
                className="absolute border border-ub-orange bg-ub-orange bg-opacity-20 z-50 selection-box"
                style={{
                    left: this.state.selection_box.x,
                    top: this.state.selection_box.y,
                    width: this.state.selection_box.w,
                    height: this.state.selection_box.h
                }}
            />
        )}

        {/* Context Menus */}
        <DesktopMenu
          active={this.state.context_menus.desktop}
          openApp={this.openApp}
          addNewFolder={this.addNewFolder}
        />
        <DefaultMenu active={this.state.context_menus.default} />

        {/* Folder Input Name Bar */}
        {this.state.showNameBar ? this.renderNameBar() : null}

        {this.state.allAppsView ? (
          <AllApplications
            apps={apps}
            recentApps={this.app_stack}
            openApp={this.openApp}
          />
        ) : null}
      </div>
    );
  }
}

export default Desktop;
