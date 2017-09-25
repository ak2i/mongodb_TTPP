# TrackId, TimeWindow, Place data Pair Framework sample data and query for MongoDB

本マテリアル集（スクリプト集）は人流解析などに使えるデータ構造TTPPを実際にMongoDB上で体験するためのシミュレーションデータ生成スクリプトとサンプルクエリのセットとなります。TTPPそのものについては以下のスライドをご覧下さい。

[SlideShare: Wi-Fiのassociation logを用いた人流解析にMongoDB使ってみた](https://www.slideshare.net/secret/byDZJzlwVu1IXy)

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

ただし、以下のチュートリアルでは上記のスクリプトで生成される100人では無く、10000人を使って生成した例が掲載されています。また、途中でプロパティの追加しており、そのプロパティ追加を反映したスクリプトをそれぞれ用意してあります。

* createData-fin.js  データ生成
* createIndex-fin.js  インデクス生成

また、シミュレーションの人数などは調整可能です。大きなものにしたらその分処理時間がかかります。createData-fin.jsの先頭部分の以下の数字などを変更してみましょう。

* ```var users = 100;``` 検知されるユーザーの人数
* ```var maxHours = 24;```　それぞれのユーザーの1回の旅程の最大時間
* ```var startDate = new Date('2017/03/01 00:00:00');```　対象となる日時の開始時点
* ```var rangeHours = 24 * 30 * 3;```　ユーザーの旅程の開始時点の範囲（上記のstartDate以降この時間の範囲のランダムな時点をとります）

## クエリを投げる

TTPデータ、TTPPデータを生成することで群流の解析クエリを実行することができます。以下のコマンドでmongoシェルに接続します。

```
$ mongo TTPP
```

以下の各チュートリアルにあるクエリを実行してみましょう。

[TTPチュートリアル](doc/tutorial_TTP.md)
[TTPPチュートリアル](doc/tutorial_TTPP.md)
