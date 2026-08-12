# refactor/ponytail-cleanup
## Overview
Describe the purpose of this branch here.
--- START GIT LOG ---

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
