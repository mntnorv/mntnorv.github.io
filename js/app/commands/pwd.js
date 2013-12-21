define(["app/termSystem"], function (termSystem) {
    "use strict";
    
    function pwd(args, term) {
        term.echo(termSystem.state.currentDir);
    }
    
    return pwd;
});