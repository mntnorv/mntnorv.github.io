/*jslint browser: true*/

define([
    "jquery",
    "app/commands",
    "text!partials/greeting.txt",
    "jquery.mousewheel",
    "jquery.terminal"
], function ($, commands, greetingText) {
    "use strict";
    
    /*
    | Helper functions
    */
    function printUsage(command, term) {
        term.echo('Usage: ' + command.usage + '\n' + command.description + '\n');
    }

    /*
    | Initialize the terminal
    */
    $('#terminal').terminal(function (input, term) {
        var split   = input.split(" "),
            args    = split.slice(1),
            command;
        
        if (input !== '') {
            command = commands[split[0]];
            
            if (command) {
                if (args.length >= command.args) {
                    command.callback(args, term);
                } else {
                    printUsage(command, term);
                }
            } else {
                term.echo(split[0] + ': command not found\n');
            }
        }
    }, {
        width: '800px',
        height: '100%',
        prompt: '> ',
        greetings: greetingText,
        exit: false,
        clear: false
    });
});