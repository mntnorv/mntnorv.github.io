/*jslint browser: true*/

define(["jquery", "app/projects"], function ($, projects) {
    "use strict";
    
    var commands = [];
    
    /*
    | Terminal command functions
    */
    
    function cat(args, term) {
    }
    
    function help(args, term) {
        var first = true,
            message = '';
        
        commands.forEach(function (e) {
            if (!first) {
                message += ', ' + e.name;
            } else {
                message += e.name;
                first = false;
            }
        });
        
        term.echo('Available commands:\n' + message + '\n');
    }
    
    function ls(args, term) {
        term.echo('about  projects\n');
    }
    
    function man(args, term) {
    }
    
    function open(args, term) {
        var lowercaseName = args[0].toLowerCase(),
            found = $.grep(projects, function (e) {
                return e.name === lowercaseName;
            }),
            project;
        
        if (found.length === 0) {
            term.echo('open: project \'' + lowercaseName + '\' not found.\n');
        }
        
        project = found[0];
        term.echo('Opening ' + project.name + ' (' + project.url + ')...\n');
        window.open(project.url, '_blank');
    }
    
    /*
    | Command definitions
    */
    commands = [
        {
            name: 'cat',
            description: 'Prints file contents',
            usage: 'cat [file]',
            args: 1,
            callback: cat
        },
        {
            name: 'help',
            description: 'Prints available commands',
            args: 0,
            callback: help
        },
        {
            name: 'ls',
            description: 'Lists files in the current directory',
            usage: 'ls',
            args: 0,
            callback: ls
        },
        {
            name: 'man',
            description: 'Prints a short description and usage information about a command.',
            usage: 'man [command]',
            args: 1,
            callback: man
        },
        {
            name: 'open',
            description: 'Opens the project\'s GitHub repository in a new tab.',
            usage: 'open [project]',
            args: 1,
            callback: open
        }
    ];
    
    return commands;
});