var Module = {
  'print': function (text) {
    if (typeof importScripts === 'function') // is worker
      postMessage(text); 
    else
      console.log(text);
  },
  'printError': function (text) { 
    if (typeof importScripts === 'function') // is worker
      postMessage(text); 
    else
      console.log(text);
  }
};