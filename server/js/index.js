#!/usr/bin/env node

var http = require('http');
var _ = require('lodash');
var express = require('express');
var fs = require('fs');
var path = require('path');
var util = require('util');
var program = require('commander');
var spawn = require('child_process').spawn;

function collect(val, memo) {
    if(val && val.indexOf('.') != 0) val = "." + val;
    memo.push(val);
    return memo;
}

program
    .option('-p, --port <port>', 'Port to run the file-browser. Default value is 8088')
    .option('-d, --directory <dir>', 'Path to the directory you want to serve. Default is current directory')
    .option('-e, --exclude <exclude>', 'File extensions to exclude. To exclude multiple extension pass -e multiple times. e.g. ( -e .js -e .cs -e .swp) ', collect, [])
    .parse(process.argv);

if (!program.directory) program.directory = process.cwd();
if (!program.port) program.port = 8088;

var app = express();
var dir = '.'; //program.directory;
app.use(express.static(process.cwd())); //app public directory
app.use(express.static(dir)); //app public directory
app.use(express.static(__dirname)); //module directory
var server = http.createServer(app);

server.listen(program.port);
console.log("Please open the link in your browser http://<YOUR-IP>:" + program.port);

app.get('/files', function(req, res) {
    
    var currentDir =  dir;
    var query = req.query.path || '';
    
    if (query) currentDir = path.join(dir, query);
    
    console.log("browsing ", currentDir);
    
    fs.readdir(currentDir, function (err, files) {
        if (err) {
            throw err;
        }
    
        var data = [];
        files
        .filter(function (file) {
            return true;
        }).forEach(function (file) {
            
            try {
                //console.log("processing ", file);
                var isDirectory = fs.statSync(path.join(currentDir,file)).isDirectory();
            
                if (isDirectory) {
                    data.push({ Name : file, IsDirectory: true, Path : path.join(query, file)  });
                } else {
                    var ext = path.extname(file);
            
                    if(program.exclude && _.contains(program.exclude, ext)) {
                        console.log("excluding file ", file);
                        return;
                    }       
            
                    data.push({ Name : file, Ext : ext, IsDirectory: false, Path : path.join(query, file) });
                }

            } catch(e) {
                console.log(e); 
            }        

        });
        
        data = _.sortBy(data, function(f) { return f.Name });
        res.json(data);
    });
});

app.get('/', function(req, res) {
    res.redirect('client/partials/template.html'); 
});

app.get('/find', function(req, res) {
    var qpath  = req.query.path || '';
    var currentDir =  dir;
    if (qpath) currentDir = path.join(dir, qpath);
    
    var qregex = req.query.regex || '.*';
    var regexstr = "'" + qregex + "'";
    var cmdargs = [currentDir,"-type", "f", "-regex", qregex];
    var cmd = spawn("find", cmdargs);
    console.log("find " + cmdargs.join(" "));
    
    var outbuff = '';

    cmd.stdout.on('data', function(data) {
        outbuff += data;
    });
    
    cmd.stdout.on('end', function() {
        var filelist = [];
        var data = [];
        filelist = outbuff.split("\n").slice(0, -1);
        for (var i in filelist) {
            filepath = filelist[i];
            ext = path.extname(filepath);
            data.push({Path: filepath, Ext: ext, Linenumber: " ", Linetext: " "});
        }
        res.json(data);
    });
});

app.get('/search', function(req, res) {
    var qpath  = req.query.path || '';
    var currentDir =  dir;
    if (qpath) currentDir = path.join(dir, qpath);
    
    var qregex = req.query.regex || '.*';
    var cmdargs = ["-Inr", "-E", qregex, currentDir];
    var cmd = spawn("grep", cmdargs);
    console.log("grep" + cmdargs.join(" "));
    
    var outbuff = '';
    
    cmd.stdout.on('data', function(data) {
        outbuff += data;
    });
    
    cmd.stdout.on('end', function() {
        var matchlist = [];
        var data = [];
        matchlist = outbuff.split("\n").slice(0, -1);
        for (var i in matchlist) {
            match = matchlist[i].split(":");
            filepath = match[0];
            linenumber = match[1];
            linetext = (match.slice(2, match.length)).join(":") ;
            ext = path.extname(filepath);
            data.push({Path: filepath, Ext: ext, Linenumber: linenumber, Linetext: linetext});
        }
        res.json(data);
    });
});
    
