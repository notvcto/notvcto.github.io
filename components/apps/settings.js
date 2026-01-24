import React from "react";
import $ from "jquery";

export function Settings(props) {
  const wallpapers = {
    "wall-1": "./images/wallpapers/wall-1.webp",
    "wall-2": "./images/wallpapers/wall-2.webp",
    "wall-3": "./images/wallpapers/wall-3.webp",
    "wall-4": "./images/wallpapers/wall-4.webp",
    "wall-5": "./images/wallpapers/wall-5.webp",
    "wall-6": "./images/wallpapers/wall-6.webp",
    "wall-7": "./images/wallpapers/wall-7.webp",
    "wall-8": "./images/wallpapers/wall-8.webp",
    "wall-9": "./images/wallpapers/wall-9.webp",
    "wall-10": "./images/wallpapers/wall-10.webp",
    "minimal": "./images/wallpapers/minimal.png",
  };

  const accentColors = [
    { name: "Ubuntu Orange", hex: "#E95420" },
    { name: "Forest Green", hex: "#4E9A06" },
    { name: "Royal Blue", hex: "#3465A4" },
    { name: "Aubergine", hex: "#77216F" },
    { name: "Crimson Red", hex: "#C0392B" },
  ];

  let changeBackgroundImage = (e) => {
    props.changeBackgroundImage($(e.target).data("path"));
  };

  return (
    <div
      className={
        "w-full flex-col flex-grow z-20 max-h-full overflow-y-auto windowMainScreen select-none bg-ub-cool-grey"
      }
    >
      <div
        className=" md:w-2/5 w-2/3 h-1/3 m-auto my-4"
        style={{
          backgroundImage: `url(${wallpapers[props.currBgImgName]})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
        }}
      ></div>

      <div className="flex flex-col items-center border-t border-gray-900 py-4">
        <span className="text-white font-bold mb-2">Accent Color</span>
        <div className="flex gap-4">
          {accentColors.map((color) => (
            <div
              key={color.hex}
              onClick={() => props.changeAccentColor(color.hex)}
              className={`w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110 flex items-center justify-center ${
                props.accentColor === color.hex ? "ring-2 ring-white" : ""
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            >
              {props.accentColor === color.hex && (
                <div className="w-3 h-3 bg-white rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center border-t border-gray-900 pt-4">
        <span className="text-white font-bold mb-2">Backgrounds</span>
        <div className="flex flex-wrap justify-center items-center">
          {Object.keys(wallpapers).map((name) => {
            return (
              <div
                key={name}
                tabIndex="1"
                onFocus={changeBackgroundImage}
                data-path={name}
                className={
                  (name === props.currBgImgName
                    ? " border-ub-orange "
                    : " border-transparent ") +
                  " md:px-28 md:py-20 md:m-4 m-2 px-14 py-10 outline-none border-4 border-opacity-80"
                }
                style={{
                  backgroundImage: `url(${wallpapers[name]})`,
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center center",
                }}
              ></div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Settings;

export const displaySettings = () => {
  return <Settings> </Settings>;
};
