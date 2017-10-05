TTPP modelデータをより有効にするため、リファインを行った。

まずはPlaceのペア間の速度から大まかな分類を行った。DistanceTwHoursが0のものは30分とみなしている。

```
$ mongo TTPP sample/distance.js
MongoDB shell version v3.4.2
connecting to: mongodb://127.0.0.1:27017/TTPP
MongoDB server version: 3.4.2
{ "HangAround" : 555, "Stay" : 249, "TBD" : 179, "Unknown" : 20 }
```

* Stayは同じ場所に止まったパターン
* HangAroundは時速2km未満の移動
* Unknownは直線距離を新幹線の最高速度220km/hよりも速く移動しているもの

Unknownは除外するとして、TBDはそんなに多くないので一つ一つみて移動の種類を推定することにした。

* 実際の場所間をgoogle地図の移動ナビゲーションで検索してみて手段を推定する

具体的には以下のように179箇所について実施

```
> var t = db.ttpp_demo_model.findOne({valueMovingType:"TBD"});
> t
{
	"_id" : ObjectId("59b7f0d1741e71718a6bc1f6"),
	"placeAddressBlocFrom" : "北海道千歳市美々",
	"placeAddressBlocTo" : "北海道札幌市手稲区富丘二条",
	"valueDistanceTwHours" : 0,
	"volumeModelCounts" : 197,
	"volumeModeltwHours" : [
		15,
		14,
		11,
		8,
		9,
		21,
		12,
		10,
		22,
		18,
		17,
		19,
		7,
		16,
		13,
		20,
		6
	],
	"valueDistanceKm" : 50.53847775224393,
	"valueDistanceSpeed" : 101.07695550448786,
	"valueMovingType" : "TBD"
}
> t.valueMovingType = ["TrainExpress","VehicleHighway"]
[ "TrainExpress", "VehicleHighway" ]
> db.ttpp_demo_model.save(t)
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
```

検索するとエアポート快速のルートと高速道路での自動車がでたのでどちらかとした。

途中でwalkで距離が短いものは自明だと気づいたので3km以内時速3km未満はwalkにする。

```
var count = 0;
db.ttpp_demo_model.find({valueMovingType:"TBD",valueDistanceKm:{$lte:3},valueDistanceSpeed:{$lt:3}}).forEach(function(model){
  model.valueMovingType = ["Walk"];
  db.ttpp_demo_model.save(model);
  count += 1;
});
```

その結果

```
> count
97
```

97個は自動で処理できた。楽になった。

採用した種類は以下の通り

* TrainExpress
* Train
* VehicleHighway
* Vehicle
* Walk

```
var types = [
  "TrainExpress",
  "Train",
  "VehicleHighway",
  "Vehicle",
  "Walk",
  "HangAround",
  "Stay",
  "Unknown"
];
types.forEach(function(type){
  var count = db.ttpp_demo_model.count({valueMovingType:type});
  print(type + ":" + count);
});
```

内訳は以下の通り

```
TrainExpress:2
Train:72
VehicleHighway:27
Vehicle:57
Walk:107
HangAround:555
Stay:249
Unknown:20
```

移動手段の分類が作れたのでシミュレーションの出力がもうちょっとリアリティを持つようにできる。
