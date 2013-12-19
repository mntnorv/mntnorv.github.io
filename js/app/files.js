define(["app/projects", "app/repeat"], function (projects, repeat) {
    "use strict";
    
    function projectsContent() {
        var content = 'Projects:\n',
            name,
            maxWidth = 0;
        
        for (name in projects) {
            if (projects.hasOwnProperty(name)) {
                content += name + ' - ' + projects[name].description + '\n';
            }
        }
        
        return content;
    }
    
    var files = {
        'about': {
            content: 'Empty!\n'
        },
        'projects': {
            content: projectsContent
        }
    };
    
    return files;
});