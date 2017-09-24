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

以下の各チュートリアルにあるクエリを実行してみましょう。

[TTPチュートリアル](doc/tutorial_TTP.md)
