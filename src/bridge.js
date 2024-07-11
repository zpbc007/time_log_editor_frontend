// 使用示例
// 事件监听
// const dispose = window.timeLineBridge.on("toolbar.bold.tapped", () => {
//   console.log("toolbar.bold.tapped");
// });
// 主动调用，等待返回结果
// window.timeLineBridge.call("page.close", {data: true}, (result) => {
//   if (result) {
//     console.log("close success");
//   } else {
//     console.log("close failed");
//   }
// });
// 主动触发，返回结果
// window.timeLineBridge.trigger("editor.content.change", { content: "xxx" });

/**
 * 使用示例
 *
 * 事件监听 无返回值
 * const dispose = window.timeLineBridge.addEventListener("toolbar.bold.tapped", () => {
 *  console.log("toolbar.bold.tapped");
 * });
 *
 * 事件监听 有返回值
 * const dispose = window.timeLineBridge.addEventHandler("editor.fetchContent", () => {
 *  return quill.getContents();
 * })
 *
 * 主动调用 native api，等待返回结果
 * window.timeLineBridge.call("page.close", {data: true}, (result) => {
 *  if (result) {
 *    console.log("close success");
 *  } else {
 *    console.log("close failed");
 *  }
 * });
 *
 * 主动触发 web 事件，通知客户端
 * window.timeLineBridge.trigger("editor.content.change", { content: "xxx" });
 */

const eventListeners = {};
/**
 * 监听从 native 发过来的事件
 * @param {string} eventName
 * @param {function} handler
 * @returns
 */
function addEventListener(eventName, handler) {
  if (!eventListeners[eventName]) {
    eventListeners[eventName] = [];
  }

  eventListeners[eventName].push(handler);

  // 调用方自己取消监听
  return () => {
    eventListeners[eventName] = eventListeners[eventName].filter(
      (item) => item != handler
    );
  };
}

/**
 * 向 native 发送前端事件
 * @param {*} eventName
 * @param {*} data
 */
function triggerEvent(eventName, data) {
  callNative(eventName, data);
}

/**
 * 向 native 发送消息
 * @param {string} eventName
 * @param {*} data
 * @param {*} callback
 */
function callNative(eventName, data, callback) {
  if (arguments.length == 2 && typeof data == "function") {
    callback = data;
    data = null;
  }

  _callNative(
    {
      eventName,
      data,
    },
    callback
  );
}

const responseCallbacks = {};
/**
 * 调用 postMessage 发出 消息
 * @param {*} message
 * @param {*} callback
 */
function _callNative(message, callback) {
  if (callback) {
    const callbackID = genUniqueID();
    // 添加 ID
    message.callbackID = callbackID;
    responseCallbacks[callbackID] = callback;
  }

  window.webkit.messageHandlers.timeLineBridge.postMessage(
    JSON.stringify({
      ...message,
      // 对数据序列化，如果 native 需要解析，再拿出来解析
      data: message.data ? JSON.stringify(message.data) : null,
    })
  );
}

/**
 * native 向前端发过来的消息
 * @param {*} message
 */
function handleMessageFromNative(message) {
  const messageObj = JSON.parse(message);
  // 需要调用 callback
  if (messageObj.callbackID) {
    const callback = responseCallbacks[messageObj.callbackID];
    if (callback) {
      callback(messageObj.data);
    }
  } else {
    const handlers = eventListeners[messageObj.eventName];
    handlers.forEach((callback) => {
      callback(messageObj.data);
    });
  }
}

const genUniqueID = (function () {
  const genId = () => `${Date.now()}${Math.random().toString(36).substring(2)}`;
  const idSet = new Set();

  return () => {
    if (idSet.size >= 500) {
      idSet.clear();
    }

    let newId = genId();
    while (idSet.has(newId)) {
      genId = genId();
    }

    idSet.add(newId);

    return newId;
  };
})();

const eventHandlers = {};
function addEventHandler(eventName, handler) {
  eventHandlers[eventName] = handler;

  return () => {
    if (eventHandlers[eventName] === handler) {
      eventHandlers[eventName] = null;
    }
  };
}

function handleEventFromNative(message) {
  const { eventName, data } = JSON.parse(message) || {};

  const response = {
    eventName,
    data: null,
  };

  if (eventName && eventHandlers[eventName]) {
    response.data = eventHandlers[eventName](data || null);
  }

  return response;
}

// 供外部调用
window.timeLineBridge = {
  // 同一个 eventName 全局可以有多个
  addEventListener,
  // 同一个 eventName 全局只能有一个
  addEventHandler,
  callNative,
  triggerEvent,
  // 客户端不获取返回值
  _handleMessageFromNative: handleMessageFromNative,
  // 客户端需要获取返回值
  _handleEventFromNative: handleEventFromNative,
};

export { addEventListener, callNative, triggerEvent, addEventHandler };
