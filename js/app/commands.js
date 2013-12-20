/*jslint browser: true*/

define(["jquery", "app/termSystem", "app/projects", "app/repeat"], function ($, termSystem, projects, repeat) {
    "use strict";
    
    var commands = [];
    
    /*
    | Terminal command functions
    */
    
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
            term.echo('cat: ' + args[0] + ': no such file or directory.\n');
            return;
        } else if (fsObject.type !== 'file') {
            term.echo('cat: ' + args[0] + ': not a file. \n');
            return;
        }
        
        if (typeof fsObject.content === 'string') {
            term.echo(fsObject.content);
        } else if (typeof fsObject.content === 'function') {
            term.echo(fsObject.content.call());
        } else {
            term.echo('cat: ' + args[0] + ': file format not supported.\n');
        }
    }
    
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
    
    function clear(args, term) {
        term.clear();
    }
    
    function pwd(args, term) {
        term.echo(termSystem.state.currentDir + '\n');
    }
    
    function help(args, term) {
        var first = true,
            message = '',
            name;
        
        for (name in commands) {
            if (commands.hasOwnProperty(name)) {
                if (!first) {
                    message += ', ' + name;
                } else {
                    message += name;
                    first = false;
                }
            }
        }
        
        term.echo('Available commands:\n' + message + '\n');
    }
    
    function ls(args, term) {
        var fsObject,
            terminalCols = term.cols(),
            fileCount = 0,
            colWidth = 0,
            filesInRow,
            filesInCol,
            biggerCols,
            filenames = [],
            output = [],
            name,
            i,
            j,
            currentFile;
        
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
            term.echo('ls: ' + args[0] + ': no such file or directory.\n');
            return;
        } else if (fsObject.type !== 'dir') {
            term.echo('ls: ' + args[0] + ': not a directory. \n');
            return;
        }
        
        // Prepare the file list
        // Get the max width and file count
        for (name in fsObject.files) {
            if (fsObject.files.hasOwnProperty(name)) {
                filenames.push(name);
                
                fileCount += 1;
                if (name.length > colWidth) {
                    colWidth = name.length;
                }
            }
        }
        
        for (name in fsObject.dirs) {
            if (fsObject.dirs.hasOwnProperty(name)) {
                filenames.push(name + '/');
                
                fileCount += 1;
                if (name.length > colWidth) {
                    colWidth = name.length;
                }
            }
        }
        
        // Sort the filename array
        filenames.sort();
        
        // Calculate the files in row and column
        filesInRow = Math.floor(terminalCols / (colWidth + 2));
        filesInCol = Math.floor(fileCount / filesInRow);
        biggerCols = fileCount - (filesInRow * filesInCol);
        
        // Prepare the output array
        for (i = 0; i < filesInCol + 1; i += 1) {
            output[i] = "";
        }
        output[filesInCol + 1] = '';
        
        // Add filenames to the output array
        currentFile = 0;
        for (i = 0; i < filesInRow && currentFile < fileCount; i += 1) {
            for (j = 0; j < (filesInCol + 1) && currentFile < fileCount; j += 1) {
                if ((j < filesInCol) || (j === filesInCol && i < biggerCols)) {
                    output[j] += filenames[currentFile] +
                        repeat(' ', colWidth - filenames[currentFile].length + 2);
                    currentFile += 1;
                }
            }
        }
        
        // Output the listing
        term.echo(output.join('\n'));
    }
    
    function man(args, term) {
        var command = commands[args[0]];
        
        if (command) {
            term.echo('Usage: ' + command.usage + '\n' + command.description + '\n');
        } else {
            term.echo('man: no manual entry for ' + args[0] + '.\n');
        }
    }
    
    function open(args, term) {
        var lowercaseName = args[0].toLowerCase(),
            project = projects[args[0]];
        
        if (project) {
            term.echo('Opening ' + lowercaseName + '...\n(' + project.url + ')\n');
            window.open(project.url, '_blank');
        } else {
            term.echo('open: project \'' + lowercaseName + '\' not found.\n');
            return;
        }
    }
    
    /*
    | Command definitions
    */
    commands = {
        cat: {
            description: 'Prints file contents.',
            usage: 'cat [[u;;]file]',
            args: 1,
            callback: cat
        },
        cd: {
            description: 'Changed the current directory.',
            usage: 'cd [[[u;;]path]]',
            args: 0,
            callback: cd
        },
        clear: {
            description: 'Clears the screen.',
            usage: 'clear',
            args: 0,
            callback: clear
        },
        help: {
            description: 'Prints available commands.',
            usage: 'help',
            args: 0,
            callback: help
        },
        ls: {
            description: 'Lists files in the specified directory.',
            usage: 'ls [[[u;;]dir]]',
            args: 0,
            callback: ls
        },
        man: {
            description: 'Prints a short description and usage information about a command.',
            usage: 'man [[u;;]command]',
            args: 1,
            callback: man
        },
        open: {
            description: 'Opens the project\'s GitHub repository in a new tab.',
            usage: 'open [[u;;]project]',
            args: 1,
            callback: open
        },
        pwd: {
            description: 'Prints current directory.',
            usage: 'pwd',
            args: 0,
            callback: pwd
        }
    };
    
    return commands;
});