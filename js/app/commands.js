define([
    "jquery",
    "app/termSystem",
    "app/projects",
    "app/repeat",
    "app/commands/cat",
    "app/commands/cd",
    "app/commands/clear",
    "app/commands/help",
    "app/commands/ls",
    "app/commands/man",
    "app/commands/open",
    "app/commands/pwd"
], function (
    $,
    termSystem,
    projects,
    repeat,
    catCommand,
    cdCommand,
    clearCommand,
    helpCommand,
    lsCommand,
    manCommand,
    openCommand,
    pwdCommand
) {
    "use strict";
    
    /*
    | Command definitions
    */
    var commands = {
        cat: {
            description: 'Prints file contents.',
            usage: 'cat [[u;;]file]',
            args: 1,
            callback: catCommand
        },
        cd: {
            description: 'Changed the current directory.',
            usage: 'cd [[[u;;]path]]',
            args: 0,
            callback: cdCommand
        },
        clear: {
            description: 'Clears the screen.',
            usage: 'clear',
            args: 0,
            callback: clearCommand
        },
        help: {
            description: 'Prints available commands.',
            usage: 'help',
            args: 0,
            callback: helpCommand
        },
        ls: {
            description: 'Lists files in the specified directory.',
            usage: 'ls [[[u;;]dir]]',
            args: 0,
            callback: lsCommand
        },
        man: {
            description: 'Prints a short description and usage information about a command.',
            usage: 'man [[u;;]command]',
            args: 1,
            callback: manCommand
        },
        open: {
            description: 'Opens the project\'s GitHub repository in a new tab.',
            usage: 'open [[u;;]project]',
            args: 1,
            callback: openCommand
        },
        pwd: {
            description: 'Prints current directory.',
            usage: 'pwd',
            args: 0,
            callback: pwdCommand
        }
    };
    
    return commands;
});