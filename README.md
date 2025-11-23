# 前端项目说明

本仓库仅包含前端代码：`admin-ui`（管理后台）与 `user-ui`（用户端）。

## 目录结构
```
frontend/
  admin-ui/      管理后台 React + Ant Design + Vite
  user-ui/       用户端报名/签到 React + Ant Design + Vite
  功能说明.md     详细功能文档
```

## 技术栈
- React 18
- React Router 6
- Ant Design 5
- Vite 5
- Axios / dayjs

## 本地运行
分别进入两个子目录安装依赖并启动：
```powershell
cd admin-ui; npm install; npm run dev
cd ../user-ui; npm install; npm run dev
```

默认端口：
- 管理后台: http://localhost:5170
- 用户端: http://localhost:5171

## 构建产物
```powershell
cd admin-ui; npm run build
cd ../user-ui; npm run build
```
生成 `dist/` 目录，可放置到 Nginx / 静态服务器。

## 环境变量（可选）
如需调整后端 API 代理，在各自 `vite.config.js` 中修改代理目标。

## 常见命令
```powershell
# 依赖更新
npm install <package> --save

# 代码检查（如果配置 ESLint）
npm run lint
```

## 生产部署建议
1. 构建两个应用得到 `dist` 目录
2. Nginx 按路径或域名区分，例如：
   - admin.example.com -> admin-ui/dist
   - user.example.com  -> user-ui/dist
3. 配置 HTTPS 与缓存策略（静态资源使用较长缓存，HTML 低缓存）

## Git 使用
此目录作为独立仓库，仅提交前端相关文件；`node_modules`、`dist` 已通过 `.gitignore` 忽略。

## 授权与安全
请勿在前端提交敏感密钥；运行时密钥应从后端接口获取或采用环境变量注入构建过程。

---
如需增加活动详情页或兼容旧链接，可在 `user-ui/src/App.jsx` 加路由并补充文档。
