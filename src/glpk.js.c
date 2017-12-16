#include <glpk.h>

#ifdef __cplusplus
extern "C" {
#endif

int solve_lp(glp_prob *P, int msg_lev) {
	glp_smcp parm;
	glp_init_smcp(&parm);
	parm.presolve = 1;
	parm.msg_lev = msg_lev;
	return glp_simplex(P, &parm);
}

int solve_mip(glp_prob *P, int msg_lev) {
	glp_iocp parm;
	glp_init_iocp(&parm);
	parm.presolve = 1;
	parm.msg_lev = msg_lev;
	return glp_intopt(P, &parm);
}

#ifdef __cplusplus
}
#endif
