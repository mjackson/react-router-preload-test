import React from "react";

export default class Message extends React.PureComponent {
  render() {
    console.log("render Message");
    return <p>{this.props.text}</p>;
  }
}
