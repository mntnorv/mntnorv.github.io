/*jslint browser: true*/

define(["jquery", "app/projects", "app/files"], function ($, projects, files) {
    "use strict";
    
    var commands = [];
    
    /*
    | Terminal command functions
    */
    
    function cat(args, term) {
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
        var terminalCols = term.cols(),
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
        
        for (name in files) {
            if (files.hasOwnProperty(name)) {
                filenames.push(name);
                fileCount += 1;
                
                if (name.length > colWidth) {
                    colWidth = name.length;
                }
            }
        }
        
        filesInRow = Math.floor(terminalCols / (colWidth + 2));
        filesInCol = Math.floor(fileCount / filesInRow);
        biggerCols = fileCount - (filesInRow * filesInCol);
        
        for (i = 0; i < filesInCol + 1; i += 1) {
            output[i] = "";
        }
        
        currentFile = 0;
        for (i = 0; i < filesInRow && currentFile < fileCount; i += 1) {
            for (j = 0; j < (filesInCol + 1) && currentFile < fileCount; j += 1) {
                if ((j < filesInCol) || (j === filesInCol && i < biggerCols)) {
                    output[j] += filenames[currentFile] + "  ";
                    currentFile += 1;
                }
                
                term.echo(JSON.stringify(output));
            }
        }
        
        term.echo(output.join('\n'));
    }
    
    function man(args, term) {
        var command = commands[args[0]];
        
        if (command) {
            term.echo('Usage: ' + command.usage + '\n' + command.description + '\n');
        } else {
            term.echo('man: command \'' + args[0] + '\' not found.\n');
        }
    }
    
    function open(args, term) {
        var lowercaseName = args[0].toLowerCase(),
            project = projects[args[0]];
        
        if (project) {
            term.echo('Opening ' + lowercaseName + ' (' + project.url + ')...\n');
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
            usage: 'cat [file]',
            args: 1,
            callback: cat
        },
        help: {
            description: 'Prints available commands.',
            usage: 'help',
            args: 0,
            callback: help
        },
        ls: {
            description: 'Lists files in the current directory.',
            usage: 'ls',
            args: 0,
            callback: ls
        },
        man: {
            description: 'Prints a short description and usage information about a command.',
            usage: 'man [command]',
            args: 1,
            callback: man
        },
        open: {
            description: 'Opens the project\'s GitHub repository in a new tab.',
            usage: 'open [project]',
            args: 1,
            callback: open
        }
    };
    
    return commands;
});