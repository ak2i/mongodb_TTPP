var users = 100;
var maxHours = 48;

var startDate = new Date('2017/03/01 00:00:00');
var rangeHours = 24 * 30 * 3;

for(var uid = 1; uid <= users; uid++) {
  var trackId = hex_md5('' + uid);
  var std = new Date( startDate.getTime() + Math.floor(Math.random()*rangeHours) * 60 * 60 * 1000 );
  var twHour = std.getHours();
  var tth = 0;
  var models = db.ttpp_demo_model.find({volumeModeltwHours:twHour}).toArray();
  var model = models[Math.floor(Math.random() * models.length)];
  var fromM = db.marker.findOne({placeAddressBloc:model.placeAddressBlocFrom},{_id:0});
  var toM = db.marker.findOne({placeAddressBloc:model.placeAddressBlocTo},{_id:0});
  var vdth = model.valueDistanceTwHours;
  var todate = new Date( std.getTime() + vdth * 60 * 60 * 1000);
  fromM.trackId = trackId;
  fromM.twDatetime = std;
  fromM.twHour = twHour;
  toM.trackId = trackId;
  toM.twDatetime = todate;
  toM.twHour = todate.getHours();
  db.track_demo.insert(fromM);
  db.track_demo.insert(toM);
  var ttpp = {
    trackId : trackId,
    timeWindow : {
      DatetimeFrom : fromM.twDatetime,
      HourFrom : fromM.twHour,
      DatetimeTo : toM.twDatetime,
      HourTo : toM.twHour
    },
    place : {
      from : {
        placeName : fromM.placeName,
		    placeAddressCity : fromM.placeAddressCity,
		    placeGeo : fromM.placeGeo,
        placeId : fromM.placeId,
        placeZip : fromM.placeZip,
        placeAddressBloc : fromM.placeAddressBloc,
        placeAddress1 : fromM.placeAddress1,
        placeAddress2 : fromM.placeAddress2,
        placeAddress3 : fromM.placeAddress3
      },
      to : {
        placeName : toM.placeName,
		    placeAddressCity : toM.placeAddressCity,
		    placeGeo : toM.placeGeo,
        placeId : toM.placeId,
        placeZip : toM.placeZip,
        placeAddressBloc : toM.placeAddressBloc,
        placeAddress1 : toM.placeAddress1,
        placeAddress2 : toM.placeAddress2,
        placeAddress3 : toM.placeAddress3
      }
    },
    value : {
      DistanceTwHours : vdth
    }
  };
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
      toM.trackId = trackId;
      toM.twDatetime = todate;
      toM.twHour = todate.getHours();
      db.track_demo.insert(fromM);
      db.track_demo.insert(toM);
      ttpp = {
        trackId : trackId,
        timeWindow : {
          DatetimeFrom : fromM.twDatetime,
          HourFrom : fromM.twHour,
          DatetimeTo : toM.twDatetime,
          HourTo : toM.twHour
        },
        place : {
          from : {
            placeName : fromM.placeName,
    		    placeAddressCity : fromM.placeAddressCity,
    		    placeGeo : fromM.placeGeo,
            placeId : fromM.placeId,
            placeZip : fromM.placeZip,
            placeAddressBloc : fromM.placeAddressBloc,
            placeAddress1 : fromM.placeAddress1,
            placeAddress2 : fromM.placeAddress2,
            placeAddress3 : fromM.placeAddress3
          },
          to : {
            placeName : toM.placeName,
    		    placeAddressCity : toM.placeAddressCity,
    		    placeGeo : toM.placeGeo,
            placeId : toM.placeId,
            placeZip : toM.placeZip,
            placeAddressBloc : toM.placeAddressBloc,
            placeAddress1 : toM.placeAddress1,
            placeAddress2 : toM.placeAddress2,
            placeAddress3 : toM.placeAddress3
          }
        },
        value : {
          DistanceTwHours : vdth
        }
      };
      db.ttpp_demo.insert(ttpp);
      if (tth >= maxHours) {
        flag = false;
      }
    } else {
      flag = false;
    }
  }
}
