@echo off
rem 一键启动脚本（Windows .bat）：在两个独立 PowerShell 窗口中启动 admin-ui 和 user-ui 的 Vite 开发服务器
rem 用法：
rem   双击或在 cmd 中运行：start-dev-servers.bat
rem   若要自动打开防火墙端口（需要管理员权限），运行：start-dev-servers.bat -OpenFirewall

setlocal enabledelayedexpansion

set BASEDIR=%~dp0

rem 检查 node 是否可用
node -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo Node.js 未检测到，请先安装并将 node 加入 PATH。
  pause
  exit /b 1
)

if not exist "%BASEDIR%admin-ui" (
  echo 未找到 %BASEDIR%admin-ui，請確認此腳本位於 frontend 目录下。
  pause
  exit /b 1
)
if not exist "%BASEDIR%user-ui" (
  echo 未找到 %BASEDIR%user-ui，請確認此腳本位於 frontend 目录下。
  pause
  exit /b 1
)

rem 如果 node_modules 不存在，则安装依赖
if not exist "%BASEDIR%admin-ui\node_modules" (
  echo 安装 admin-ui 依赖...
  pushd "%BASEDIR%admin-ui"
  npm install
  popd
)
if not exist "%BASEDIR%user-ui\node_modules" (
  echo 安装 user-ui 依赖...
  pushd "%BASEDIR%user-ui"
  npm install
  popd
)

rem 处理防火墙参数
set OPENFW=0
if /I "%1"=="-OpenFirewall" set OPENFW=1

if %OPENFW%==1 (
  echo 正在尝试添加防火墙规则（需要管理员权限）...
  netsh advfirewall firewall add rule name="Vite 5170" dir=in action=allow protocol=TCP localport=5170 profile=any >nul 2>&1
  if %ERRORLEVEL% neq 0 echo 无法添加端口 5170 规则（请以管理员身份运行）。
  netsh advfirewall firewall add rule name="Vite 5171" dir=in action=allow protocol=TCP localport=5171 profile=any >nul 2>&1
  if %ERRORLEVEL% neq 0 echo 无法添加端口 5171 规则（请以管理员身份运行）。
)

echo 在新窗口中启动 admin-ui (5171) 和 user-ui (5170)...

start "admin-ui" powershell -NoExit -Command "Set-Location -LiteralPath '%BASEDIR%admin-ui'; npm run dev -- --host --port 5171"
timeout /t 1 >nul
start "user-ui" powershell -NoExit -Command "Set-Location -LiteralPath '%BASEDIR%user-ui'; npm run dev -- --host --port 5170"

echo.
echo 启动完成。示例访问地址（当手机与电脑在同一局域网时）：
echo   用户端: http://192.168.31.75:5170
echo   管理端: http://192.168.31.75:5171
echo.
echo 注意：若手机无法访问，请确认防火墙已放通端口或以管理员权限运行此脚本添加规则，
echo 并确认开发服务器输出中包含 Network 地址（表示监听所有接口）。

endlocal
