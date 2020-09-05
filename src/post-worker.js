});
glpkPromise.then(function (glpkjs) {
    self.onmessage = function (event) {
        var problem = event['data'];
        postMessage(glpkjs.solve(problem));
    }
    postMessage({ initialized: true });
});
