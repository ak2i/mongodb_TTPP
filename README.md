# TrackId, TimeWindow, Place data Pair Framework sample data and query for MongoDB

## データの準備

以下のコマンドでローカルに立ち上げているMongoDBのDBインスタンス"TTPP"に二つのCollectionが生成されます。

```
$ cd <このプロジェクトのディレクトリ>
$ mongorestore dump
```

生成されるCollectionは以下の通り。

* marker : Geo JSONが付加された位置情報サンプルのセット
* ttpp_demo_model : TTPPデータ生成のためのモデルデータ

## TTPデータ、TTPPデータの生成

モデルデータを使ってダミーの人流を作ってTTP及びTTPPのデータを生成します。mongoシェルに実行させるクエリの形で実装されています。

```
$ cd <このプロジェクトのディレクトリ>
$ mongo TTPP script/createData.js
```

以下は上記生成データを使った処理です。結果は生成されたデータによって異なります。

## クエリを投げる

TTPデータ、TTPPデータを生成することで群流の解析クエリを実行することができます。以下のコマンドでmongoシェルに接続します。

```
$ mongo TTPP
```

以降の処理は全てmongoシェル上の操作です。

### TTPデータの例

どんなデータが入っているかを調べて見ましょう。findOneはcollectionに入っているドキュメントを一つ取り出します。ここでは無条件で取り出して見ましょう。

```
> db.track_demo.findOne()
{
	"_id" : ObjectId("59c21dbfe6dd9c5685a16f0d"),
	"placeName" : "南二条西",
	"placeAddressCity" : "北海道札幌市中央区",
	"placeGeo" : {
		"type" : "Point",
		"coordinates" : [
			141.34275426,
			43.05649734
		]
	},
	"placeId" : "bd5f00afad089c4c8be24582b5f261d8",
	"placeZip" : "0600062",
	"placeType" : "Marker.Hamlet.ZipArea.RepresentPoint",
	"placeAddressBloc" : "北海道札幌市中央区南二条西",
	"placeAddress1" : "北海道",
	"placeAddress2" : "札幌市中央区",
	"placeAddress3" : "南二条西",
	"trackId" : "c4ca4238a0b923820dcc509a6f75849b",
	"twDatetime" : ISODate("2017-04-28T15:00:00Z"),
	"twHour" : 0
}
```

北海道札幌市中央区南二条西にて検知されたtrackId c4ca4238a0b923820dcc509a6f75849bのデータが出ました。

placeで始まるプロパティは全て場所に関するものです。例えばplaceAddress1はこのサンプルでは都道府県名が入っています。

### どんな地域で検出されたかを調べる

生成されたTTPデータにはどんな地域のデータが入っているのでしょうか？distinctを使ってリストアップすることができます。placeAddress1（都道府県名）のフィールドを対象にdistinctクエリを投げてみましょう。

```
> db.track_demo.distinct("placeAddress1",{})
[
	"北海道",
	"東京都",
	"大阪府",
	"福岡県",
	"山形県",
	"滋賀県",
	"鹿児島県",
	"千葉県",
	"京都府",
	"広島県",
	"神奈川県",
	"長崎県",
	"埼玉県",
	"愛知県",
	"沖縄県",
	"熊本県"
]
```

日本全国にわたるデータではなかったようです。さらに市町村で調べることももちろんできます。placeAddress2を対象にしてみましょう。この時、検索条件としてplaceAddress1に東京都と入れると東京都内の市町村が出ます。

```
> db.track_demo.distinct("placeAddress2",{placeAddress1:"東京都"})
[
	"渋谷区",
	"中央区",
	"港区",
	"新宿区",
	"豊島区",
	"荒川区",
	"台東区",
	"千代田区",
	"目黒区",
	"武蔵野市",
	"文京区",
	"北区",
	"大田区",
	"江東区",
	"品川区",
	"杉並区",
	"墨田区"
]
```

### ある場所にいた人数を集計する

どんな地域で検知されたかがわかったら、今度はそこにどのくらいの人がいたのかを調べたいですよね。その場所で検知された人数を調べたい時はdistinctでtrackIdを対象にしてその出力配列の個数を取得します。場所の指定にはplaceAddress1とplaceAddress2の両方を指定しても良いですし、この二つを連結させた値が入っているplaceAddressCityを使っても良いです。

```
> db.track_demo.distinct("trackId",{placeAddressCity:"東京都渋谷区"}).length
29
```

どうせなら東京都内の各区のデータを出したいですね。もう少し複雑なクエリを投げてみましょう。mongoシェル上ではjavascriptの文法がほぼそのまま使えます。

```
> var list = [];
> var cities = db.track_demo.distinct("placeAddress2",{placeAddress1:"東京都"});
> cities.forEach(function(city){
... var count = db.track_demo.distinct("trackId",{placeAddress1:"東京都",placeAddress2:city}).length;
... list.push([city,count]);
... });
> list.sort(function(a,b){ return b[1] - a[1]; });
> list.forEach(function(ent){
... print( ent[0] + ':' + ent[1] );
... });
渋谷区:29
新宿区:26
豊島区:17
中央区:15
港区:15
千代田区:13
台東区:8
大田区:7
文京区:6
荒川区:5
北区:4
江東区:4
品川区:3
武蔵野市:2
目黒区:1
杉並区:1
墨田区:1
```

この例では東京都内の区に対して、それぞれの検出数を調べ、多い順に並び替えて出しています。

### どの時刻だったのかを調べる

createData.jsの例ではTTPエントリに時刻の数値であるtwHourがついています。これを使って、何時頃にいたのかがわかります。例えば東京都の渋谷区で検知された人々は何時頃にいたのか調べてみましょう。distinctでtwHourを対象にすることで取り出せます。

```
> db.track_demo.distinct("twHour",{placeAddressCity:"東京都渋谷区"})
[
	0,
	15,
	11,
	6,
	10,
	21,
	16,
	17,
	14,
	5,
	3,
	12,
	13,
	22,
	18,
	9,
	8,
	7,
	2,
	4
]
```

かなり広い範囲に分布しています。

### お昼頃に検知されたのはどこかを調べる

１２時に検知されたデータはどこで検知されているでしょうか。二段階処理になってしまいますが、twHourを使って場所を絞り込み、場所とtwHourで絞って件数を数えることで、お昼頃にどこでどのくらい検知されたかを一覧で見ることができます。

```
> var list = [];
> var cities = db.track_demo.distinct("placeAddressCity",{twHour:12});
> cities.forEach(function(city){
... var count = db.track_demo.distinct("trackId",{placeAddressCity:city, twHour:12}).length;
... list.push([city, count]);
... });
> list.sort(function(a,b){ return b[1] - a[1]; });
> list.forEach(function(ent){
... print( ent[0] + ':' + ent[1] );
... });
東京都港区:1
東京都大田区:1
東京都江東区:1
東京都千代田区:1
東京都中央区:1
東京都新宿区:1
東京都渋谷区:1
東京都豊島区:1
```

結果が少し寂しいですね。範囲を広げてみましょう。11時から14時までの間だとどうでしょう？twHourが11以上、14未満のケースです。

```
> var list = [];
> var cond = { twHour : { $gte : 11, $lt : 14 } };
> var cities = db.track_demo.distinct("placeAddressCity", cond);
> cities.forEach(function(city){
... cond.placeAddressCity = city;
... var count = db.track_demo.distinct("trackId",cond).length;
... list.push([city,count]);
... });
> list.sort(function(a,b){ return b[1] - a[1]; });
> list.forEach(function(ent){
... print( ent[0] + ':' + ent[1] );
... });
東京都渋谷区:4
東京都新宿区:4
東京都千代田区:3
東京都豊島区:3
東京都台東区:2
大阪府大阪市中央区:2
東京都中央区:2
東京都荒川区:1
東京都目黒区:1
千葉県成田市:1
東京都港区:1
東京都大田区:1
東京都江東区:1
大阪府吹田市:1
東京都文京区:1
大阪府大阪市浪速区:1
山形県山形市:1
福岡県福岡市博多区:1
北海道函館市:1
愛知県名古屋市中区:1
```

今度はより多くの情報が取り出せました。

### 曜日による検索を追加する

特定の曜日の検知を集計してみましょう。ただ、現状ではTTPエントリーには曜日の記述がありません。そこで新たにtwDayというプロパティを追加してしまいましょう。

```
> var days = ['日','月','火','水','木','金','土'];
> var cur = db.track_demo.find({});
> cur.forEach(function(doc){
... var twDay = days[doc.twDatetime.getDay()];
... doc.twDay = twDay;
... db.track_demo.save(doc);
... });
> db.track_demo.findOne({twDay:'日'});
{
	"_id" : ObjectId("59c21dc1e6dd9c5685a17912"),
	"placeName" : "吉祥寺本町",
	"placeAddressCity" : "東京都武蔵野市",
	"placeGeo" : {
		"type" : "Point",
		"coordinates" : [
			139.57705718,
			35.70663422
		]
	},
	"placeId" : "2a0976f9a493c20db93e624cd0742587",
	"placeZip" : "1800004",
	"placeType" : "Marker.Hamlet.ZipArea.RepresentPoint",
	"placeAddressBloc" : "東京都武蔵野市吉祥寺本町",
	"placeAddress1" : "東京都",
	"placeAddress2" : "武蔵野市",
	"placeAddress3" : "吉祥寺本町",
	"trackId" : "6512bd43d9caa6e02c990b0a82652dca",
	"twDatetime" : ISODate("2017-03-12T13:00:00Z"),
	"twHour" : 22,
	"twDay" : "日"
}  
> db.track_demo.createIndex({twDay:1});
{
	"createdCollectionAutomatically" : false,
	"numIndexesBefore" : 1,
	"numIndexesAfter" : 2,
	"ok" : 1
}
```

少し時間がかかってしまいますが、処理は簡単です。Date型オブジェクトには曜日の番号を返す関数getDay()がありますから、全部のTTPエントリーのtwDatetimeに関して曜日番号を取得し、対応する曜日名をtwDayプロパティとして追加し、保存します。最後に忘れずにインデックスを作っておきましょう。
