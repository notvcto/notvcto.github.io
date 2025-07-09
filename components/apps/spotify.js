import React from "react";

export default function Spotify() {
  return (
<iframe src="https://open.spotify.com/embed/playlist/0Pict9HQbfIuVe05q2NiSO?utm_source=generator&theme=0" 
width="100%" 
height="100%" 
frameBorder="0" 
allowfullscreen="" 
allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
loading="lazy">
</iframe>
  );
}

export const displaySpotify = () => {
  return <Spotify> </Spotify>;
};

