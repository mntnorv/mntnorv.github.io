define(["app/projects"], function (projects) {
    "use strict";
    
    function projectsContent() {
        var content = 'Projects:\n',
            name;
        
        for (name in projects) {
            if (projects.hasOwnProperty(name)) {
                content += name + ' - ' + projects[name] + '\n';
            }
        }
        
        return content;
    }
    
    var files = {
        'about': {
            content: 'Empty!'
        },
        'projects': {
            content: projectsContent
        }
    };
    
    return files;
});