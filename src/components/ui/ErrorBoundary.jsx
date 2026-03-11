import { Component } from "react";
import { C, FONT } from "../../constants/theme.js";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div style={{ padding: 24, textAlign: "center", fontFamily: FONT, color: C.text }}>
        <div style={{ fontSize: 28, marginBottom: 12 }}>:(</div>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Něco se pokazilo</div>
        <div style={{ fontSize: 10, color: C.muted, marginBottom: 16, wordBreak: "break-word" }}>
          {this.state.error?.message}
        </div>
        <button
          onClick={() => this.setState({ error: null })}
          style={{ padding: "8px 20px", background: C.green, color: "white", border: "none", borderRadius: 6, fontSize: 12, fontFamily: FONT, fontWeight: 700, cursor: "pointer" }}
        >
          Zkusit znovu
        </button>
      </div>
    );
  }
}
