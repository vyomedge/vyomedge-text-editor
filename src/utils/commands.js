// utils/commands.js
export function execCommand(cmd, value = null) {
  document.execCommand(cmd, false, value);
}
