import React from "react";

export class VoidNet extends React.Component {
  render() {
    return (
      <div className="h-full w-full flex flex-col bg-ub-cool-grey">
        <iframe
          src="https://notvc.to/voidnet"
          className="flex-grow"
          id="voidnet-screen"
          frameBorder="0"
          title="VoidNet"
        ></iframe>
      </div>
    );
  }
}

export default VoidNet;

export const displayVoidNet = () => {
  return <VoidNet> </VoidNet>;
};