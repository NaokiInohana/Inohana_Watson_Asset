
全文検索から自然文検索にするための手順。

自分のPC作業
1.任意のフォルダでターミナルを開き、2のコマンドを入力
2.git clone https://github.com/NaokiInohana/Inohana_Watson_Asset

ブラウザ作業
3.https://console.bluemix.net/openwhisk/actions にアクセス
4.[discovery]を開きそこに記載されているコードを、手順1,2によって作成された[discovery.js]のコードに書き換える。
5.左メニューからランタイムを開き、Node.js 8に変更する

以上です。
