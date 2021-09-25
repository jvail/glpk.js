#include <glpk.h>
#include <emscripten.h>
#include <stdlib.h>

#ifdef __cplusplus
extern "C" {
#endif


glp_smcp* EMSCRIPTEN_KEEPALIVE get_glp_smcp(int it_lim,  int msg_lev, int tm_lim) {
    glp_smcp *parm = malloc(sizeof *parm);
    glp_init_smcp(parm);
    parm->it_lim = it_lim;
    parm->msg_lev = msg_lev;
    parm->tm_lim = tm_lim;
    parm->presolve = 0; // disable presolver
    return parm;
}

int EMSCRIPTEN_KEEPALIVE solve_lp_itlim(glp_prob *P, glp_smcp *parm, int each) {
    parm->it_lim = parm->it_lim + each;
    return glp_simplex(P, parm);
}

int EMSCRIPTEN_KEEPALIVE solve_lp(glp_prob *P, int msg_lev, int tm_lim, int presolve) {
    glp_smcp parm;
    glp_init_smcp(&parm);
    parm.msg_lev = msg_lev;
    parm.tm_lim = tm_lim;
    parm.presolve = presolve;
    return glp_simplex(P, &parm);
}

int EMSCRIPTEN_KEEPALIVE solve_mip(glp_prob *P, int msg_lev, int tm_lim, int presolve, double mip_gap) {
    glp_iocp parm;
    glp_init_iocp(&parm);
    parm.msg_lev = msg_lev;
    parm.tm_lim = tm_lim;
    parm.presolve = presolve;
    parm.mip_gap = mip_gap;
    return glp_intopt(P, &parm);
}

#ifdef __cplusplus
}
#endif
