Usage:

Send picture-parser.bat to your deskstop (right click => send to => desktop)
Follow initial setup

-----------------------------------------------------------------------

Notes:

Pay attention to the command prompt when you are having issues with a 
particular set of pictures. If something goes wrong, it will 
help you troubleshoot the issue.

For help, send error logs to benjaminpwagner@gmail.com

-----------------------------------------------------------------------

Config:

You can customize the format in which picture sets are renamed 
in /config/renameFormat.js 

You can add your own text to find within a screenshot or update search 
terms in the event that fulcrum fields change. See /config/findInText.js

Sometimes it will read the item number as some non-numeric character. If you 
notice this is happening, navigate to /config/charToNum.js and 
add more settings

-----------------------------------------------------------------------

Initial setup:

Download windows installer for nodejs & npm:
https://nodejs.org/en/download/ (this link includes npm)

IMPORTANT: Make sure you download the 64bit version if you are on a
           64bit system. This will improve the accuracy of tesseract.

Download tesseract-OCR 64bit (or 32 if you are on windows 32bit) version v4+
https://github.com/UB-Mannheim/tesseract/wiki

IMPORTANT: Make sure you get at least v4+ as it is   
           far more accurate when reading screenshots.

Install the most recent version of python:
https://www.python.org/downloads/windows/

IMPORTANT: Make sure you add python to your path 
           during installation.

Add the following to your system path:

C:\Program Files (x86)\Tesseract-OCR\tesseract.exe for 64bit users
C:\Program Files\Tesseract-OCR\tesseract.exe for 32bit users

-----------------------------------------------------------------------

Ignore the rest of this file if you have a pre-packaged
version of this software.

If you are cloning this from github, it is not 'pre-packaged'

-----------------------------------------------------------------------

More setup:

Run "npm install" from the command prompt inside this project directory.

Currently, node-tesseract seems to be a bit broken (slightly outdated)... but we can fix that: (must run npm install first)

First, open up ./node_modules/node-tesseract/lib/tesseract.js in 
your favorite code editor.

Change line 58 to the following:

var command = [options.binary, `"${image}"`, output];

Change line 65 to the following:

command.push('--psm ' + options.psm);

Change line 99 to the following:

fs.unlink(files[0], (err) => { if (err) throw err; });

-----------------------------------------------------------------------