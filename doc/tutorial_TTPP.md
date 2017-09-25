# TTPPデータの扱い方

### twDay 曜日データの付与

TTPのチュートリアルで付与した曜日をこちらでもつけておきます。（createData-fin.jsで生成した場合は最初から付与されています）

```javascript
var days = ['日','月','火','水','木','金','土'];
var cur = db.ttpp_demo.find({});
cur.forEach(function(doc){
 doc.timeWindow.from.Day = days[doc.timeWindow.from.Datetime.getDay()];
 doc.timeWindow.to.Day = days[doc.timeWindow.to.Datetime.getDay()];
 db.ttpp_demo.save(doc);
});
db.ttpp_demo.createIndex({"timeWindow.from.Day":1});
db.ttpp_demo.createIndex({"timeWindow.to.Day":1});
```

### TTPPデータの例

どんなデータが入っているかを調べて見ましょう。

```
> db.ttpp_demo.findOne()
{
	"_id" : ObjectId("59c70a4ff853e76d2cd87050"),
	"trackId" : "c4ca4238a0b923820dcc509a6f75849b",
	"timeWindow" : {
		"from" : {
			"Datetime" : ISODate("2017-05-17T01:00:00Z"),
			"Hour" : 10,
			"Day" : "水"
		},
		"to" : {
			"Datetime" : ISODate("2017-05-17T01:00:00Z"),
			"Hour" : 10,
			"Day" : "水"
		}
	},
	"place" : {
		"from" : {
			"Name" : "山之口町",
			"AddressCity" : "鹿児島県鹿児島市",
			"Geo" : {
				"type" : "Point",
				"coordinates" : [
					130.55325011,
					31.58821092
				]
			},
			"Id" : "a07edaf2fea7f5cd535910788bac2dcb",
			"Zip" : "8920844",
			"AddressBloc" : "鹿児島県鹿児島市山之口町",
			"Address1" : "鹿児島県",
			"Address2" : "鹿児島市",
			"Address3" : "山之口町"
		},
		"to" : {
			"Name" : "東千石町",
			"AddressCity" : "鹿児島県鹿児島市",
			"Geo" : {
				"type" : "Point",
				"coordinates" : [
					130.55328694,
					31.59187947
				]
			},
			"Id" : "212baee772265e9049fcc4783167c4ae",
			"Zip" : "8920842",
			"AddressBloc" : "鹿児島県鹿児島市東千石町",
			"Address1" : "鹿児島県",
			"Address2" : "鹿児島市",
			"Address3" : "東千石町"
		}
	},
	"value" : {
		"DistanceTwHours" : 0
	}
}
```

鹿児島県鹿児島市山之口町から鹿児島県鹿児島市東千石町へ移動したデータが表示されました。

### 東京都から外へ出た行き先をカウント

TTPPの特徴は移動をキーに使った検索です。ここでは東京都から別の都道府県へ出たパターンを行き先毎に集計してみましょう。

```javascript
var list = [];
var tos = db.ttpp_demo.distinct("place.to.Address1",{"place.from.Address1":"東京都", "place.to.Address1" : {$ne : "東京都"}});
tos.forEach(function(add1){
	var count = db.ttpp_demo.distinct("trackId",{"place.from.Address1":"東京都", "place.to.Address1":add1}).length;
	list.push([add1, count]);
});
list.sort(function(a,b){ return b[1] - a[1]; });
list.forEach(function(ent){
 print( ent[0] + ':' + ent[1] );
});
```

```
> var list = [];
> var tos = db.ttpp_demo.distinct("place.to.Address1",{"place.from.Address1":"東京都", "place.to.Address1" : {$ne : "東京都"}});
> tos.forEach(function(add1){
... var count = db.ttpp_demo.distinct("trackId",{"place.from.Address1":"東京都", "place.to.Address1":add1}).length;
... list.push([add1, count]);
... });
> list.sort(function(a,b){ return b[1] - a[1]; });
[ [ "大阪府", 369 ], [ "滋賀県", 285 ], [ "神奈川県", 13 ] ]
> list.forEach(function(ent){
...  print( ent[0] + ':' + ent[1] );
... });
大阪府:369
滋賀県:285
神奈川県:13
```

意外なことに東京都から滋賀県に移動したのがすごく多いようです。（あくまでシミュレーションデータです！！）

### 時間距離で絞り込む

TTPPはエントリーに時間距離を含みます。ここでは時間距離に1時間かかっているエントリーでfrom、toを出してみましょう。

```javascript
var list = [];
var froms = db.ttpp_demo.distinct("place.from.Address1",{"value.DistanceTwHours":1});
froms.forEach(function(add1){
	var tos = db.ttpp_demo.distinct("place.to.Address1",{"place.from.Address1":add1,"value.DistanceTwHours":1});
	tos.forEach(function(add1to){
		var count = db.ttpp_demo.distinct("trackId",{"place.from.Address1":add1, "place.to.Address1":add1to, "value.DistanceTwHours":1}).length;
		list.push([add1, add1to, count]);
	});
});
list.sort(function(a,b){ return b[2] - a[2]; });
list.forEach(function(ent){
 print( ent[0] + '-' + ent[1] + ':' + ent[2] );
});
```

```
> var list = [];
> var froms = db.ttpp_demo.distinct("place.from.Address1",{"value.DistanceTwHours":1});
> froms.forEach(function(add1){
... var tos = db.ttpp_demo.distinct("place.to.Address1",{"place.from.Address1":add1,"value.DistanceTwHours":1});
... tos.forEach(function(add1to){
... var count = db.ttpp_demo.distinct("trackId",{"place.from.Address1":add1, "place.to.Address1":add1to, "value.DistanceTwHours":1}).length;
... list.push([add1, add1to, count]);
... });
... });
> list.sort(function(a,b){ return b[2] - a[2]; });
[ [ "東京都", "東京都", 249 ] ]
> list.forEach(function(ent){
...  print( ent[0] + '-' + ent[1] + ':' + ent[2] );
... });
東京都-東京都:249
```

上記の例では東京都内において1時間かけて動いている例が検出されています。都内で1時間かけて動いた先が何処なのか気になりますね。AddressCityを使ってみましょう。

```javascript
var tAdd1 = "東京都";
var list = [];
var froms = db.ttpp_demo.distinct("place.from.AddressCity",{"place.from.Address1":tAdd1, "value.DistanceTwHours":1});
froms.forEach(function(add1){
	var tos = db.ttpp_demo.distinct("place.to.AddressCity",{"place.from.AddressCity":add1,"value.DistanceTwHours":1});
	tos.forEach(function(add1to){
		var count = db.ttpp_demo.distinct("trackId",{"place.from.AddressCity":add1, "place.to.AddressCity":add1to, "value.DistanceTwHours":1}).length;
		list.push([add1, add1to, count]);
	});
});
list.sort(function(a,b){ return b[2] - a[2]; });
list.forEach(function(ent){
 print( ent[0] + '-' + ent[1] + ':' + ent[2] );
});
```

```
> var tAdd1 = "東京都";
> var list = [];
> var froms = db.ttpp_demo.distinct("place.from.AddressCity",{"place.from.Address1":tAdd1, "value.DistanceTwHours":1});
> froms.forEach(function(add1){
... var tos = db.ttpp_demo.distinct("place.to.AddressCity",{"place.from.AddressCity":add1,"value.DistanceTwHours":1});
... tos.forEach(function(add1to){
... var count = db.ttpp_demo.distinct("trackId",{"place.from.AddressCity":add1, "place.to.AddressCity":add1to, "value.DistanceTwHours":1}).length;
... list.push([add1, add1to, count]);
... });
... });
> list.sort(function(a,b){ return b[2] - a[2]; });
[ [ "東京都新宿区", "東京都新宿区", 249 ] ]
> list.forEach(function(ent){
...  print( ent[0] + '-' + ent[1] + ':' + ent[2] );
... });
東京都新宿区-東京都新宿区:249
```

新宿区に集中しています。こうなったらAddressBlocを使いましょう。

```javascript
var tAdd1 = "東京都";
var list = [];
var froms = db.ttpp_demo.distinct("place.from.AddressBloc",{"place.from.Address1":tAdd1, "value.DistanceTwHours":1});
froms.forEach(function(add1){
	var tos = db.ttpp_demo.distinct("place.to.AddressBloc",{"place.from.AddressBloc":add1,"value.DistanceTwHours":1});
	tos.forEach(function(add1to){
		var count = db.ttpp_demo.distinct("trackId",{"place.from.AddressBloc":add1, "place.to.AddressBloc":add1to, "value.DistanceTwHours":1}).length;
		list.push([add1, add1to, count]);
	});
});
list.sort(function(a,b){ return b[2] - a[2]; });
list.forEach(function(ent){
 print( ent[0] + '-' + ent[1] + ':' + ent[2] );
});
```

```
> var tAdd1 = "東京都";
> var list = [];
> var froms = db.ttpp_demo.distinct("place.from.AddressBloc",{"place.from.Address1":tAdd1, "value.DistanceTwHours":1});
> froms.forEach(function(add1){
... var tos = db.ttpp_demo.distinct("place.to.AddressBloc",{"place.from.AddressBloc":add1,"value.DistanceTwHours":1});
... tos.forEach(function(add1to){
... var count = db.ttpp_demo.distinct("trackId",{"place.from.AddressBloc":add1, "place.to.AddressBloc":add1to, "value.DistanceTwHours":1}).length;
... list.push([add1, add1to, count]);
... });
... });
> list.sort(function(a,b){ return b[2] - a[2]; });
[ [ "東京都新宿区歌舞伎町", "東京都新宿区新宿", 249 ] ]
> list.forEach(function(ent){
...  print( ent[0] + '-' + ent[1] + ':' + ent[2] );
... });
東京都新宿区歌舞伎町-東京都新宿区新宿:249
```

歌舞伎町から新宿への移動で全てでした。モデルデータは実際のデータからK100（同一条件で検索したときに100エントリ以上の条件のみ抽出）で得た情報を元にモデル化しており、そのモデルを元に簡単な乱数で生成しているのでこういう偏りが発生してしまいます。

### 追跡する

TTP、TTPPはtrackIdを持っており、それで個々の人々の移動を追跡できます。ここでは個別に追跡してその移動経路を可視化しやすく集計したflowVolumeというデータ形式を使いましょう。

追跡の対象は先ほどの歌舞伎町から新宿へ移動した249人を対象としてみましょう。（シミュレーション結果によってバラツキがあるので、ここは適宜読み替えて下さい。）

```javascript
var fromBloc = "東京都新宿区歌舞伎町";
var toBloc = "東京都新宿区新宿";
var trackIds = db.ttpp_demo.distinct("trackId",{"place.from.AddressBloc":fromBloc, "place.to.AddressBloc":toBloc});
var fvTbl = {};
var fvIds = [];
var fvType = "Normal";
trackIds.forEach(function(tid){
	db.ttpp_demo.find({trackId:tid}).sort({"timeWindow.from.Datetime":1}).forEach(function(ttpp){
		var fvkey = ttpp.place.from.Id + '_to_' + ttpp.place.to.Id;
		if (fvTbl[fvkey] !== undefined) {
			fvTbl[fvkey].value.FlowVolume += 1;
		} else {
			fvTbl[fvkey] = {
				flowPathId : fvkey,
				place : {
					from : ttpp.place.from,
					to : ttpp.place.to
				},
				value : {
					FlowVolume : 1,
					FlowPathType : fvType
				}
			};
			fvIds.push(fvkey);
		}
	});
});
var records = [];
fvIds.forEach(function(fvid){
	records.push(fvTbl[fvid]);
});
records.sort(function(a,b){ return b.value.FlowVolume - a.value.FlowVolume; });
printjson(records);
```

出力が多いので省略し、一番多かった移動パターンをみてみましょう。

```
> printjson(records[0]);
{
	"flowPathId" : "6f115b98a28a22bf57f28c401c7b46e9_to_6f115b98a28a22bf57f28c401c7b46e9",
	"place" : {
		"from" : {
			"Name" : "四谷",
			"AddressCity" : "東京都新宿区",
			"Geo" : {
				"type" : "Point",
				"coordinates" : [
					139.72855012,
					35.68628864
				]
			},
			"Id" : "6f115b98a28a22bf57f28c401c7b46e9",
			"Zip" : "1600004",
			"AddressBloc" : "東京都新宿区四谷",
			"Address1" : "東京都",
			"Address2" : "新宿区",
			"Address3" : "四谷"
		},
		"to" : {
			"Name" : "四谷",
			"AddressCity" : "東京都新宿区",
			"Geo" : {
				"type" : "Point",
				"coordinates" : [
					139.72855012,
					35.68628864
				]
			},
			"Id" : "6f115b98a28a22bf57f28c401c7b46e9",
			"Zip" : "1600004",
			"AddressBloc" : "東京都新宿区四谷",
			"Address1" : "東京都",
			"Address2" : "新宿区",
			"Address3" : "四谷"
		}
	},
	"value" : {
		"FlowVolume" : 3337,
		"FlowPathType" : "Normal"
	}
}
```

四谷から四谷で移動したパターンが最も多く3337サンプルありました。これはtrackIdの数よりも多いですから、同じ人が何度も四谷内で移動した事が分かります。

それでは同じ場所の移動は除外してもう一度集計してみましょう。少し条件を加えるだけで出来ます。

```javascript
var fromBloc = "東京都新宿区歌舞伎町";
var toBloc = "東京都新宿区新宿";
var trackIds = db.ttpp_demo.distinct("trackId",{"place.from.AddressBloc":fromBloc, "place.to.AddressBloc":toBloc});
var fvTbl = {};
var fvIds = [];
var fvType = "Normal";
trackIds.forEach(function(tid){
 db.ttpp_demo.find({trackId:tid}).sort({"timeWindow.from.Datetime":1}).forEach(function(ttpp){
  if (ttpp.place.from.Id !== ttpp.place.to.Id) {
   var fvkey = ttpp.place.from.Id + '_to_' + ttpp.place.to.Id;
   if (fvTbl[fvkey] !== undefined) {
    fvTbl[fvkey].value.FlowVolume += 1;
   } else {
    fvTbl[fvkey] = {
     flowPathId : fvkey,
     place : {
      from : ttpp.place.from,
      to : ttpp.place.to
     },
     value : {
      FlowVolume : 1,
      FlowPathType : fvType
     }
    };
    fvIds.push(fvkey);
   }
  }
 });
});
var records = [];
fvIds.forEach(function(fvid){
 records.push(fvTbl[fvid]);
});
records.sort(function(a,b){ return b.value.FlowVolume - a.value.FlowVolume; });
printjson(records);
```

今回も出力が多いので一部を見てみます。

```
> printjson(records[0]);
{
	"flowPathId" : "24c9d63131bf3ec840c07bde1fbd6e5b_to_9f2a4af5341eafd497bf7f4bafed2779",
	"place" : {
		"from" : {
			"Name" : "歌舞伎町",
			"AddressCity" : "東京都新宿区",
			"Geo" : {
				"type" : "Point",
				"coordinates" : [
					139.70313811,
					35.69553109
				]
			},
			"Id" : "24c9d63131bf3ec840c07bde1fbd6e5b",
			"Zip" : "1600021",
			"AddressBloc" : "東京都新宿区歌舞伎町",
			"Address1" : "東京都",
			"Address2" : "新宿区",
			"Address3" : "歌舞伎町"
		},
		"to" : {
			"Name" : "新宿",
			"AddressCity" : "東京都新宿区",
			"Geo" : {
				"type" : "Point",
				"coordinates" : [
					139.70730369,
					35.69441442
				]
			},
			"Id" : "9f2a4af5341eafd497bf7f4bafed2779",
			"Zip" : "1600022",
			"AddressBloc" : "東京都新宿区新宿",
			"Address1" : "東京都",
			"Address2" : "新宿区",
			"Address3" : "新宿"
		}
	},
	"value" : {
		"FlowVolume" : 591,
		"FlowPathType" : "Normal"
	}
}
```

まず、最も多かったのは、歌舞伎町から新宿でした。trackIdよりも多いですから何回か動いている人がいます。

```
> printjson(records[1]);
{
	"flowPathId" : "9f2a4af5341eafd497bf7f4bafed2779_to_24c9d63131bf3ec840c07bde1fbd6e5b",
	"place" : {
		"from" : {
			"Name" : "新宿",
			"AddressCity" : "東京都新宿区",
			"Geo" : {
				"type" : "Point",
				"coordinates" : [
					139.70730369,
					35.69441442
				]
			},
			"Id" : "9f2a4af5341eafd497bf7f4bafed2779",
			"Zip" : "1600022",
			"AddressBloc" : "東京都新宿区新宿",
			"Address1" : "東京都",
			"Address2" : "新宿区",
			"Address3" : "新宿"
		},
		"to" : {
			"Name" : "歌舞伎町",
			"AddressCity" : "東京都新宿区",
			"Geo" : {
				"type" : "Point",
				"coordinates" : [
					139.70313811,
					35.69553109
				]
			},
			"Id" : "24c9d63131bf3ec840c07bde1fbd6e5b",
			"Zip" : "1600021",
			"AddressBloc" : "東京都新宿区歌舞伎町",
			"Address1" : "東京都",
			"Address2" : "新宿区",
			"Address3" : "歌舞伎町"
		}
	},
	"value" : {
		"FlowVolume" : 307,
		"FlowPathType" : "Normal"
	}
}
```

次に多かったのはその反対パターンでした。新宿から歌舞伎町への移動です。

```
> printjson(records[2]);
{
	"flowPathId" : "9f2a4af5341eafd497bf7f4bafed2779_to_de4a9ab9c48a9a290a1f790fcaf8632e",
	"place" : {
		"from" : {
			"Name" : "新宿",
			"AddressCity" : "東京都新宿区",
			"Geo" : {
				"type" : "Point",
				"coordinates" : [
					139.70730369,
					35.69441442
				]
			},
			"Id" : "9f2a4af5341eafd497bf7f4bafed2779",
			"Zip" : "1600022",
			"AddressBloc" : "東京都新宿区新宿",
			"Address1" : "東京都",
			"Address2" : "新宿区",
			"Address3" : "新宿"
		},
		"to" : {
			"Name" : "大久保",
			"AddressCity" : "東京都新宿区",
			"Geo" : {
				"type" : "Point",
				"coordinates" : [
					139.70477154,
					35.7037483
				]
			},
			"Id" : "de4a9ab9c48a9a290a1f790fcaf8632e",
			"Zip" : "1690072",
			"AddressBloc" : "東京都新宿区大久保",
			"Address1" : "東京都",
			"Address2" : "新宿区",
			"Address3" : "大久保"
		}
	},
	"value" : {
		"FlowVolume" : 248,
		"FlowPathType" : "Normal"
	}
}
```

さらに次は新宿から大久保への移動パターンでした。

以上のようにflowVolume形式でレコードを作ると有る条件を満たした移動パターンの旅行者が他にどのような移動パターンをとったかその頻度を付けて出力することができます。レコードにその頻度（FlowVolume）をつけ、from、toのGEO座業値やラベル名などを付けておくことで可視化ソフトなどで表示させることが可能となります。可視化についてはここでは説明を省きます。
