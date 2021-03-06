/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
*/

var fso = WScript.CreateObject('Scripting.FileSystemObject'),
    shell = WScript.CreateObject("shell.application"),
    wscript_shell = WScript.CreateObject("WScript.Shell");

var args = WScript.Arguments,
    //Root folder of cordova-wp7 (i.e C:\Cordova\cordova-wp7)
    ROOT = WScript.ScriptFullName.split('\\tooling\\', 1),
    //Sub folder containing templates
    TEMPLATES_PATH = '\\templates',
    //Sub folder for standalone project
    STANDALONE_PATH = TEMPLATES_PATH + '\\standalone',
    //Sub folder for full project
    FULL_PATH = TEMPLATES_PATH + '\\full',
    //Sub folder containing framework
    FRAMEWORK_PATH = '\\framework',
    //Subfolder containing example project
    EXAMPLE_PATH = '\\example';

//Destination to build to
var BUILD_DESTINATION;
// pull the project down from github?
var GET_NEW = false;
//Add templates to visual studio?
var ADD_TO_VS = false;

// help function
function Usage()
{
    WScript.StdOut.WriteLine("");
    WScript.StdOut.WriteLine("Usage: new [ PathToDestinationFolder ]");
    WScript.StdOut.WriteLine("    PathToDestinationFolder : Folder you wish to be created for a new cordova-wp7 repo");
    WScript.StdOut.WriteLine("examples:");
    WScript.StdOut.WriteLine("    new C:\\Users\\anonymous\\Desktop\\cordova-wp7");
    WScript.StdOut.WriteLine("");
}

// returns the contents of a file
function read(filename) {
    //WScript.StdOut.WriteLine('Reading in ' + filename);
    if(fso.FileExists(filename))
    {
        var f=fso.OpenTextFile(filename, 1,2);
        var s=f.ReadAll();
        f.Close();
        return s;
    }
    else
    {
        WScript.StdOut.WriteLine('Cannot read non-existant file : ' + filename);
        WScript.Quit(1);
    }
    return null;
}

// executes a commmand in the shell
function exec(command) {
    var oShell=wscript_shell.Exec(command);
    while (oShell.Status == 0) {
        if(!oShell.StdOut.AtEndOfStream) {
            var line = oShell.StdOut.ReadLine();
            // XXX: Change to verbose mode
            // WScript.StdOut.WriteLine(line);
        }
        WScript.sleep(100);
    }
}

function copy_to(path)
{
    //Copy everything over to BUILD_DESTINATION
    var dest = shell.NameSpace(path);
    WScript.StdOut.WriteLine("Copying files to build directory...");

    /** copy by file instead? (just what we need)**/
    dest.CopyHere(ROOT + "\\bin");
    dest.CopyHere(ROOT + EXAMPLE_PATH);      //Should mostly be copied from standalone
    dest.CopyHere(ROOT + FRAMEWORK_PATH);
    dest.CopyHere(ROOT + TEMPLATES_PATH);
    dest.CopyHere(ROOT + "\\tests");
    dest.CopyHere(ROOT + "\\tooling");
    dest.CopyHere(ROOT + "\\.gitignore");
    dest.CopyHere(ROOT + "\\LICENSE");
    dest.CopyHere(ROOT + "\\NOTICE");
    dest.CopyHere(ROOT + "\\README.md");
    dest.CopyHere(ROOT + "\\VERSION");
}

WScript.StdOut.WriteLine("");

if(args.Count() > 0)
{
    if(fso.FolderExists(args(0)))
    {
        WScript.StdOut.WriteLine("The given directory already exists!");
        Usage();
        WScript.Quit(1);
    }
    else
    {
        BUILD_DESTINATION = args(0);

    }

    if(!GET_NEW) {

        if(fso.FolderExists(BUILD_DESTINATION))
        {
            WScript.StdOut.WriteLine("The given directory already exists!");
            Usage();
            WScript.Quit(1);
        }
        else
        {
            BUILD_DESTINATION = args(0);
        }

        // set up file structure
        fso.CreateFolder(BUILD_DESTINATION);
        // copy nessisary files
        copy_to(BUILD_DESTINATION);
    }
    else
    {
        var CORDOVA_WP7 = 'git://github.com/apache/cordova-wp7.git';

        wscript_shell.CurrentDirectory = arg(0) + '\\..';
        BUILD_DESTINATION = wscript_shell.CurrentDirectory + '\\cordova-wp7';

        WScript.StdOut.WriteLine('Cloning cordova-wp7 from git, build destination now ' + BUILD_DESTINATION);
        if(fso.FolderExists(BUILD_DESTINATION))
        {
            WScript.StdOut.WriteLine("Could not clone cordova-wp7 from git because it's directory already exists!");
            WScript.Quit(1);
        }

        exec('git clone ' + CORDOVA_WP7); //git fetch --tags && git checkout?

    }
}
else
{
    Usage();
    WScript.Quit(1);
}