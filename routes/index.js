var users = [];
var messages = [];

var is_user = function(user) {
  var users_count = users.length;
  for(var i = 0; i < users_count; i++)
  {
    if(user == users[i]){
      return true;
    }
  }
  return false;
}


module.exports = function Route(app, server){

  var io = require("socket.io").listen(server)

  io.sockets.on('connection', function(socket){
    socket.on('page_load', function(data){
      if(is_user(data.user) === true){
        socket.emit('existing_user', {error: "This user already exists"})
      }
      else {
        users.push(data.user);
        messages.push({message: data.user + " has entered the conversation board"})
        socket.emit('load_messages', {current_user: data.user, messages: messages})
        io.emit('load_users', {updated_users: users})
      }
  })

  socket.on('new_message', function(data){
    messages.push({message: data.user + " : " + data.message})
    io.emit('post_new_message', {new_message: messages})
  })

  socket.on('leave_room', function(data){
    console.log(data);
    messages.push({message:data.user + " has left the room"})
    for(var i = 0; i < users.length; i++)
    {
      if(data.user === users[i]){
        users.splice(i,1);
        console.log(users)
        io.emit('post_leave_message', {leave_message: messages, current_users: users})
      }
    }
  })


  socket.on('exit', function(data){
    console.log(data.user);
    messages.push({message:data.user + " has left the room"})
    for(var i = 0; i < users.length; i++)
    {
      if(data.user === users[i]){
        users.splice(i,1);
        console.log(users)
        io.emit('post_leave_message', {leave_message: messages, current_users: users})
      }
    }
    })
  })


  app.get('/', function(req, res){
    res.render('index');
  })

}
