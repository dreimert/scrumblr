var Db = require('mongodb').Db;
    Server = require('mongodb').Server,
    BSON = require('mongodb').BSONNative,
    conf = require('../config.js').database,
    mongoose = require('mongoose')
    require('coffee-script/register'),
    elastic = require('/opt/odin/core/elasticsearch'),
    getModels = require('/opt/odin/core/jumplynSchema'),
    _ = require('lodash')
    mongo = require('/opt/odin/core/mongo');

var db = function()
{
  mongo.connect().then(function () {
    getModels().then(function (lModels) {
      this.models = lModels;
    }.bind(this));
  }.bind(this));
}

db.prototype = {

	// theme commands
	setTheme: function(room, theme)
	{
    // console.log('DONE Appel setTheme', theme);
    this.models.ProjectModel
    .findOne({'_id':mongoose.Types.ObjectId('545cdefaec73bef2af7b063c')})
    .then(function (project) {
      project.scrumblr.theme = theme;
      project.save();
    });
	},

	getTheme: function(room, callback)
	{
    // console.log('DONE Appel getTheme');
    this.models.ProjectModel
    .findOne({'_id':mongoose.Types.ObjectId('545cdefaec73bef2af7b063c')})
    .then(function (project) {
      callback(project.scrumblr.theme);
    });
	},

	// Column commands
	createColumn: function(room, name, callback)
	{
    // console.log('DONE Appel createColumn');
    this.models.ProjectModel
    .findOne({'_id':mongoose.Types.ObjectId('545cdefaec73bef2af7b063c')})
    .then(function (project) {
      project.scrumblr.columns.push(name);
      project.save()
      .then(callback())
    });
	},

	getAllColumns: function(room, callback)
	{
    // console.log('DONE Appel getAllColumns');
    this.models.ProjectModel
    .findOne({'_id':mongoose.Types.ObjectId('545cdefaec73bef2af7b063c')})
    .then(function (project) {
      callback(project.scrumblr.columns);
    });
	},

	deleteColumn: function(room)
	{
    console.log('Appel deleteColumn');
    //
		// this.rooms.update(
		// 	{name:room},
		// 	{$pop:{columns:1}}
		// );
	},

	setColumns: function(room, columns)
	{
    // console.log('DONE Appel setColumns', columns);
    this.models.ProjectModel
    .findOne({'_id':mongoose.Types.ObjectId('545cdefaec73bef2af7b063c')})
    .then(function (project) {
      project.scrumblr.columns = columns;
      project.save();
    });
	},

	// Card commands
	createCard: function(room, id, card, callback)
	{
    // console.log('DONE Appel createCard', id, " - ", card);
    this.models.ProjectModel
    .findOne({'_id':mongoose.Types.ObjectId('545cdefaec73bef2af7b063c')})
    .then(function (project) {
      task = {'delete_is_allowed': true,
              'status': 'ok',
              'zone': 'internal',
              'name': card.text,
              'scrumblr': card}
      delete card.text;

      project.deliverables.splice(0, 0, task);
      project.save()
      .then(function (project) {
        callback(project.deliverables[0]._id)
      });

    });
	},
	getAllCards: function(room, callback)
	{
    // console.log('DONE Appel getAllCards', room);
    this.models.ProjectModel
    .findOne({'_id':mongoose.Types.ObjectId('545cdefaec73bef2af7b063c'), "deliverables.zone": "internal"})
    .then(function (projects) {
      cards = projects.deliverables.reduce(function(elem, v, i) {
        if (v.zone === 'internal') {
          elem[i] = {}
          elem[i].id = v._id;
          elem[i].colour = v.scrumblr.colour;
          elem[i].rot = v.scrumblr.rot;
  			  elem[i].x = v.scrumblr.x;
  			  elem[i].y = v.scrumblr.y;
          elem[i].text = v.name;
          elem[i].sticker = (v.scrumblr.sticker === null ? null : v.scrumblr.sticker[0]);
        }
        return elem;
      }, {});
      callback(cards)
    });
	},

	cardEdit: function(room, id, text)
	{
    // console.log('DONE Appel cardEdit');
    this.models.ProjectModel
    .findOne({'_id':mongoose.Types.ObjectId('545cdefaec73bef2af7b063c'),
              "deliverables._id": mongoose.Types.ObjectId(id)})
    .then(function (project) {
      deliverable = _.find(project.deliverables, {"_id": mongoose.Types.ObjectId(id)});
      deliverable.name = text;
      project.save();
    });
	},
	cardSetXY: function(room, id, x, y)
	{
    // console.log('DONE Appel cardSetXY');
    this.models.ProjectModel
    .findOne({'_id':mongoose.Types.ObjectId('545cdefaec73bef2af7b063c'),
              "deliverables._id": mongoose.Types.ObjectId(id)})
    .then(function (project) {
      if (project != null) {
        deliverable = _.find(project.deliverables, {"_id": mongoose.Types.ObjectId(id)});
        deliverable.scrumblr.x = x;
        deliverable.scrumblr.y = y;
        project.save();
      }
    });
	},
	deleteCard: function(room, id)
	{
    // console.log('DONE Appel deleteCard');
    this.models.ProjectModel
    .findOne({'_id':mongoose.Types.ObjectId('545cdefaec73bef2af7b063c'),
              "deliverables._id": mongoose.Types.ObjectId(id)})
    .then(function (project) {
        deliverableIdx = _.findIndex(project.deliverables, {"_id": mongoose.Types.ObjectId(id)});
        project.deliverables.splice(deliverableIdx, 1);
        project.save();
    });
	},
	addSticker: function(room, cardId, stickerId)
	{
    // console.log('DONE Appel addSticker', stickerId);
    this.models.ProjectModel
    .findOne({'_id':mongoose.Types.ObjectId('545cdefaec73bef2af7b063c'),
              "deliverables._id": mongoose.Types.ObjectId(cardId)})
    .then(function (project) {
      deliverable = _.find(project.deliverables, {"_id": mongoose.Types.ObjectId(cardId)});
      if (stickerId === 'nosticker') {
        deliverable.scrumblr.sticker = null;
      } else if (deliverable.scrumblr.sticker === null) {
        deliverable.scrumblr.sticker = [stickerId];
      } else {
        deliverable.scrumblr.sticker.set(0, stickerId);
      }
      project.save();
    });
	},
	getBoardSize: function(room, callback) {
    // console.log('DONE Appel getBoardSize');
    this.models.ProjectModel
    .findOne({'_id':mongoose.Types.ObjectId('545cdefaec73bef2af7b063c')})
    .then(function (project) {
      callback(project.scrumblr.size);
    });
	},
	setBoardSize: function(room, size) {
    // console.log('DONE Appel setBoardSize');
    this.models.ProjectModel
    .findOne({'_id':mongoose.Types.ObjectId('545cdefaec73bef2af7b063c')})
    .then(function (project) {
      project.scrumblr.size = size;
      project.save();
    });
	}
};
exports.db = db;
