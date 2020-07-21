import React from "react";

const TWEET_STYLE = {
  margin: 10,
  border: "1px solid gray",
  borderRadius: 7,
  background: "white",
  display: "flex"
};

const IMAGE_STYLE = {
  height: 60,
  width: 60,
  margin: 10,
  borderRadius: "50%"
};

const USERNAME_STYLE = {
  textAlign: "left",
  padding: 0,
  margin: 0,
  marginLeft: 22
};

const BODY_STYLE = {
  padding: 7,
  margin: 7
};

const TEXT_STYLE = {
  margin: 15,
  padding: 15,
  borderRadius: 7,
  border: "1px solid gray",
  background: "#E8E8E8",
  textAlign: "left"
};

export default ({ tweet: { text, image, username } }) => (
  <div style={TWEET_STYLE} className="fade-in">
    <img src={image} style={IMAGE_STYLE} alt={username} />
    <div style={BODY_STYLE}>
      <h2 style={USERNAME_STYLE}>{username}</h2>
      <div style={TEXT_STYLE}>{text}</div>
    </div>
  </div>
);
