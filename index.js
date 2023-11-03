var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var app = express();
const { v4: uuidv4 } = require('uuid');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const uri = "mongodb://localhost:27017";
const path = require('path');
const staticPath = __dirname

app.use(bodyParser.json()); 

app.use(bodyParser.urlencoded({ extended: true })); 

app.use(express.static(staticPath));

app.use(upload.array()); 
app.use(express.static('public'));
app.use(express.json());

app.get('/', function(req, res){
   res.sendFile(staticPath);
});

app.post('/', function(req, res){
    console.log(req.body);

});

app.get('/index.html', function(req, res){
    res.sendFile(staticPath+'/index.html');
});

app.post('/index.html', function(req, res){
    res.sendFile(staticPath+'/index.html');
});

app.get('/add-friend.html', function(req, res){
    res.sendFile(staticPath+'/add-friend.html');
});

app.get('/contact.html', function(req, res){
    res.sendFile(staticPath+'/contact.html');
});

app.get('/group.html', function(req, res){
    res.sendFile(staticPath+'/group.html');
});

app.get('/join-group.html', function(req, res){
    res.sendFile(staticPath+'/join-group.html');
});

app.get('/login.html', function(req, res){
    res.sendFile(staticPath+'/login.html');
});

app.get('/organize-form.html', function(req, res){
    res.sendFile(staticPath+'/organize-form.html');
});

app.get('/participate-event.html', function(req, res){
    res.sendFile(staticPath+'/iparticipate-event.html');
});

app.get('/participate.html', function(req, res){
    res.sendFile(staticPath+'/participate.html');
});

app.get('/reporting-issue.html', function(req, res){
    res.sendFile(staticPath+'/reporting-issue.html');
});

app.get('/signin.html', function(req, res){
    res.sendFile(staticPath+'/signin.html');
});

app.get('/topics-detail.html', function(req, res){
    res.sendFile(staticPath+'/topics-detail.html');
});

app.get('/topics-listing.html', function(req, res){
    res.sendFile(staticPath+'/topics-listing.html');
});

app.post('/saveuser', async(req, res) => {
    console.log(req.body);

    const client = new MongoClient(uri);
    
    const { name, email, password } = req.body;
    const sanitizedEmail = email.toLowerCase();
    const genUserId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await client.connect();
        const database = client.db('Ice');
        const users = database.collection('Users');

        const existingUser = await users.findOne({ email });
        if (existingUser) {
            return res.status(409).send('User account already exists. Log in')
          }
        
        const data = {
            user_id : genUserId,
            name: name,
            email: sanitizedEmail,
            hashed_password: hashedPassword,
        };
        const insertedUser = await users.insertOne(data);

    }
    catch(err){
        console.log(err);
    }
    const token = jwt.sign(insertedUser, sanitizedEmail, { expiresIn: 60 * 24 })
    res.status(201).json({ token, userId: generatedUserId });
    res.sendFile(staticPath+"/index.html");
    client.close();
})

app.post('/logon', async(req,res) => {
    console.log(req.body);

    const client = new MongoClient(uri);
    const { email, password } = req.body;

    try {
        await client.connect()
        const database = client.db('Ice')
        const users = database.collection('Users')
        const returnedUser = await users.findOne({ email })
        console.log(returnedUser)
        const correctPassword = await bcrypt.compare(
          password,
          returnedUser.hashed_password
        )
    
        if (returnedUser && correctPassword) {
          const token = jwt.sign(returnedUser, email, { expiresIn: 60 * 24 })
          res.status(201).json({ token, userId: returnedUser.user_id })
        }
        res.status(400).send('Invalid Credentials')
      } catch (err) {
        console.log(err)
      }
      res.sendFile(staticPath+"/index.html");
      client.close();
})

app.post('/cevent', async(req,res) => {
    console.log(req.body);
    const client = new MongoClient(uri);
    const { evname,evtype,evadd,flexRadioDefault,evcost,evinfo,imageOfEvent } = req.body;
    const eventId = uuidv4();
    try {
        await client.connect();
        const database = client.db('Ice');
        const events = database.collection('Events');
        const data = {
            event_id: eventId,
            event_name: evname,
            event_address: evadd,
            paid_or_free: flexRadioDefault,
            event_cost: evcost,
            event_info: evinfo,
            image_uri: imageOfEvent
        }
        const insertedEvents = await events.insertOne(data);
    } catch(err){
        console.log(err);
    }
    res.sendFile(staticPath+"/index.html");
    client.close();
})

app.post('/part', async(req,res) => {
    console.log(req.body);
    const client = new MongoClient(uri);
    const { name,email,evname, evnum } = req.body;
    try{
        await client.connect();
        const database = client.db('Ice');
        const events = database.collection('Events');
        const events_p = database.collection('Events_Part');
        var eventId = null;
        var retreivedData = null;

        const returnedEventName = events.find({ event_name:evname });
        for await (const doc of returnedEventName){
            console.log(doc)
            retreivedData = doc;
        }
        console.log(retreivedData.event_id);
        if(retreivedData.event_id !== null)
        {
            const eventDetails = events.find({event_name: evname})
            eventId = retreivedData.event_id;
            const data = {
                event_id: eventId,
                event_name: evname,
                participant_name: name,
                participant_email: email,
                no_of_participants: evnum
            }
            const insertedPart = await events_p.insertOne(data);
            
        }
    }catch(err){
        console.log(err);
    }
    
    res.sendFile(staticPath+"/index.html");
    client.close();
})

app.listen(3000);