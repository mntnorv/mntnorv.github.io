define(["app/projects", "app/repeat"], function (projects, repeat) {
    "use strict";
    
    function projectsContent() {
        var content = 'Projects:\n',
            name,
            maxWidth = 0;
        
        for (name in projects) {
            if (projects.hasOwnProperty(name)) {
                if (name.length > maxWidth) {
                    maxWidth = name.length;
                }
            }
        }
        
        
        for (name in projects) {
            if (projects.hasOwnProperty(name)) {
                content += name +
                    repeat(' ', maxWidth - name.length) +
                    ' - ' + projects[name].description + '\n';
            }
        }
        
        return content;
    }
    
    var files = {
        'projects': {
            content: projectsContent
        }
    };
    
    return files;
});