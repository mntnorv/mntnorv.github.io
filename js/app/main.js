/*jslint browser: true*/

define([
    "jquery",
    "app/termSystem",
    "app/commands",
    "text!partials/greeting.txt",
    "jquery.mousewheel",
    "jquery.terminal"
], function ($, termSystem, commands, greetingText) {
    "use strict";
    
    /*
    | Helper functions
    */
    function printUsage(command, term) {
        term.echo('Usage: ' + command.usage + '\n' + command.description + '\n');
    }
    
    function prompt(setPrompt) {
        setPrompt(termSystem.state.currentDir + ' > ');
    }

    /*
    | Initialize the terminal
    */
    $('#terminal').terminal(function (input, term) {
        var parsed = termSystem.parseArgs(input),
            args = parsed.slice(1),
            command;
        
        if (input !== '') {
            command = commands[parsed[0]];
            
            if (command) {
                if (args.length >= command.args) {
                    command.callback(args, term);
                } else {
                    printUsage(command, term);
                }
            } else {
                term.echo(parsed[0] + ': command not found');
            }
            
            term.echo(' ');
        }
    }, {
        width: '800px',
        height: '100%',
        prompt: prompt,
        greetings: greetingText,
        exit: false,
        clear: false
    });
});