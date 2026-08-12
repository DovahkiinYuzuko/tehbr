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
