import React from "react";

export default function Spotify() {
  return (
    <iframe
      src="https://open.spotify.com/playlist/0Pict9HQbfIuVe05q2NiSO"
      frameBorder="0"
      title="Spotify"
      className="h-full w-full bg-ub-cool-grey"
    ></iframe>
  );
}

export const displaySpotify = () => {
  <Spotify> </Spotify>;
};
