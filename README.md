# Pump测试网前端部署指南

## 功能概述

本前端为测试人员提供以下功能：

1. **钱包连接** - 支持Phantom等钱包连接本地测试网
2. **水龙头** - 一键获取测试SOL
3. **代币列表** - 显示所有已部署的代币
4. **Bonding Curve交易** - 在内盘阶段买卖代币
5. **联合曲线图表** - 实时显示价格曲线
6. **AMM交易** - 迁移后在PumpSwap上交易
7. **K线图表** - AMM阶段的K线图
8. **交易历史** - 实时交易记录

## 快速启动

### 方式1：一键启动（推荐）

```bash
# Windows
双击 start_all.bat
```

### 方式2：手动启动

```bash
# 1. 启动验证器（在WSL中）
wsl -d Ubuntu -e bash -lc "source ~/.profile && source ~/.cargo/env && cd ~ && ./start_validator.sh"

# 2. 启动后端API
cd pump-testnet/backend
pnpm install
pnpm dev

# 3. 启动前端
cd pump-testnet/frontend
pnpm install
pnpm dev
```

## 访问地址

| 服务 | 端口 | 地址 |
|------|------|------|
| 发币通前端 | 3000 | http://localhost:3000 |
| 发币通后端 | 3001 | http://localhost:3001 |
| **测试前端** | **3003** | **http://localhost:3003** |
| **测试后端** | **3004** | **http://localhost:3004** |
| 验证器RPC | 8899 | http://127.0.0.1:8899 |
| WebSocket | 8900 | ws://127.0.0.1:8900 |

## 多人测试配置

### 步骤1：配置端口转发

以**管理员身份**运行PowerShell：

```powershell
# 获取WSL IP
$wslIp = (wsl -d Ubuntu -e ip addr show eth0 | Select-String "inet (\d+\.\d+\.\d+\.\d+)" | ForEach-Object { $_.Matches.Groups[1].Value })
Write-Host "WSL IP: $wslIp"

# 配置端口转发
netsh interface portproxy add v4tov4 listenport=8899 listenaddress=0.0.0.0 connectport=8899 connectaddress=$wslIp
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=127.0.0.1
netsh interface portproxy add v4tov4 listenport=3002 listenaddress=0.0.0.0 connectport=3002 connectaddress=127.0.0.1

# 配置防火墙
New-NetFirewallRule -DisplayName "Pump Testnet" -Direction Inbound -LocalPort 8899,3000,3002 -Protocol TCP -Action Allow
```

### 步骤2：获取公网IP

```powershell
# 获取公网IP
(Invoke-WebRequest -Uri "https://api.ipify.org").Content
```

### 步骤3：测试人员访问

测试人员使用以下地址访问：

```
前端: http://<公网IP>:3000
RPC: http://<公网IP>:8899
```

## 钱包配置

### Phantom钱包配置

1. 打开Phantom钱包
2. 进入设置 -> 开发者设置
3. 添加自定义网络：
   - 网络名称: Pump测试网
   - RPC URL: http://<公网IP>:8899
   - WebSocket URL: ws://<公网IP>:8900

### 导入测试钱包

测试人员可以使用以下方式获取钱包：

1. 创建新钱包
2. 通过水龙头获取测试SOL

## 功能说明

### 水龙头

- 连接钱包后，点击"获取测试币"按钮
- 默认获取10 SOL
- 可自定义获取数量（1-10000 SOL）

### 代币列表

- 显示所有已部署的代币
- 显示代币进度（Bonding Curve阶段）
- 点击代币进入交易界面

### 交易

**Bonding Curve阶段：**
- 显示联合曲线进度
- 支持买入/卖出
- 实时计算价格

**AMM阶段：**
- K线图表
- 支持买入/卖出
- 流动性池信息

## 开发说明

### 技术栈

- Next.js 14
- React 18
- Tailwind CSS
- @solana/web3.js
- @solana/wallet-adapter
- lightweight-charts (图表)
- Zustand (状态管理)

### 目录结构

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── WalletProvider.tsx
│   │   ├── Header.tsx
│   │   ├── Faucet.tsx
│   │   ├── TokenList.tsx
│   │   ├── TradePanel.tsx
│   │   ├── Chart.tsx
│   │   └── TradeHistory.tsx
│   └── store/
│       └── tokenStore.ts
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

### 环境变量

```env
# .env.local
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8899
NEXT_PUBLIC_WS_URL=ws://127.0.0.1:8900
NEXT_PUBLIC_PUMP_PROGRAM_ID=6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P
NEXT_PUBLIC_PUMPSWAP_PROGRAM_ID=pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA
```

## 故障排除

### 问题1：钱包连接失败

- 确认Phantom已添加自定义网络
- 确认RPC地址正确

### 问题2：无法获取测试币

- 确认验证器正在运行
- 检查控制台错误信息

### 问题3：交易失败

- 检查钱包余额
- 确认代币合约正常
- 查看验证器日志
