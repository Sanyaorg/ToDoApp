var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var redis = require('redis');

var app = express();


//Redis Client
var client = redis.createClient();

client.on('connect', function(){
  console.log('Connected to Redis...');
});

//View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  var title = 'ToDo List';
  client.lrange('todos', 0, -1, function(err, reply){
    if(err){
      res.send(err)
    }
		res.render('index', {
			title: title,
			todos: reply
		});
	});
});

//Add new todo
app.post('/todo/add', function (req, res, next) {
  var todo = req.body.todo;
  client.rpush('todos', todo, function (err, reply) {
    if(err){
      res.send(err)
    }
    console.log('Todo added...');
    res.redirect('/');
  });
});

//Remove todo
app.post('/todo/delete', function (req, res, next) {
  var delTodos = req.body.todos;
  client.lrange('todos', 0, -1, function(err, todos){
    for (var i = 0; i < todos.length; i++) {
      if(delTodos.indexOf(todos[i]) > -1){
        client.lrem('todos', 0, todos[i], function () {
          if (err){
            console.log(err);
          }
        });
      }
    }
    res.redirect('/');
  });
});


app.listen(3000, function () {
    console.log('Server started on port 3000....')
});

module.exports =app;
