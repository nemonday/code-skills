#!/usr/bin/env bash
# code-skills 一键安装（macOS / Linux）— 实际逻辑在 install.mjs
cd "$(dirname "$0")"
exec node install.mjs "$@"
