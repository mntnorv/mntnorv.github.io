define(["app/termSystem", "app/repeat"], function (termSystem, repeat) {
    "use strict";
    
    function filenameComparator(a, b) {
        
    }
    
    function ls(args, term) {
        var fsObject,
            filenames = [],
            name,
            maxWidth = term.cols(),
            maxCols,
            cols,
            lineWidth,
            colWidths = [],
            lines,
            position,
            i,
            j,
            output = [];
        
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
            term.echo('ls: ' + args[0] + ': no such file or directory.');
            return;
        } else if (fsObject.type !== 'dir') {
            term.echo('ls: ' + args[0] + ': not a directory.');
            return;
        }
        
        // Prepare the file list
        for (name in fsObject.files) {
            if (fsObject.files.hasOwnProperty(name)) {
                filenames.push(name);
            }
        }
        
        for (name in fsObject.dirs) {
            if (fsObject.dirs.hasOwnProperty(name)) {
                filenames.push(name + '/');
            }
        }

        // Sort the filename array
        filenames.sort();
        
        // Calculate the maximum number of columns that can be printed
        maxCols = Math.floor(maxWidth / 3);
        for (i = maxCols; i > 1; i -= 1) {
            lines = Math.ceil(filenames.length / i);
            
            // Prepare the column widths array
            for (j = 0; j < i; j += 1) {
                colWidths[j] = 0;
            }
            
            // Calculate the resulting column widths
            for (j = 0; j < filenames.length; j += 1) {
                position = Math.floor(j / lines);
                
                if (colWidths[position] < (filenames[j].length + 2)) {
                    colWidths[position] = (filenames[j].length + 2);
                }
            }
            
            // Calculate line width
            lineWidth = 0;
            for (j = 0; j < i; j += 1) {
                lineWidth += colWidths[j];
            }
            
            if (lineWidth <= maxWidth) {
                break;
            }
        }
        
        cols = i;
        
        // Prepare the output array
        for (i = 0; i < lines; i += 1) {
            output[i] = '';
        }
        
        // Generate the output
        for (i = 0; i < filenames.length; i += 1) {
            position = Math.floor(i / lines);
            output[i % lines] += filenames[i] + repeat(
                ' ',
                colWidths[position] - filenames[i].length
            );
        }
        
        // Output the listing
        term.echo(output.join('\n'));
    }
    
    return ls;
    
});