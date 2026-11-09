# code-skills 一键安装（Windows PowerShell）— 实际逻辑在 install.mjs
$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repo
node install.mjs @args
