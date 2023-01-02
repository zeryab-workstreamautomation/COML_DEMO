/**
 *  express based server to serve up the COMl Demo
 * 
 * To run:
 * cd to the `script` folder
 * `node DemoServer`
 * 
 * @author Urooj
 */
 "use strict";

 const express= require("express");
 //const bodyParser = require("body-parser");
 const fs = require('fs');

 let app=express();
 
 console.log("CWD="+process.cwd());
 
 // 1. set up the static paths to serve up static content 
 //========================================================================
 const PORT=80;
 const DEMOFOLDER="..";

 
 app.use(function (req, res, next) {
    console.log(` request is [${req.path}]`);
    next();
  });


app.use('/resources', express.static('C:/java/WSPACE-WRA2/WRA_V2/projects/Dash/public/resources')); // for local ui5
app.use('/', express.static(DEMOFOLDER)); 
 
 // start the web server on the given port:ss
 console.log(`COML DemoServer listening on http://localhost:${PORT}/`);
 app.listen(PORT); 
 