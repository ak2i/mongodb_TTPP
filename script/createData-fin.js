var users = 100;
var maxHours = 24;

var startDate = new Date('2017/03/01 00:00:00');
var rangeHours = 24 * 30 * 3;
var days = ['日','月','火','水','木','金','土'];

var nextTw = function(dt, dist) {
	var dd = Math.floor( (0.5 * Math.random() + 0.25 + dist ) * 60 * 60 * 1000);
	return new Date( dt.getTime() + dd);
}

var regTwHour = function(dt) {
	var b = 60 * 60 * 1000;
	return new Date( Math.floor(dt.getTime() / b) * b );
}

var regTwQthour = function(dt) {
	var b = 15 * 60 * 1000;
	return new Date( Math.floor(dt.getTime() / b) * b );
}

var makeTTPP = function(trackId, model, fromM, toM) {
	var vdth = model.valueDistanceTwHours;
	var ttpp = {
		trackId : trackId,
		timeWindow : {
			from : {
				Datetime : fromM.twDatetime,
				Hour : fromM.twHour,
				Day : fromM.twDay,
			},
			to : {
				Datetime : toM.twDatetime,
				Hour : toM.twHour,
				Day : toM.twDay
			}
		},
		place : {
			from : {
				Name : fromM.placeName,
				AddressCity : fromM.placeAddressCity,
				Geo : fromM.placeGeo,
				Id : fromM.placeId,
				Zip : fromM.placeZip,
				AddressBloc : fromM.placeAddressBloc,
				Address1 : fromM.placeAddress1,
				Address2 : fromM.placeAddress2,
				Address3 : fromM.placeAddress3
			},
			to : {
				Name : toM.placeName,
				AddressCity : toM.placeAddressCity,
				Geo : toM.placeGeo,
				Id : toM.placeId,
				Zip : toM.placeZip,
				AddressBloc : toM.placeAddressBloc,
				Address1 : toM.placeAddress1,
				Address2 : toM.placeAddress2,
				Address3 : toM.placeAddress3
			}
		},
		value : {
			DistanceTwHours : vdth
		}
	};
	return ttpp;
}

for(var uid = 1; uid <= users; uid++) {
	var trackId = hex_md5('user' + uid);
	var std = new Date( startDate.getTime() + Math.floor(Math.random()*rangeHours) * 60 * 60 * 1000 );
	var tth = 0;
	var models = db.ttpp_demo_model.find({volumeModeltwHours:std.getHours()}).toArray();
	if (models.length > 0) {
		var model = models[Math.floor(Math.random() * models.length)];
		var fromM = db.marker.findOne({placeAddressBloc:model.placeAddressBlocFrom},{_id:0});
		var toM = db.marker.findOne({placeAddressBloc:model.placeAddressBlocTo},{_id:0});
		var vdth = model.valueDistanceTwHours;
		var todate = nextTw(std, vdth);
		fromM.trackId = trackId;
		fromM.twDatetime = regTwQthour(std);
		fromM.twHour = fromM.twDatetime.getHours();
		fromM.twDay = days[fromM.twDatetime.getDay()];
		db.track_demo.insert(fromM);
		toM.trackId = trackId;
		toM.twDatetime = regTwQthour(todate);
		toM.twHour = toM.twDatetime.getHours();
		toM.twDay = days[toM.twDatetime.getDay()];
		db.track_demo.insert(toM);
		var ttpp = makeTTPP(trackId, model, fromM, toM);
		db.ttpp_demo.insert(ttpp);
		var flag = true;
		while (flag == true) {
			models = db.ttpp_demo_model.find({placeAddressBlocFrom:toM.placeAddressBloc}).toArray();
			if (models.length > 0) {
				tth += (todate.getTime() - std.getTime()) / (60 * 60 * 1000);
				std = todate;
				model = models[Math.floor(Math.random() * models.length)];
				fromM = db.marker.findOne({placeAddressBloc:model.placeAddressBlocFrom},{_id:0});
				toM = db.marker.findOne({placeAddressBloc:model.placeAddressBlocTo},{_id:0});
				vdth = model.valueDistanceTwHours;
				todate = nextTw(std, vdth);
				fromM.trackId = trackId;
				fromM.twDatetime = regTwQthour(std);
				fromM.twHour = fromM.twDatetime.getHours();
				fromM.twDay = days[fromM.twDatetime.getDay()];
				db.track_demo.insert(fromM);
				toM.trackId = trackId;
				toM.twDatetime = regTwQthour(todate);
				toM.twHour = toM.twDatetime.getHours();
				toM.twDay = days[toM.twDatetime.getDay()];
				db.track_demo.insert(toM);
				ttpp = makeTTPP(trackId, model, fromM, toM);
				db.ttpp_demo.insert(ttpp);
				if (tth >= maxHours) {
					flag = false;
				}
			} else {
				flag = false;
			}
		}
	}
}
