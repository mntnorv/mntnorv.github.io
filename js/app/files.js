define([
    "app/projects",
    "app/repeat",
    "text!partials/wb.txt",
    "text!partials/wrdl-holo.txt",
    "text!partials/mntnorv.github.io.txt"
], function (
    projects,
    repeat,
    wbContent,
    wrdlHoloContent,
    mntnorvContent
) {
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
    
    var filesystem = {
        dirs: {
            'projects': {
                dirs: {},
                files: {
                    'wb.txt': {
                        content: wbContent
                    },
                    'wrdl-holo.txt': {
                        content: wrdlHoloContent
                    },
                    'mntnorv.github.io.txt': {
                        content: mntnorvContent
                    }
                }
            }
        },
        files: {
            'projects.txt': {
                content: projectsContent
            }
        }
    };
    
    return filesystem;
});