# Pump测试网配置文档

## 公网访问地址

| 服务 | URL | 说明 |
|------|-----|------|
| **前端页面** | https://pump-testent.vercel.app | 固定 |
| **Solana RPC** | 查看Cloudflare隧道窗口输出 | 每次启动会变化 |

---

## TP钱包配置

| 字段 | 值 | 说明 |
|------|-----|------|
| **网络名称** | Pump测试网 | 固定 |
| **RPC URL** | 查看Cloudflare隧道窗口输出 | 每次启动会变化 |
| **Chain ID** | 运行 `show_config.bat` 获取 | 每次重启验证器会变化 |
| **货币符号** | SOL | 固定 |

---

## 一键启动脚本

| 脚本 | 功能 |
|------|------|
| `start_all_services.bat` | 一键启动所有服务 |
| `show_config.bat` | 显示当前配置信息 |

---

## 启动步骤

### 方式1: 一键启动
双击运行 `start_all_services.bat`

### 方式2: 手动启动
1. 启动Solana验证器
2. 启动Cloudflare RPC隧道
3. 启动测试网后端
4. 启动测试网前端
5. 启动发币通后端
6. 启动发币通前端

---

## 本地服务端口

| 服务 | 端口 |
|------|------|
| Solana验证器 | 8899 |
| 测试网后端 | 3004 |
| 测试网前端 | 3003 |
| 发币通后端 | 3001 |
| 发币通前端 | 3000 |

---

## 程序ID (Program IDs)

| 程序 | 地址 |
|------|------|
| **Pump** | 6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6Pump |
| **PumpSwap** | pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA |
| **Token Program** | TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA |
| **Token-2022** | TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb |
| **Associated Token** | ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL |
| **Metadata** | metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s |
| **Fee** | pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ |
| **Pump Exec** | MAyhSmzXzV1pTf7LsNkrNwkWKTo4ougAJ1PPg47MD4e |

---

## 注意事项

1. **RPC URL会变化**: 每次重启Cloudflare隧道，URL都会变化
2. **Chain ID会变化**: 每次重启验证器，Genesis Hash会变化
3. **需要重新配置钱包**: 每次重启后，需要在TP钱包中更新RPC URL和Chain ID
4. **查看当前配置**: 运行 `show_config.bat` 获取最新的Chain ID

---

## GitHub仓库

https://github.com/9pphy4fbqg-dev/PUMP-TESTENT
