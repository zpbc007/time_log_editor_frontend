import { addEventListener } from "./bridge";

const options = {
  modules: {},
  theme: "snow",
};
const quill = new Quill("#editor", options);

// 加粗操作
addEventListener("toolbar.boldButtonTapped", () => {
  const range = quill.getSelection();
  const formats = range == null ? {} : quill.getFormat(range);
  const isActive = formats["bold"] != null;

  quill.format("bold", !isActive);
});
