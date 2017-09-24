var users = 1000;
var maxHours = 48;

var startDate = new Date('2017/03/01 00:00:00');
var rangeHours = 24 * 30 * 3;
var days = ['日','月','火','水','木','金','土'];

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
	var trackId = hex_md5('' + uid);
	var std = new Date( startDate.getTime() + Math.floor(Math.random()*rangeHours) * 60 * 60 * 1000 );
	var twHour = std.getHours();
	var tth = 0;
	var models = db.ttpp_demo_model.find({volumeModeltwHours:twHour}).toArray();
	if (models.length > 0) {
		var model = models[Math.floor(Math.random() * models.length)];
		var fromM = db.marker.findOne({placeAddressBloc:model.placeAddressBlocFrom},{_id:0});
		var toM = db.marker.findOne({placeAddressBloc:model.placeAddressBlocTo},{_id:0});
		var vdth = model.valueDistanceTwHours;
		var todate = new Date( std.getTime() + vdth * 60 * 60 * 1000);
		fromM.trackId = trackId;
		fromM.twDatetime = std;
		fromM.twHour = twHour;
		fromM.twDay = days[std.getDay()];
		toM.trackId = trackId;
		toM.twDatetime = todate;
		toM.twHour = todate.getHours();
		toM.twDay = days[todate.getDay()];
		db.track_demo.insert(fromM);
		db.track_demo.insert(toM);
		var ttpp = makeTTPP(trackId, model, fromM, toM);
		db.ttpp_demo.insert(ttpp);
		var flag = true;
		while (flag == true) {
			models = db.ttpp_demo_model.find({placeAddressBlocFrom:toM.placeAddressBloc}).toArray();
			if (models.length > 0) {
				std = new Date( std.getTime() + vdth * 60 * 60 * 1000 );
				twHour = std.getHours();
				tth += Math.max(vdth,0.5);
				model = models[Math.floor(Math.random() * models.length)];
				fromM = db.marker.findOne({placeAddressBloc:model.placeAddressBlocFrom},{_id:0});
				toM = db.marker.findOne({placeAddressBloc:model.placeAddressBlocTo},{_id:0});
				vdth = model.valueDistanceTwHours;
				todate = new Date( std.getTime() + vdth * 60 * 60 * 1000);
				fromM.trackId = trackId;
				fromM.twDatetime = std;
				fromM.twHour = twHour;
				fromM.twDay = days[std.getDay()];
				toM.trackId = trackId;
				toM.twDatetime = todate;
				toM.twHour = todate.getHours();
				toM.twDay = days[todate.getDay()];
				db.track_demo.insert(fromM);
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
