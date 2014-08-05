
Module['glpConstants'] = function () {

  return {
      /* direction: */
      GLP_MIN: 1  /* minimization */
    , GLP_MAX: 2  /* maximization */

      /* kind of structural variable: */
    , GLP_CV:  1  /* continuous variable */
    , GLP_IV:  2  /* integer variable */
    , GLP_BV:  3  /* binary variable */

      /* type of auxiliary/structural variable: */
    , GLP_FR:  1  /* free (unbounded) variable */
    , GLP_LO:  2  /* variable with lower bound */
    , GLP_UP:  3  /* variable with upper bound */
    , GLP_DB:  4  /* double-bounded variable */
    , GLP_FX:  5  /* fixed variable */

      /* message level: */
    , GLP_MSG_OFF: 0  /* no output */
    , GLP_MSG_ERR: 1  /* warning and error messages only */
    , GLP_MSG_ON:  2  /* normal output */
    , GLP_MSG_ALL: 3  /* full output */
    , GLP_MSG_DBG: 4  /* debug output */

      /* solution status: */
    , GLP_UNDEF:  1  /* solution is undefined */
    , GLP_FEAS:   2  /* solution is feasible */
    , GLP_INFEAS: 3  /* solution is infeasible */
    , GLP_NOFEAS: 4  /* no feasible solution exists */
    , GLP_OPT:    5  /* solution is optimal */
    , GLP_UNBND:  6  /* solution is unbounded */
  };

};


Module['solve'] = function (LP , msg_lev) {

  var ret = {
        time: 0
      , result: null
      , cson_error: ''
    }
    , json_in = JSON.stringify(LP)
    , start = new Date().getTime()
    ;

  /* TODO: can't figure out how to pass a char* to c to store JSON and read string from ptr. I am using a cb instead */
  var cb = Runtime.addFunction(
    function (rc, out) {
      var out_str = Pointer_stringify(out);
      if (rc === 0)
        ret.result = JSON.parse(out_str);
      else
        ret.cson_error = out_str; /* cson error string */
      ret.time = ((new Date().getTime() - start) / 1000);
    }
  );

  ccall('do_solve', 'number', ['string', 'number', 'number'], [json_in, cb, msg_lev])

  Runtime.removeFunction(cb);

  return ret;

};