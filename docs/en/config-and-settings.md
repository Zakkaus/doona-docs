English / [简体中文](../zh-CN/config-and-settings.md) / [繁體中文](../zh-TW/config-and-settings.md)

<a name="config-and-settings"></a>

# Config and settings

This page covers the Configuration page, where you read, validate and apply honk's configuration files. It also covers the Settings page, where you manage backend profiles, backend options, geodata, appearance and backend actions.

<a name="config-page"></a>

## Open the Configuration page

1. In the Settings hub, open Configuration. The page appears only when the backend provides its configuration.
2. Read the line above the tabs. Config version identifies the configuration in effect and changes when changed content takes effect. Next to it, a status shows No diagnostics or the number of errors or warnings.
3. If the line also shows Listener secret values are redacted, the backend hid those values in the text it returned.
4. Choose a tab: Modules, Sources or Validation.

Without a tab specified in the link, the page opens on Modules, even when the main file is empty. It opens on Sources when the link selects a source or the backend did not return the main configuration text. For the file format and the roles of the main file and its includes, see [Configuration](configuration.md#config).

To add a subscription, open Nodes and choose Add subscription; see [nodes and subscriptions](routing.md#nodes). To apply a rule template, open Rules; see [routing rules](routing.md#rules).

### Sources

1. Open Sources and choose a file from Source. Each entry shows its kind: Main, Include, Subscription or Generated.
2. Read the facts next to the picker: the number of lines and the size. Hover over them to see when the file was loaded.
3. If the file cannot be edited, a badge next to the picker names the reason. The table below lists the badges.
4. Press Export to download the displayed text. The export keeps the text as shown and may contain credentials, so review it before sharing.

| Badge | Meaning |
| --- | --- |
| Read-only | The backend does not allow configuration writes; the badge's help says how to enable them, and [Configuration](configuration.md#config) describes `config_write`. Without that help, the backend refuses this file and gives no reason; see [read-only sources](troubleshooting.md#read-only). |
| Contains secrets | The file holds a listener secret, so the backend does not write it back. Move the secret into its own included file to edit the rest. |
| Text not returned | The backend did not return the file's text. Check the backend's content visibility policy. |
| Redacted | The backend hid part of the file. Writing it back would lose those values. |
| Subscription | The file is downloaded from a subscription URL and replaced when the subscription updates. |
| Generated | The engine generates the file and overwrites it when it regenerates. Change the configuration that produces it instead. |

Typing into a read-only file shows the notice This file is read-only, once per file.

<a name="edit-source"></a>

## Edit and apply a source

1. On Sources, choose a file without a badge and click its text.
2. Type your change. A Not applied badge appears, and reloading or closing the page loses the change.
3. If the backend supports validation, doona validates the main file and its includes after a pause in typing and marks diagnostic lines in the editor. Press Validate to check at once; the cursor moves to the first error.
4. Review the diagnostics listed above the editor. Open config source on a row opens its file at that line.
5. Press Apply. honk validates the files, writes the change and reloads the configuration. A notice says the file was written and the configuration reloaded.

Press Cancel to drop the change. If validation finds errors, nothing is written and the errors appear in the list. If the change touches a setting that takes effect only after a restart, nothing is written either; change that setting in the file and restart honk.

If the file changed on disk while you were editing, an alert says so and Apply stays disabled. Press Keep changes, then Apply, to write your text over the new file; or press Cancel to drop your change and load the new text.

To create an included file:

1. On Sources, press New file. The button appears when the backend allows creating files.
2. If an include pattern of the main file sets the directory and extension, enter only the file name in Name; when there are several patterns, choose one from Include pattern first. Otherwise enter a path relative to the main configuration's directory in Path; it must end in `.dae`.
3. Press Create. The new file starts empty, the configuration reloads, and the file opens on Sources.

If no include pattern of the loaded files matches the path, the dialog warns that the backend will refuse the file.

## Validation and diagnostics

1. Open Validation. The status reads Passed, Passed with N warnings, or Failed with the numbers of errors and warnings.
2. Filter the table with All, Errors, Warnings or Info. Each row shows Level, Where, Message and Code.
3. Select a row and press Open config source to open the file at that line.
4. Press Validate again to check the current files.

Until you validate, the table shows the diagnostics kept for the accepted configuration, with its `generation`. After a validation it shows the time of that run; a reload or an applied change returns it to the accepted diagnostics. Validation covers the main file and its includes, and needs the whole text of the main file. If errors remain, Apply writes no file and a reload does not activate the configuration.

## Modules

1. Open Modules. It shows one card for each `global`, `subscription`, `node`, `group`, `dns` and `routing` section, with the file and line range and a short summary.
2. Press Edit on a card to edit that section in place. Edit appears only when the file is writable and its text is complete.
3. Press Validate if offered, then Apply, or Cancel to drop the change.

Only one section can be edited at a time. Open source file opens the whole file on Sources at the section. Open page opens the page that manages the section: Nodes, Policies, or the DNS or routing list on Rules. A card for a missing section says so, and names the main file when you can add the section there.

<a name="settings-page"></a>

## Settings page

In the Settings hub, open Settings. The page opens without a connected backend, so you can correct the backend address there. Its cards appear in this order:

1. Backend
2. Backend options
3. Geodata, when the backend lets you configure geodata sources
4. Appearance
5. Backend actions
6. About

### Backend

1. Choose a profile from Profile to switch to it. doona saves the choice and reloads the page with that backend.
2. Use Add profile, Rename profile or Delete profile to manage profiles. Each opens a dialog; confirming reloads the page. A new profile starts with the built-in demo data.
3. Enter the Backend URL: the backend root or reverse-proxy prefix, not `/api/v1`. Leave it empty or enter `mock` for the built-in demo data.
4. Enter the Token. A backend with password sign-in shows a note instead, and Sign out appears while you are signed in.
5. Press Test connection. The result reads Connected, API v*N*, or names the failure.
6. Press Save. doona stores the profile in this browser and reloads the page to apply it.

Switching, adding, renaming or deleting a profile discards unsaved Backend URL and Token edits; the dialogs warn about this first. A pairing link fills in Backend URL and Token, which take effect once saved. Save changes doona's profile, not honk's configuration. If the test or sign-in fails, see [sign-in failures](troubleshooting.md#sign-in).

<a name="runtime-options"></a>

### Backend options

1. Read the badge next to the title: From configuration or Runtime override.
2. Change the fields the backend offers: Log level, Log records kept, DNS log records kept, Flows kept and Flow retention (seconds). Each numeric field shows its allowed range.
3. For Flow recording, choose On flow demand, Always or Off. For Log recording and DNS log, choose With panel, Always or Off. A status next to each reads Recording, Idle or Disabled in configuration.
4. Press Apply. The changes take effect immediately. Discard changes appears while you have unapplied edits.

These options are not written to the configuration file. A restart or an accepted explicit configuration activation, including a no-op reload, restores the configured values. Rejected activation and provider or network refresh preserve the overrides. A recorder disabled in the configuration cannot be enabled here. If the options change on the backend while you edit, doona keeps your draft and says so.

<a name="geodata"></a>

### Geodata

The Geodata card appears only when the backend lets you configure geodata sources. If the backend provides geodata but does not let you configure its sources, the Backend actions card lists the geodata files; see [Backend actions](#backend-actions).

1. Choose a Source: Loyalsoldier, MetaCubeX full, MetaCubeX lite or Custom. If the preset lacks categories your rules use, a dialog lists them before switching, because the backend refuses such a file on update.
2. For Custom, enter the `geosite` and `geoip` URLs in the Custom URLs dialog and press Apply and update, or Apply. Each list takes up to four URLs, tried in order. Use URLs that serve the file directly; GitHub release download links redirect and do not work. Edit reopens the dialog later.
3. Choose a Download route: By routing rules, Direct or Specific group. For Specific group, choose the group; the route is saved then.
4. Leave Verify checksum on unless a trusted mirror's checksum URL returns an error page or an error other than HTTP 404. A mirror without a `.sha256sum` file already loads files unverified.
5. Turn on Automatic updates and choose an Interval (hours) for scheduled downloads.
6. Read Status. Press Update now, if offered, to download at once. Open Details for each file's information.

Each control saves when you change it. If the backend updates on request, a new source downloads at once; otherwise it downloads at the next automatic update. Download route and Verify checksum appear only when the backend reports them. If the card says the URLs come from the configuration file, honk writes those URLs back when it restarts. For failures, see [geodata update failures](troubleshooting.md#geodata-update) and [geodata sources](troubleshooting.md#geodata-sources).

### Appearance

Choose Language, Palette, Color scheme, Wordmark and Notification position. Turn on Mirrored layout to flip the layout left to right. doona stores these choices in this browser; they do not change honk's configuration.

<a name="backend-actions"></a>

### Backend actions

The card shows only the actions the backend supports.

1. Under Service, press Reload to make honk read its configuration files again. Suspend appears while the engine runs; Resume appears while it is suspended.
2. Under DNS, press Clear all cache and confirm to clear every DNS cache entry.
3. Under Nodes, press Refresh all subscriptions (*N*).
4. Under Connections, press Close all and confirm. It closes every connection the backend owns and skips kernel-direct connections.
5. When the backend provides geodata but its sources cannot be configured, a Geodata table lists each file with Asset, Size, Updated, SHA-256 and Source. Press Update, if offered, to download and verify the files and reload the configuration.

The top bar's Reload honk runs the same reload after a confirmation; see the [interface tour](tour.md#top-bar). Neither writes held rules; see [held rules](routing.md#held-rules). If the geodata note says the download URLs come from the configuration file, editing sources needs the backend's state database; see [state database](troubleshooting.md#state-db).

### About

About doona opens a dialog with the engine, API and contract versions, the license and the privacy statement. Keyboard shortcuts opens the shortcut list. Guide opens this documentation in the interface language. Install as an app appears when the browser offers installation; Safari on iOS and macOS shows the steps instead. If the backend uses an API major version other than 1, a warning appears in this card.
