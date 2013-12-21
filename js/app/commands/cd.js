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
            term.echo('cd: ' + args[0] + ': no such file or directory.');
            return;
        }
        
        fsObject = termSystem.getFsObject(parsedPath);
        if (!fsObject) {
            term.echo('cd: ' + args[0] + ': no such file or directory.');
            return;
        }
        
        if (fsObject.type !== 'dir') {
            term.echo('cd: ' + args[0] + ': not a directory.');
            return;
        }
        
        newPath = '/' + parsedPath.join('/');
        
        if (newPath !== '/' && newPath.charAt(newPath.length - 1) === '/') {
            newPath = newPath.substring(
                0,
                newPath.length - 1
            );
        }
        termSystem.state.currentDir = newPath;
    }
    
    return cd;
    
});