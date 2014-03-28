
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

    var json_in = JSON.stringify(LP)
      , start = new Date().getTime()
      , out = ccall('do_solve', 'number', ['string', 'number'], [json_in, msg_lev])
      , end = new Date().getTime()
      , json_out = Pointer_stringify(out)
      ;

    return { 
        time: ((end - start) / 1000)
      , result: JSON.parse(json_out) 
    };

};