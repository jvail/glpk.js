importScripts('glpk.js');

onmessage = function (evt) {

  if (typeof evt.data.lp != undefined) {  // solve LP

    var json_in = JSON.stringify(evt.data.lp)
      , msg_lev = evt.data.msg_lev
      , out = solve(json_in, msg_lev);
      , json_out = Pointer_stringify(out)
      ;

  	postMessage(JSON.parse(json_out));

  } else { // return GLPK constants

    return glpConstants();
    
  }

};

