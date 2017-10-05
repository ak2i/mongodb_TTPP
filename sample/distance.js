function getDistance(lat1, lng1, lat2, lng2) {
  function radians(deg){
    return deg * Math.PI / 180;
  }
  return 6378.14 * Math.acos(Math.cos(radians(lat1))*
    Math.cos(radians(lat2))*
    Math.cos(radians(lng2)-radians(lng1))+
    Math.sin(radians(lat1))*
    Math.sin(radians(lat2)));
}

var types = {};

db.ttpp_demo_model.find({}).forEach(function(model){
  var dt = 0.5;
  if (model.placeAddressBlocFrom != model.placeAddressBlocTo) {
    var fromM = db.marker.findOne({placeAddressBloc:model.placeAddressBlocFrom});
    var toM = db.marker.findOne({placeAddressBloc:model.placeAddressBlocTo});
    var dis = getDistance(
      fromM.placeGeo.coordinates[1],
      fromM.placeGeo.coordinates[0],
      toM.placeGeo.coordinates[1],
      toM.placeGeo.coordinates[0]
    );
    if (model.valueDistanceTwHours > 0) {
      dt = model.valueDistanceTwHours;
    }
    model.valueDistanceKm = dis;
  } else {
    var dis = 0;
    model.valueDistanceKm = dis;
  }
  var v = dis / dt;
  model.valueDistanceSpeed = v;
  model.valueMovingType = 'Unknown';
  if (v == 0) {
    model.valueMovingType = 'Stay';
  } else if (v < 2) {
    model.valueMovingType = 'HangAround';
  } else if (v < 220) {
    model.valueMovingType = 'TBD';
  }
  if (types[model.valueMovingType] !== undefined) {
    types[model.valueMovingType] += 1;
  } else {
    types[model.valueMovingType] = 1;
  }
  db.ttpp_demo_model.save(model);
});

printjson(types);
