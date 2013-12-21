define(["app/termSystem"], function (termSystem) {
    "use strict";
    
    function cat(args, term) {
        var fsObject;
        
        // Get the FS object
        if (args[0]) {
            fsObject = termSystem.getFsObject(
                args[0]
            );
        } else {
            fsObject = termSystem.getFsObject(
                termSystem.state.currentDir
            );
        }
        
        if (!fsObject) {
            term.echo('cat: ' + args[0] + ': no such file or directory.');
            return;
        } else if (fsObject.type !== 'file') {
            term.echo('cat: ' + args[0] + ': not a file.');
            return;
        }
        
        if (typeof fsObject.content === 'string') {
            term.echo(fsObject.content);
        } else if (typeof fsObject.content === 'function') {
            term.echo(fsObject.content.call());
        } else {
            term.echo('cat: ' + args[0] + ': file format not supported.');
        }
    }
    
    return cat;
    
});