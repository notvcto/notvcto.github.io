import React from "react";

export class VSH extends React.Component {
  render() {
    return (
      <div className="h-full w-full flex flex-col bg-ub-cool-grey">
        <iframe
          src="https://vsh.notvc.to"
          className="flex-grow"
          id="vsh-screen"
          frameBorder="0"
          title="VSH"
        ></iframe>
      </div>
    );
  }
}

export default VSH;

export const displayVSH = () => {
  return <VSH> </VSH>;
<<<<<<< Updated upstream
};
=======
};
>>>>>>> Stashed changes
