const express = require('express');
const https = require('https');
const fs = require('fs');
const app = express();
var bodyParser = require('body-parser');
var mongo = require('mongoose');
var Plan = require('./model/Plan.js');
var User =require('./model/User.js');
var serviceURL = 'https://planner.cis.udel.edu:3002';
var jwt = require('jsonwebtoken');
const port = 3002;

/*
    Connecting to the mongodb cluster, please dont hack me.
*/
var db = mongo.connect("mongodb+srv://muhammet:test123@cluster0-dg6n3.mongodb.net/Degree_Plans?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true}, function(error, response){
    if(error){
        console.log(error);
    }
    else{
        console.log("Connected!");
    }
});

/*
    Express makes it easy to handle HTTP requests for our API that will be
    used by our client-side angular code.
*/
 app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({extended:true}));

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials"
      );
    res.setHeader('Access-Control-Allow-Credentials', true);

    if (req.method === "OPTIONS") {
        return res.status(200).end();
      }
    next();
});

app.all('*',function(req,res,next){
    if(req.get("Authorization")){
        try {
            jwt.verify(req.get("Authorization"), 'universityofdelaware**1776**cisc');
            next();
          } catch(err) {
            res.status(401).send();
          }
    }else{
        res.status(401).send(); // 401 Not Authorized
    }
});

app.get('/api/plans/:planID', function(req, res){
    Plan.find({"planID":req.params.planID}, function(err, data){
        if(err){
            res.status(400).send(err);
        }

        else{
            res.status(200).send(data);
        }
    });
});

app.get('/api/plans/semesterize/:planID', function(req, res){
    Plan.find({"planID":req.params.planID}, function(err, data){
        if(err){
            res.status(400).send(err);
        }

        else{
            let curriculum = data[0];
            semesters = [];

            if(curriculum){
                for(var i = 1; i <= 8; i++){
                    let key = "semester_" + i;
                    if(curriculum[key]){
                        semesters.push(curriculum[key]);
                    }
                }
            }   

            res.status(200).send(semesters);
        }
    });
});

app.get('/api/plans', function(req, res){
    Plan.find({}, function(err, data){
        if(err){
            res.status(400).send(err);
        }
        else{
            res.status(200).send(data);
        }
    });
});

app.get('/api/plan-names', function(req, res){
    Plan.find({}, function(err, data){
        if(err){
            res.status(400).send(err);
        }

        else{
            planNames = [];

            for(plan in data){
                planNames.push(data[plan]["planID"]);
            }

            res.status(200).send(planNames);
        }
    });
});

app.get('/api/concentration-names', function(req, res){
    Plan.find({planID: {$ne: "Traditional"}} , function(err, data){
        if(err){
            res.status(400).send(err);
        }

        else{
            planNames = [];

            for(plan in data){
                planNames.push(data[plan]["planID"]);
            }

            res.status(200).send(planNames);
        }
    });
});

app.get('/api/users/classes/:studentID', function(req, res){
    let token = jwt.decode(req.get("Authorization"));
    let tokenSID = token["cas:serviceResponse"]["cas:authenticationSuccess"]["cas:user"]["_text"];

    if(tokenSID != req.params.studentID){
        res.status(400).send();
    }
    else{
        User.find({"uid":req.params.studentID}, function(err, data){
            if(err){
                res.status(400).send(err);
            }

            else{
                res.status(200).send(data[0]["classes"]);
            }
        });
    }
});

app.get('/api/users/classes/class-names/:studentID', function(req, res){
    let token = jwt.decode(req.get("Authorization"));
    let tokenSID = token["cas:serviceResponse"]["cas:authenticationSuccess"]["cas:user"]["_text"];

     if(tokenSID != req.params.studentID){
         res.status(400).send();
     }
     else{
        User.find({"uid":req.params.studentID}, function(err, data){
            if(err){
                res.status(400).send(err);
            }

            else{
                let classes = data[0]["classes"];
                classNames = [];
                var numBreadths = 0;
                var numConcElective = 0;
                var numTechElective = 0;

                for(let i in classes){
                    if(classes[i].classification == "Requirement"){
                        classNames.push(classes[i].name);
                    }
                    else if(classes[i].classification == "University Breadth"){
                        classNames.push(classes[i].classification + " " + (++numBreadths).toString());
                    }
                    else if(classes[i].classification == "Concentration Elective"){
                        classNames.push(classes[i].classification + " " + (++numConcElective).toString());
                    }
                    else if(classes[i].classification == "Technical Elective"){
                        classNames.push(classes[i].classification + " " + (++numTechElective).toString());
                    }
                }

                res.status(200).send(classNames);
            }
        });
    }
});

app.get('/api/users/:studentID', function(req, res){
    let token = jwt.decode(req.get("Authorization"));
    let tokenSID = token["cas:serviceResponse"]["cas:authenticationSuccess"]["cas:user"]["_text"];

    if(tokenSID != req.params.studentID){
        res.status(401).send();
    }
    else{
        User.find({"uid":req.params.studentID}, function(err, data){
            if(err){ 
                res.status(400).send(err);
            }
            else{       
                res.status(200).send(data);
            }
        });
    }
});

app.get('/api/users/register/:uid', function(req, res){
    let token = jwt.decode(req.get("Authorization"));
    let tokenSID = token["cas:serviceResponse"]["cas:authenticationSuccess"]["cas:user"]["_text"];
    let firstName = token["cas:serviceResponse"]["cas:authenticationSuccess"]["cas:firstname"]["_text"];
    let lastName = token["cas:serviceResponse"]["cas:authenticationSuccess"]["cas:lastname"]["_text"];

    if(tokenSID != req.params.uid){
        res.status(401).send();
    }
    else{
        User.countDocuments({"uid":req.params.uid}, function(err, count){
            if(err){ 
                res.status(400).send(err);
            }
            else{ 
                if(!count){  
                    var newUser = new User({
                        "uid":  tokenSID,
                        "first_name": firstName,
                        "last_name": lastName,
                        "classes" : []
                    });
                    newUser.save()
                        .then(item => {
                        res.status(200).send();
                    })
                        .catch(err => {
                        res.status(400).send();
                    });   
                }
                else{
                    res.status(412).send();
                }
            }
        });
    }
});

app.post('/api/users',function(req,res) {
    var myData = new User(req.body);
    myData.save()
        .then(item => {
        res.send("item saved to database");
    })
        .catch(err => {
        res.status(400).send("unable to save to database");
    });
});

app.post('/api/users/update-classes/:uid',function(req,res) {
    let token = jwt.decode(req.get("Authorization"));
    let tokenSID = token["cas:serviceResponse"]["cas:authenticationSuccess"]["cas:user"]["_text"];

    if(tokenSID != req.params.uid){
        res.status(401).send();
    }
    else{
        User.updateOne({ uid: req.params.uid}, {$set: { "classes": req.body}}, function (err, data) {
            if(err){ 
                res.status(400).send(err);
            }
            else{       
                res.status(200).send();
            }
        }) 
    }
});
 
https.createServer({
        key: fs.readFileSync('/var/secret/etc/ssl/forms-combined.cis.udel.edu.key'),
        cert: fs.readFileSync('/var/secret/etc/ssl/forms-combined.cis.udel.edu.pem')
    }, app)
    .listen(port, function () {
    console.log('API listening at: ' + serviceURL);
});