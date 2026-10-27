[繁體中文](../zh-TW/requirements.md) / [简体中文](../zh-CN/requirements.md) / English

<a name="requirements"></a>

# Requirements

Check the gateway and browser before installing doona and honk. For an individual page or action, use [Feature requirements](feature-requirements.md).

## Gateway

| Component | Requirement |
| --- | --- |
| Operating system | Linux; run honk's real transparent-proxy backend as root. |
| Kernel | Linux 6.12 or later. The real eBPF backend rejects older kernels. |
| cgroup | cgroup v2 with BPF support. Required socket hooks must attach successfully. |
| Kernel type information | Raw BTF matching the running kernel, available at one of the locations below. |
| BPF filesystem | bpffs mounted at `/sys/fs/bpf` for the default pin directory. |
| HTTPS downloads | A system CA certificate store. Install the certificate package from your distribution's installation guide. |

Keep console access or another way into the gateway for the first real start: honk changes its networking.

### Check the kernel

Run on the gateway:

```sh
uname -r
zcat /proc/config.gz 2>/dev/null || cat /boot/config-$(uname -r)
```

The real backend needs these kernel options:

```text
CONFIG_BPF=y
CONFIG_BPF_SYSCALL=y
CONFIG_BPF_JIT=y
CONFIG_CGROUP_BPF=y
CONFIG_NET_SCHED=y
CONFIG_NET_CLS_ACT=y
CONFIG_NET_XGRESS=y
CONFIG_NET_NS=y
```

`CONFIG_NET_XGRESS` is selected by `CONFIG_NET_CLS_ACT`. The TCX backend does not require the legacy `CONFIG_NET_CLS_BPF` or `CONFIG_NET_SCH_INGRESS` options.

The default held-first-packet UDP path also needs:

```text
CONFIG_NF_TABLES=y|m
CONFIG_NF_TABLES_INET=y|m
CONFIG_NFT_CT=y|m
CONFIG_NFT_QUEUE=y|m
CONFIG_NETFILTER_NETLINK_QUEUE=y|m
```

honk reads raw BTF from `HONK_VMLINUX_BTF` if set. Otherwise it tries `/sys/kernel/btf/vmlinux`, then `/usr/lib/debug/boot/vmlinux`. OpenWrt's `vmlinux-btf` package supplies the latter; an ELF debug image is not a raw BTF file.

### Check bpffs

Run on the gateway, omitting sudo in a root shell:

```sh
sudo install -d -m 0755 /sys/fs/bpf
mountpoint -q /sys/fs/bpf || sudo mount -t bpf bpf /sys/fs/bpf
mountpoint /sys/fs/bpf
```

The last command must report that `/sys/fs/bpf` is a mountpoint.

If the system does not mount bpffs automatically, add this entry to `/etc/fstab`:

```text
bpf /sys/fs/bpf bpf defaults 0 0
```

<a name="honk-version"></a>

## honk version

Use a honk build that implements doona's native API contract and includes the `native-api` build feature. A version number alone does not establish compatibility; a build without that feature cannot serve the API even if you add its configuration block.

Choose a compatible honk-core archive using the [installation guide](install.md). The app's [contract pin](https://github.com/Zakkaus/doona/blob/main/contract/api-standardize/SOURCE.md) identifies the API it expects.

On the gateway, run:

```sh
honk-core --version
```

After signing in, compare the running engine version on **System status** with the installed binary. For a missing API or a rejected build, see [native API troubleshooting](troubleshooting.md#no-native-api).

## Browser and source builds

| Component | Requirement |
| --- | --- |
| Browser | Standard-edition build targets: Chrome or Edge 120, Firefox 121, Safari 17 or later; JavaScript target ES2022. |
| Build the app | Node `^22.13.0 \|\| ^24.0.0 \|\| >=26.0.0` and pnpm 11.15.1. |
| Build this documentation site | Node `^22.18.0 \|\| ^24.0.0 \|\| >=26.0.0` and pnpm 11.15.1. |

Node and pnpm are only needed for [development](development.md), not to serve a prebuilt interface. Process-name routing has additional [feature requirements](feature-requirements.md#req-process-routing).
