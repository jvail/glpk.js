#include <glpk.h>

#ifdef __cplusplus
extern "C" {
#endif

int solve_lp(glp_prob *P, int msg_lev, int presolve) {
	glp_smcp parm;
	glp_init_smcp(&parm);
	parm.presolve = presolve;
	parm.msg_lev = msg_lev;
	return glp_simplex(P, &parm);
}

int solve_mip(glp_prob *P, int msg_lev, int tm_lim, double mip_gap, int presolve) {
	glp_iocp parm;
	glp_init_iocp(&parm);
	parm.presolve = presolve;
	parm.msg_lev = msg_lev;
	parm.tm_lim = tm_lim;
	parm.mip_gap = mip_gap;
	return glp_intopt(P, &parm);
}

#ifdef __cplusplus
}
#endif
