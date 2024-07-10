import { addEventListener } from "./bridge";

const options = {
  modules: {},
  theme: "snow",
};
const quill = new Quill("#editor", options);

function isFeatureActive(type) {
  const range = quill.getSelection();
  const formats = range == null ? {} : quill.getFormat(range);
  return formats[type] != null;
}

// 加粗操作
addEventListener("toolbar.boldButtonTapped", () => {
  const isActive = isFeatureActive("bold");

  quill.format("bold", !isActive);
});

// 有序列表操作
addEventListener("toolbar.numberListButtonTapped", () => {
  const isActive = isFeatureActive("list");

  quill.format("list", isActive ? false : "ordered");
});

// 无序列表操作
addEventListener("toolbar.dashListButtonTapped", () => {
  const isActive = isFeatureActive("list");

  quill.format("list", isActive ? false : "bullet");
});
