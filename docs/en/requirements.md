English / [简体中文](../zh-CN/requirements.md) / [繁體中文](../zh-TW/requirements.md)

<a name="requirements"></a>

# Requirements

## Gateway

honk runs on Linux as `root`. It loads eBPF programs, creates the `dae0` link and the `daens` namespace, and changes sysctls, so keep a second way into the machine, such as a console, during the first start.

- Linux 6.12 or later. honk rejects an older kernel before it attaches anything.
- The kernel options below. Desktop and server distributions usually enable them; OpenWrt, Armbian and VyOS need checking.
- cgroup v2 for `pname(...)` rules. Without it honk starts, and process-name routing stays off.
- bpffs mounted at `/sys/fs/bpf`.
- CA certificates, such as the `ca-certificates` package. Without them honk stops with “subscription network startup failed”.
- With `geoip` rules on a honk build before `debug.2026.9.28.native-api.4`, use at least 512 MB RAM: the older OpenWrt test ran out of memory during a geodata update on a 256 MB VM. From that build on, honk streams geodata updates to disk. For OpenWrt, keep `MIMALLOC_PURGE_DELAY=0` in the [procd service](service-management.md).

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
CONFIG_NFT_QUEUE=y|m
```

Mount bpffs if the system does not:

```sh
sudo install -d -m 0755 /sys/fs/bpf
mountpoint -q /sys/fs/bpf || sudo mount -t bpf bpf /sys/fs/bpf
mountpoint /sys/fs/bpf
# To mount it at boot, add this line to /etc/fstab:
# bpf /sys/fs/bpf bpf defaults 0 0
```

<a name="honk-version"></a>

## honk version

- Only builds from the `feat/native-api` branch of Glassyiris/honk and its rolling `debug` release have the native API. On that branch, `native-api` is an opt-in build feature; release and `debug` builds include it. doona beta.12 attaches `debug.2026.9.30.native-api.5` (commit `25377686`). `HONK-SOURCE.txt` in each doona release from beta.8 onward names its honk tag and commit.
- Builds of daeuniverse/honk `main` have no native API. honk rejects every `native_api` setting as `unknown experimental setting`, and `/api` and `/ui/` answer 404.
- A build from `feat/native-api` without the `native-api` feature stops startup with `native-api feature is required` when `native_api` is enabled.
- Early `feat/native-api` builds update geodata but have no configurable sources. The builds attached to doona beta.8 and beta.9 have both.

Run `honk-core --version` to check the installed binary. To check the running version, use the Engine card on Overview or the bottom of the side navigation.

## Browser and build

| Component | Requirement                                                                                                                                                             |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend   | An engine implementing the native API contract pinned in [SOURCE.md](https://github.com/Zakkaus/doona/blob/main/contract/api-standardize/SOURCE.md), with its API listener enabled                           |
| Browser   | Chrome or Edge 120, Firefox 121, Safari 17 or later. These are the CSS build targets; the JavaScript target is ES2022. Automated tests use Chromium, and CI adds WebKit |
| Build     | Node `^22.18.0 \|\| ^24.0.0 \|\| >=26.0.0` and pnpm 11.15.1, only to build doona from source; GNU tar, gzip and sha256sum for the archives                              |
