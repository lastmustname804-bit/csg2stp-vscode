# CSG to STEP — OpenSCAD 一键导出 STEP 文件

> 在 VS Code 中打开 `.scad` 文件，点击状态栏按钮即可导出为 STEP 格式，无需离开编辑器。

![插件预览](https://github.com/lastmustname804-bit/csg2stp-vscode/blob/main/images/overview.png?raw=true)

## 功能

- 在 VS Code 状态栏添加 **导出 STEP** 按钮
- 自动检测当前激活的 `.scad` 文件
- 调用 `csg2stp` 可执行文件完成 CSG → STEP 转换
- 转换完成后在右下角弹出通知
- 完全可配置：可自由指定 `csg2stp` 可执行文件路径

## 需求

| 软件 | 说明 |
|------|------|
| **csg2stp** 可执行文件 | 核心转换引擎。可从 [csg2stp 项目](https://github.com/openscad/csg2stp) 获取 |
| **VS Code OpenSCAD 插件**（推荐） | 提供语法高亮、预览等功能。在 VS Code 扩展商店搜索 "OpenSCAD" 安装 |

> 强烈建议同时安装 **OpenSCAD 官方插件**，获得完整的 `.scad` 编辑体验（语法高亮、代码补全、本地预览）。

## 安装

### 从 VSIX 安装

1. 在 VS Code 中按 `Ctrl+Shift+X` 打开扩展面板
2. 点击右上角 `...` → **Install from VSIX...**
3. 选择本插件 `.vsix` 文件
4. 安装完成后，**需要重载窗口**（Reload Window）

![从VSIX安装](https://github.com/lastmustname804-bit/csg2stp-vscode/blob/main/images/install-from-vsix.png?raw=true)

### 从源码安装（开发调试）

```bash
# 克隆仓库
git clone https://github.com/lastmustname804-bit/csg2stp-vscode.git

# 进入目录
cd csg2stp-vscode

# 安装依赖
npm install

# 打包 vsix
npx vsce package

# 在 VS Code 中按 F5 启动 Extension Development Host 调试
```

###### 也可以在扩展商店中安装插件

## 使用

### 1. 配置 `csg2stp` 可执行文件路径

打开 VS Code 设置，搜索 `csg2stp`：

1. `Ctrl+Shift+P` → 搜索 `Preferences: Open Settings (UI)`
2. 在搜索框输入 `csg2stp`
3. 在找到的 **CSG to STP: Executable Path** 配置项中填入路径

![插件设置](https://github.com/lastmustname804-bit/csg2stp-vscode/blob/main/images/settings.png?raw=true)

或者直接编辑 `settings.json`：

```json
{
  "csg2stp.executablePath": "C:\\path\\to\\csg2stp.exe"
}
```

> **注意**：路径需指向实际存在的 `csg2stp` 可执行文件。如果路径配置错误，状态栏会显示错误提示，导出操作也会失败。

---

### 2. 导出 STEP

打开一个 `.scad` 文件并确保它是当前激活标签页，在 VS Code 底部状态栏点击 **导出 STEP** 按钮即可。

![状态栏按钮](https://github.com/lastmustname804-bit/csg2stp-vscode/blob/main/images/statusbar-button.png?raw=true)

---

### 3. 完成提示

转换完成后，VS Code 右下角会弹出成功通知：

![导出成功提示](https://github.com/lastmustname804-bit/csg2stp-vscode/blob/main/images/export-success.png?raw=true)

生成的 `.stp` 文件将保存在与 `.scad` 文件 **相同的目录** 下，文件名相同但后缀为 `.stp`。

## 工作原理

```
.scad 文件 →（OpenSCAD 编译）→ .csg 内容 →（csg2stp 转换）→ .stp 文件
         ↑                             ↑
   你编辑的源代码                 插件自动调用 csg2stp
```

当你在 VS Code 中打开一个 `.scad` 文件并点击导出时，插件会：

1. 检查当前激活的编辑器是否为 `.scad` 文件
2. 验证 `csg2stp` 配置路径是否有效
3. 调用 `csg2stp` 将 CSG 内容转换为 STEP
4. 将 `.stp` 文件输出到源文件同目录
5. 弹出成功提示

## 命令列表

| 命令 | 名称（命令面板搜索） |
|------|---------------------|
| 导出 STEP | `CSG to STP: Export Active .scad to STEP` |
| 设置 csg2stp 路径 | 无（通过 VS Code 设置界面或 settings.json 配置） |

> 配置路径请使用 VS Code 设置界面搜索 `csg2stp`，或直接编辑 `settings.json`。

## 配置项

| 配置 ID | 类型 | 默认值 | 说明 |
|---------|------|--------|------|
| `csg2stp.executablePath` | `string` | `""` | `csg2stp` 可执行文件的完整路径 |

## 常见问题

### Q: 状态栏没有显示 "导出 STEP" 按钮？

确保：
- 当前已打开并激活了一个 **.scad** 文件
- 已重载窗口（`Ctrl+Shift+P` → `Developer: Reload Window`）

插件仅在 `.scad` 文件处于活动状态时才会显示按钮。

### Q: 转换失败 / 没有生成 .stp 文件？

检查以下几点：

**1. csg2stp 路径配置错误**
- 打开 VS Code 设置，搜索 `csg2stp`，确认路径填写正确
- 路径必须指向可执行文件本身（包含文件名），例如 `C:\tools\csg2stp.exe`
- 路径中不要包含引号

**2. csg2stp 可执行文件权限问题**
- 在命令行中直接执行 `csg2stp` 确认能正常运行
- Windows 下可能需要管理员权限

**3. 查看错误输出**
- 如果转换失败，状态栏会显示错误信息
- 可以打开 **终端面板**（`Ctrl+``）查看扩展输出的详细日志

**4. csg2stp自身问题**

- 确保 OpenSCAD 文件能正常编译。建议安装 OpenSCAD 插件查看语法错误
- csg2stp本身有随机性，可以尝试多次导出直到得到满意结果
- 部分OpenSCAD代码无法转换，例如hull、import、projection、minkowski等
- 有时导出文件会不全面（例如扭转信息丢失），需要使用建模软件进行修复

### Q: 支持 macOS / Linux 吗？

支持。`csg2stp.executablePath` 可以指向任何平台下的可执行文件，例如 Linux 下的 `/usr/local/bin/csg2stp` 或 macOS 下的 `/opt/homebrew/bin/csg2stp`。

## 开发

```bash
# 编译
npm run compile

# 监听模式
npm run watch

# 运行测试
npm test
```

项目基于 VS Code Extension API，主要入口文件为 `src/extension.ts`。

## 许可证

GPL 3.0 — 详见 [LICENSE](https://github.com/lastmustname804-bit/csg2stp-vscode/blob/main/LICENSE?raw=true) 文件。
