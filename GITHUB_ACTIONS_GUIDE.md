# 咔嚓 App - GitHub Actions 自动构建指南

## 第一步：在 GitHub 创建新仓库

1. 打开 https://github.com/new
2. 仓库名填 `kacha-app`
3. **不要**勾选 "Initialize this repository with a README"（保持空仓库）
4. 点击 "Create repository"

## 第二步：推送代码到 GitHub

在你电脑上打开 **PowerShell 或 CMD**，执行：

```bash
# 进入项目目录
cd C:\Users\yule\WorkBuddy\20260503120703\kacha-app

# 初始化 git（如果还没有）
git init

# 添加所有文件
git add .

# 首次提交
git commit -m "Initial commit: 咔嚓App v3.3"

# 关联远程仓库（把 YOUR_USERNAME 换成你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/kacha-app.git

# 推送（会要求输入用户名和密码，密码填你的 Token）
git push -u origin main
```

> **注意**：如果提示分支名是 `master` 不是 `main`，把最后一行改成 `git push -u origin master`

## 第三步：下载 GitHub Token

如果还没有 Token，去这里生成一个（需要 `repo` 权限）：
https://github.com/settings/tokens/new

勾选：
- ✅ **repo**（完整仓库权限）
- ✅ **workflow**（允许 Actions 运行）

生成后**立即复制保存**（只显示一次）

## 第四步：推送时认证

`git push` 时会弹窗或提示输入密码：
- 用户名：你的 GitHub 用户名
- 密码：**粘贴你的 Token**（不是 GitHub 登录密码）

## 第五步：等待自动构建

推送成功后：
1. 打开你的仓库页面
2. 点击 **Actions** 标签页
3. 你会看到 "Build Android APK" 工作流正在运行
4. 等待约 **5-10 分钟**

## 第六步：下载 APK

构建完成后：
1. 在 Actions 页面点击刚才的运行记录
2. 滚动到页面底部 **Artifacts** 区域
3. 下载以下文件：
   - `app-debug-apk` → `app-debug.apk`（调试版，可直接安装）
   - `app-release-unsigned-apk` → `app-release-unsigned.apk`（发布版，需签名）

## 常见问题

**Q: `git push` 被拒绝？**
A: 确认 Token 有 `repo` 权限，且用户名/Token 输入正确。

**Q: Actions 运行失败？**
A: 点击失败的 workflow run，查看 Logs 找出错步骤。常见问题：Node.js 版本不兼容、依赖安装失败等。

**Q: 构建成功但找不到 APK？**
A: 在 Artifacts 区域，可能需要展开才能看到下载链接。
