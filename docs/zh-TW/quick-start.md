繁體中文 / [简体中文](../zh-CN/quick-start.md) / [English](../en/quick-start.md)

# 快速入門

使用 honk 內嵌的 doona，無需另行下載介面檔案。

先檢查[閘道器需求](requirements.md)。已有 honk 組態時請保留；全新後端須先準備 honk 的[最小組態](https://github.com/daeuniverse/honk/blob/main/doc/zh/how-to-start.md#最小配置)，再加入下方 API 區塊。

## 1. 安裝 honk

在 64 位元 OpenWrt 或 ImmortalWrt 25.12 上，從 [daeuniverse 軟體源](https://openwrt.daeuniverse.org/zh-tw/)安裝 honk。

其他 Linux 系統請按[安裝 honk](install.md#install)操作，從 [honk 發行頁](https://github.com/daeuniverse/honk/releases)選擇名稱含 `full` 的壓縮檔。

## 2. 設定 honk

將以下區塊寫入 honk 組態，取代原有的 `native_api` 區塊：

```dae
experimental {
    native_api {
        enabled: true
        listen: '127.0.0.1:9527'
        password_auth: true
        config_write: true
        ui: 'embedded'
    }
}
```

若要改用 doona lite，設定 `ui: 'embedded-lite'`（自 honk v0.1.0-beta.4 起提供），詳見 [doona lite](lite.md)。

其他選項見[組態參考](configuration.md)。[啟動或重新啟動 honk](service-management.md)後，變更才會生效。

## 3. 開啟 doona

在執行 honk 的機器上開啟 <http://127.0.0.1:9527/>。若 honk 在路由器上，請在電腦執行以下命令。將 `<router>` 替換為路由器的 SSH 位址，並保持連線：

```sh
ssh -L 9527:127.0.0.1:9527 root@<router>
```

在電腦開啟相同網址。首次造訪會建立管理員，詳見[首次登入](first-sign-in.md)。
