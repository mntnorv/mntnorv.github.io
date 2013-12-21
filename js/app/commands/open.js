define(["app/projects"], function (projects) {
    "use strict";
    
    function open(args, term) {
        var lowercaseName = args[0].toLowerCase(),
            project = projects[args[0]];
        
        if (project) {
            term.echo('Opening ' + lowercaseName + '...\n(' + project.url + ')');
            window.open(project.url, '_blank');
        } else {
            term.echo('open: project \'' + lowercaseName + '\' not found.');
            return;
        }
    }
    
    return open;
});