# 研究ノート

卒業研究の研究経過報告書と実験計画書を閲覧するための静的サイトです。GitHub Pagesへの公開先はリポジトリのルートです。トップページは `index.html` から `templates/index.html` を開きます。

## ディレクトリ

```text
cp_template/             非公開の原稿テンプレート
imgs/                    画像素材
static/css/style.css     共通スタイル
static/js/script.js      トップページのチェックリスト
templates/index.html     トップページ
templates/rpr/           研究経過報告書（Research Progress Report）
templates/ep/            実験計画書（Experimental Plan）
videos/                  動画素材
```

`cp_template` はPagesの公開成果物に含めない設定です。原稿テンプレート自体はリポジトリ内にあるため、リポジトリを閲覧できる人は取得できます。チェックリストの状態は利用中のブラウザーに保存され、別の端末やブラウザーとは共有されません。

## 報告書を追加する

1. `cp_template/cp_rpr.html`（研究経過報告書）または `cp_template/cp_ep.html`（実験計画書）を複製します。
2. 日付を `YYYY-MM-DD` 形式で入れ、`templates/rpr/rpr_YYYY-MM-DD.html` または `templates/ep/ep_YYYY-MM-DD.html` に保存します。
3. 日付、タイトル、氏名、本文を記入します。
4. 新しい記事へのリンクを `templates/index.html` の右側アーカイブに追加します。最新の研究経過報告書をトップに表示する場合は、トップのカード内容とリンクも更新します。
5. 追加分があるときはアーカイブの件数を更新します。

各記事の右側リンクはトップと同じ二段構成です。`cp_template` 内のリンクは、コピー後の `templates/ep/` または `templates/rpr/` を基準に設定しています。

## 公開

`.github/workflows/static.yml` が `main` ブランチへの push 時にGitHub Pagesへデプロイします。公開物は `index.html`、`templates/`、`static/`、`imgs/`、`videos/` から組み立て、`cp_template/` は含めません。
