define(["app/termSystem", "app/repeat"], function (termSystem, repeat) {
    "use strict";
    
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
    
    return ls;
    
});