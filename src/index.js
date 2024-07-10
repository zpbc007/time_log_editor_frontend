import { addEventListener } from "./bridge";

const options = {
  modules: {},
  theme: "snow",
};
const quill = new Quill("#editor", options);

// 加错操作
addEventListener("toolbar.bold.tapped", () => {
  console.log("toolbar.bold.tapped");
});
