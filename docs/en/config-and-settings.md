English / [简体中文](../zh-CN/config-and-settings.md) / [繁體中文](../zh-TW/config-and-settings.md)

<a name="config-and-settings"></a>

# Config and settings

This page covers the Configuration page, where you read, validate and apply honk's configuration files. It also covers the Settings page, where you manage backend profiles, temporary runtime overrides, geodata, appearance and latency probes. Activity's [Getting started](observe.md#activity) card links to the setup steps.

<a name="config-page"></a>

## Open the Configuration page

1. In the Settings hub, open Configuration. The page appears when the backend provides configuration or backup and revision capabilities.
2. Read the line above the tabs. Config version identifies the configuration in effect and changes when changed content takes effect. Next to it, a status shows No diagnostics or the number of errors or warnings.
3. If the line also shows Listener secret values are redacted, the backend hid those values in the text it returned.
4. Choose Modules or Config files. Global settings appears for an engine whose settings doona knows. Backups and revisions appears when the backend offers configuration export, import or revision history.

Without a tab specified in the link, the page opens on Modules, even when the main file is empty. It opens on Config files when the link selects a source or the backend did not return the main configuration text. For the file format and the roles of the main file and its includes, see [Configuration](configuration.md#config).

To add a subscription, open Nodes and choose Add subscription; see [nodes and subscriptions](routing.md#nodes). To apply a rule template, open Rules; see [routing rules](routing.md#rules).

### Config files

1. Open Config files and choose a file from Config file. Each entry shows its kind: Main, Include, Subscription or Generated.
2. Read the facts next to the picker: the number of lines and the size. Hover over them to see when the file was loaded.
3. If the file cannot be edited, a badge next to the picker names the reason. The table below lists the badges.
4. Press Download source file to download the displayed text. The export keeps the text as shown and may contain credentials, so review it before sharing.

| Badge | Meaning |
| --- | --- |
| Read-only | The backend does not allow configuration writes; the badge's help says how to enable them, and [Configuration](configuration.md#config) describes `config_write`. Without that help, the backend refuses this file and gives no reason; see [read-only sources](troubleshooting.md#read-only). |
| Contains secrets | The file holds a listener secret, so the backend does not write it back. Move the secret into its own included file to edit the rest. |
| Redacted | The backend hid part of the file. Writing it back would lose those values. |
| Subscription | The file is downloaded from a subscription URL and replaced when the subscription updates. |
| Generated | The engine generates the file and overwrites it when it regenerates. Change the configuration that produces it instead. |

Typing into a read-only file shows the notice This file is read-only, once per file.

<a name="edit-source"></a>

## Edit and apply a source

1. On Config files, choose a writable file with complete text and click its text.
2. Type your change. A Not applied badge appears, and reloading or closing the page loses the change.
3. If the backend supports validation, doona validates the main file and its includes after a pause in typing and marks diagnostic lines in the editor. Press Validate to check at once; the cursor moves to the first error.
4. Review Diagnostics above the editor. Go jumps to a diagnostic in the current file; Open opens another file at that line. Details expands the backend's original diagnostic text.
5. Press Apply. honk validates the files, writes the change and reloads the configuration. A notice says the file was written and the configuration reloaded.

Press Cancel to drop the change. If validation finds errors, nothing is written and the errors appear in the list. If the change touches a setting that takes effect only after a restart, nothing is written either. The notice lists those settings and the restart command; edit them on disk and [restart honk](service-management.md).

If the file changed on disk while you were editing, an alert says so and Apply stays disabled. Press Keep changes, then Apply, to write your text over the new file; or press Cancel to drop your change and load the new text.

To create an included file:

1. On Config files, press New file. The button appears when the backend allows creating writable files.
2. If an include pattern of the main file sets the directory and extension, enter only the file name in Name; when there are several patterns, choose one from Include pattern first. Otherwise enter a path relative to the main configuration's directory in Path; it must end in `.dae`.
3. Press Create. The new file starts empty, the configuration reloads, and the file opens on Config files.

If no include pattern of the loaded files matches the path, the dialog warns that the backend will refuse the file.

## Validation and diagnostics

1. Open Config files. Diagnostics appears above the editor, with error and warning counts and the diagnostic scope.
2. Expand the counts to read the diagnostic rows. Errors expand the list automatically. Details shows the original backend text.
3. Use Go or Open on a row to reach its location.
4. Press Validate to check the main file and its includes when the backend offers full validation and all required text is available.

The list shows diagnostics for the accepted configuration until a draft is validated. Validation needs the complete main file and include text. An applied change or a new accepted generation clears the previous validation results. Old links to Validation open the diagnostics on Config files.

## Modules

1. Open Modules. It shows one card for each `global`, `subscription`, `node`, `group`, `dns` and `routing` section, with its line range and one summary line.
2. Press Open page to open the section's editor: Global settings, Nodes, Policies, or the DNS or routing list on Rules.

Modules is an overview, not an inline editor. Edit whole files on Config files. A card for a missing section says so.

## Global settings

1. Open Global settings and choose a section from Config file. The picker includes `global` sections in the main file and includes; a main file without one can receive a new section.
2. Edit the offered fields for interfaces, dialing and TLS, node checks, logging, storage, bandwidth and preconnection. Each field shows its configuration key and any units or range. Not set uses the engine default; duplicate fields must be resolved on Config files.
3. Press Write and reload to validate, write and apply the change. Discard changes drops the draft.

Only writable files with complete text can be changed. A file changed on disk blocks the save. A restart-required change is refused without writing and lists the settings to edit on disk. If the write succeeds but the new configuration cannot be read, the draft stays and Retry is offered.

## Backups and revisions

Open Backups and revisions when offered by the backend. Available controls depend on its capabilities:

- Export configuration downloads the accepted configuration, unlike Download source file on Config files, which downloads only the displayed file. Listener secrets are omitted, but other credentials may remain; review the export before sharing.
- Import server files reads the file tree specified by `-c` at honk startup, validates it, replaces the database configuration and applies it after confirmation. It does not upload a local backup.
- The revision table shows Revision, Recorded at, Origin and Size, and marks Database head. Open a row for metadata and source SHA-256 values. Restore revision validates and applies that revision after confirmation, usually creating a new revision.

If an accepted import or restore has an unknown result, reopen this tab and use Refresh to check its operation without sending another write. A changed database head requires review and confirmation again.

<a name="settings-page"></a>

## Settings page

In the Settings hub, open Settings. The page opens without a connected backend, so you can correct the backend address there. Its cards appear in this order:

1. Backend
2. Temporary runtime overrides
3. Geodata, when the backend provides geodata
4. Appearance
5. Latency probes
6. About

### Backend

1. Choose a profile from Profile to switch to it. doona saves the choice and reloads the page with that backend.
2. Use Add profile, Rename profile or Delete profile to manage profiles. Each opens a dialog; confirming reloads the page. A new profile starts with the built-in demo data.
3. Enter the Backend URL: the backend root or reverse-proxy prefix, not `/api/v1`. Leave it empty or enter `mock` for the built-in demo data.
4. Enter the Token. A backend with password sign-in shows a note instead, and Sign out appears while you are signed in.
5. Press Test connection. The result reads Connected, API v*N*, or names the failure.
6. Press Save. doona stores the profile in this browser and reloads the page to apply it.

Switching, adding, renaming or deleting a profile discards unsaved Backend URL and Token edits; the dialogs warn about this first. A pairing link fills in Backend URL and Token, which take effect once saved. Save changes doona's profile, not honk's configuration. If the test or sign-in fails, see [sign-in failures](troubleshooting.md#sign-in).

Sign out also appears when the active profile uses a saved token. It removes the token from this browser, keeps the backend address and returns to sign-in; it does not revoke the backend secret. Password sign-out closes the session and also removes any saved token.

<a name="runtime-options"></a>

### Temporary runtime overrides

1. Read the badge next to the title: From configuration or Runtime override.
2. Change the fields the backend offers: Log level, Log records kept, DNS log records kept, Flows kept and Flow retention (seconds). Each numeric field shows its allowed range.
3. For Flow recording, choose On flow demand, Always or Off. For Log recording, choose On log demand, Always or Off. For DNS log, choose On DNS log demand, Always or Off. A status next to each reads Recording, Idle or Disabled in configuration.
4. Press Apply. The changes take effect immediately. Discard changes appears while you have unapplied edits.

These options are not written to the configuration file. A restart or an accepted explicit configuration activation, including a no-op reload, restores the configured values. Rejected activation and provider or network refresh preserve the overrides. A recorder disabled in the configuration cannot be enabled here. If the options change on the backend while you edit, doona keeps your draft and says so.

Edit persistent settings in Configuration opens Global settings for values written to honk's configuration.

<a name="geodata"></a>

### Geodata

The Geodata card shows the files the backend provides, even when sources cannot be configured. Its table lists Asset, Size, Updated, SHA-256 and Source. Update now appears when the backend supports a manual update. Source and schedule controls below require configurable sources.

1. Choose a Source: Loyalsoldier, MetaCubeX full, MetaCubeX lite or Custom. If the preset lacks categories your rules use, a dialog lists them before switching, because the backend refuses such a file on update.
2. For Custom, enter the `geosite` and `geoip` URLs in the Custom URLs dialog and press Apply and update, or Apply. Each list takes up to four URLs, tried in order. Use URLs that serve the file directly; GitHub release download links redirect and do not work. Edit reopens the dialog later.
3. Choose a Download route: By routing rules, Direct or Specific group. For Specific group, choose the group; the route is saved then.
4. Leave Verify checksum on unless a trusted mirror's checksum URL returns an error page or an error other than HTTP 404. A mirror without a `.sha256sum` file already loads files unverified.
5. Turn on Automatic updates and choose an Interval (hours) for scheduled downloads.
6. Read Status. Press Update now, if offered, to download at once. Open Details for update status; the files table lists each file's information.
7. Press Reset to defaults and confirm to remove every geodata override and every value taken from the configuration file. The built-in sources and defaults apply again.

Each control saves when you change it. If the backend updates on request, a new source downloads at once; otherwise it downloads at the next automatic update. Download route and Verify checksum appear only when the backend reports them. If the card says the URLs come from the configuration file, honk writes those URLs back when it restarts. For failures, see [geodata update failures](troubleshooting.md#geodata-update) and [geodata sources](troubleshooting.md#geodata-sources).

### Appearance

Choose Language, Palette, Color scheme, Wordmark and Notification position. Turn on Mirrored layout to flip the layout left to right. doona stores these choices in this browser; they do not change honk's configuration.

The Palette picker filters choices by name. Only its option list scrolls; the search field stays visible.

Show country flags controls flags before node names and does not affect routing. Show trends on activity cards controls recent-value sparklines on Activity's traffic, CPU and latency cards.

Open at startup chooses the page to open when the address has no page route. It defaults to Activity and saves immediately in this browser. A link to a specific page keeps its destination. Without a configured backend, an address without a page route still opens Settings.

<a name="backend-actions"></a>

### Backend controls

Backend operations are on the pages that own them:

1. System status has an action toolbar beside its status strip. Reload rereads honk's configuration; Suspend or Resume appears only when the backend provides it.
2. DNS has cache deletion and Clear all cache. Cache rows have delete icons; cache and Resolution log rows have their own add-rule icons. These create a DNS request rule under Rules -> DNS rules -> Request rules, or a routing rule when DNS rules are unavailable.
3. Nodes has Update N subscriptions.
4. Connections has Close all, which closes backend-owned connections and skips kernel-direct connections.

The top bar's Reload honk confirms before reloading and does not write held rules; see the [interface tour](tour.md#top-bar) and [held rules](routing.md#held-rules).

### Latency probes

Choose Probe method, IP family, Measurement and Group probes. Measurement chooses Warm (reuse connection) or Cold (new connection); Group probes chooses Direct members or Every leaf node, including nested groups. Choices are saved in this browser. Probe buttons use them, and the options dialog starts from them. A node that cannot carry the chosen method uses a supported method and reports the fallback.

Trojan, AnyTLS and VLESS keep DNS UDP choices whose support depends on node configuration; backend admission failures remain visible instead of silently falling back to HTTP. A probe with no completed measurement can report result unknown, with the timeout, cancellation, unavailable address or local refusal explained. This does not establish that the node is unavailable.

Edit health checks in Configuration opens the persistent background check settings, including check URLs and interval. Those are separate from these manual probe preferences.

### About

About doona opens a dialog with the engine, API and contract versions, the license and the privacy statement. Keyboard shortcuts opens the shortcut list. Guide opens this documentation in the interface language. Install as an app appears when the browser offers installation; Safari on iOS and macOS shows the steps instead. If the backend uses an API major version other than 1, a warning appears in this card.

Copy recent errors copies the last 20 API errors kept in memory for a bug report. Secrets and request bodies are omitted; reloading the page clears this history. Failure notices also offer Copy error for the individual request.
