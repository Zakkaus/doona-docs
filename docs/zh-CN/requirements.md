[English](../en/requirements.md) · 简体中文 · [繁體中文](../zh-TW/requirements.md)

<a name="requirements"></a>

# 系统要求

## 网关

honk 只能在 Linux 上以 `root` 身份运行。它会加载 eBPF 程序、创建 `dae0` 链路与 `daens` 命名空间并修改 sysctl，因此首次启动时请保留控制台等第二条管理通道。

- Linux 6.12 或更高版本。内核版本过低时，honk 会在挂载任何程序之前拒绝启动。
- 下列内核选项。桌面与服务器发行版通常已启用；OpenWrt、Armbian 与 VyOS 需要逐项检查。
- `pname(...)` 规则需要 cgroup v2。缺少 cgroup v2 时 honk 仍可启动，但按进程名分流不可用。
- bpffs 挂载于 `/sys/fs/bpf`。
- CA 证书，例如 `ca-certificates` 软件包。缺少时 honk 会以 `subscription network startup failed` 退出。

```sh
uname -r
zcat /proc/config.gz 2>/dev/null || cat /boot/config-$(uname -r)
```

```text
CONFIG_BPF=y
CONFIG_BPF_SYSCALL=y
CONFIG_BPF_JIT=y
CONFIG_CGROUP_BPF=y
CONFIG_NET_CLS_BPF=y|m
CONFIG_NET_SCH_INGRESS=y|m
CONFIG_NET_CLS_ACT=y
CONFIG_NET_NS=y
# Held-first-packet UDP (NFQUEUE, on by default) also needs:
CONFIG_NF_TABLES=y|m
CONFIG_NF_TABLES_INET=y
CONFIG_NETFILTER_NETLINK_QUEUE=y|m
```

系统未自动挂载 bpffs 时，执行：

```sh
sudo install -d -m 0755 /sys/fs/bpf
mountpoint -q /sys/fs/bpf || sudo mount -t bpf bpf /sys/fs/bpf
mountpoint /sys/fs/bpf
# To mount it at boot, add this line to /etc/fstab:
# bpf /sys/fs/bpf bpf defaults 0 0
```

<a name="honk-version"></a>

## honk 版本

- 只有 Glassyiris/honk `feat/native-api` 分支的构建提供原生 API，即滚动发布的 `debug` 版本，目前由标签 `debug.2026.9.28.native-api.2`（提交 `7449f4e2`）构建。每个 doona 发行版附带发行时的构建，其 `HONK-SOURCE.txt` 注明标签与提交。
- 由 daeuniverse/honk main 分支构建的版本没有原生 API。honk 会以 `unknown experimental setting` 拒绝所有 `native_api` 设置，访问 `/api` 与 `/ui/` 返回 404。
- 早期的 `feat/native-api` 构建可以更新地理数据，但不能设置来源。每个 doona 发行版附带的构建两者都支持。

执行 `honk-core --version` 查看已安装二进制文件的版本；正在运行的版本请查看 doona 概览页的“引擎”卡片或侧边导航栏底部。

## 浏览器与构建

| 组件   | 要求                                                                                                                                          |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 后端   | 实现 [SOURCE.md](../../contract/api-standardize/SOURCE.md) 所钉契约并启用 API 监听的引擎                                                      |
| 浏览器 | Chrome 或 Edge 120、Firefox 121、Safari 17 及以后。这些是 CSS 构建目标；JavaScript 构建目标是 ES2022。自动化测试使用 Chromium，CI 另加 WebKit |
| 构建   | 仅从源码构建 doona 时需要 Node `^22.18.0 \|\| ^24.0.0 \|\| >=26.0.0` 与 pnpm 11.15.1；打包需要 GNU tar、gzip 与 sha256sum                     |
