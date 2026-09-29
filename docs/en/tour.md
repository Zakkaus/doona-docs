English / [简体中文](../zh-CN/tour.md) / [繁體中文](../zh-TW/tour.md)

<a name="tour"></a>

# Interface tour

This page shows where things are in doona after you sign in: the four navigation sections, the top bar, and the tabs, detail panels and action menus inside a page. It also explains how Hold, Apply and Save differ, how to confirm that a change took effect, and how the layout changes on a phone.

<a name="navigation"></a>

## Find a page

In a window at least 1024 px wide, the sidebar lists the pages under four sections. Select a page name to open it.

### Activity

- Activity: outbound mode, download and upload rates, active connections, the current node, CPU, traffic, outbound usage, top devices and domains, memory and notifications.
- System status: engine state, traffic counters, memory, datapath attachments and backend features, with Export state JSON.

### Monitor

- Connections: Traffic and Connections tabs. Select a connection to see its route and actions.
- Routing log: Map and Records tabs.
- DNS: Statistics, Resolution log, Cache and Query tabs, as far as the backend provides them.
- Logs: the live engine log, with a level filter, a target filter, Pause, Clear and Export.
- Events: backend state changes, with Export JSON.

### Routing

- Policies: Groups and Group membership tabs. Select nodes for a group or change its members.
- Nodes: nodes and their subscriptions, usage and refresh. A Latency tab appears once latency has been measured.
- Rules: Routing rules, DNS rules and Trace simulation tabs; the DNS rules tab appears only when the backend provides it.

### Settings

- Configuration: Modules, Quick setup, Sources and Validation tabs; Quick setup appears only when it is available.
- Settings: the Backend, Backend options, Geodata, Appearance, Backend actions and About cards.

A page stays in the navigation when the backend does not provide it. Opening it shows This backend does not provide this page and a Back to activity button; see [feature requirements](features.md#still-missing).

Press `?` to open Keyboard shortcuts. Press `g` and then a page letter within 800 ms to open that page, for example `g` `r` for Rules.

<a name="top-bar"></a>

## Use the top bar

1. Select the backend indicator at the bottom of the sidebar. A popover shows the engine and version, the connection state (for example Connected or Sign-in required), the API, the Backend URL and the profile. Select Edit backend to open the Backend card on Settings, or About doona for version details.
2. Select the search field, or press `Ctrl K` (`⌘K` on macOS). Type part of a page, tab, node, group or node source name, a live connection, a configuration file path or a rule expression. Select a result to open it.
3. When rules are held, a check-mark button with the number of held rules appears. Its name is Apply (N), or Apply (N); writes F files when the rules go to more than one file. Select it to write every held rule; see [the held list](routing.md#held-rules).
4. Select Reload honk and confirm in the Reload honk? dialog. honk reads its configuration files again and reloads; held rules are not written. The button appears only when the backend offers a reload.
5. Select Refresh, or press `r`, to read all displayed data from the backend again. A Data refreshed. toast confirms it. Refresh does not write anything and does not reload honk.
6. Select the Theme button to switch between light and dark. When the theme follows the system, it switches to the opposite scheme; the next press returns to System. The Language and Palette menus sit beside it; Palette also holds the Wordmark choice.

Apply (N) and Reload honk wait for each other: while one runs, the other is disabled.

<a name="panels"></a>

## Use tabs, details and actions

1. Select a tab under the page title to change the view within the page. The tab changes the view, not the page.
2. Select a row on Connections, Routing log or DNS to open its details. In a window at least 1200 px wide, the details appear in a panel beside the list; in a narrower window they open in a drawer.
3. Use the panel's one primary button for the main task. On a connection, this is Add rule.
4. Open More actions (the vertical dots button) for the other commands. On a connection, these include Show matched rule, View flow, Trace this connection and Close connection; the destructive command is last.
5. Close the panel with Close or `Esc`.

<a name="commit-verbs"></a>

## Hold, apply or save

- Hold appears only in the Add rule dialog, where it is the highlighted button. It puts the rule in the held list without writing it. Held rules are written later with Apply (N) in the top bar or Apply held rules on the Rules page; see [the held list](routing.md#held-rules).
- Apply writes the change to the backend now. In Add rule, Apply writes that rule and reloads honk at once. Configuration uses Apply to write an edited source, and the Backend options card on Settings uses Apply for runtime changes that are not written to the configuration file; see [editing a source](config-and-settings.md#edit-source) and [backend options](config-and-settings.md#runtime-options).
- Save stores a backend profile in this browser. Saving reloads the page to use the profile; see [Settings](config-and-settings.md#settings-page).

<a name="confirm"></a>

## Check that a change took effect

1. Read the toast after the write. A rule write shows New rule is in effect, Rule change is in effect, or N rules are in effect after Apply (N).
2. Read the toast detail: Existing connections keep their current route until they reconnect.
3. To check the new route, open Connections and inspect a connection opened after the change.

If a write fails, the toast shows the reason, and held rules that were not written stay held. For a read-only configuration file, see [troubleshooting](troubleshooting.md#read-only).

<a name="phone"></a>

## Navigate on a phone

In a window narrower than 1024 px, the sidebar is replaced by a bottom bar and a page strip.

1. Select Activity, Monitor, Routing or Settings in the bottom bar. Each section opens on the page you last visited in it during this browser session, or on its first page.
2. Select a page in the strip above the content. When the pages do not fit, swipe the strip sideways; the current page stays in view.
3. Open More options (the vertical dots button) in the top bar for the Language, Theme, Palette and Wordmark menus, Reload honk, and Backend. Backend opens the same popover as the sidebar indicator.
4. Use the search button, Refresh and Apply (N) directly in the top bar; they stay outside the menu.
5. In a page toolbar, the first action stays a button and the others move into More actions.

For installing honk and doona, see the [installation guide](install.md); for the configuration file, see [Configuration](configuration.md#config).
