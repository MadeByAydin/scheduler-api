var mongo = require('mongoose');

var Schema = mongo.Schema;

var usersSchema = new Schema({
    objectId: mongo.Schema.Types.ObjectId,
    sid:  Number,
    first_name: String,
    last_name: String,
    classes : Array,
    credits : Array
  });

module.exports = mongo.model('users', usersSchema);
