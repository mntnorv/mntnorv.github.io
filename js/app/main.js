/*jslint browser: true*/

define(["jquery", "app/commands", "jquery.mousewheel", "jquery.terminal"], function ($, commands) {
    "use strict";
    
    /*
    | Constant variables
    */
    var greetingMsg = $('#greeting').html() +
        "\nType 'help' to list available commands\n";
    
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
                if (command.args === undefined || command.args === args.length) {
                    command.callback(args, term);
                } else {
                    printUsage(command, term);
                }
            } else {
                term.echo('Unrecognised command: \'' + split[0] + '\'\n');
            }
        }
    }, {
        width: '800px',
        height: '100%',
        prompt: '> ',
        greetings: greetingMsg
    });
});