#include <prob.h>
#include <cson_amalgamation_core.h>
#include <emscripten.h>
#include <string>

#ifdef __cplusplus
extern "C" {
#endif

static int my_printfv(char const * fmt, va_list vargs )
{
    vfprintf( stderr, fmt, vargs );
    return 0;
}


static int my_printf(char const * fmt, ...)
{
    int rc = 0;
    va_list vargs;
    va_start(vargs,fmt);
    rc = my_printfv( fmt, vargs );
    va_end(vargs);
    return rc;
}


#define MARKER if(1) my_printf("%s:%d:%s():\t",__FILE__,__LINE__,__func__); if(1) my_printf
#define MESSAGE my_printf


static int cson_data_dest_string(void * state, void const * src, unsigned int n )
{
  if( ! state ) return cson_rc.ArgError;
  if( !src || !n ) return 0;
  else
  {
    std::string *str = static_cast<std::string*>(state);
    str->append((char*) src, n);
    return 0;
  }
}



int write_json(const cson_value* val, std::string *str)
{
  cson_output_opt opt;
  opt.addNewline = 1;
  opt.indentation = 2;
  opt.addSpaceAfterColon = 1;
  opt.maxDepth = 25;
  int  rc = cson_output(val, cson_data_dest_string, (void*)str, &opt);
  return rc;
}


int parse_json(cson_value **val, char const *json)
{
  cson_parse_info info = cson_parse_info_empty;
  int rc = cson_parse_string(val, json, strlen(json), NULL, &info);
  if( 0 != rc ) {
    MESSAGE("JSON parse error, code=%d (%s), at line %u, column %u.\n",
      info.errorCode, cson_rc_string(rc), info.line, info.col );
    return rc;
  }
  return rc;
}

static int find_col(struct glp_prob *P, const char *name)
{     
  /* find column by its symbolic name */
  int j;
  j = glp_find_col(P, name);
  if (j == 0)
  {  /* not found; create new column */
     j = glp_add_cols(P, 1);
     glp_set_col_name(P, j, name);
     /* TODO: default bounds? */
     glp_set_col_bnds(P, j, GLP_FX, +DBL_MAX, -DBL_MAX);
  }
  return j;
}


const char* do_solve(char const *json_in, int msg_lev)
{
  /* create cson from P JSON */
  cson_value *in_val = NULL;
  int rc = 0;

  rc = parse_json(&in_val, json_in); 
  if (rc != 0)
    return cson_rc_string(rc);

  /* create cson from lp JSON */
  cson_object *in_obj = cson_value_get_object(in_val);
  cson_object *objective_obj = cson_value_get_object(cson_object_get(in_obj, "objective")); 
  cson_array *objective_vars_arr = cson_value_get_array(cson_object_get(objective_obj, "vars")); 
  cson_array *subject_arr = cson_value_get_array(cson_object_get(in_obj, "subjectTo")); 
  cson_array *bounds_arr = cson_value_get_array(cson_object_get(in_obj, "bounds")); 

  /* declare variables */
  glp_prob *P;

  /* create problem */
  P = glp_create_prob();
  /* erase problem object */
  glp_erase_prob(P);
  glp_create_index(P);

  const char* prob_name = cson_string_cstr(cson_value_get_string(cson_object_get(in_obj, "name")));
  glp_set_prob_name(P, prob_name);
  int obj_dir = (int)cson_value_get_integer(cson_object_get(objective_obj, "direction"));
  glp_set_obj_dir(P, obj_dir);

  int j, i = 0;

  /* parse objective */
  for (int i = 1; i < cson_array_length_get(objective_vars_arr) + 1; i++) {

    cson_object* obj = cson_value_get_object(cson_array_get(objective_vars_arr, i - 1));
    const char* name =  cson_string_cstr(cson_value_get_string(cson_object_get(obj, "name")));
    int type = GLP_LO;
    double lb = 0.0;
    double ub = 0.0;
    double coef = cson_value_get_double(cson_object_get(obj, "coef"));
    j = find_col(P, name);
    glp_set_col_bnds(P, j, type, lb, ub);
    glp_set_obj_coef(P, j, coef);
    // printf("%s: %i\n", name, glp_find_col(P, name));

  }

  /* parse_constraints */
  for (int k = 1; k < cson_array_length_get(subject_arr) + 1; k++) {
    
    cson_object* row_obj = cson_value_get_object(cson_array_get(subject_arr, k - 1));
    cson_array* var_arr = cson_value_get_array(cson_object_get(row_obj, "vars"));
    cson_object* bnds = cson_value_get_object(cson_object_get(row_obj, "bnds"));
    
    int len = cson_array_length_get(var_arr);
    int ind[1+len]; 
    double val[1+len];

    for (int kk = 1; kk < len + 1; kk++) {
      cson_object* var_obj = cson_value_get_object(cson_array_get(var_arr, kk - 1));
      const char* name =  cson_string_cstr(cson_value_get_string(cson_object_get(var_obj, "name")));
      double coef = cson_value_get_double(cson_object_get(var_obj, "coef"));
      j = find_col(P, name);
      ind[kk] = j, val[kk] = coef;
    }

    const char* name =  cson_string_cstr(cson_value_get_string(cson_object_get(row_obj, "name")));
    int type = (int)cson_value_get_integer(cson_object_get(bnds, "type"));
    double lb = cson_value_get_double(cson_object_get(bnds, "lb"));
    double ub = cson_value_get_double(cson_object_get(bnds, "ub"));

    i = glp_add_rows(P, 1);
    glp_set_row_name(P, i, name);
    glp_set_mat_row(P, i, len, ind, val);
    glp_set_row_bnds(P, i, type, lb, ub);

  }

  /* set bounds of variables */ 
  int type;
  double lb, ub;
  for (j = 1; j <= P->n; j++) 
  {  
    lb = glp_get_col_lb(P, j);
    ub = glp_get_col_ub(P, j);
    if (lb == +DBL_MAX) lb = 0.0;      /* default lb */
    if (ub == -DBL_MAX) ub = +DBL_MAX; /* default ub */
    if (lb == -DBL_MAX && ub == +DBL_MAX)
      type = GLP_FR;
    else if (ub == +DBL_MAX)
      type = GLP_LO;
    else if (lb == -DBL_MAX)
      type = GLP_UP;
    else if (lb != ub)
      type = GLP_DB;
    else
      type = GLP_FX;
    glp_set_col_bnds(P, j, type, lb, ub);
  }

  /* print some statistics */
  // xprintf("%d row%s, %d column%s, %d non-zero%s\n",
  //    P->m, P->m == 1 ? "" : "s", P->n, P->n == 1 ? "" : "s",
  //    P->nnz, P->nnz == 1 ? "" : "s");
  // if (glp_get_num_int(P) > 0)
  // {  int ni = glp_get_num_int(P);
  //    int nb = glp_get_num_bin(P);
  //    if (ni == 1)
  //    {  if (nb == 0)
  //          xprintf("One variable is integer\n");
  //       else
  //          xprintf("One variable is binary\n");
  //    }
  //    else
  //    {  xprintf("%d integer variables, ", ni);
  //       if (nb == 0)
  //          xprintf("none");
  //       else if (nb == 1)
  //          xprintf("one");
  //       else if (nb == ni)
  //          xprintf("all");
  //       else
  //          xprintf("%d", nb);
  //       xprintf(" of which %s binary\n", nb == 1 ? "is" : "are");
  //    }
  // }

  /* problem data has been successfully read */
  glp_delete_index(P);
  glp_sort_matrix(P);

  /* set parameters */
  glp_smcp parm;
  glp_init_smcp(&parm);
  parm.presolve = GLP_ON;
  parm.msg_lev = msg_lev;

  // using parm fails (trap) with optimization: emcc -01 or -02 
  /* solve problem */
  glp_simplex(P, &parm);
  /* recover and display results */
  double z = glp_get_obj_val(P);
  // printf("z = %g\n", z);

  /* create return JSON */
  cson_object *out_obj = cson_new_object();
  
  cson_object *vars_obj = cson_new_object();
  char const *vars_key = "vars";
  cson_object_set(out_obj, vars_key, cson_object_value(vars_obj));

  cson_value *z_val = cson_value_new_double(z);
  char const *z_key = "z";
  cson_object_set(out_obj, z_key, z_val);

  const char* version = glp_version();
  cson_value *v_val = cson_value_new_string(version, strlen(version));
  char const *v_key = "glpk_version";
  cson_object_set(out_obj, v_key, v_val);  

  cson_value *s_val = cson_value_new_integer(glp_get_status(P));
  char const *s_key = "status";
  cson_object_set(out_obj, s_key, s_val);

  for (int j = 1; j <  glp_get_num_cols(P) + 1; j++) 
  {
    cson_value *val = cson_value_new_double(glp_get_col_prim(P, j));
    char const *key = glp_get_col_name(P, j);
    cson_object_set(vars_obj, key, val);
    // printf("%s = %f\n", glp_get_col_name(P, j), glp_get_col_prim(P, j));
  }

  std::string json_out = "";
  rc = write_json(cson_object_value(out_obj), &json_out);
  if (rc != 0)
    return cson_rc_string(rc);

  // printf("%s\n", json_out.c_str());

  /* housekeeping */
  glp_delete_prob(P);
  glp_free_env();
  cson_value_free(in_val);
  cson_free_object(out_obj);

  return json_out.c_str();

}


#ifdef __cplusplus
}
#endif