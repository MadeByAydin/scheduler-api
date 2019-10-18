const express = require('express');
const https = require('https');
const fs = require('fs');
const app = express();
var bodyParser = require('body-parser');
var mongo = require('mongoose');
var Plan = require('./model/Plan.js');
var User =require('./model/User.js');
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
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.post('/api/update-plan/:planID', function(req, res){
    Plan.save({"planID":req.params.planID}, function(err, data){
        if(err){
            res.send(err);
        }

        res.send({data: "The plan was deleted"});
    });
});

app.get('/api/plans/:planID', function(req, res){
    Plan.find({"planID":req.params.planID}, function(err, data){
        if(err){
            res.send(err);
        }

        console.log(data);
        res.send(data);
    });
});

app.delete('/api/delete-plan/:planID', function(req, res){
    Plan.deleteOne({"planID":req.params.planID}, function(err, data){
        if(err){
            res.send(err);
        }

        res.send({data: "The plan was deleted"});
    });
});

app.get('/api/users', function(req, res){
    User.find({}, function(err, data){
        if(err){
            res.send(err);
        }

        console.log(data);
        res.send(data);
    });
});

app.get('/api/delete-user/:studentID', function(req, res){
    User.deleteOne({"sid":req.params.studentID}, function(err, data){
        if(err){
            res.send(err);
        }

        res.send({data: "The user was deleted"});
    });
});

app.listen(port, () => console.log(`Backend listening on port ${port}!`))

// https.createServer({
//         key: fs.readFileSync('/var/secret/etc/ssl/forms-combined.cis.udel.edu.key'),
//         cert: fs.readFileSync('/var/secret/etc/ssl/forms-combined.cis.udel.edu.pem')
//     }, app)
//     .listen(3000, function () {
//     console.log('API listening at: ' + serviceURL);
// });