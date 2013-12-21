define(["app/termSystem"], function (termSystem) {
    "use strict";
    
    function cd(args, term) {
        var parsedPath,
            fsObject,
            newPath;
        
        if (args[0]) {
            parsedPath = termSystem.parsePath(args[0]);
        } else {
            parsedPath = [];
        }
        
        if (!parsedPath) {
            term.echo('cd: ' + args[0] + ': no such file or directory.\n');
            return;
        }
        
        fsObject = termSystem.getFsObject(parsedPath);
        if (!fsObject) {
            term.echo('cd: ' + args[0] + ': no such file or directory.\n');
            return;
        }
        
        if (fsObject.type !== 'dir') {
            term.echo('cd: ' + args[0] + ': not a directory.\n');
            return;
        }
        
        newPath = '/' + parsedPath.join('/');
        term.echo(newPath + '\n');
        termSystem.state.currentDir = newPath;
    }
    
    return cd;
    
});