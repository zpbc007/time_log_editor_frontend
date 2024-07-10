import { addEventListener } from "./bridge";

const options = {
  modules: {},
  theme: "snow",
};
const quill = new Quill("#editor", options);

// 加粗操作
addEventListener("toolbar.boldButtonTapped", () => {
  console.log("toolbar.bold.tapped!!!");
});
