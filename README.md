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

また、作られたデータにインデックスを貼っておきます。

```
$ mongo TTPP script/createIndex.js
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
	"京都府",
	"兵庫県",
	"北海道",
	"千葉県",
	"埼玉県",
	"大分県",
	"大阪府",
	"奈良県",
	"宮城県",
	"宮崎県",
	"山形県",
	"山梨県",
	"岐阜県",
	"岡山県",
	"広島県",
	"愛知県",
	"東京都",
	"沖縄県",
	"滋賀県",
	"熊本県",
	"神奈川県",
	"福岡県",
	"群馬県",
	"茨城県",
	"長崎県",
	"長野県",
	"青森県",
	"静岡県",
	"香川県",
	"鹿児島県"
]
```

日本全国にわたるデータではなかったようです。さらに市町村で調べることももちろんできます。placeAddress2を対象にしてみましょう。この時、検索条件としてplaceAddress1に東京都と入れると東京都内の市町村が出ます。

```
> db.track_demo.distinct("placeAddress2",{placeAddress1:"東京都"})
[
	"千代田区",
	"台東区",
	"荒川区",
	"文京区",
	"杉並区",
	"中央区",
	"豊島区",
	"渋谷区",
	"新宿区",
	"港区",
	"江戸川区",
	"江東区",
	"大田区",
	"北区",
	"世田谷区",
	"武蔵野市",
	"墨田区",
	"品川区",
	"中野区",
	"立川市",
	"目黒区",
	"葛飾区"
]
```

### ある場所にいた人数を集計する

どんな地域で検知されたかがわかったら、今度はそこにどのくらいの人がいたのかを調べたいですよね。その場所で検知された人数を調べたい時はdistinctでtrackIdを対象にしてその出力配列の個数を取得します。場所の指定にはplaceAddress1とplaceAddress2の両方を指定しても良いですし、この二つを連結させた値が入っているplaceAddressCityを使っても良いです。

```
> db.track_demo.distinct("trackId",{placeAddressCity:"東京都渋谷区"}).length
246
```

どうせなら東京都内の各区のデータを出したいですね。もう少し複雑なクエリを投げてみましょう。mongoシェル上ではjavascriptの文法がほぼそのまま使えます。

```javascript
var list = [];
var cities = db.track_demo.distinct("placeAddress2",{placeAddress1:"東京都"});
cities.forEach(function(city){
 var count = db.track_demo.distinct("trackId",{placeAddress1:"東京都",placeAddress2:city}).length;
 list.push([city,count]);
});
list.sort(function(a,b){ return b[1] - a[1]; });
list.forEach(function(ent){
 print( ent[0] + ':' + ent[1] );
});
```

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
渋谷区:246
新宿区:209
港区:147
豊島区:146
中央区:116
千代田区:113
台東区:85
大田区:74
文京区:44
江東区:42
北区:32
荒川区:29
品川区:20
墨田区:10
杉並区:6
世田谷区:5
武蔵野市:4
目黒区:4
葛飾区:3
江戸川区:2
中野区:2
立川市:2
```

この例では東京都内の区に対して、それぞれの検出数を調べ、多い順に並び替えて出しています。

### どの時刻だったのかを調べる

createData.jsの例ではTTPエントリに時刻の数値であるtwHourがついています。これを使って、何時頃にいたのかがわかります。例えば東京都の渋谷区で検知された人々は何時頃にいたのか調べてみましょう。distinctでtwHourを対象にすることで取り出せます。

```
> db.track_demo.distinct("twHour",{placeAddressCity:"東京都渋谷区"})
[
	10,
	7,
	23,
	8,
	4,
	9,
	16,
	13,
	0,
	5,
	11,
	19,
	20,
	18,
	12,
	2,
	1,
	6,
	15,
	22,
	14,
	17,
	21,
	3
]
```

かなり広い範囲に分布しています。

### お昼頃に検知されたのはどこかを調べる

１２時に検知されたデータはどこで検知されているでしょうか。二段階処理になってしまいますが、twHourを使って場所を絞り込み、場所とtwHourで絞って件数を数えることで、お昼頃にどこでどのくらい検知されたかを一覧で見ることができます。

```javascript
var list = [];
var cities = db.track_demo.distinct("placeAddressCity",{twHour:12});
cities.forEach(function(city){
 var count = db.track_demo.distinct("trackId",{placeAddressCity:city, twHour:12}).length;
 list.push([city,count]);
});
list.sort(function(a,b){ return b[1] - a[1]; });
list.forEach(function(ent){
 print( ent[0] + ':' + ent[1] );
});
```

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
東京都新宿区:12
東京都渋谷区:10
大阪府大阪市中央区:8
東京都港区:6
東京都台東区:6
東京都中央区:5
東京都千代田区:5
大阪府大阪市浪速区:4
東京都大田区:4
東京都豊島区:3
東京都北区:3
滋賀県大津市:3
北海道札幌市中央区:3
東京都文京区:2
福岡県福岡市博多区:2
北海道札幌市白石区:2
大阪府大阪市天王寺区:2
広島県広島市中区:1
大阪府大阪市北区:1
埼玉県新座市:1
京都府京都市下京区:1
大阪府大阪市西成区:1
神奈川県横浜市鶴見区:1
奈良県奈良市:1
北海道旭川市:1
東京都杉並区:1
千葉県成田市:1
兵庫県神戸市中央区:1
福岡県北九州市小倉北区:1
東京都江東区:1
北海道千歳市:1
北海道札幌市手稲区:1
東京都荒川区:1
京都府京都市中京区:1
大阪府大阪市阿倍野区:1
北海道函館市:1
```

結果が少し寂しいですね。範囲を広げてみましょう。11時から14時までの間だとどうでしょう？twHourが11以上、14未満のケースです。

```javascript
var list = [];
var cond = { twHour : { $gte : 11, $lt : 14 } };
var cities = db.track_demo.distinct("placeAddressCity",cond);
cities.forEach(function(city){
 cond.placeAddressCity = city;
 var count = db.track_demo.distinct("trackId",cond).length;
 list.push([city,count]);
});
list.sort(function(a,b){ return b[1] - a[1]; });
list.forEach(function(ent){
 print( ent[0] + ':' + ent[1] );
});
```

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
東京都渋谷区:31
東京都新宿区:30
東京都港区:24
大阪府大阪市中央区:22
東京都豊島区:20
東京都千代田区:15
大阪府大阪市浪速区:13
東京都中央区:12
東京都台東区:9
北海道札幌市中央区:9
東京都大田区:9
福岡県福岡市博多区:7
東京都文京区:6
大阪府大阪市天王寺区:5
東京都北区:5
滋賀県大津市:5
大阪府大阪市北区:4
埼玉県新座市:4
北海道函館市:4
北海道札幌市白石区:4
東京都荒川区:3
京都府京都市下京区:3
北海道札幌市北区:3
大阪府大阪市阿倍野区:3
福岡県福岡市中央区:3
愛知県名古屋市中村区:3
東京都江東区:3
大阪府大阪市西成区:2
北海道千歳市:2
北海道札幌市手稲区:2
北海道旭川市:2
千葉県成田市:2
兵庫県神戸市中央区:2
東京都世田谷区:1
福岡県太宰府市:1
鹿児島県霧島市:1
沖縄県那覇市:1
群馬県吾妻郡草津町:1
沖縄県豊見城市:1
東京都葛飾区:1
愛知県長久手市:1
岡山県岡山市北区:1
広島県広島市中区:1
神奈川県横浜市鶴見区:1
奈良県奈良市:1
東京都杉並区:1
福岡県北九州市小倉北区:1
京都府京都市中京区:1
大分県由布市:1
神奈川県横浜市中区:1
長野県北佐久郡軽井沢町:1
東京都武蔵野市:1
大阪府泉佐野市:1
沖縄県中頭郡北谷町:1
東京都墨田区:1
京都府京都市南区:1
千葉県千葉市美浜区:1
```

今度はより多くの情報が取り出せました。

### 曜日による検索を追加する

特定の曜日の検知を集計してみましょう。ただ、現状ではTTPエントリーには曜日の記述がありません。そこで新たにtwDayというプロパティを追加してしまいましょう。

```javascript
var days = ['日','月','火','水','木','金','土'];
var cur = db.track_demo.find({});
cur.forEach(function(doc){
 var twDay = days[doc.twDatetime.getDay()];
 doc.twDay = twDay;
 db.track_demo.save(doc);
});
db.track_demo.findOne({twDay:'日'});
db.track_demo.createIndex({twDay:1});
```

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
	"_id" : ObjectId("59c36690fbb6a68781d5ea66"),
	"placeName" : "神田岩本町",
	"placeAddressCity" : "東京都千代田区",
	"placeGeo" : {
		"type" : "Point",
		"coordinates" : [
			139.77493759,
			35.69554387
		]
	},
	"placeId" : "d80b426245e50297ec9c571700b9940b",
	"placeZip" : "1010033",
	"placeType" : "Marker.Hamlet.ZipArea.RepresentPoint",
	"placeAddressBloc" : "東京都千代田区神田岩本町",
	"placeAddress1" : "東京都",
	"placeAddress2" : "千代田区",
	"placeAddress3" : "神田岩本町",
	"trackId" : "c4ca4238a0b923820dcc509a6f75849b",
	"twDatetime" : ISODate("2017-04-30T08:00:00Z"),
	"twHour" : 17,
	"twDay" : "日"
}
> db.track_demo.createIndex({twDay:1});
{
	"createdCollectionAutomatically" : false,
	"numIndexesBefore" : 13,
	"numIndexesAfter" : 14,
	"ok" : 1
}
```

少し時間がかかってしまいますが、処理は簡単です。Date型オブジェクトには曜日の番号を返す関数getDay()がありますから、全部のTTPエントリーのtwDatetimeに関して曜日番号を取得し、対応する曜日名をtwDayプロパティとして追加し、保存します。最後に忘れずにインデックスを作っておきましょう。

### Geo検索で大手町の半径1000m以内にいた人を数える

```javascript
var om = db.marker.findOne({placeAddress1:"東京都",placeAddress2:"千代田区",placeAddress3:"大手町"});
db.track_demo.distinct("trackId",{
 placeGeo : {
  $near : {
   $geometry : om.placeGeo,
   $maxDistance : 1000 }}}
).length;
```

```
> var om = db.marker.findOne({placeAddress1:"東京都",placeAddress2:"千代田区",placeAddress3:"大手町"});
> db.track_demo.distinct("trackId",{
...  placeGeo : {
...   $near : {
...    $geometry : om.placeGeo,
...    $maxDistance : 1000 }}}
... ).length;
63
```
