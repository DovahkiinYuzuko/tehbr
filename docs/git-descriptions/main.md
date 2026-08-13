---
type: Log
description: Git branch history and commit log summary for main branch.
tags:
  - "@meta"
  - "@git"
---

# main
## Overview
Describe the purpose of this branch here.
--- START GIT LOG ---

### `acafe35`
- **Date:** 2026-08-13 13:07:04
- **Commit Message:** [chore] クリップボードビルド成果物およびGitログドキュメントの最新化同期
- **Constraint:** TypeScriptビルド成果物(dist/utils/clipboard.js)およびGitログ記述(docs/git-descriptions/main.md)の完全整合
- **Rejected:** 未コミットのビルド成果物およびログドキュメントの残留
- **Chosen:** dist/utils/clipboard.jsおよびmain.mdの同期コミットとリモートPush

### `54d47d2`
- **Date:** 2026-08-13 07:36:08
- **Commit Message:** [fix] npm Provenance改ざん検証パスのためpackage.jsonにrepository情報を追加
- **Constraint:** npm Trusted PublishingにおけるProvenance(Sigstore検証署名)の必須メタデータ定義
- **Rejected:** repository.url欠落による422 Unprocessable Entityエラーの発生
- **Chosen:** package.jsonへのrepository定義追加によるProvenance検証の完全成功

### `9dbb7f8`
- **Date:** 2026-08-13 07:34:51
- **Commit Message:** [fix] npm Trusted Publishing(OIDC)完全準拠のためNode 22.xおよびnpm@latest更新ステップを適用
- **Constraint:** npm Trusted Publishing要件(Node 22.14.0+およびnpm 11.5.1+)の遵守
- **Rejected:** 古いnpm CLIバージョンにおけるOIDC自動認証未対応およびENEEDAUTHエラーの発生
- **Chosen:** Node.js 22.x指定・registry-url設定・npm@latest導入によるOIDC自動公開の実現

### `1520d59`
- **Date:** 2026-08-13 07:33:09
- **Commit Message:** [fix] OIDC Trusted Publishingにおける.npmrc干渉回避のためsetup-nodeのregistry-url設定を削除
- **Constraint:** Trusted Publishing (OIDC)における環境変数干渉の排除および自動認証フローの完全動作
- **Rejected:** setup-nodeのregistry-url記述による空トークン.npmrc生成および404認証エラーの発生
- **Chosen:** setup-nodeからのregistry-url削除および標準npm publishコマンドの適用

### `c6e8ac0`
- **Date:** 2026-08-13 07:29:13
- **Commit Message:** [fix] Linux headless環境におけるxclipの永久ハング防止ガードの追加
- **Constraint:** execSync/spawnSyncにおけるtimeoutおよび終了ステータスチェックの必須化
- **Rejected:** timeout指定のないxclip呼び出しによるheadless Linux/xvfb環境での無限フリーズ
- **Chosen:** timeout: 2000msの追加およびstatus != 0時のフォールバック処理の実装

### `6fc7d9d`
- **Date:** 2026-08-13 07:20:59
- **Commit Message:** [fix] CIハング防止のためテストランナー(test_runner.ts)成功時にprocess.exit(0)を明示呼び出し
- **Constraint:** ヘッドレスLinux CI環境における非同期ハンドルの残留によるプロセスハングの防止
- **Rejected:** 成功時にprocess.exit(0)を省略することによる無限待機・CIタイムアウトの発生
- **Chosen:** runTestsの末尾にてprocess.exit(0)を明示的に呼び出しテストプロセスを確実に終了

### `1548d82`
- **Date:** 2026-08-13 06:38:02
- **Commit Message:** [feat] v0.1.1 パッケージ更新とTrusted Publishing自動リリースワークフローの適用
- **Constraint:** npmパッケージ配布物へのNOTICE.mdライセンスファイルの同梱およびOIDC認証許可の記述
- **Rejected:** NOTICE.mdの欠落およびTrusted Publishing時のid-tokenパーミッション未設定による認証失敗
- **Chosen:** package.jsonへのNOTICE.md定義追加・バージョン0.1.1更新およびrelease.ymlのid-token:write設定適用

### `b0df65a`
- **Date:** 2026-08-13 06:30:38
- **Commit Message:** [fix] npmパッケージ名をスコープ付き@yuzuko_underson/tehbrに変更
- **Constraint:** npmレジストリにおける既存パッケージ名(tebs)との類似重複回避ルールの遵守
- **Rejected:** 単独名tehbrの使用による403 Forbiddenパブリッシュエラーの発生
- **Chosen:** @yuzuko_underson/tehbrへのパッケージ名変更およびREADMEドキュメントの同期

### `10abcd7`
- **Date:** 2026-08-13 06:12:53
- **Commit Message:** [chore] .gitignoreの最適化およびテストランナー仕様書の行数更新
- **Constraint:** .gitignoreフラグメント整理の適用および最新実装コードと仕様書ドキュメント行数の完全整合
- **Rejected:** 一時ファイルや未整理フラグメントの残留および仕様書行数の乖離
- **Chosen:** .gitignoreの統合記述と仕様書(test_runner.md)の行数範囲同期

### `2552057`
- **Date:** 2026-08-13 06:00:12
- **Commit Message:** [fix] CIマトリックスからNode.js 18.xを除外し20.x/22.xに統一
- **Constraint:** string-width@8依存におけるRegExp /vフラグ(Unicode Sets)のNode 20+動作要件遵守
- **Rejected:** Node.js 18.xにおけるV8構文エラー SyntaxError: Invalid regular expression flags
- **Chosen:** CIマトリックスの対象バージョンを[20.x, 22.x]へ変更

### `8709ca0`
- **Date:** 2026-08-13 05:56:19
- **Commit Message:** [fix] CIおよびReleaseワークフローのLinuxクリップボード環境対策
- **Constraint:** ヘッドレスLinux CI環境における全テストケースの合格保証
- **Rejected:** xclip/xvfbの未定義および無防備なクリップボード例外によるビルド失敗
- **Chosen:** ci.yml/release.ymlへのxclip・xvfb依存追加、xvfb-run経由でのテスト実行、test_runnerへの環境ガード実装

### `7a1a246`
- **Date:** 2026-08-13 05:43:29
- **Commit Message:** [docs] Update main branch git log description for README
- **Description:** None

### `61275d5`
- **Date:** 2026-08-13 05:43:09
- **Commit Message:** [docs] README.mdおよびRelease自動化ワークフローの作成
- **Constraint:** 実際のコード挙動と完全に合致したバイリンガルドキュメントの記述
- **Rejected:** 乖離のあるオプション説明およびアスキーアート図表現
- **Chosen:** 乖離箇所全件修正、Mermaidダイアグラム導入、GitHub npm install標準構文の適用

### `1ad295a`
- **Date:** 2026-08-13 05:31:14
- **Commit Message:** [fix]LICENSE.MIT
- **Description:** None

### `32aa5d1`
- **Date:** 2026-08-13 05:27:50
- **Commit Message:** [feat]Clipboard
- **Description:** None

### `c59fc39`
- **Date:** 2026-08-13 05:27:34
- **Commit Message:** [docs] Update main branch git log description
- **Description:** None

### `8ceb48f`
- **Date:** 2026-08-13 05:27:20
- **Commit Message:** [docs] サードパーティオープンソース通知ファイル (NOTICE.md) の作成
- **Constraint:** サードパーティ著作権・ライセンス通知フォーマットの準拠
- **Rejected:** NOTICE.mdの未作成および著作権情報の欠落
- **Chosen:** 役割別カテゴリ分類に従ったNOTICE.mdの生成と登録

### `f77a2a3`
- **Date:** 2026-08-13 05:21:42
- **Commit Message:** [docs] update git branch log descriptions
- **Description:** None

### `506d7f2`
- **Date:** 2026-08-13 05:20:06
- **Commit Message:** [feat] CI環境およびビルド・ドキュメントGit構成の整備
- **Constraint:** npm install時の自動コンパイル保証とリポジトリの清潔性の維持
- **Rejected:** dist/のGit直接管理およびテストログ・ビルド用設定の追跡漏れ
- **Chosen:** gitignoreホワイトリスト再構成、package.jsonへのprepare/files設定の追加、GitHub Actions CIワークフローの構築

### `d8a8326`
- **Date:** 2026-08-13 05:07:19
- **Commit Message:** [refactor] 不要なFSMの削除およびコード重複の解消
- **Constraint:** シンプルな変換CLIにおける保守性と可読性の最大化
- **Rejected:** 空のFSMクラスの維持およびパーサー・ジェネレーター・フォーマット検出の個別実装
- **Chosen:** FSMクラスの全廃、デリミタ引数化によるパーサー/ジェネレーター統合、拡張子判定関数の共通化

### `5c26082`
- **Date:** 2026-08-13 04:45:08
- **Commit Message:** [refactor] 完全動的レジストリ・ゼロハードコードOS言語照合アーキテクチャの完成
- **Description:** detectOSLocale のハードコード 8 言語 if 分岐を全廃し、ディレクトリスキャン結果に対する 3 段階優先度動的マッチングへ短縮。parsers/generators をレジストリマップオブジェクトへ移行し、拡張子判定を EXT_TO_FORMAT_MAP 辞書へ完全動的化。

### `46dc095`
- **Date:** 2026-08-13 04:39:31
- **Commit Message:** [refactor] 動的ロケール検出 (Dynamic Locale Discovery) アーキテクチャへの刷新 (i18n)
- **Description:** ソースコード内の SUPPORTED_LOCALES ハードコード定数を全廃。各 locales/*.json の meta セクションをファイルシステム走査 (fs.readdirSync) で動的に自動検出・読み込みするプラガブルな構造へリファクタリング。

### `b8cb2e9`
- **Date:** 2026-08-13 02:51:57
- **Commit Message:** [feat] OS言語自動認識・--lang切り替え・主要8言語ロケールの追加 (i18n)
- **Description:** OS言語自動検出 (LANG/LC_ALL/Intl)、デフォルトenフォールバック、CLI --lang <locale> / --list-locales オプションを追加。zh-CN, zh-TW, es, de, fr, ko 主要ロケールファイルを新設。

### `20349e9`
- **Date:** 2026-08-13 02:45:32
- **Commit Message:** [fix] 不正/未対応エンコーディング指定時エラーハンドリングおよび異常系テストの追加 (Test 18)
- **Description:** iconv.encodingExists バリデーションを追加し、未対応文字コード名指定時に親切なエラーメッセージを返却。破壊バイト列/ヌルバイト入力の異常系テスト (Test 18) を追加。

### `15f6d50`
- **Date:** 2026-08-13 02:42:35
- **Commit Message:** [feat] 多言語入力エンコーディング対応 (-e, --encoding) の追加 (TASK-11)
- **Description:** iconv-lite による Shift_JIS, EUC-JP, GBK, Big5, EUC-KR, Windows-1252, UTF-16 等の多言語入力バイナリの UTF-8 デコード変換機能 (-e, --encoding <name>) を追加。
- **Constraint:** デフォルトは決定論的 UTF-8 (BOM 自動認識付き) とし、他エンコーディングは -e / --encoding オプションで明示指定。
- **Chosen:** 特定言語の個別特化処理を避け、OSS グローバル仕様の汎用エンコーディング変換設計を採用。

### `119fe15`
- **Date:** 2026-08-13 02:30:24
- **Commit Message:** [feat] 大容量データ Streaming 変換機能 (--stream) の追加 (TASK-10)
- **Description:** node:stream/promises パイプラインおよび Transform ストリームによる O(1) 空間複雑度の低メモリ大容量ファイル変換モード (--stream) を追加。
- **Constraint:** バックプレッシャー自動制御により数GBクラスのCSV/TSV/JSON/SQL直接パイプライン変換に対応。
- **Chosen:** 全行桁揃え事前走査を要する Markdown/HTML 指定時は安全に一括処理モードへフォールバック。

### `d1e856c`
- **Date:** 2026-08-13 02:23:29
- **Commit Message:** [feat] クリップボード直接連携機能 (-c, --clip) の追加 (TASK-09)
- **Description:** OS標準コマンド (PowerShell, pbpaste/pbcopy, xclip/xsel/wl-copy) による外部ライブラリ依存ゼロのシステムクリップボード自動読み書き機能 (-c, --clip) を追加。
- **Constraint:** 入力省略時かつ-c指定時にクリップボードから自動読み込み。出力省略時かつ-c指定時にクリップボードへ自動書き込み。
- **Chosen:** ノン・サードパーティOSコマンド連携によるシンプル・堅牢なクロスプラットフォーム設計を採用。

### `ff50332`
- **Date:** 2026-08-13 02:01:04
- **Commit Message:** [feat] JSON (オブジェクト配列) および SQL Generator の追加 (v0.3.0)
- **Description:** JSONフォーマット (オブジェクト配列 <-> TehbrIR) の双方向パース・生成機能、および ANSI SQL 準拠の CREATE TABLE / INSERT INTO ステートメント生成機能を追加。
- **Constraint:** JSONパース時は数値をString()で文字列化し、キー不揃い時は全キーの和集合構築と空文字パディングを実施。SQLは一方向変換のみとし型推論を行わない。
- **Rejected:** Excel (.xlsx) および LaTeX 対応案、疑似SQLエンジン案、HFSM導入案を却下。
- **Chosen:** フラットな CLIFSM を継続使用し、単一目的の表形式フォーマット変換機能に特化。

### `b7944be`
- **Date:** 2026-08-12 16:22:23
- **Commit Message:** [feat] rokeeruライブラリを導入しi18n国際化構造を適用
- **Description:** 自作i18nライブラリ rokeeru (RokeeruLoader) を導入し、locales/en.json および ja.json による動的メッセージ管理構造を構築。CLIメッセージを t(...) 参照へ移行。
- **Constraint:** Prohibition of Hardcoded Text (Internationalization) ルールを遵守し、対面メッセージの直書きを排除すること。
- **Rejected:** 静的プロパティによるインポート管理案を却下し、RokeeruLoaderによる動的ディレクトリ走査・フォールバック管理構造を採用。
- **Chosen:** src/i18n/ モジュールを新設し、txthc スキャンで検出ゼロを検証。docs/using-library/lib-WH.md にライセンス情報を記録。

### `9b4d7bb`
- **Date:** 2026-08-12 16:13:08
- **Commit Message:** [feat] CLIモジュールおよびインタラクティブモードの追加と仕様書の適用
- **Description:** src/cli/ モジュールを追加し、仕様書・タグインデックスおよび整合性監査レポートを完全同期。
- **Constraint:** hardcoded text（ハードコード文字列）を極力抑え、FSMおよび型安全性を担保すること。
- **Rejected:** コマンドライン引数パーサーの直書きを却下し、CommanderモジュールとFSM状態遷移をカプセル化。
- **Chosen:** src/cli/index.ts および interactive.ts をモジュール化してコミット。

### `2c152cd`
- **Date:** 2026-08-12 16:12:28
- **Commit Message:** [feat] 初期実装と仕様書ドキュメントの同期
- **Description:** tehbr CLIおよびパーサー・ジェネレーターの初期実装と仕様書群の整合性を同期。
- **Constraint:** システムプロンプトおよびプロジェクト定義ルールに従い仕様書とコードのシンボル不一致を解消すること。
- **Rejected:** 実装に存在しない関数（isBunAvailable等）をダミー実装として追加する案を却下し、仕様書側を実態に合わせる方針を採用。
- **Chosen:** docs/variables'n'functions/ のドキュメントを修正し、監査レポートの不一致を解消。
