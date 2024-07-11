import { addEventListener, addEventHandler, callNative } from "./bridge";
import { throttle } from "lodash-es";

const options = {
  modules: {
    toolbar: false,
  },
  theme: "snow",
};
const quill = new Quill("#editor", options);

function getSelectionFormats() {
  const range = quill.getSelection();
  return range == null ? {} : quill.getFormat(range);
}

function isFormatActive(type) {
  const formats = getSelectionFormats();
  return formats[type] != null;
}

// 加粗操作
addEventListener("toolbar.boldButtonTapped", () => {
  const isActive = isFormatActive("bold");

  quill.format("bold", !isActive);
});

// 有序列表操作
addEventListener("toolbar.numberListButtonTapped", () => {
  const formats = getSelectionFormats();

  quill.format("list", formats.list === "ordered" ? false : "ordered");
});

// 无序列表操作
addEventListener("toolbar.dashListButtonTapped", () => {
  const formats = getSelectionFormats();

  quill.format("list", formats.list === "bullet" ? false : "bullet");
});

// 勾选列表操作
addEventListener("toolbar.checkBoxListButtonTapped", () => {
  const formats = getSelectionFormats();

  if (formats.list === "checked" || formats.list === "unchecked") {
    quill.format("list", false);
  } else {
    quill.format("list", "unchecked");
  }
});

function handleIndentChange(modifier) {
  const formats = getSelectionFormats();
  const indent = parseInt(formats.indent || 0, 10);
  modifier *= formats.direction === "rtl" ? -1 : 1;

  quill.format("indent", indent + modifier);
}

// 增加缩进操作
addEventListener("toolbar.increaseIndentButtonTapped", () => {
  handleIndentChange(1);
});

// 减少缩进操作
addEventListener("toolbar.decreaseIndentButtonTapped", () => {
  handleIndentChange(-1);
});

// 减少缩进操作
addEventListener("toolbar.blurButtonTapped", () => {
  quill.blur();
});

// 获取编辑器内容
addEventHandler("editor.fetchContent", () => {
  return quill.getContents();
});

// 设置编辑器内容
addEventListener("editor.setContent", (newContent) => {
  quill.setContents(newContent, "api");
});

function noticeNativeTextChange(delta) {
  callNative("editor.textChange", delta);
}
const throttledNotice = throttle(noticeNativeTextChange, 300, {
  trailing: true,
});

quill.on("text-change", (delta, oldDelta, source) => {
  if (source == "user") {
    throttledNotice(delta);
  }
});
