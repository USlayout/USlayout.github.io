# 研究ノート

卒業研究の研究経過報告書と実験計画書を閲覧するための静的サイトです。GitHub Pagesへの公開先はリポジトリのルートです。トップページは `index.html` から `templates/index.html` を開きます。

## ディレクトリ

```text
cp_template/             非公開の原稿テンプレート
imgs/                    画像素材
static/css/style.css     共通スタイル
static/js/script.js      トップページのチェックリスト
templates/index.html     トップページ
templates/research_paper.html 参考論文リンク集
templates/rpr/           研究経過報告書（Research Progress Report）
templates/ep/            実験計画書（Experimental Plan）
templates/scripts/       実験スクリプトとコード表示ページ
templates/scripts/archive/ 旧スクリプトの保管場所
videos/                  動画素材
```

`cp_template` はPagesの公開成果物に含めない設定です。原稿テンプレート自体はリポジトリ内にあるため、リポジトリを閲覧できる人は取得できます。チェックリストの状態は利用中のブラウザーに保存され、別の端末やブラウザーとは共有されません。

## 報告書を追加する

1. `cp_template/cp_rpr.html`（研究経過報告書）または `cp_template/cp_ep.html`（実験計画書）を複製します。
2. 日付を `YYYY-MM-DD` 形式で入れ、`templates/rpr/rpr_YYYY-MM-DD.html` または `templates/ep/ep_YYYY-MM-DD.html` に保存します。
3. 日付、タイトル、氏名、本文を記入します。
4. 新しい記事を `rpr_YYYY-MM-DD.html` の名前で保存します。Pagesの公開時に日付順の一覧を自動生成し、トップページに最新報告書を表示します。実験計画書は `ep_YYYY-MM-DD` で始まる名前にします。
5. 追加分があるときはアーカイブの件数を更新します。

各記事の右側リンクはトップと同じ二段構成です。`cp_template` 内のリンクは、コピー後の `templates/ep/` または `templates/rpr/` を基準に設定しています。

## 論文・スクリプトを追加する

- 参考文献は `templates/research_paper.html` の `literature-item` を複製して、タイトル・説明・URLを追加します。
- 現行の `.sh` や `.conf` は `templates/scripts/` に置き、`templates/scripts/index.html` にコード表示カードを追加します。コード本文はファイルから読み込み、画面ではテキストとして表示します。
- 古い版は `templates/scripts/archive/` に移し、`templates/scripts/archive/index.html` から閲覧できるようにします。

## 公開

`.github/workflows/static.yml` が `main` ブランチへの push 時にGitHub Pagesへデプロイします。公開物は `index.html`、`templates/`、`static/`、`imgs/`、`videos/` から組み立て、`cp_template/` は含めません。

公開時には `scripts/build-pages.mjs` が日付付きHTMLを走査して一覧を生成します。`rpr_YYYY-MM-DD.html` を追加してpushすると、トップページ本文と各ページの右側一覧が最新日付に自動で切り替わります。ローカルでページを確認する場合は、静的サーバーを起動する前に `node scripts/build-pages.mjs .` を実行して一覧を更新してください。
