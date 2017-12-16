var glpk = (function () {

Module['preInit'] = [

	function () {
		FS.mkdir('/out');
		FS.mount(MEMFS, { root: '.' }, '/out');
	}

];
