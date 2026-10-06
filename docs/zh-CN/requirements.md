[English](../en/requirements.md) / 简体中文 / [繁體中文](../zh-TW/requirements.md)

<a name="requirements"></a>

# 系统要求

## 网关

honk 只能在 Linux 上以 `root` 身份运行。它会加载 eBPF 程序、创建 `dae0` 链路与 `daens` 命名空间并修改 sysctl，因此首次启动时请保留控制台等第二条管理通道。

- Linux 6.12 或更高版本。内核版本过低时，honk 会在挂载任何程序之前拒绝启动。
- 下列内核选项。桌面与服务器发行版通常已启用；OpenWrt、Armbian 与 VyOS 需要逐项检查。
- `pname(...)` 规则需要 cgroup v2。缺少 cgroup v2 时 honk 仍可启动，但按进程名分流不可用。
- bpffs 挂载于 `/sys/fs/bpf`。
- CA 证书，例如 `ca-certificates` 软件包。缺少时 honk 会以 `subscription network startup failed` 退出。
- 地理数据更新可能增加小型路由器的内存占用。honk 将更新流式写入磁盘；在 OpenWrt 上使用 mimalloc 构建时，请保留 [procd 服务](service-management.md)中的 `MIMALLOC_PURGE_DELAY=0`，让已释放的内存及时归还系统。

```sh
uname -r
zcat /proc/config.gz 2>/dev/null || cat /boot/config-$(uname -r)
```

```text
CONFIG_BPF=y
CONFIG_BPF_SYSCALL=y
CONFIG_BPF_JIT=y
CONFIG_DEBUG_INFO_BTF=y
CONFIG_CGROUP_BPF=y
CONFIG_NET_CLS_BPF=y|m
CONFIG_NET_SCH_INGRESS=y|m
CONFIG_NET_CLS_ACT=y
CONFIG_NET_NS=y
# Held-first-packet UDP (NFQUEUE, on by default) also needs:
CONFIG_NF_TABLES=y|m
CONFIG_NF_TABLES_INET=y|m
CONFIG_NFT_CT=y|m
CONFIG_NETFILTER_NETLINK_QUEUE=y|m
CONFIG_NFT_QUEUE=y|m
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

- 各 doona 发布版本附带 Glassyiris/honk `feat/native-api` debug 标签的 honk-core 构建，已启用需显式选择的 `native-api` 构建功能。发布流程固定 honk 提交 `a949f1f`（`debug.2026.10.6.native-api.1`），其嵌入界面为 doona beta.14。`HONK-SOURCE.txt` 记录标签与完整提交。安装独立的 beta.16 文件才能使用本文描述的界面。
- daeuniverse/honk `main` 分支的构建没有原生 API。honk 会以 `unknown experimental setting` 拒绝所有 `native_api` 设置，访问 `/api` 与 `/ui/` 会返回 404。
- `feat/native-api` 分支的构建若未启用 `native-api` 功能，启用 `native_api` 时会以 `native-api feature is required` 阻止启动。
- 早期的 `feat/native-api` 构建可以更新地理数据，但不能设置来源。doona beta.8 和 beta.9 附带的构建两者都支持。

执行 `honk-core --version` 查看已安装二进制文件的版本；正在运行的版本请查看 doona「系统状态」页的「引擎」卡片或侧边导航栏底部。

## 浏览器与构建

| 组件   | 要求                                                                                                                                          |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 后端   | 实现 [SOURCE.md](https://github.com/Zakkaus/doona/blob/main/contract/api-standardize/SOURCE.md) 所钉契约并启用 API 监听的引擎                                                      |
| 浏览器 | Chrome 或 Edge 120、Firefox 121、Safari 17 及以后。这些是 CSS 构建目标；JavaScript 构建目标是 ES2022。浏览器测试使用 Chromium；CI 另加 WebKit 与 Firefox Nightly 兼容性测试。 |
| 构建   | 仅从源码构建 doona 时需要 Node `^22.13.0 \|\| ^24.0.0 \|\| >=26.0.0` 与 pnpm 11.15.1；打包需要 GNU tar、gzip 与 sha256sum。 |
