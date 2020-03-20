const uuid = require("uuid");
const database = require("../models/index");
function createTimedMessage(timedMessage) {
    return database.default.TimedMessage
        .create({
					id: uuid.v1(),
					sock: timedMessage.sock,
					videoTime: timedMessage.videoTime,
					message: timedMessage.message,
					condition: timedMessage.condition
				});
}
function findAllTimedMessage() {
    return database.default.TimedMessage
        .findAll({order: [['videoTime', 'ASC']]});
}
function setModeratorName(newName, callback) {
	return database.default.Moderator.findOne({ where: { id: 1 } }).then(moder => {
		if (moder){
			moder.name = newName;
			moder.save().then((res) => {
				callback(null, res)
			}).catch ((err) => {
				callback(err, null)
			})
		} else {
			database.default.Moderator
			.create({
				name: newName
			})
			.then((res) => {
				callback(null, res)
			}).catch ((err) => {
				callback(err, null)
			})
		}
	  }).catch((err) => {
		callback(err, null)
	  })
}
function getModeratorName() {
	return database.default.Moderator.findOne({ where: { id: 1 } });
}

module.exports = (router) => {

	router.post('/api/addTimedMessages', function(req, res) {
		createTimedMessage(req.body)
			.then(tm => {
				console.log(tm)
				res.json({success: true, tm: tm})
			})
			.catch(err => {
				console.error('Unable to create TimedMessages:', err);
				res.json({success: false, err: err})
			})
	});
	// {
	// 	"sock": "{\"n\":\"LIoyd\"}",
	// 	"videoTime": 10,
	// 	"message": "[Name], 10 minutes gone, any questions?"
	// 	}
	router.post('/chatapi/actions', function(req, res) {
		res.json({success: true, msg: "action api successed"})
	});
	router.get('/api/getAllTimedMessages', function(req, res) {
		findAllTimedMessage()
		.then(tms => {
			console.log(tms)
			res.json({success: true, tms: tms})
		})
		.catch(err => {
			console.error('Unable to get TimedMessages:', err);
			res.json({success: false, err: err})
		})
	});
	router.post('/api/removeTimedMessage', function(req, res) {
		database.default.TimedMessage.findOne({ where: { id: req.body.messageId } })
		.then(tm => {
			console.log(tm)
			tm.destroy()
			.then((destroyRes) => {
				res.json({success: true, res: destroyRes})
			})
			.catch(err => {
				console.error('Unable to destroy TimedMessage with id:', req.body.messageId, " err:", err);
				res.json({success: false, err: err})
			})
		})
		.catch(err => {
			console.error('Unable to get TimedMessage with id:', req.body.messageId, " err:", err);
			res.json({success: false, err: err})
		});
	});
	router.post('/api/setModeratorName', function(req, res) {
		setModeratorName(req.body.newName, function(error, result) {
			if (error) {
				console.log("setModeratorName err", error);
				return res.json({success: false, err: error})
			}
			return res.json({success: true, msg: result})
		})
	});
	// {
	// 	"newName":"LIoyd"
	// }
	router.get('/api/getModeratorName', function(req, res) {
		getModeratorName()
		.then(moder => {
			console.log(moder)
			res.json({success: true, moderator: moder})
		})
		.catch(err => {
			console.error('Unable to get moderator:', err);
			res.json({success: false, err: err})
		})
	});
	router.get('*', function(req, res) {
	  res.render("index.html");
	});
	return router;
};