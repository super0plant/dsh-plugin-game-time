window.__ModuleLoader__.load({
  id: 'dsh-plugin-game-time',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'game-time'
    const PANEL_ID = 'game-time'

    /* ------------------------------------------------------------------ *
     * Dictionaries
     * ------------------------------------------------------------------ */

    const VERSION = '0.16.0'

    const zh = {
      'panel': '游戏时长',
      'title': '游戏时长',
      'tab.today': '今日',
      'tab.all': '全部',
      'demo': '演示数据',
      'live.badge': '实时',
      'live.on': '监控中',
      'stat.today': '本日',
      'stat.week': '本周',
      'stat.total': '总计',
      'stat.avgDaily': '平均/天',
      'stat.lastWeekSum': '上周',
      'stat.lastMonthSum': '上月',
      'stat.played': '总天数',
      'stat.switch': '点击切换为{name}',
      'stat.tip.day': '今日 {now} · 平均每日 {avg}',
      'stat.tip.week': '本周 {now} · 上周总和 {avg}',
      'stat.tip.month': '本月 {now} · 上月总和 {avg}',
      'stat.tip.total': '已玩 {days} 天 · 共 {total} 天',
      'empty.title': '今天还没有玩游戏',
      'empty.body': '如要添加新游戏，把游戏 exe 或快捷方式拖到面板里',
      'today.section': '今天玩过',
      'today.count': '{n} 款',
      'today.col.game': '游戏',
      'today.col.day': '本日',
      'today.col.week': '本周',
      'today.col.total': '总计',
      'list.hint.vsAvg': '比平均',
      'list.hint.avgDay': '平均/天',
      'list.hint.days': '总天数',
      'list.hint.played': '已玩',
      'today.trend': '趋势图',
      'today.trend.hint': '左 24 小时 · 右 7/30 天，滚轮切换',
      'today.hours': '今日时段',
      'today.byDay': '按天',
      'today.byWeek': '按周',
      'search': '搜索游戏…',
      'sort.total': '总时长',
      'sort.week': '本周',
      'sort.recent': '最近游玩',
      'sort.name': '名称',
      'all.summary': '共 {n} 款 · 累计 {total}',
      'all.col.game': '游戏',
      'all.col.total': '总时长',
      'all.col.week': '本周',
      'all.col.recent': '最近游玩',
      'all.empty': '没有匹配的游戏',
      'back': '返回',
      'range.day': '今日',
      'range.last7': '近 7 天',
      'range.last30': '近 1 月',
      'range.week': '本周',
      'range.month': '本月',
      'range.all': '全部',
      'detail.sessions': '次数',
      'detail.average': '平均每天',
      'detail.playedDays': '已玩',
      'day': '天',
      'detail.platforms': '平台分布',
      'detail.trend': '时长趋势',
      'chart.bar': '柱状',
      'chart.line': '曲线',
      'chart.avg': '平均',
      'chart.other': '其他游戏',
      'chart.more': '其他 {n} 项',
      'chart.unit': '{title}（{unit}）',
      'chart.reset': '恢复默认',
      'unit.10m': '10分',
      'unit.30m': '30分',
      'unit.1h': '1时',
      'unit.1d': '1天',
      'unit.1w': '1周',
      'unit.1mo': '1月',
      'chart.empty': '这个范围内还没有记录',
      'all.analysis': '数据分析',
      'all.share.games': '游戏分布',
      'all.sessions': '游玩时段',
      'all.sessions.summary': '{n} 次 · 共 {total}',
      'list.segments': '游玩时段',
      'list.days': '每日明细',
      'list.months': '每月明细',
      'list.empty': '暂无记录',
      'list.count': '{n} 次',
      'minute': '分',
      'hour': '时',
      'noData': '—',
      'rel.today': '今天',
      'rel.yesterday': '昨天',
      'rel.days': '{n} 天前',
      'rel.never': '—',
      'settings': '设置',
      'refresh': '刷新状态',
      'settings.game': '游戏设置',
      'settings.monitor': '监控',
      'settings.interval': '监控间隔',
      'settings.interval.hint': '轮询进程的时间间隔；间隔越短，起止时间越准，开销略高。',
      'settings.history': '历史加载窗口',
      'settings.history.hint': '启动时只加载最近这段记录；往回翻时按需加载更早的，总计不受影响。',
      'settings.history.months': '{n} 个月',
      'settings.history.years': '{n} 年',
      'settings.startup': '启动',
      'settings.autostart': '开机自启',
      'settings.autostart.hint': '登录 Windows 后自动启动，从开机第一局开始计时。',
      'settings.autostart.unavailable': '独立版入口未安装，暂时无法设置。',
      'settings.autostart.dsh': 'DSH 里不可选：插件由 DSH 自己启动，这里写系统自启只会变成「让 DSH 随登录启动」，不属于本插件，也和你的 DSH 启动方式冲突。本项只在独立界面中生效。',
      'settings.autostart.dsh.hint': '在 DSH 中由 DSH 启动，本项不可用。',
      'settings.autostart.why': '为什么建议开启：只有常驻才能从开机那一刻开始记录；不开机自启时，打开程序之前的游玩不会被计入。',
      'settings.autostart.off': '关闭后只移除本程序的登录启动项，不影响其他软件，之后随时可以再打开。',
      'settings.ui': '界面',
      'settings.density': '界面密度',
      'settings.density.comfortable': '舒适',
      'settings.density.compact': '紧凑',
      'settings.density.hint': '紧凑会收紧行距、字号和内边距，一屏能多看一行。',
      'settings.language': '语言',
      'settings.language.hint': '默认跟随系统；这里只影响这个面板。',
      'settings.statsDays': '列表提示',
      'settings.statsDays.hint': '只给最近这段时间玩过的游戏显示「对比平均 / 平均每天 / 已玩」；很久没玩的游戏不再显示。',
      'settings.statsDays.days': '{n} 天',
      'language.auto': '跟随系统',
      'platform.other': '其他',
      'settings.platforms': '启动平台',
      'settings.platforms.hint': '拖 exe / 快捷方式到地址框可直接填入；详情页的平台分布按这里的清单聚合。',
      'settings.addPlatform': '添加平台',
      'settings.expand': '详细设置',
      'settings.collapse': '收起',
      'addGame.title': '添加游戏？',
      'addGame.name': '名称',
      'addGame.platform': '平台',
      'addGame.confirm': '添加',
      'addGame.owned': '「{name}」已经在计时这个 exe，没有重复添加',
      'drop.overlay': '松开即可添加游戏',
      'settings.dropGame.hint': '把 exe 或快捷方式拖到这里，直接添加游戏',
      'settings.dropGame.release': '松开即添加',
      'settings.dropGame.added': '已添加 {n} 个游戏',
      'settings.dropGame.owned': '「{name}」已经在计时这个 exe，没有重复添加',
      'settings.data': '数据',
      'settings.data.retention': '历史永久保留；默认加载最近 1 年，更早的记录按需加载',
      'settings.data.later': '数据文件',
      'settings.data.path': '全部数据在 %USERPROFILE%\\.dsh\\storages\\game-time\\：config.json 是设置，sessions.json 是全部会话。导入 / 导出暂未提供。',
      'settings.about': '关于',
      'settings.version': '当前版本 v{v}',
      'settings.checkUpdate': '检查更新',
      'settings.update.checking': '检查中…',
      'settings.update.latest': '已经是最新版',
      'settings.update.found': '有新版本 v{v}，点此下载',
      'settings.update.error': '检查失败，稍后再试',
      'settings.credit': '游戏时长 v{v} · super0plant',
      'game.platforms': '平台',
      'game.platforms.hint': '关掉的平台会从徽标、详情统计和总时长里隐藏。',
      'game.runs': '启动方式',
      'game.runs.hint': '一个游戏可以有多个启动入口，时长合并。',
      'game.run.add': '添加启动方式',
      'game.run.path': '启动文件或启动器路径',
      'game.name': '名称',
      'cancel': '取消',
      'delete': '删除',
      'game.manage': '游戏',
      'game.add': '添加游戏',
      'game.delete.title': '删除游戏？',
      'game.delete.body': '「{name}」及其全部历史记录会被删除，无法恢复。',
      'game.path': '游戏路径',
      'game.path.placeholder': '游戏本体 exe，例如 D:\\...\\ZenlessZoneZero.exe',
      'game.path.hint': '游戏本体的 exe；进程名从它自动识别。',
      'game.watch.dir': '限定目录：{dir}',
      'pick': '选择文件',
      'reveal': '打开所在位置',
      'pick.busy': '正在打开选择窗口…',
      'icon.extract': '从软件提取',
      'status.offline': '离线',
      'status.active': '正在计时',
      'status.error': '路径错误',
      'status.suspended': '挂起（未计时）',
      'icon.pick': '更换图标',
      'icon.reset': '移除图标',
      'game.icon': '图标',      'game.background': '背景图',
      'game.background.hint': '只在这个游戏的页面显示；这里不设，就用全局的底色。',
      'settings.background': '主界面背景',
      'settings.background.hint': '纯色打底、图片叠加：底色不透明，DSH 自己的配色透不上来；图片浓淡由下面的滑杆调。',
      'bg.base': '底色',
      'bg.base.hint': '面板最底层的纯色，完全不透明。',
      'settings.headerBackground': '标题背景',
      'settings.surfaceColor': '模块背景色',
      'settings.surfaceColor.hint': '卡片和面板的底色，会和底色叠出层次。',
      'game.headerBackground': '标题背景',
      'game.headerBackground.hint': '只在这个游戏的页面生效，留空则用总设置的标题背景。',
      'settings.headerBackground.hint': '只铺在顶部标题栏，向下渐隐。',
      'settings.headerHeight': '高度 (px)',
      'settings.headerFade': '渐变起点 (%)',
      'bg.imageOpacity': '图片透明度',
      'crop.zoom': '缩放',
      'crop.ratio.original': '原图',
      'crop.apply': '确定',
      'crop.hint': '拖动调整位置',
      'image.choose': '选择图片',
      'image.remove': '移除',
      'image.none': '未设置',
      'image.working': '处理中…',
      'fit.cover': '铺满',
      'fit.tile': '平铺',      'game.installs': '安装位置',
      'game.installs.add': '添加安装位置',
      'game.installs.hint': '一行 = 一个平台的一份安装；留空则该行不计时。',
      'drop.hint': '可以把 exe 或快捷方式拖到这里，自动解析路径和名称',
      'drop.hintBrowser': '网页版可以直接拖 .url / .lnk；exe 拿不到路径，请点右侧文件夹按钮选择',
      'drop.release': '松开即可添加',
      'drop.added': '已添加 {n} 个安装位置',
      'drop.dup': '{n} 个已存在',
      'drop.failed': '无法识别：{names}',
      'drop.unreadable': '读不出路径：浏览器里拖 exe 需要桌面端，请用文件夹按钮',
      'drop.needExe': '这里只接受 exe 或指向 exe 的快捷方式',
      'drop.badGame': '没能识别出游戏（{why}）',
      'drop.owned': '这个 exe 已经在「{name}」里计时，再加一条不会重复计时',
      'drop.ownedAddAsk': '「{name}」已经在计时这个 exe，仍然添加？',
      'drop.ownedAdd': '仍然添加',
      'game.group': '统计归组',
      'game.group.placeholder': '留空 = 按平台统计',
      'game.group.hint': '填了名字后，这个游戏的时长在「平台分布」里记在该名字下，不再占用平台；填平台名（如 Steam）会直接并进该平台。留空保持原来的按平台统计。',
      'game.group.color': '归组颜色',
      'game.group.into': '并入 {name}',
      'game.group.active': '归组：{name}',
      'game.archive': '归档',
      'game.archive.toggle': '从游戏列表里收起',
      'game.archive.exempt': '不放入自动归档',
      'game.archive.auto': '已按自动归档规则收起，玩一次自动恢复',
      'game.duplicate': '重复',
      'game.duplicate.hint': '这个 exe 已经在「{name}」里计时，这里不会再计时',
      'game.danger': '删除',
      'game.delete.button': '删除这个游戏',
      'game.delete.note': '历史记录会一起删除',
      'settings.autoArchive': '自动归档',
      'settings.autoArchive.on': '自动收起很久没玩的游戏',
      'settings.autoArchive.hint': '按最后游玩时间算；玩一次会自动恢复。从未玩过的游戏不会被收起。',
      'settings.autoArchive.after': '不玩超过',
      'settings.autoArchive.day': '天',
      'settings.autoArchive.month': '个月',
      'game.archive.hint': '只是折叠：从游戏列表里收起来，统计、图表和总计照常计入；历史记录一条不删，取消勾选立即恢复。',
      'all.archived': '{n} 个 · 共 {total}',
      'all.archive.uninstalled': '归档已卸载 ({n})',
      'archived': '已归档',
      'archived.title': '已归档游戏',
      'game.install.path': '游戏本体 exe 路径',
      'game.install.process': '监控进程：{process}',      'game.entries': '启动入口',
      'game.entries.add': '添加启动入口',
      'game.entries.hint': '顺序就是优先级：排在前面的启动器优先；都不在线时按安装位置。名称/路径留空时用平台的值。',
      'game.entry.drag': '拖动调整优先级（越靠前越优先）',
      'game.entry.name': '名称',
      'game.entry.path': '启动文件路径',
      'game.entry.args': '启动参数（可选，一般不填）',
      'platform.name': '平台名称',
      'platform.color': '颜色',
      'platform.processes': '附加进程名，逗号分隔（可选）',
      'platform.drag': '拖动排序',
      'platform.path': '默认启动文件（可空）',
      'platform.delete.title': '删除平台？',
      'platform.delete.body': '「{name}」当前被 {count} 个游戏引用，删除后这些游戏会失去该平台。',
      'game.watch': '监控进程',
      'game.watch.hint': '填游戏本体进程名（如 ZenlessZoneZero.exe），不要填启动器。',
      'game.watch.add': '添加进程',
      'game.watch.placeholder': '例如 ZenlessZoneZero.exe',
      'game.meta': '{platforms} 平台 · {entries} 启动入口 · {installs} 安装',
      'game.edit': '编辑',
      'game.new': '新游戏',      'game.color': '主题色',
      'game.banner': '横幅背景',
      'game.banner.later': '自定义图片与裁剪（后续版本）',
      'remove': '删除',
    }

    const en = {
      'panel': 'Game Time',
      'title': 'Game Time',
      'tab.today': 'Today',
      'tab.all': 'All',
      'demo': 'Demo data',
      'live.badge': 'Live',
      'live.on': 'Monitoring',
      'stat.today': 'Today',
      'stat.week': 'This week',
      'stat.total': 'Total',
      'stat.avgDaily': 'avg/day',
      'stat.lastWeekSum': 'last week',
      'stat.lastMonthSum': 'last month',
      'stat.played': 'total days',
      'stat.switch': 'Click to show {name}',
      'stat.tip.day': 'Today {now} · avg/day {avg}',
      'stat.tip.week': 'This week {now} · last week {avg}',
      'stat.tip.month': 'This month {now} · last month {avg}',
      'stat.tip.total': 'Played {days} days of {total}',
      'empty.title': 'No games played today',
      'empty.body': 'To add a new game, drop its exe or shortcut on this panel',
      'today.section': 'Played today',
      'today.count': '{n} games',
      'today.col.game': 'Game',
      'today.col.day': 'Today',
      'today.col.week': 'Week',
      'today.col.total': 'Total',
      'list.hint.vsAvg': 'vs avg',
      'list.hint.avgDay': 'avg/day',
      'list.hint.days': 'total days',
      'list.hint.played': 'played',
      'today.trend': 'Trend',
      'today.trend.hint': 'Left 24 hours · right 7/30 days, wheel to switch',
      'today.hours': 'Today by hour',
      'today.byDay': 'By day',
      'today.byWeek': 'By week',
      'search': 'Search games…',
      'sort.total': 'Total time',
      'sort.week': 'This week',
      'sort.recent': 'Recently played',
      'sort.name': 'Name',
      'all.summary': '{n} games · {total} total',
      'all.col.game': 'Game',
      'all.col.total': 'Total',
      'all.col.week': 'Week',
      'all.col.recent': 'Last played',
      'all.empty': 'No matching games',
      'back': 'Back',
      'range.day': 'Day',
      'range.last7': 'Last 7 days',
      'range.last30': 'Last 30 days',
      'range.week': 'Week',
      'range.month': 'Month',
      'range.all': 'All',
      'detail.sessions': 'Sessions',
      'detail.average': 'Avg/day',
      'detail.playedDays': 'Played',
      'day': 'd',
      'detail.platforms': 'Platforms',
      'detail.trend': 'Play time',
      'chart.bar': 'Bars',
      'chart.line': 'Line',
      'chart.avg': 'avg',
      'chart.other': 'Other games',
      'chart.more': '{n} more',
      'chart.unit': '{title} ({unit})',
      'chart.reset': 'Reset',
      'unit.10m': '10m',
      'unit.30m': '30m',
      'unit.1h': '1h',
      'unit.1d': '1d',
      'unit.1w': '1w',
      'unit.1mo': '1mo',
      'chart.empty': 'Nothing recorded in this range',
      'all.analysis': 'Breakdown',
      'all.share.games': 'Games',
      'all.sessions': 'Play sessions',
      'all.sessions.summary': '{n} sessions · {total}',
      'list.segments': 'Sessions',
      'list.days': 'Daily detail',
      'list.months': 'Monthly detail',
      'list.empty': 'No records',
      'list.count': '{n} sessions',
      'minute': 'm',
      'hour': 'h',
      'noData': '—',
      'rel.today': 'today',
      'rel.yesterday': 'yesterday',
      'rel.days': '{n}d ago',
      'rel.never': '—',
      'settings': 'Settings',
      'refresh': 'Refresh status',
      'settings.game': 'Game settings',
      'settings.monitor': 'Monitoring',
      'settings.interval': 'Polling interval',
      'settings.interval.hint': 'Shorter intervals track start and stop more precisely at a slightly higher cost.',
      'settings.history': 'History window',
      'settings.history.hint': 'Loads only this much history at startup; older records load on demand. Totals stay complete.',
      'settings.history.months': '{n} months',
      'settings.history.years': '{n} years',
      'settings.startup': 'Startup',
      'settings.autostart': 'Start with Windows',
      'settings.autostart.hint': 'Launches at login so play time is counted from the first game after boot.',
      'settings.autostart.unavailable': 'The standalone entry is not installed, so this cannot be set yet.',
      'settings.autostart.dsh': 'Unavailable in DSH: the plugin is started by DSH itself, so a login entry here would only start DSH — that belongs to your DSH install, not this plugin. This option applies to the standalone interface only.',
      'settings.autostart.dsh.hint': 'DSH starts the plugin itself, so this is not available here.',
      'settings.autostart.why': 'Why enable it: only a resident tracker can count from boot. Without it, time played before you open the app is not recorded.',
      'settings.autostart.off': 'Turning it off removes only this app’s login entry; other software is untouched and you can re-enable it anytime.',
      'settings.ui': 'Interface',
      'settings.density': 'Density',
      'settings.density.comfortable': 'Comfortable',
      'settings.density.compact': 'Compact',
      'settings.density.hint': 'Compact tightens rows, type and padding so one more line fits on screen.',
      'settings.language': 'Language',
      'settings.language.hint': 'Follows the system by default; this only affects this panel.',
      'settings.statsDays': 'Row hints',
      'settings.statsDays.hint': 'Show 对比平均 / 平均每天 / 已玩 on rows of games played within this window; games untouched for longer keep their rows plain.',
      'settings.statsDays.days': '{n} d',
      'language.auto': 'System',
      'platform.other': 'Other',
      'settings.platforms': 'Platforms',
      'settings.platforms.hint': 'Drop an exe or a shortcut onto the path box to fill it; the per-game platform breakdown aggregates over this list.',
      'settings.addPlatform': 'Add platform',
      'settings.expand': 'Details',
      'settings.collapse': 'Collapse',
      'addGame.title': 'Add this game?',
      'addGame.name': 'Name',
      'addGame.platform': 'Platform',
      'addGame.confirm': 'Add',
      'addGame.owned': '"{name}" is already timing this exe; nothing was added',
      'drop.overlay': 'Drop to add the game',
      'settings.dropGame.hint': 'Drop an exe or shortcut here to add a game',
      'settings.dropGame.release': 'Release to add',
      'settings.dropGame.added': 'Added {n} game(s)',
      'settings.dropGame.owned': '"{name}" already times this exe; nothing was added',
      'settings.data': 'Data',
      'settings.data.retention': 'Sessions kept forever; the last year loads by default, older pages on demand',
      'settings.data.later': 'Data files',
      'settings.data.path': 'Everything lives in %USERPROFILE%\\.dsh\\storages\\game-time\\: config.json holds settings, sessions.json holds every session. Import and export are not available yet.',
      'settings.about': 'About',
      'settings.version': 'Version v{v}',
      'settings.checkUpdate': 'Check for updates',
      'settings.update.checking': 'Checking…',
      'settings.update.latest': 'You are up to date',
      'settings.update.found': 'v{v} is available - open the download',
      'settings.update.error': 'Check failed, try again later',
      'settings.credit': 'Game Time v{v} · super0plant',
      'game.platforms': 'Platforms',
      'game.platforms.hint': 'Disabled platforms disappear from badges, the breakdown and the totals.',
      'game.runs': 'Launch entries',
      'game.runs.hint': 'Several launch entries merge their time into one game.',
      'game.run.add': 'Add launch entry',
      'game.run.path': 'Launcher or game executable path',
      'game.name': 'Name',
      'cancel': 'Cancel',
      'delete': 'Delete',
      'game.manage': 'Games',
      'game.add': 'Add game',
      'game.delete.title': 'Delete this game?',
      'game.delete.body': '“{name}” and all of its recorded history will be removed. This cannot be undone.',
      'game.path': 'Game path',
      'game.path.placeholder': 'Game executable, e.g. D:\\...\\ZenlessZoneZero.exe',
      'game.path.hint': 'The game exe itself; the process name is read from it.',
      'game.watch.dir': 'Limited to {dir}',
      'pick': 'Choose file',
      'reveal': 'Show in folder',
      'pick.busy': 'Opening the file picker…',
      'icon.extract': 'Use app icon',
      'status.offline': 'Offline',
      'status.active': 'Timing',
      'status.error': 'Path missing',
      'status.suspended': 'Suspended',
      'icon.pick': 'Change icon',
      'icon.reset': 'Remove icon',
      'game.icon': 'Icon',      'game.background': 'Background',
      'game.background.hint': 'Only on this game page; empty keeps the global base colour.',
      'settings.background': 'Panel background',
      'settings.background.hint': 'Solid colour with the image on top: the base is opaque, so DSH colours never show through. Use the slider for image strength.',
      'bg.base': 'Base colour',
      'bg.base.hint': 'The opaque colour under everything.',
      'settings.headerBackground': 'Header background',
      'settings.surfaceColor': 'Block colour',
      'settings.surfaceColor.hint': 'Card and panel colour; layers over the base colour.',
      'game.headerBackground': 'Header background',
      'game.headerBackground.hint': 'Only inside this game; empty falls back to the global header image.',
      'settings.headerBackground.hint': 'Behind the top bar only, fading downwards.',
      'settings.headerHeight': 'Height (px)',
      'settings.headerFade': 'Fade start (%)',
      'bg.imageOpacity': 'Image opacity',
      'crop.zoom': 'Zoom',
      'crop.ratio.original': 'Original',
      'crop.apply': 'Apply',
      'crop.hint': 'Drag to reposition',
      'image.choose': 'Choose image',
      'image.remove': 'Remove',
      'image.none': 'Not set',
      'image.working': 'Working…',
      'fit.cover': 'Cover',
      'fit.tile': 'Tile',      'game.installs': 'Installs',
      'game.installs.add': 'Add install',
      'game.installs.hint': 'One row per platform install; empty rows never count time.',
      'drop.hint': 'Drop an exe or shortcut here to add it automatically',
      'drop.hintBrowser': 'The web build reads .url / .lnk drops; for an exe use the folder button',
      'drop.release': 'Release to add',
      'drop.added': 'Added {n} install(s)',
      'drop.dup': '{n} already present',
      'drop.failed': 'Could not read: {names}',
      'drop.unreadable': 'No path available; dropping an exe needs the desktop app, use the folder button',
      'drop.needExe': 'Only an exe or a shortcut to one is accepted here',
      'drop.badGame': 'Could not read a game from this file ({why})',
      'drop.owned': 'This exe is already timed under "{name}"; a second row would stay at zero',
      'drop.ownedAddAsk': '"{name}" already times this exe. Add anyway?',
      'drop.ownedAdd': 'Add anyway',
      'game.group': 'Stat group',
      'game.group.placeholder': 'Empty = by platform',
      'game.group.hint': 'With a name, this game counts under that name in the platform breakdown instead of its platform. A platform name such as Steam folds into that platform. Empty keeps the platform.',
      'game.group.color': 'Group colour',
      'game.group.into': 'Folds into {name}',
      'game.group.active': 'Grouped as {name}',
      'game.archive': 'Archive',
      'game.archive.toggle': 'Fold out of the game list',
      'game.archive.exempt': 'Never auto-archive',
      'game.archive.auto': 'Folded by the auto-archive rule; playing it restores it',
      'game.duplicate': 'Duplicate',
      'game.duplicate.hint': 'This exe is already timed under "{name}"; this entry will not record time',
      'game.danger': 'Delete',
      'game.delete.button': 'Delete this game',
      'game.delete.note': 'Play history is removed with it',
      'settings.autoArchive': 'Auto archive',
      'settings.autoArchive.on': 'Fold games that have not been played for a while',
      'settings.autoArchive.hint': 'Based on the last play time; playing the game restores it. Games never played are left alone.',
      'settings.autoArchive.after': 'Not played for',
      'settings.autoArchive.day': 'days',
      'settings.autoArchive.month': 'months',
      'game.archive.hint': 'Fold only: the game leaves the game tables, while totals, charts and sessions keep counting it. Nothing is deleted; uncheck to unfold.',
      'all.archived': '{n} · {total} total',
      'all.archive.uninstalled': 'Archive uninstalled ({n})',
      'archived': 'Archived',
      'archived.title': 'Archived games',
      'game.install.path': 'Game executable path',
      'game.install.process': 'Watching: {process}',      'game.entries': 'Launch entries',
      'game.entries.add': 'Add launch entry',
      'game.entries.hint': 'Order is priority: the first running launcher wins; otherwise the install platform. Empty name/path fall back to the platform.',
      'game.entry.drag': 'Drag to reorder (top wins)',
      'game.entry.name': 'Name',
      'game.entry.path': 'Launcher or game path',
      'game.entry.args': 'Arguments (optional)',
      'platform.name': 'Platform name',
      'platform.color': 'Colour',
      'platform.processes': 'Extra process names, comma separated',
      'platform.drag': 'Drag to reorder',
      'platform.path': 'Default launcher (optional)',
      'platform.delete.title': 'Delete this platform?',
      'platform.delete.body': '“{name}” is used by {count} game(s); they will lose this platform.',
      'game.watch': 'Watched processes',
      'game.watch.hint': 'The game process itself (for example ZenlessZoneZero.exe), never the launcher.',
      'game.watch.add': 'Add process',
      'game.watch.placeholder': 'e.g. ZenlessZoneZero.exe',
      'game.meta': '{platforms} platforms · {entries} entries · {installs} installs',
      'game.edit': 'Edit',
      'game.new': 'New game',      'game.color': 'Accent colour',
      'game.banner': 'Banner',
      'game.banner.later': 'Custom image with cropping (later version)',
      'remove': 'Remove',
    }

    /* ------------------------------------------------------------------ *
     * Formatting and date helpers
     * ------------------------------------------------------------------ */

    const MINUTE = 60000
    const HOUR_MS = 3600000
    const DAY_MS = 86400000

    function pad2(n) {
      return n < 10 ? '0' + n : String(n)
    }

    function startOfDay(value) {
      const d = new Date(value)
      d.setHours(0, 0, 0, 0)
      return d
    }

    function startOfWeek(value) {
      const d = startOfDay(value)
      d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
      return d
    }

    function startOfMonth(value) {
      const d = startOfDay(value)
      d.setDate(1)
      return d
    }

    function dayKey(value) {
      const d = new Date(value)
      return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate())
    }

    function monthKey(value) {
      const d = new Date(value)
      return d.getFullYear() + '-' + pad2(d.getMonth() + 1)
    }

    /* --- one "average" definition for the whole panel -------------------- *
     * Every average in this plugin means "per day that actually had play".
     * A day with no play must never lower it, and a game's all-time average
     * must agree with its row hint, its detail page and the chart line — so
     * these four helpers are the only place the rule is written down.
     */

    /** Distinct local days that hold at least one session inside [from, to). */
    function activeDaysOf(sessions, from, to) {
      const seen = new Set()
      const startEdge = from ? from.getTime() : null
      const endEdge = to ? to.getTime() : null
      for (const session of Array.isArray(sessions) ? sessions : []) {
        const start = startEdge === null ? session.start : Math.max(session.start, startEdge)
        const end = endEdge === null ? session.end : Math.min(session.end, endEdge)
        if (end <= start) continue
        seen.add(dayKey(start))
      }
      return seen.size
    }

    /** Seconds per played day; 0 when nothing was ever played. */
    function averagePerDay(seconds, days) {
      const count = Number(days) || 0
      if (count <= 0) return 0
      return Math.max(0, Number(seconds) || 0) / count
    }

    /** Relative change in percent; null when there is no baseline to compare. */
    function comparePercent(current, base) {
      const edge = Number(base) || 0
      if (edge <= 0) return null
      return ((Number(current) || 0) - edge) / edge * 100
    }

    /** Mean of the non-empty buckets — empty buckets are not "zero days". */
    function activeMean(points) {
      const list = Array.isArray(points) ? points : []
      let sum = 0
      let count = 0
      for (const point of list) {
        const seconds = point && point.seconds > 0 ? point.seconds : 0
        if (seconds <= 0) continue
        sum += seconds
        count += 1
      }
      return count > 0 ? sum / count : 0
    }

    /**
     * Panel width → breakpoint name. The panel is a container inside DSH, not
     * the browser window, so `@media` is the wrong tool: the same window can
     * hold a 380 px sidebar panel or a 1200 px full-width one.
     */
    function widthTier(width) {
      const value = Number(width) || 0
      if (value <= 0) return 'lg'
      if (value >= 820) return 'lg'
      if (value >= 700) return 'md'
      if (value >= 620) return 'sm'
      if (value >= 540) return 'xs'
      return 'xxs'
    }

    function clockOf(value) {
      const d = new Date(value)
      return pad2(d.getHours()) + ':' + pad2(d.getMinutes())
    }

    function shortDate(value) {
      const d = new Date(value)
      return pad2(d.getMonth() + 1) + '-' + pad2(d.getDate())
    }

    function durationParts(seconds, t) {
      const total = Math.max(0, Math.round(seconds))
      if (total < 60) return [{ v: total === 0 ? '0' : '1', u: t('minute') }]
      let hours = Math.floor(total / 3600)
      let minutes = Math.round((total % 3600) / 60)
      if (minutes === 60) {
        hours += 1
        minutes = 0
      }
      if (hours === 0) return [{ v: String(minutes), u: t('minute') }]
      if (minutes === 0) return [{ v: String(hours), u: t('hour') }]
      return [
        { v: String(hours), u: t('hour') },
        { v: String(minutes), u: t('minute') },
      ]
    }

    function formatDuration(seconds, t) {
      return durationParts(seconds, t)
        .map(function (part) {
          return part.v + part.u
        })
        .join('')
    }

    /** Short value for the hover chip: "3.5时" / "42分". */
    function compactDuration(seconds, t) {
      const total = Math.max(0, Math.round(Number(seconds) || 0))
      if (total < 3600) return Math.round(total / 60) + t('minute')
      const hours = Math.round((total / 3600) * 10) / 10
      return String(hours).replace('.0', '') + t('hour')
    }
    function formatRelative(ts, t, now) {
      if (!ts) return t('rel.never')
      const days = Math.round((startOfDay(now).getTime() - startOfDay(ts).getTime()) / DAY_MS)
      if (days <= 0) return t('rel.today')
      if (days === 1) return t('rel.yesterday')
      return t('rel.days').replace('{n}', String(days))
    }

    function baseName(path) {
      const parts = String(path).split(/[\\\\/]/)
      return parts[parts.length - 1] || ''
    }

    function dirName(path) {
      const value = String(path)
      const cut = Math.max(value.lastIndexOf('\\\\'), value.lastIndexOf('/'))
      return cut > 0 ? value.slice(0, cut) : ''
    }

    function rangeBounds(range, anchor) {
      if (range === 'day') {
        const from = startOfDay(anchor)
        return { from: from, to: new Date(from.getTime() + DAY_MS) }
      }
      if (range === 'last7' || range === 'last30') {
        const days = range === 'last7' ? 7 : 30
        const to = new Date(startOfDay(anchor).getTime() + DAY_MS)
        return { from: new Date(to.getTime() - days * DAY_MS), to: to }
      }
      if (range === 'week') {
        const from = startOfWeek(anchor)
        return { from: from, to: new Date(from.getTime() + 7 * DAY_MS) }
      }
      if (range === 'month') {
        const from = startOfMonth(anchor)
        return { from: from, to: new Date(from.getFullYear(), from.getMonth() + 1, 1) }
      }
      return { from: null, to: null }
    }

    /* --- scale grains: the wheel steps between these --------------------- */

    const GRAIN = {
      m10: { key: '10m', kind: 'minute', ms: 600000 },
      m30: { key: '30m', kind: 'minute', ms: 1800000 },
      h1: { key: '1h', kind: 'minute', ms: 3600000 },
      d1: { key: '1d', kind: 'day', ms: DAY_MS },
      w1: { key: '1w', kind: 'week', ms: 7 * DAY_MS },
      mo: { key: '1mo', kind: 'month', ms: 0 },
    }

    // Coarse to fine. `base` is the level a range opens on; one wheel notch
    // moves one level, up = finer.
    const GRAIN_LEVELS = {
      day: { levels: [GRAIN.h1, GRAIN.m30, GRAIN.m10], base: 0 },
      last7: { levels: [GRAIN.d1], base: 0 },
      last30: { levels: [GRAIN.d1], base: 0 },
      week: { levels: [GRAIN.d1], base: 0 },
      month: { levels: [GRAIN.w1, GRAIN.d1], base: 1 },
      all: { levels: [GRAIN.mo, GRAIN.w1, GRAIN.d1], base: 0 },
    }

    function baseGrain(range) {
      const config = GRAIN_LEVELS[range] || GRAIN_LEVELS.day
      return config.levels[config.base]
    }

    function grainOf(range, grain) {
      return grain || baseGrain(range)
    }

    /** The exact span a chart draws: every range is a rolling window ending at its anchor. */
    function windowBounds(range, anchor, grain) {
      const unit = grainOf(range, grain)
      const end = clampAnchor(range, anchor, unit)
      if (range === 'all') {
        if (unit.kind === 'month') {
          const start = new Date(end.getFullYear(), end.getMonth() - 11, 1)
          return { from: start, to: new Date(end.getFullYear(), end.getMonth() + 1, 1) }
        }
        return { from: new Date(end.getTime() - 365 * DAY_MS), to: end }
      }
      const days = windowLength(range, end)
      return { from: new Date(end.getTime() - days * DAY_MS), to: end }
    }

    /** The visible window printed next to a chart's title. */
    function rangeLabelOf(range, anchor, grain) {
      const unit = grainOf(range, grain)
      if (range === 'all') {
        const end = clampAnchor('all', anchor, unit)
        if (unit.kind === 'month') {
          const start = new Date(end.getFullYear(), end.getMonth() - 11, 1)
          return (
            start.getFullYear() +
            '.' +
            pad2(start.getMonth() + 1) +
            ' – ' +
            end.getFullYear() +
            '.' +
            pad2(end.getMonth() + 1)
          )
        }
        const start = new Date(end.getTime() - 365 * DAY_MS)
        const stamp = function (value) {
          return value.getFullYear() + '.' + pad2(value.getMonth() + 1) + '.' + pad2(value.getDate())
        }
        return stamp(start) + ' – ' + stamp(new Date(end.getTime() - DAY_MS))
      }
      if (range === 'day') {
        const end = clampAnchor('day', anchor, unit)
        const start = new Date(end.getTime() - DAY_MS)
        const wholeDay = start.getHours() === 0 && end.getHours() === 0
        if (wholeDay) return shortDate(start)
        return shortDate(start) + ' ' + clockOf(start) + ' – ' + shortDate(end) + ' ' + clockOf(end)
      }
      const end = clampAnchor(range, anchor, unit)
      const days = windowLength(range, end)
      const start = new Date(end.getTime() - days * DAY_MS)
      return shortDate(start) + ' – ' + shortDate(new Date(end.getTime() - DAY_MS))
    }

    function earliestSessionStart() {
      let earliest = null
      for (const session of SESSIONS) {
        if (earliest === null || session.start < earliest) earliest = session.start
      }
      return earliest
    }

    /** Round up to the next whole hour — a rolling day window ends on an hour. */
    function ceilHour(value) {
      const hour = new Date(value)
      hour.setMinutes(0, 0, 0)
      if (hour.getTime() < value.getTime()) hour.setHours(hour.getHours() + 1)
      return hour
    }

    /** Round up to the next midnight — the day-long windows end on a day. */
    function ceilDay(value) {
      const day = startOfDay(value)
      if (day.getTime() < value.getTime()) day.setDate(day.getDate() + 1)
      return day
    }

    /** How many bars one window holds: the full day, week or month. */
    function windowLength(range, end) {
      if (range === 'day') return 1
      if (range === 'last7') return 7
      if (range === 'last30') return 30
      if (range === 'week') return 7
      const last = new Date(end.getTime() - 1)
      return new Date(last.getFullYear(), last.getMonth() + 1, 0).getDate()
    }

    /** Every window ends at the end of today / this week / this month. */
    function defaultAnchor(range) {
      const day = startOfDay(NOW)
      if (range === 'day') return new Date(day.getTime() + DAY_MS)
      if (range === 'last7' || range === 'last30') return new Date(day.getTime() + DAY_MS)
      if (range === 'week') return new Date(startOfWeek(day).getTime() + 7 * DAY_MS)
      if (range === 'month') return new Date(day.getFullYear(), day.getMonth() + 1, 1)
      return new Date(NOW)
    }

    /** Round up to the grain: a 10-minute mark, an hour, a day or a month. */
    function alignEnd(value, grain) {
      if (!grain || grain.kind === 'month') return startOfMonth(value)
      if (grain.kind === 'minute') {
        const end = new Date(value)
        end.setSeconds(0, 0)
        const step = Math.max(1, Math.round(grain.ms / MINUTE))
        const rest = end.getMinutes() % step
        if (rest !== 0) end.setMinutes(end.getMinutes() + (step - rest))
        return end
      }
      return ceilDay(value)
    }

    /**
     * Panning stops at real data: never past the end of the current period,
     * never before the first recorded day. Every range is a rolling window
     * ending at the anchor, aligned to the current grain.
     */
    function clampAnchor(range, anchor, grain) {
      const unit = grainOf(range, grain)
      // The true first session comes from the host; the loaded window may start
      // later, and `ensureHistory()` fills it in when panning reaches the edge.
      const earliest = FIRST_START !== null ? FIRST_START : earliestSessionStart()
      const day = startOfDay(NOW)
      if (unit.kind === 'month') {
        const month = startOfMonth(anchor)
        const min = startOfMonth(earliest === null ? NOW : new Date(earliest))
        const max = startOfMonth(day)
        if (month.getTime() < min.getTime()) return min
        if (month.getTime() > max.getTime()) return max
        return month
      }
      const periodEnd =
        range === 'day'
          ? new Date(day.getTime() + DAY_MS)
          : range === 'week'
            ? new Date(startOfWeek(day).getTime() + 7 * DAY_MS)
            : range === 'month'
              ? new Date(day.getFullYear(), day.getMonth() + 1, 1)
              : new Date(day.getTime() + DAY_MS)
      const minEnd = earliest === null ? periodEnd : new Date(startOfDay(new Date(earliest)).getTime() + DAY_MS)
      const end = alignEnd(anchor, unit)
      if (end.getTime() < minEnd.getTime()) return minEnd
      if (end.getTime() > periodEnd.getTime()) return periodEnd
      return end
    }

    /** One step is one x tick: a grain of the current zoom level. */
    function panAnchor(range, anchor, delta, grain) {
      const unit = grainOf(range, grain)
      const next = new Date(anchor)
      if (unit.kind === 'month') next.setMonth(next.getMonth() + delta)
      else next.setTime(next.getTime() + delta * unit.ms)
      return clampAnchor(range, next, unit)
    }

    /* ------------------------------------------------------------------ *
     * Demo data — replaced by a Host query in a later round
     * ------------------------------------------------------------------ */

    function createRng(seed) {
      let state = seed >>> 0
      return function next() {
        state = (state * 1664525 + 1013904223) >>> 0
        return state / 4294967296
      }
    }

    /**
     * "Now" is a moving value, not the moment the bundle loaded. The desktop
     * shell lives in the tray for days, so a frozen clock would keep "今日" on
     * the day the panel was opened — exactly what a 13th→14th session saw.
     * `setNow()` moves the same Date instance (so every closure sees it) and
     * reports whether the calendar day changed.
     */
    const NOW = new Date()

    function setNow(value) {
      const next = value instanceof Date ? value.getTime() : Number(value)
      if (!Number.isFinite(next) || next <= 0) return false
      const dayChanged = dayKey(next) !== dayKey(NOW)
      NOW.setTime(next)
      return dayChanged
    }

    const PLATFORMS = {
      mihoyo: { id: 'mihoyo', name: '米哈游', short: '米', color: '#4f8ff7' },
      steam: { id: 'steam', name: 'Steam', short: 'S', color: '#66c0f4' },
      epic: { id: 'epic', name: 'Epic', short: 'E', color: '#b6b6f2' },
      tencent: { id: 'tencent', name: '腾讯', short: '腾', color: '#f0a53e' },
      gog: { id: 'gog', name: 'GOG', short: 'G', color: '#a86bd6' },
      riot: { id: 'riot', name: 'Riot', short: 'R', color: '#e35c5c' },
    }

    const GAMES = [
      {
        id: 'zzz',
        name: '绝区零',
        glyph: '绝',
        color: '#4f8ff7',
        platforms: ['mihoyo'],
        weight: 1,
        disabled: [],
        runs: [
          {
            id: 'zzz-r1',
            platformId: 'mihoyo',
            path: 'D:\\GameFile\\miHoYo Launcher\\launcher.exe',
            args: '--game=nap_cn',
          },
          {
            id: 'zzz-r2',
            platformId: 'mihoyo',
            path: 'D:\\GameFile\\miHoYo Launcher\\games\\ZenlessZoneZero Game\\ZenlessZoneZero.exe',
            args: '-use-d3d12',
          },
          {
            id: 'zzz-r3',
            platformId: 'mihoyo',
            path: 'C:\\Users\\Public\\XXMI Launcher\\XXMI Launcher.exe',
            args: '--nogui --xxmi ZZMI',
          },
        ],
      },
      {
        id: 'genshin',
        name: '原神',
        glyph: '原',
        color: '#5cc9b8',
        platforms: ['mihoyo'],
        weight: 0.55,
        disabled: [],
        runs: [
          {
            id: 'genshin-r1',
            platformId: 'mihoyo',
            path: 'D:\\GameFile\\miHoYo Launcher\\launcher.exe',
            args: '--game=hk4e_cn',
          },
        ],
      },
      {
        id: 'hsr',
        name: '崩坏：星穹铁道',
        glyph: '星',
        color: '#8f7af0',
        platforms: ['mihoyo'],
        weight: 0.45,
        disabled: [],
        runs: [
          {
            id: 'hsr-r1',
            platformId: 'mihoyo',
            path: 'D:\\GameFile\\miHoYo Launcher\\launcher.exe',
            args: '--game=hkrpg_cn',
          },
        ],
      },
      {
        id: 'lol-cn',
        name: '英雄联盟（国服）',
        glyph: 'L',
        color: '#d7b45a',
        platforms: ['tencent'],
        weight: 0.5,
        disabled: [],
        runs: [
          {
            id: 'lol-cn-r1',
            platformId: 'tencent',
            path: 'C:\\Riot Games\\League of Legends\\LeagueClient.exe',
            args: '',
          },
        ],
      },
      {
        id: 'lol-global',
        name: '英雄联盟（国际服）',
        glyph: 'L',
        color: '#e35c5c',
        platforms: ['riot'],
        weight: 0.12,
        disabled: [],
        runs: [
          {
            id: 'lol-global-r1',
            platformId: 'riot',
            path: 'C:\\Riot Games\\League of Legends (US)\\LeagueClient.exe',
            args: '',
          },
        ],
      },
      {
        id: 'cp2077',
        name: '赛博朋克 2077',
        glyph: '7',
        color: '#f2d94e',
        platforms: ['steam', 'gog'],
        weight: 0.2,
        disabled: [],
        runs: [
          {
            id: 'cp2077-r1',
            platformId: 'steam',
            path: 'D:\\SteamLibrary\\steamapps\\common\\Cyberpunk 2077\\bin\\x64\\Cyberpunk2077.exe',
            args: '',
          },
          {
            id: 'cp2077-r2',
            platformId: 'gog',
            path: 'D:\\GOG Games\\Cyberpunk 2077\\bin\\x64\\Cyberpunk2077.exe',
            args: '',
          },
        ],
      },
      {
        id: 'hollow',
        name: '空洞骑士',
        glyph: '空',
        color: '#9aa7b4',
        platforms: ['steam', 'epic'],
        weight: 0.15,
        disabled: [],
        runs: [
          {
            id: 'hollow-r1',
            platformId: 'steam',
            path: 'D:\\SteamLibrary\\steamapps\\common\\Hollow Knight\\hollow_knight.exe',
            args: '',
          },
        ],
      },
    ]

    const COLOR_PRESETS = ['#4f8ff7', '#5cc9b8', '#8f7af0', '#d7b45a', '#e35c5c', '#f2d94e', '#9aa7b4', '#7fbf6a']


    const DEMO_PATHS = {
      zzz: 'D:\GameFile\miHoYo Launcher\games\ZenlessZoneZero Game\ZenlessZoneZero.exe',
      genshin: 'D:\GameFile\miHoYo Launcher\games\Genshin Impact Game\GenshinImpact.exe',
      hsr: 'D:\GameFile\miHoYo Launcher\games\Star Rail Game\StarRail.exe',
      'lol-cn': 'D:\GameFile\TencentGames\英雄联盟(26)\Game\League of Legends.exe',
      'lol-global': 'D:\GameFile\Riot Games\League of Legends\Game\League of Legends.exe',
      cp2077: 'D:\SteamLibrary\steamapps\common\Cyberpunk 2077\bin\x64\Cyberpunk2077.exe',
      hollow: 'D:\SteamLibrary\steamapps\common\Hollow Knight\hollow_knight.exe',
    }

    for (const key of Object.keys(PLATFORMS)) {
      if (typeof PLATFORMS[key].path !== 'string') PLATFORMS[key].path = ''
    }

    for (const game of GAMES) {
      if (!Array.isArray(game.entries)) game.entries = game.runs || []
      if (!Array.isArray(game.installs)) game.installs = []
      if (game.installs.length === 0) {
        const path = DEMO_PATHS[game.id] || ''
        if (path) {
          game.installs.push({
            id: game.id + '-i1',
            platformId: (game.platforms || [])[0],
            path: path,
          })
        }
      }
    }
    const SETTINGS = {
      intervalSec: 10,
      // foregroundOnly 已废弃（0.4.0）：没有实现，见 HANDOFF §10 的替代方案。
      autostart: true,
      density: 'comfortable',
      language: 'auto',
      historyDays: 365,
      statsDays: 7,
      baseColor: '#0b0b0c',
      imageOpacity: 1,
      todayChartHours: 'line',
      todayChartRange: 'line',
      todayWindow: 'last7',
      autoArchive: { enabled: false, value: 60, unit: 'day' },
    }

    /** The built-in "other" platform is shown in the current language. */
    let TR_FN = null

    function platformLabel(platform) {
      if (!platform) return ''
      if (platform.id === 'other' && TR_FN) return TR_FN('platform.other')
      return platform.name
    }

    function enabledPlatforms(game) {
      const ids = []
      const add = function (id) {
        if (id && PLATFORMS[id] && ids.indexOf(id) < 0) ids.push(id)
      }
      for (const install of game.installs || []) add(install.platformId)
      for (const entry of game.entries || []) add(entry.platformId)
      for (const id of game.platforms || []) add(id)
      return ids
    }

    function buildSessions() {
      const rng = createRng(20261108)
      const out = []
      const days = 400

      const todayPlan = [
        { gameId: 'zzz', platformId: 'mihoyo', until: 420, minutes: 46 },
        { gameId: 'zzz', platformId: 'mihoyo', until: 130, minutes: 57 },
        { gameId: 'genshin', platformId: 'mihoyo', until: 260, minutes: 32 },
        { gameId: 'lol-cn', platformId: 'tencent', until: 540, minutes: 47 },
      ]
      todayPlan.forEach(function (item, index) {
        const end = NOW.getTime() - item.until * MINUTE
        out.push({
          id: 'today-' + index,
          gameId: item.gameId,
          platformId: item.platformId,
          start: end - item.minutes * MINUTE,
          end: end,
        })
      })

      for (let back = 1; back < days; back++) {
        const dayStart = startOfDay(NOW)
        dayStart.setDate(dayStart.getDate() - back)
        for (const game of GAMES) {
          if (rng() > 0.45 * game.weight) continue
          const count = 1 + (rng() < 0.35 ? 1 : 0) + (rng() < 0.12 ? 1 : 0)
          let cursor = 9 * 60 + Math.floor(rng() * 600)
          for (let i = 0; i < count; i++) {
            const lengthMin = 18 + Math.floor(rng() * 130 * game.weight + rng() * 40)
            const startAt = dayStart.getTime() + cursor * MINUTE
            const endAt = startAt + lengthMin * MINUTE
            const roll = rng()
            const platform =
              game.platforms.length === 1 || roll < 0.8
                ? game.platforms[0]
                : game.platforms[1 + Math.floor(rng() * (game.platforms.length - 1))]
            out.push({
              id: game.id + '-' + back + '-' + i,
              gameId: game.id,
              platformId: platform,
              start: startAt,
              end: endAt,
            })
            cursor += lengthMin + 40 + Math.floor(rng() * 180)
            if (cursor > 22 * 60) break
          }
        }
      }
      return out
    }

    const SESSIONS = buildSessions()

    /* ------------------------------------------------------------------ *
     * Live data — the Host face replaces the demo snapshot in place
     * ------------------------------------------------------------------ */

    let LIVE = false
    let ACTIVE = []
    let ENV = { standalone: false, autostart: { supported: false, reason: 'dsh', enabled: true, target: '' } }
    let CURRENT_ROUTE = 'today'
    // Lazy history: `/state` only carries the configured window. Everything
    // older is fetched on demand; these module values remember how far back
    // the client has already loaded and what the true all-time numbers are.
    let HISTORY_FROM = null
    let FIRST_START = null
    let ALL_TOTALS = null
    let LAST_PLAYED = null
    // All-time "how many days did I play this game" per game, and the union
    // across games. Both come from the host because the client only holds the
    // lazy-load window; counting here would disagree with "总计" (HANDOFF §9).
    let ALL_PLAYED_DAYS = null
    let PLAYED_DAYS_TOTAL = 0
    let WINDOW_PLAYED_DAYS = null
    let HISTORY_REQUESTS = []
    // Module scope, not component state: the panel unmounts when you switch
    // away, so a React state would drop you back on the start page every time.
    // A client reload (refresh / DSH restart) rebuilds the module and resets it.
    let LAST_ROUTE = { name: 'today' }
    let bumpPage = null

    function applyLiveState(payload) {
      if (!payload || !Array.isArray(payload.games)) return
      const platforms = payload.platforms && typeof payload.platforms === 'object' ? payload.platforms : {}
      for (const key of Object.keys(PLATFORMS)) delete PLATFORMS[key]
      for (const key of Object.keys(platforms)) PLATFORMS[key] = platforms[key]

      GAMES.length = 0
      for (const game of payload.games) {
        if (!Array.isArray(game.platforms)) game.platforms = []
        if (!Array.isArray(game.disabled)) game.disabled = []
        if (!Array.isArray(game.entries)) game.entries = []
        if (!Array.isArray(game.installs)) game.installs = []
        GAMES.push(game)
      }

      const wasLive = LIVE
      const liveGames = new Set(
        GAMES.map(function (game) {
          return game.id
        })
      )
      const historyFrom = Number(payload.historyFrom)
      const hasWindow = Number.isFinite(historyFrom) && historyFrom > 0
      // Only a later refresh may keep already-loaded older pages. The first
      // live payload starts from the demo snapshot, which must never survive;
      // a deleted game's cached pages must not survive either.
      const older = wasLive && hasWindow
        ? SESSIONS.filter(function (session) {
            return session.end < historyFrom && liveGames.has(session.gameId)
          })
        : []

      SESSIONS.length = 0
      const sessions = Array.isArray(payload.sessions) ? payload.sessions : []
      for (const session of sessions) SESSIONS.push(session)
      if (hasWindow) {
        const known = new Set(
          SESSIONS.map(function (session) {
            return session.id
          })
        )
        for (const session of older) {
          if (known.has(session.id)) continue
          known.add(session.id)
          SESSIONS.push(session)
        }
      }

      const liveNow = payload.now || Date.now()
      // Trust the host clock for every window that depends on "now" (今日 /
      // 本周 / relative labels). This is the rollover that matters: the poll
      // that lands after midnight re-anchors the day without a reload.
      setNow(liveNow)
      for (const item of Array.isArray(payload.active) ? payload.active : []) {
        SESSIONS.push({
          id: 'live-' + item.gameId,
          gameId: item.gameId,
          platformId: item.platformId,
          source: null,
          start: item.start,
          end: liveNow,
          live: true,
        })
      }

      if (hasWindow) HISTORY_FROM = HISTORY_FROM === null ? historyFrom : Math.min(HISTORY_FROM, historyFrom)
      const firstStart = Number(payload.firstStart)
      if (Number.isFinite(firstStart) && firstStart > 0) FIRST_START = firstStart
      else if (payload.firstStart === null) FIRST_START = null
      ALL_TOTALS = payload.totals && typeof payload.totals === 'object' ? payload.totals : null
      LAST_PLAYED = payload.lastPlayed && typeof payload.lastPlayed === 'object' ? payload.lastPlayed : null
      ALL_PLAYED_DAYS = payload.playedDays && typeof payload.playedDays === 'object' ? payload.playedDays : null
      PLAYED_DAYS_TOTAL = Number(payload.playedDaysTotal) || 0
      WINDOW_PLAYED_DAYS = null

      if (payload.settings && typeof payload.settings === 'object') Object.assign(SETTINGS, payload.settings)
      if (payload.env && typeof payload.env === 'object') ENV = payload.env
      ACTIVE = Array.isArray(payload.active) ? payload.active : []
      LIVE = true
      markConfigChanged()
    }

    function loadLiveState(force) {
      if (typeof fetch !== 'function') return
      let pending = null
      try {
        pending = fetch('/api/game-time/state', {
          headers: { accept: 'application/json' },
          cache: 'no-store',
        })
      } catch (error) {
        return
      }
      Promise.resolve(pending)
        .then(function (response) {
          return response && response.ok ? response.json() : null
        })
        .then(function (payload) {
          if (!payload) return
          if (!force && (CURRENT_ROUTE === 'settings' || CURRENT_ROUTE === 'game-settings')) return
          applyLiveState(payload)
          if (typeof bumpPage === 'function') bumpPage()
        })
        .catch(function () {})
    }


    let saveTimer = null

    function serializeConfig() {
      const platforms = {}
      for (const key of Object.keys(PLATFORMS)) platforms[key] = PLATFORMS[key]
      return { version: 3, settings: SETTINGS, platforms: platforms, games: GAMES }
    }

    function saveConfig() {
      if (!LIVE || typeof fetch !== 'function') return
      if (saveTimer) clearTimeout(saveTimer)
      saveTimer = setTimeout(function () {
        let request = null
        try {
          request = fetch('/api/game-time/config', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(serializeConfig()),
          })
        } catch (error) {
          return
        }
        Promise.resolve(request).catch(function () {})
      }, 500)
    }

    /**
     * Fetch the slice of history before the window that `/state` delivered.
     * Overlapping requests are skipped and appends are de-duplicated by id, so
     * a 30-second refresh and a user panning at the same time cannot double a
     * session. Panning is incremental; each step asks only for the new slice.
     */
    function ensureHistory(fromMs) {
      if (!LIVE || !Number.isFinite(fromMs) || !Number.isFinite(HISTORY_FROM)) return
      if (fromMs >= HISTORY_FROM) return
      if (typeof fetch !== 'function') return
      for (const item of HISTORY_REQUESTS) {
        if (fromMs >= item.from) return
      }
      // Do not re-fetch what an in-flight request already covers: stop at the
      // earliest pending start instead of always going to HISTORY_FROM.
      let ceiling = HISTORY_FROM
      for (const item of HISTORY_REQUESTS) {
        if (item.from < ceiling) ceiling = item.from
      }
      const request = { from: fromMs, to: ceiling }
      HISTORY_REQUESTS.push(request)
      let pending = null
      try {
        pending = fetch(
          '/api/game-time/sessions?from=' + Math.floor(fromMs) + '&to=' + Math.floor(request.to),
          { headers: { accept: 'application/json' }, cache: 'no-store' }
        )
      } catch (error) {
        HISTORY_REQUESTS.splice(HISTORY_REQUESTS.indexOf(request), 1)
        return
      }
      Promise.resolve(pending)
        .then(function (response) {
          return response && response.ok ? response.json() : null
        })
        .then(function (payload) {
          if (!payload || !Array.isArray(payload.sessions)) return
          const liveGames = new Set(
            GAMES.map(function (game) {
              return game.id
            })
          )
          const known = new Set(
            SESSIONS.map(function (session) {
              return session.id
            })
          )
          for (const session of payload.sessions) {
            if (!liveGames.has(session.gameId)) continue
            if (known.has(session.id)) continue
            known.add(session.id)
            SESSIONS.push(session)
          }
          HISTORY_FROM = Math.min(HISTORY_FROM, fromMs)
          if (typeof bumpPage === 'function') bumpPage()
        })
        .catch(function () {})
        .then(function () {
          const index = HISTORY_REQUESTS.indexOf(request)
          if (index >= 0) HISTORY_REQUESTS.splice(index, 1)
        })
    }

    loadLiveState()
    if (typeof window !== 'undefined' && typeof setInterval === 'function') {
      setInterval(loadLiveState, 30000)
      // The day boundary is not something React can observe: no data changes,
      // no state updates — only the calendar moves. Watch it on its own ticker
      // (two date strings, no allocation) so "今日" rolls over even when the
      // panel sits on a page that skips the poll. It also catches a wake-up
      // from sleep, where a one-shot midnight timer can fire late.
      setInterval(function () {
        if (!setNow(Date.now())) return
        if (typeof bumpPage === 'function') bumpPage()
        loadLiveState(false)
      }, 15000)
      // Browsers throttle timers in a hidden window (up to a minute). Coming
      // back to the panel should not show yesterday for another minute, so the
      // first visible frame refreshes both the clock and the data.
      if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
        document.addEventListener('visibilitychange', function () {
          if (document.visibilityState && document.visibilityState !== 'visible') return
          setNow(Date.now())
          loadLiveState(false)
        })
      }
    }

    /* ------------------------------------------------------------------ *
     * Queries
     * ------------------------------------------------------------------ */

    function sessionsInRange(gameId, from, to, platformFilter) {
      return SESSIONS.filter(function (s) {
        if (gameId !== null && s.gameId !== gameId) return false
        if (platformFilter && platformFilter(s.platformId) === false) return false
        if (from !== null && s.end <= from.getTime()) return false
        if (to !== null && s.start >= to.getTime()) return false
        return true
      })
    }

    function allowedPlatforms(game) {
      if (!game) return null
      const enabled = enabledPlatforms(game)
      return function (platformId) {
        return enabled.indexOf(platformId) >= 0
      }
    }

    /**
     * One session's subtitle: the platform, plus the launch source only when it
     * adds information. A session started from the platform's own launcher has
     * source === platform name, which used to render as "米哈游 · 米哈游".
     */
    function sessionSub(session) {
      const platform = PLATFORMS[session.platformId]
      const name = platform ? platform.name : ''
      const source = session.source
      if (!source || source === name) return name
      return name + ' · ' + source
    }

    function secondsInRange(sessions, from, to) {
      let total = 0
      for (const s of sessions) {
        const start = from === null ? s.start : Math.max(s.start, from.getTime())
        const end = to === null ? s.end : Math.min(s.end, to.getTime())
        if (end > start) total += end - start
      }
      return total / 1000
    }

    /* ------------------------------------------------------------------ *
     * Series — one shape for every chart, whatever the slices are
     * ------------------------------------------------------------------ */

    const OTHER_ID = 'other'
    const OTHER_COLOR = '#9199a3'
    // A slice below this share of the range is folded into 其他, so the legend
    // and the bar stay readable no matter how many platforms or games exist.
    const MIN_SHARE = 0.05

    /**
     * A game may opt out of the platform split: an optional group name turns
     * every session of that game into one slice under that name. An empty group
     * keeps the platform as the key, so old data and old behaviour stay intact.
     */
    const GROUP_PREFIX = 'group:'

    function groupNameOf(game) {
      return game ? String(game.group || '').trim() : ''
    }

    /** Custom colour when set, else a stable palette slot no platform claims. */
    function groupColorOf(name) {
      const custom = SETTINGS.groupColors && SETTINGS.groupColors[name]
      if (custom) return custom
      const names = []
      for (const game of GAMES) {
        const value = groupNameOf(game)
        if (value && names.indexOf(value) < 0) names.push(value)
      }
      names.sort()
      const taken = new Set()
      for (const key of Object.keys(PLATFORMS)) taken.add(PLATFORMS[key].color)
      const free = COLOR_PRESETS.filter(function (color) {
        return !taken.has(color)
      })
      const palette = free.length > 0 ? free : COLOR_PRESETS
      return palette[Math.max(0, names.indexOf(name)) % palette.length]
    }

    /**
     * A group named after a real platform ("Steam", "steam", or a platform id)
     * folds into that platform instead of becoming a second Steam slice.
     * Rank order decides when two platforms share a name.
     */
    function platformIdForGroup(name) {
      const wanted = String(name || '').trim().toLowerCase()
      if (!wanted) return ''
      const ids = Object.keys(PLATFORMS).sort(function (left, right) {
        return (Number(PLATFORMS[left].rank) || 0) - (Number(PLATFORMS[right].rank) || 0)
      })
      for (const id of ids) {
        const platform = PLATFORMS[id]
        if (!platform) continue
        if (id.toLowerCase() === wanted) return id
        if (String(platform.name || '').trim().toLowerCase() === wanted) return id
      }
      return ''
    }

    /** The slice key a group name resolves to: a platform id, or a group id. */
    function platformSliceId(gameId) {
      const name = groupNameOf(
        GAMES.find(function (item) {
          return item.id === gameId
        })
      )
      if (!name) return ''
      return platformIdForGroup(name) || GROUP_PREFIX + name
    }

    /** Normalised auto-archive setting; missing/old configs default to off. */
    function autoArchiveConfig() {
      const raw = SETTINGS.autoArchive && typeof SETTINGS.autoArchive === 'object' ? SETTINGS.autoArchive : {}
      const unit = raw.unit === 'month' ? 'month' : 'day'
      const value = Number(raw.value)
      return {
        enabled: raw.enabled === true,
        value:
          Number.isFinite(value) && value > 0
            ? Math.min(unit === 'month' ? 24 : 365, Math.round(value))
            : unit === 'month'
              ? 2
              : 60,
        unit: unit,
      }
    }

    /** How many days of silence trigger the rule; 0 means "rule off". */
    function autoArchiveDays() {
      const config = autoArchiveConfig()
      if (!config.enabled) return 0
      return config.unit === 'month' ? config.value * 30 : config.value
    }

    /**
     * Derived, never stored: a game with at least one session whose last play is
     * older than the rule is folded automatically. Playing it again moves
     * `lastPlayedAt` forward, so it comes back by itself.
     */
    function autoArchived(game) {
      const days = autoArchiveDays()
      if (!days || !game || game.noAutoArchive === true) return false
      const last = lastPlayedAt(game.id)
      if (!last) return false
      return Date.now() - last > days * 86400000
    }

    /**
     * Two game entries pointing at the same exe: the host credits only the first
     * one in config order, so every later entry can never record time. Flag them
     * instead of silently leaving a zero row behind.
     *
     * Pure in-memory scan (no IO). The result is cached per config change so a
     * re-render does not rescan; `markConfigChanged()` is called by `touch()`
     * and by every live-state replacement.
     */
    let configVersion = 0
    let duplicateCache = { key: '', map: new Map() }

    function markConfigChanged() {
      configVersion += 1
      duplicateCache = { key: '', map: new Map() }
    }

    function duplicateMap() {
      // `configVersion` covers edits routed through `touch()`; the length term
      // also catches direct array edits (tests, live-state swaps).
      const key = String(configVersion) + '|' + String(GAMES.length)
      if (duplicateCache.key === key) return duplicateCache.map
      const owners = new Map()
      const duplicates = new Map()
      for (const game of GAMES) {
        for (const install of game.installs || []) {
          const pathKey = normalizePath(install.path).toLowerCase()
          if (!pathKey || !/\.exe$/i.test(pathKey)) continue
          const owner = owners.get(pathKey)
          if (!owner) {
            owners.set(pathKey, game)
            continue
          }
          if (owner.id !== game.id && !duplicates.has(game.id)) {
            duplicates.set(game.id, { owner: owner, path: normalizePath(install.path) })
          }
        }
      }
      duplicateCache = { key: key, map: duplicates }
      return duplicates
    }

    /** Turn one dropped/picked exe into a brand new game entry. */
    function createGameFromResolved(t, resolved) {
      const path = normalizePath(resolved && resolved.path)
      if (!path || !/\.exe$/i.test(path)) return { state: 'fail' }
      const owner = installOwner(path, '')
      if (owner) return { state: 'owned', owner: owner }
      const ids = Object.keys(PLATFORMS)
      let platformId = resolved.platformId && PLATFORMS[resolved.platformId] ? resolved.platformId : ''
      if (!platformId) platformId = PLATFORMS.other ? 'other' : ids[0]
      const id = 'game-' + String(Date.now()) + '-' + String(GAMES.length)
      const name = resolved.name || t('game.new')
      GAMES.push({
        id: id,
        name: name,
        glyph: name.charAt(0) || '游',
        color: COLOR_PRESETS[GAMES.length % COLOR_PRESETS.length],
        icon: '',
        background: '',
        backgroundFit: 'cover',
        imageOpacity: 1,
        headerBackground: '',
        platforms: [platformId],
        installs: [{ id: id + '-i1', platformId: platformId, path: path }],
        entries: [],
      })
      if (typeof fetch === 'function') {
        extractIcon(path).then(function (icon) {
          const game = GAMES.find(function (item) {
            return item.id === id
          })
          if (icon && game && !game.icon) {
            game.icon = icon
            if (typeof bumpPage === 'function') bumpPage()
          }
        })
      }
      markConfigChanged()
      return { state: 'added' }
    }

    /**
     * Preview a dropped file before it becomes a game: the confirm dialog edits
     * the name and the platform, so nothing lands in the list by accident.
     */
    function draftGameFromResolved(t, resolved) {
      const path = normalizePath(resolved && resolved.path)
      if (!path || !/\.exe$/i.test(path)) return null
      const owner = installOwner(path, '')
      const fallbackPlatform = PLATFORMS.other ? 'other' : Object.keys(PLATFORMS)[0]
      const platformId =
        resolved && resolved.platformId && PLATFORMS[resolved.platformId]
          ? resolved.platformId
          : fallbackPlatform
      const name = (resolved && resolved.name) || baseName(path).replace(/\.exe$/i, '') || t('game.new')
      return { path: path, name: name, platformId: platformId, owned: owner || null }
    }

    /** Commit a confirmed draft: this is the only place a dropped game is added. */
    function commitGameDraft(draft) {
      const path = normalizePath(draft && draft.path)
      if (!path) return null
      if (installOwner(path, '')) return null
      const platformId =
        draft.platformId && PLATFORMS[draft.platformId]
          ? draft.platformId
          : PLATFORMS.other
            ? 'other'
            : Object.keys(PLATFORMS)[0]
      const id = 'game-' + String(Date.now()) + '-' + String(GAMES.length)
      const name = String(draft.name || '').trim() || baseName(path)
      GAMES.push({
        id: id,
        name: name,
        glyph: name.charAt(0) || '游',
        color: COLOR_PRESETS[GAMES.length % COLOR_PRESETS.length],
        icon: '',
        background: '',
        backgroundFit: 'cover',
        imageOpacity: 1,
        headerBackground: '',
        platforms: [platformId],
        installs: [{ id: id + '-i1', platformId: platformId, path: path }],
        entries: [],
      })
      if (typeof fetch === 'function') {
        extractIcon(path).then(function (icon) {
          const game = GAMES.find(function (item) {
            return item.id === id
          })
          if (icon && game && !game.icon) {
            game.icon = icon
            if (typeof bumpPage === 'function') bumpPage()
          }
        })
      }
      markConfigChanged()
      return id
    }


    function DuplicateTag({ t, duplicate }) {
      if (!duplicate) return null
      return h(
        'span',
        {
          className: 'gt-dup-tag',
          title: t('game.duplicate.hint').replace('{name}', duplicate.owner.name),
        },
        t('game.duplicate')
      )
    }

    /**
     * Archive is a display fold only: the game collapses out of the game tables,
     * but its time still counts everywhere — totals, charts, sessions. Sessions
     * are never touched, so unchecking puts the row straight back.
     */
    function isArchived(game) {
      if (!game) return false
      return game.archived === true || autoArchived(game)
    }

    /** How sessions are cut into coloured slices: by platform or by game. */
    const BY_PLATFORM = {
      id: 'platform',
      of: function (session) {
        return platformSliceId(session.gameId) || session.platformId
      },
      meta: function (id) {
        if (id.indexOf(GROUP_PREFIX) === 0) {
          const name = id.slice(GROUP_PREFIX.length)
          return { name: name, color: groupColorOf(name) }
        }
        const platform = PLATFORMS[id]
        return { name: platformLabel(platform) || id, color: platform ? platform.color : OTHER_COLOR }
      },
    }

    const BY_GAME = {
      id: 'game',
      of: function (session) {
        return session.gameId
      },
      meta: function (id) {
        const game = GAMES.find(function (item) {
          return item.id === id
        })
        return { name: game ? game.name : id, color: game ? game.color : OTHER_COLOR }
      },
    }

    /** Per-slice seconds inside one window — the stack source of every chart. */
    function seriesPartsIn(sessions, from, to, slice) {
      const byId = new Map()
      for (const s of sessions) {
        const start = from === null ? s.start : Math.max(s.start, from.getTime())
        const end = to === null ? s.end : Math.min(s.end, to.getTime())
        if (end <= start) continue
        const id = slice.of(s)
        byId.set(id, (byId.get(id) || 0) + (end - start) / 1000)
      }
      return Array.from(byId.entries())
        .map(function (entry) {
          const meta = slice.meta(entry[0])
          return { id: entry[0], name: meta.name, color: meta.color, seconds: entry[1] }
        })
        .sort(function (a, b) {
          return b.seconds - a.seconds
        })
    }

    /** Seconds of any game session that is still running (not in `sessions`). */
    function activeSeconds(gameId) {
      let total = 0
      for (const item of ACTIVE) {
        if (gameId !== null && item.gameId !== gameId) continue
        total += Number(item.seconds) || 0
      }
      return total
    }

    function totalsFor(gameId, range, anchor) {
      // "总计" is all-time: the host sends the totals separately because the
      // client only holds the configured lazy-load window of detail.
      if (range === 'all' && ALL_TOTALS) {
        const base = gameId === null ? Number(ALL_TOTALS.total) || 0 : Number((ALL_TOTALS.game || {})[gameId]) || 0
        return base + activeSeconds(gameId)
      }
      const game = gameId === null ? null : GAMES.find(function (g) {
        return g.id === gameId
      })
      const bounds = rangeBounds(range, anchor)
      const sessions = sessionsInRange(gameId, bounds.from, bounds.to, allowedPlatforms(game))
      return secondsInRange(sessions, bounds.from, bounds.to)
    }

    /** One x label: clock for minutes, weekday/day/date for days, month for months. */
    function bucketLabel(range, grain, from) {
      if (grain.kind === 'minute') return clockOf(from)
      if (grain.kind === 'week') return shortDate(from)
      if (range === 'week' || (range === 'last7' && grain.kind === 'day')) return ['一', '二', '三', '四', '五', '六', '日'][(from.getDay() + 6) % 7]
      if (range === 'month') return String(from.getDate())
      return shortDate(from)
    }

    /** The buckets a window is cut into — the grain decides the tick. */
    function seriesWindows(range, anchor, grain) {
      const unit = grainOf(range, grain)
      const bounds = windowBounds(range, anchor, unit)
      const windows = []
      if (unit.kind === 'month') {
        let cursor = startOfMonth(bounds.from)
        while (cursor.getTime() < bounds.to.getTime()) {
          const from = new Date(cursor)
          const to = new Date(from.getFullYear(), from.getMonth() + 1, 1)
          windows.push({ key: monthKey(from), label: pad2(from.getMonth() + 1) + '月', from: from, to: to })
          cursor = to
        }
        return windows
      }
      const step = unit.ms
      for (let time = bounds.from.getTime(); time < bounds.to.getTime(); time += step) {
        const from = new Date(time)
        const to = new Date(Math.min(time + step, bounds.to.getTime()))
        windows.push({ key: 'w' + time, label: bucketLabel(range, unit, from), from: from, to: to })
      }
      return windows
    }

    /**
     * The one series builder. `gameId === null` means every game; `slice`
     * turns each session into a coloured part (BY_PLATFORM or BY_GAME).
     */
    function seriesFor(gameId, range, anchor, slice, grain) {
      const game = gameId === null ? null : GAMES.find(function (g) {
        return g.id === gameId
      })
      const filter = allowedPlatforms(game)
      const cut = slice || BY_PLATFORM
      return seriesWindows(range, anchor, grain).map(function (window) {
        const list = sessionsInRange(gameId, window.from, window.to, filter)
        return {
          key: window.key,
          label: window.label,
          seconds: secondsInRange(list, window.from, window.to),
          parts: seriesPartsIn(list, window.from, window.to, cut),
        }
      })
    }

    function platformBreakdown(gameId, range, anchor, grain) {
      const game = gameId === null ? null : GAMES.find(function (g) {
        return g.id === gameId
      })
      const bounds = windowBounds(range, anchor, grain)
      const list = sessionsInRange(gameId, bounds.from, bounds.to, allowedPlatforms(game))
      return seriesPartsIn(list, bounds.from, bounds.to, BY_PLATFORM)
    }

    /** Aggregate one range across every game, sliced by `slice`. */
    function totalsByRange(range, anchor, slice, grain) {
      const bounds = windowBounds(range, anchor, grain)
      const list = sessionsInRange(null, bounds.from, bounds.to, null)
      return seriesPartsIn(list, bounds.from, bounds.to, slice)
    }

    function keepSliceIds(totals) {
      let total = 0
      totals.forEach(function (seconds) {
        total += seconds
      })
      const keep = new Set()
      if (total <= 0) return keep
      let bestId = null
      let best = -1
      totals.forEach(function (seconds, id) {
        if (seconds / total >= MIN_SHARE) keep.add(id)
        if (seconds > best) {
          best = seconds
          bestId = id
        }
      })
      // Never fold everything away when a hundred tiny slices add up.
      if (keep.size === 0 && bestId !== null) keep.add(bestId)
      return keep
    }

    /** Fold small slices of a flat distribution into 其他. */
    function bucketItems(items, t) {
      const totals = new Map()
      items.forEach(function (item) {
        totals.set(item.id, item.seconds)
      })
      const keep = keepSliceIds(totals)
      if (keep.size === totals.size) return items
      let other = 0
      const kept = []
      items.forEach(function (item) {
        if (keep.has(item.id)) kept.push(item)
        else other += item.seconds
      })
      if (other > 0) kept.push({ id: OTHER_ID, name: t('chart.other'), color: OTHER_COLOR, seconds: other })
      return kept.sort(function (a, b) {
        return b.seconds - a.seconds
      })
    }

    /** Fold small slices inside every window of a stacked series into 其他. */
    function bucketSeries(points, t) {
      const totals = new Map()
      points.forEach(function (point) {
        point.parts.forEach(function (part) {
          totals.set(part.id, (totals.get(part.id) || 0) + part.seconds)
        })
      })
      const keep = keepSliceIds(totals)
      if (keep.size === totals.size) return points
      return points.map(function (point) {
        const parts = []
        let other = 0
        point.parts.forEach(function (part) {
          if (keep.has(part.id)) parts.push(part)
          else other += part.seconds
        })
        if (other > 0) parts.push({ id: OTHER_ID, name: t('chart.other'), color: OTHER_COLOR, seconds: other })
        return { key: point.key, label: point.label, seconds: point.seconds, parts: parts }
      })
    }

    function segmentsOf(gameId, day) {
      const from = startOfDay(day)
      const to = new Date(from.getTime() + DAY_MS)
      return segmentsBetween(gameId, from, to)
    }

    function segmentsBetween(gameId, from, to) {
      const game = GAMES.find(function (g) {
        return g.id === gameId
      })
      return sessionsInRange(gameId, from, to, allowedPlatforms(game))
        .slice()
        .sort(function (a, b) {
          return a.start - b.start
        })
    }

    function daysInRange(gameId, range, anchor, grain) {
      const game = GAMES.find(function (g) {
        return g.id === gameId
      })
      const filter = allowedPlatforms(game)
      const rows = []
      if (range === 'all') {
        const base = startOfMonth(anchor)
        for (let i = 11; i >= 0; i--) {
          const bounds = rangeBounds('month', new Date(base.getFullYear(), base.getMonth() - i, 1))
          const list = sessionsInRange(gameId, bounds.from, bounds.to, filter)
          const seconds = secondsInRange(list, bounds.from, bounds.to)
          if (seconds <= 0) continue
          rows.push({
            key: monthKey(bounds.from),
            label: bounds.from.getFullYear() + '.' + pad2(bounds.from.getMonth() + 1),
            seconds: seconds,
            count: list.length,
          })
        }
        return rows.reverse()
      }

      const bounds = windowBounds(range, anchor, grain)
      const days = Math.round((bounds.to.getTime() - bounds.from.getTime()) / DAY_MS)
      for (let i = 0; i < days; i++) {
        const day = new Date(bounds.from.getTime() + i * DAY_MS)
        if (day.getTime() > NOW.getTime()) break
        const to = new Date(day.getTime() + DAY_MS)
        const list = sessionsInRange(gameId, day, to, filter)
        rows.push({
          key: dayKey(day),
          label: shortDate(day),
          seconds: secondsInRange(list, day, to),
          count: list.length,
        })
      }
      return rows
    }

    function lastPlayedAt(gameId) {
      let latest = 0
      if (LAST_PLAYED) {
        const stored = Number(LAST_PLAYED[gameId])
        if (Number.isFinite(stored) && stored > latest) latest = stored
      }
      for (const s of SESSIONS) {
        if (s.gameId === gameId && s.end > latest) latest = s.end
      }
      for (const item of ACTIVE) {
        if (item.gameId !== gameId) continue
        const end = (Number(item.start) || 0) + (Number(item.seconds) || 0) * 1000
        if (end > latest) latest = end
      }
      return latest
    }

    /**
     * Fallback when the host did not send played days (older host, or the DSH
     * process has not been restarted since the update): count from the loaded
     * window. Exact as long as the user's history fits in `historyDays`, which
     * is the common case; the host value always wins when it exists.
     */
    function windowPlayedDays() {
      if (WINDOW_PLAYED_DAYS) return WINDOW_PLAYED_DAYS
      const byGame = new Map()
      const union = new Set()
      for (const session of SESSIONS) {
        const key = dayKey(session.start)
        union.add(key)
        let set = byGame.get(session.gameId)
        if (!set) {
          set = new Set()
          byGame.set(session.gameId, set)
        }
        set.add(key)
      }
      WINDOW_PLAYED_DAYS = { byGame: byGame, total: union.size }
      return WINDOW_PLAYED_DAYS
    }

    /** Days this game was played on, all time. */
    function playedDaysFor(gameId) {
      if (ALL_PLAYED_DAYS && ALL_PLAYED_DAYS[gameId] !== undefined) {
        return Number(ALL_PLAYED_DAYS[gameId]) || 0
      }
      const fallback = windowPlayedDays().byGame.get(gameId)
      return fallback ? fallback.size : 0
    }

    /** Days with play across every game, all time. */
    function playedDaysTotal() {
      if (LIVE && PLAYED_DAYS_TOTAL > 0) return PLAYED_DAYS_TOTAL
      return windowPlayedDays().total
    }

    /** Earliest session anywhere; the host value wins when it exists. */
    function firstStartAt() {
      const first = Number(FIRST_START) || 0
      if (first > 0) return first
      let earliest = 0
      for (const session of SESSIONS) {
        if (!earliest || session.start < earliest) earliest = session.start
      }
      return earliest
    }

    /** Natural days from the first record through today, inclusive. */
    function recordDays() {
      const first = firstStartAt()
      if (!(first > 0)) return 0
      const span = Math.round((startOfDay(NOW).getTime() - startOfDay(first).getTime()) / DAY_MS)
      return Math.max(1, span + 1)
    }

    /* ------------------------------------------------------------------ *
     * Styles
     * ------------------------------------------------------------------ */

    const STYLE = [
      // One set of type sizes and accents for the whole panel. Everything below
      // uses these four sizes and two accent colours — do not add a fifth size
      // or a third accent for a single element, that is what made the old UI
      // look inconsistent.
      '.gt-shell{position:relative;display:flex;flex-direction:column;height:100%;min-height:0;font:inherit;color:inherit;overflow:hidden;--gt-fs-1:10px;--gt-fs-2:11px;--gt-fs-3:13px;--gt-fs-4:20px;--gt-green:#4fc7a6;--gt-red:#e35c5c;--gt-muted:.55;font-variant-numeric:tabular-nums;}',
      '.gt-top{padding:18px 22px 0;flex:0 0 auto;}',
      '.gt-head{display:flex;align-items:center;justify-content:space-between;gap:12px;}',
      '.gt-head-left{display:flex;align-items:center;gap:10px;min-width:0;}',
      '.gt-head-right{display:flex;align-items:center;gap:8px;}',
      '.gt-title{font-size:17px;font-weight:600;letter-spacing:.2px;margin:0;}',
      '.gt-live-on{display:inline-flex;align-items:center;gap:5px;font-size:11px;opacity:.8;}',
      '.gt-dot{width:6px;height:6px;border-radius:50%;background:var(--gt-green);flex:0 0 auto;}',
      '.gt-demo{font-size:11px;line-height:1;padding:4px 7px;border-radius:999px;border:1px solid rgba(128,128,128,.3);opacity:.55;white-space:nowrap;}',
      '.gt-tabs{display:inline-flex;gap:2px;padding:3px;border-radius:10px;background:rgba(128,128,128,.10);flex:0 0 auto;}',
      '.gt-tab{font:inherit;font-size:13px;line-height:1;color:inherit;background:transparent;border:0;border-radius:8px;padding:7px 14px;cursor:pointer;opacity:.62;}',
      '.gt-tab:hover{opacity:.85;}',
      '.gt-tab[data-active="true"]{background:rgba(128,128,128,.20);opacity:1;}',
      '.gt-root{display:flex;flex-direction:column;height:100%;min-height:0;box-sizing:border-box;padding:14px 22px 22px;gap:14px;overflow:auto;color:inherit;font:inherit;}',
      '.gt-chart-chip{position:absolute;z-index:5;padding:2px 6px;border-radius:6px;border:1px solid rgba(128,128,128,.26);background:var(--dsw-alias-bg-overlay,Canvas);box-shadow:0 4px 10px rgba(0,0,0,.16);pointer-events:none;transform:translate(-50%,calc(-100% - 4px));font-size:10.5px;line-height:1.4;font-variant-numeric:tabular-nums;white-space:nowrap;}',
      '.gt-chart-chip[data-side="below"]{transform:translate(-50%,4px);}',
      '.gt-trend-module{display:flex;flex-direction:column;gap:8px;margin-top:16px;padding-top:14px;border-top:1px solid rgba(128,128,128,.26);}',
      '.gt-trend-module .gt-card-head-title .gt-muted{display:none;}',
      '.gt-trend-module .gt-chart-label,.gt-trend-module .gt-chart-y,.gt-trend-module .gt-chart-avg-y{font-size:6.5px;opacity:.4;}',
      '.gt-trend-module .gt-muted{font-size:11px;opacity:.55;}',
      '.gt-trend-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(450px,1fr));gap:8px;align-items:start;overflow-x:auto;}',
      '.gt-trend-cell{display:flex;flex-direction:column;gap:4px;min-width:450px;}',
      '.gt-trend-seg{align-self:flex-end;}',
      '.gt-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;flex:0 0 auto;}',
      '.gt-card{border:1px solid rgba(128,128,128,.22);border-radius:12px;padding:11px 13px;background:rgba(var(--gt-surface-color,128,128,128),var(--gt-surface-alpha,.05));min-width:0;}',
      '.gt-label{font-size:var(--gt-fs-2);opacity:var(--gt-muted);letter-spacing:.2px;}',
      '.gt-value{font-size:var(--gt-fs-4);font-weight:600;line-height:1.2;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      // Stat card: time + comparison + ring on one line, so the card is two
      // lines tall instead of three and the small text reads as part of the number.
      '.gt-stat-main{display:flex;align-items:center;gap:8px;min-width:0;}',
      '.gt-stat-line{display:flex;align-items:baseline;gap:6px;min-width:0;flex:1 1 auto;overflow:hidden;}',
      '.gt-stat-line .gt-value{flex:0 0 auto;margin-top:0;}',
      '.gt-stat-sub{display:inline-flex;align-items:baseline;gap:3px;font-size:var(--gt-fs-2);line-height:1.3;min-width:0;overflow:hidden;white-space:nowrap;flex:0 1 auto;}',
      '.gt-stat-sub-k{opacity:var(--gt-muted);font-size:var(--gt-fs-2);letter-spacing:.2px;}',
      '.gt-stat-sub-v{font-variant-numeric:tabular-nums;}',
      '.gt-stat-sub-v[data-tone="over"]{color:var(--gt-red);}',
      '.gt-stat-sub-v[data-tone="under"]{color:var(--gt-green);}',
      '.gt-ring{position:relative;display:inline-flex;flex:0 0 auto;margin-left:auto;}',
      '.gt-ring-svg{display:block;overflow:visible;}',
      // One flat stroke: grey track until the average, green track with a red
      // overflow arc past 100 %, all red once the overflow filled the ring.
      '.gt-ring-gray{stroke:rgba(128,128,128,.24);}',
      '.gt-ring-green{stroke:var(--gt-green);transition:stroke .2s ease;}',
      '.gt-ring-red{stroke:var(--gt-red);transition:stroke .2s ease;}',
      '.gt-ring-lap{fill:currentColor;opacity:.8;font-size:var(--gt-fs-1);font-weight:600;font-variant-numeric:tabular-nums;letter-spacing:-.4px;}',
      '.gt-ring-lap[data-tone="over"]{fill:var(--gt-red);opacity:1;}',
      '.gt-ring-tip{position:absolute;top:calc(100% + 6px);right:0;z-index:6;padding:5px 8px;border-radius:8px;border:1px solid rgba(128,128,128,.26);background:var(--dsw-alias-bg-overlay,Canvas);box-shadow:0 6px 14px rgba(0,0,0,.18);font-size:var(--gt-fs-2);line-height:1.45;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .12s ease;}',
      '.gt-ring:hover .gt-ring-tip{opacity:1;}',
      '.gt-card-btn{font:inherit;color:inherit;text-align:left;cursor:pointer;}',
      '.gt-card-btn:hover{background:rgba(128,128,128,.12);}',
      '.gt-card-caret{font-size:var(--gt-fs-1);opacity:.45;margin-left:4px;}',
      '.gt-value .gt-unit{font-size:.68em;font-weight:500;opacity:var(--gt-muted);margin-left:1px;margin-right:3px;}',
      '.gt-section{display:flex;align-items:center;justify-content:space-between;gap:8px;flex:0 0 auto;margin-top:2px;}',
      '.gt-section-title{font-size:var(--gt-fs-3);font-weight:600;opacity:.9;}',
      // A soft card around the list so the page reads as separate blocks
      // (stats / list / trend) instead of one long scroll.
      '.gt-list-card{display:flex;flex-direction:column;gap:4px;padding:10px 8px 8px;border:1px solid rgba(128,128,128,.18);border-radius:12px;background:linear-gradient(180deg,rgba(128,128,128,.07),rgba(128,128,128,.02));box-shadow:inset 0 1px 0 rgba(255,255,255,.03);}',
      '.gt-muted{font-size:var(--gt-fs-2);opacity:var(--gt-muted);}',
      '.gt-grid-head,.gt-row{display:grid;grid-template-columns:minmax(0,1fr) 72px 72px 72px;gap:8px;align-items:center;}',
      '.gt-grid-head{font-size:var(--gt-fs-2);opacity:.5;padding:0 10px 2px;letter-spacing:.2px;}',
      '.gt-num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap;font-size:var(--gt-fs-3);letter-spacing:-.1px;}',
      '.gt-num .gt-unit{font-size:.78em;opacity:.5;margin-left:1px;margin-right:2px;font-weight:500;}',
      '.gt-row{font:inherit;color:inherit;text-align:left;background:transparent;border:1px solid transparent;border-radius:10px;padding:9px 10px;cursor:pointer;width:100%;}',
      '.gt-row:hover{background:rgba(128,128,128,.09);}',
      '.gt-row:active{background:rgba(128,128,128,.14);}',
      '.gt-row-main{display:flex;align-items:center;gap:10px;min-width:0;}',
      // Fixed name block: long names truncate instead of pushing the hints, so
      // every row keeps the same hint columns however the panel is resized.
      '.gt-row-main .gt-name-wrap{flex:0 0 180px;min-width:0;}',
      // Row hints take the space the fixed name leaves, split into equal
      // columns: equal fractions of the same row width line up across rows, and
      // right-aligned values line up in a column at any panel width.
      '.gt-hints{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));align-items:baseline;gap:8px;margin-left:auto;padding-left:8px;min-width:0;flex:1 1 auto;font-size:var(--gt-fs-2);line-height:1.25;}',
      '.gt-hint{display:flex;align-items:baseline;gap:2px;justify-content:flex-end;min-width:0;overflow:hidden;white-space:nowrap;}',
      '.gt-hint-k{opacity:.5;font-size:var(--gt-fs-2);letter-spacing:.2px;overflow:hidden;text-overflow:ellipsis;}',
      '.gt-hint-v{font-variant-numeric:tabular-nums;opacity:.92;flex:0 0 auto;}',
      '.gt-hint-v[data-tone="over"]{color:var(--gt-red);opacity:1;}',
      '.gt-hint-v[data-tone="under"]{color:var(--gt-green);opacity:1;}',
      '.gt-hint-v[data-tone="flat"]{opacity:.45;}',
      '.gt-tile{display:flex;align-items:center;justify-content:center;font-weight:600;color:#fff;flex:0 0 auto;letter-spacing:.5px;}',
      '.gt-name{font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.gt-name-wrap{display:flex;flex-direction:column;gap:3px;min-width:0;}',
      '.gt-badges{display:flex;gap:4px;flex-wrap:wrap;}',
      '.gt-badge{width:14px;height:14px;border-radius:4px;font-size:9px;line-height:14px;text-align:center;color:#fff;font-weight:600;}',
      '.gt-toolbar{display:flex;gap:8px;align-items:center;flex:0 0 auto;}',
      '.gt-search{flex:1 1 auto;min-width:0;font:inherit;font-size:13px;color:inherit;background:rgba(128,128,128,.07);border:1px solid rgba(128,128,128,.22);border-radius:9px;padding:8px 11px;outline:none;}',
      '.gt-search:focus{border-color:rgba(128,128,128,.45);}',
      '.gt-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center;padding:34px 24px;border:1px dashed rgba(128,128,128,.28);border-radius:12px;}',
      '.gt-empty-title{font-size:14px;font-weight:600;}',
      '.gt-empty-body{font-size:12.5px;opacity:.6;max-width:340px;line-height:1.6;}',
      '.gt-back{display:inline-flex;align-items:center;justify-content:center;gap:5px;flex:0 0 auto;box-sizing:border-box;font:inherit;font-size:12.5px;color:inherit;background:transparent;border:0;padding:5px 8px;border-radius:8px;cursor:pointer;opacity:.75;transition:opacity .16s ease,background .16s ease,transform .12s ease;}',
      '.gt-back:hover{opacity:1;}',
      '.gt-back:active{transform:scale(.96);}',
      '.gt-back:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(128,128,128,.3);}',
      '.gt-back.icon{width:21px;height:21px;padding:0;background:transparent;border:0;border-radius:7px;opacity:.45;transition:opacity .16s ease;}',
      '.gt-back.icon:hover{opacity:1;}',
      '.gt-back.icon:active{transform:scale(.96);}',
      '.gt-icon-btn{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;box-sizing:border-box;font:inherit;color:inherit;background:transparent;border:0;border-radius:7px;width:21px;height:21px;line-height:1;padding:0;cursor:pointer;opacity:.45;transition:opacity .16s ease;}',
      '.gt-icon-btn svg{width:14px;height:14px;}',
      '.gt-icon-btn:hover{opacity:1;}',
      '.gt-icon-btn:active{transform:scale(.96);}',
      '.gt-icon-btn:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(128,128,128,.3);}',
      '.gt-icon-btn:disabled{opacity:.28;cursor:default;transform:none;}',
      '.gt-detail-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex:0 0 auto;}',
      '.gt-detail-id{display:flex;align-items:center;gap:11px;min-width:0;}',
      '.gt-detail-name{font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.gt-detail-right{display:flex;align-items:center;gap:10px;flex:0 0 auto;}',
      '.gt-detail-total{text-align:right;}',
      '.gt-range{display:flex;align-items:center;gap:8px;flex:0 0 auto;}',
      '.gt-seg{display:inline-flex;gap:2px;padding:3px;border-radius:10px;background:rgba(128,128,128,.10);}',
      '.gt-seg-btn{font:inherit;font-size:12.5px;line-height:1;color:inherit;background:transparent;border:0;border-radius:8px;padding:6px 11px;cursor:pointer;opacity:.62;}',
      '.gt-seg-btn:hover{opacity:.85;}',
      '.gt-seg-btn[data-active="true"]{background:rgba(128,128,128,.20);opacity:1;}',
      '.gt-pager{display:inline-flex;gap:2px;margin-left:auto;}',
      '.gt-gear.spinning svg{animation:gt-spin .9s linear infinite;}',
      '@keyframes gt-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}',
      '.gt-gear.inline{margin-left:0;}',
      '.gt-name-row{display:flex;align-items:center;gap:4px;min-width:0;}',
      '.gt-swatch{width:16px;height:16px;border-radius:5px;cursor:pointer;flex:0 0 auto;}',
      '.gt-color{width:24px;height:20px;padding:0;border:0;background:transparent;cursor:pointer;}',
      '.gt-pselect{position:relative;min-width:0;}',
      '.gt-pselect-btn{display:flex;align-items:center;gap:5px;width:100%;font:inherit;font-size:11.5px;color:inherit;background:rgba(128,128,128,.08);border:1px solid rgba(128,128,128,.22);border-radius:8px;padding:4px 6px;cursor:pointer;text-align:left;}',
      '.gt-pselect-btn:hover{border-color:rgba(128,128,128,.4);}',
      '.gt-pselect-label{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.gt-caret{opacity:.5;font-size:9px;}',
      '.gt-pselect-menu{position:absolute;z-index:30;top:calc(100% + 4px);left:0;right:0;min-width:120px;padding:4px;border-radius:9px;border:1px solid rgba(128,128,128,.28);background:var(--dsw-alias-bg-overlay,Canvas);box-shadow:0 10px 26px rgba(0,0,0,.22);display:flex;flex-direction:column;gap:1px;}',
      '.gt-pselect-item{display:flex;align-items:center;gap:6px;font:inherit;font-size:11.5px;color:inherit;background:transparent;border:0;border-radius:6px;padding:5px 6px;cursor:pointer;text-align:left;}',
      '.gt-pselect-item:hover{background:rgba(128,128,128,.16);}',
      '.gt-pselect-item[data-active="true"]{background:rgba(128,128,128,.22);}',
      '.gt-backdrop{position:fixed;inset:0;z-index:20;}',
      '.gt-status-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:11px;line-height:1.3;}',
      '.gt-status-text{white-space:nowrap;letter-spacing:.1px;font-weight:500;}',
      '.gt-status-platform{opacity:.42;transition:opacity .15s ease;}',
      '.gt-status-platform[data-active="true"]{opacity:1;font-weight:500;}',
      '.gt-status-sep{opacity:.45;font-size:10px;}',
      '.gt-status{width:7px;height:7px;border-radius:50%;flex:0 0 auto;display:inline-block;}',
      '.gt-accent{width:3px;height:22px;border-radius:2px;flex:0 0 auto;}',
      '.gt-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;flex:0 0 auto;}',
      '.gt-summary-4{grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;}',
      '.gt-panel-card{border:1px solid rgba(128,128,128,.22);border-radius:12px;padding:12px 14px;background:rgba(var(--gt-surface-color,128,128,128),calc(var(--gt-surface-alpha,.05) * 0.85));flex:0 0 auto;}',
      '.gt-card-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;}',
      '.gt-card-head-title{display:flex;align-items:baseline;gap:8px;min-width:0;}',
      '.gt-card-head-title .gt-muted{white-space:nowrap;}',
      '.gt-card-title{font-size:12.5px;font-weight:600;opacity:.85;}',
      '.gt-bar{display:flex;height:8px;border-radius:999px;overflow:hidden;background:rgba(128,128,128,.14);}',
      '.gt-bar-seg{height:100%;}',
      '.gt-legend{display:flex;flex-wrap:wrap;gap:10px 16px;margin-top:10px;}',
      '.gt-legend-item{display:inline-flex;align-items:center;gap:6px;font-size:12px;opacity:.8;}',
      '.gt-legend-dot{width:8px;height:8px;border-radius:3px;}',
      '.gt-analysis{display:flex;flex-direction:column;gap:10px;margin-top:4px;padding-top:14px;border-top:1px solid rgba(128,128,128,.14);}',
      '.gt-share-divider{height:1px;margin:12px 0 10px;background:rgba(128,128,128,.14);}',
      '.gt-collapse{display:flex;align-items:center;gap:8px;width:100%;padding:0;border:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;}',
      '.gt-collapse .gt-muted{margin-left:auto;font-variant-numeric:tabular-nums;}',
      '.gt-collapse-caret{font-size:9px;opacity:.45;transition:transform .15s ease;}',
      '.gt-collapse-caret[data-open="false"]{transform:rotate(-90deg);}',
      '.gt-collapse[aria-expanded="true"]+.gt-list{margin-top:10px;}',
      '.gt-summary-line{display:flex;align-items:center;justify-content:space-between;gap:10px;}',
      '.gt-summary-line .gt-link{padding:0;font-size:12px;}',
      '.gt-archived{margin-top:2px;padding-top:8px;border-top:1px solid rgba(128,128,128,.14);}',
      '.gt-archived .gt-card-title{font-size:12px;}',
      '.gt-fixed-head{overflow:hidden;}',
      '.gt-fixed-head>.gt-settings{flex:1 1 auto;min-height:0;overflow:auto;}',
      '.gt-row[data-archived="true"]{opacity:.72;}',
      '.gt-chart-wrap{width:100%;position:relative;}',
      '.gt-chart{display:block;width:100%;height:auto;}',
      '.gt-chart[data-pan="true"]{cursor:grab;touch-action:pan-y;user-select:none;}',
      '.gt-chart[data-pan="true"]:active{cursor:grabbing;}',
      '.gt-chart text{font-family:inherit;font-size:8px;font-weight:400;letter-spacing:.01em;}',
      '.gt-chart-label{fill:currentColor;opacity:.5;}',
      '.gt-chart-unit{fill:currentColor;opacity:.42;letter-spacing:0;}',
      '.gt-chart-axis{stroke:currentColor;opacity:.12;stroke-width:1;}',
      '.gt-chart-grid{stroke:currentColor;opacity:.05;stroke-width:1;}',
      '.gt-chart-guide{stroke:currentColor;opacity:.22;stroke-width:1;stroke-dasharray:3 3;pointer-events:none;}',
      '.gt-chart text,.gt-chart circle,.gt-chart path{pointer-events:none;}',
      '.gt-bar-rect{transition:opacity .12s ease;}',
      '.gt-chart .gt-chart-y,.gt-chart .gt-chart-avg-y{font-size:7px;font-weight:500;fill:currentColor;opacity:.5;letter-spacing:0;font-variant-numeric:tabular-nums;}',
      '.gt-chart-avg{stroke:var(--gt-chart-avg,rgba(148,155,166,.5));stroke-width:.75;stroke-dasharray:2 3;fill:none;}',
      '.gt-chart-avg-tick{stroke:var(--gt-chart-avg,rgba(148,155,166,.5));stroke-width:1;}',
      '.gt-chart-avg-tag{fill:currentColor;opacity:.5;}',
      '.gt-chart-tip{position:absolute;z-index:5;display:flex;flex-direction:column;gap:2px;padding:6px 8px;border-radius:8px;border:1px solid rgba(128,128,128,.26);background:var(--dsw-alias-bg-overlay,Canvas);box-shadow:0 8px 20px rgba(0,0,0,.18);pointer-events:none;transform:translate(-50%,calc(-100% - 6px));font-size:11px;line-height:1.45;min-width:126px;max-width:248px;}',
      '.gt-chart-tip[data-side="below"]{transform:translate(-50%,6px);}',
      '.gt-chart-tip i{width:7px;height:7px;border-radius:2px;display:inline-block;flex:0 0 auto;}',
      '.gt-tip-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:2px;}',
      '.gt-tip-head b{font-size:12.5px;font-weight:600;font-variant-numeric:tabular-nums;}',
      '.gt-tip-head span{font-size:10.5px;opacity:.55;white-space:nowrap;}',
      '.gt-tip-row{display:flex;align-items:flex-start;gap:6px;}',
      '.gt-tip-row i{margin-top:4px;}',
      '.gt-tip-name{flex:1 1 auto;min-width:0;opacity:.82;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word;}',
      '.gt-tip-dur{margin-left:auto;flex:0 0 auto;padding-left:4px;white-space:nowrap;font-variant-numeric:tabular-nums;opacity:.95;}',
      '.gt-list{display:flex;flex-direction:column;gap:1px;}',
      '.gt-list-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px;border-radius:8px;font-size:12.5px;}',
      '.gt-list-row:hover{background:rgba(128,128,128,.07);}',
      '.gt-list-row[data-selected="true"]{background:rgba(128,128,128,.12);}',
      '.gt-list-time{opacity:.85;font-variant-numeric:tabular-nums;}',
      '.gt-list-sub{opacity:.5;font-size:11.5px;margin-left:8px;}',
      '.gt-list-dur{opacity:.9;font-variant-numeric:tabular-nums;white-space:nowrap;}',
      '.gt-modal-backdrop{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:24px;}',
      '.gt-modal{width:min(360px,100%);border-radius:14px;border:1px solid rgba(128,128,128,.3);background:var(--dsw-alias-bg-overlay,Canvas);padding:18px;box-shadow:0 20px 60px rgba(0,0,0,.35);}',
      '.gt-modal-title{font-size:14px;font-weight:600;margin-bottom:8px;}',
      '.gt-modal-body{font-size:12.5px;opacity:.7;line-height:1.6;margin-bottom:16px;}',
      '.gt-modal-actions{display:flex;justify-content:flex-end;gap:8px;}',
      '.gt-btn{font:inherit;font-size:12.5px;padding:7px 14px;border-radius:9px;border:1px solid rgba(128,128,128,.3);background:transparent;color:inherit;cursor:pointer;}',
      '.gt-btn:hover{background:rgba(128,128,128,.12);}',
      '.gt-btn.danger{background:#e5484d;border-color:#e5484d;color:#fff;}',
      '.gt-btn.primary{background:#3d7dff;border-color:#3d7dff;color:#fff;}',
      '.gt-update{display:flex;flex-direction:column;gap:6px;}',
      '.gt-update-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}',
      '.gt-drop-toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:65;max-width:min(560px,88vw);padding:8px 14px;border-radius:9px;background:rgba(20,20,22,.92);border:1px solid rgba(255,120,120,.5);color:#fff;font-size:12px;line-height:1.5;box-shadow:0 10px 28px rgba(0,0,0,.4);cursor:pointer;}',
      '.gt-drop-overlay{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(11,11,12,.72);border:2px dashed rgba(120,170,255,.6);color:#fff;font-size:13px;pointer-events:none;}',
      '.gt-modal-backdrop{position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);}',
      '.gt-modal{width:min(420px,90vw);border-radius:12px;border:1px solid rgba(128,128,128,.26);background:var(--dsw-alias-bg-overlay,#17181a);padding:14px;display:flex;flex-direction:column;gap:10px;box-shadow:0 18px 48px rgba(0,0,0,.4);}',
      '.gt-modal-title{font-size:14px;font-weight:600;}',
      '.gt-modal-path{font-size:11px;opacity:.55;word-break:break-all;}',
      '.gt-modal-row{display:flex;align-items:center;gap:8px;}',
      '.gt-modal-label{font-size:12px;opacity:.7;min-width:40px;}',
      '.gt-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:2px;}',
      '.gt-btn.danger:hover{background:#d93b40;}',
      '.gt-pathfield{display:flex;gap:6px;align-items:center;min-width:0;}',
      '.gt-pathfield .gt-input{flex:1 1 auto;min-width:0;}',
      '.gt-pathfield-wrap{display:flex;flex-direction:column;gap:4px;min-width:0;}',
      '.gt-pathfield-wrap .gt-pathfield{width:100%;}',
      '.gt-pathfield-wrap[data-drop="true"] .gt-input{border-color:rgba(128,128,128,.6);}',
      '.gt-pathfield-note{font-size:11px;opacity:.62;line-height:1.45;}',
      '.gt-reveal-glyph{font-size:12px;line-height:1;opacity:.85;}',
      '.gt-dup-tag{display:inline-flex;align-items:center;margin-left:6px;padding:0 6px;height:16px;border-radius:999px;font-size:10.5px;line-height:1;color:#ff6b6b;background:rgba(229,72,77,.14);border:1px solid rgba(229,72,77,.38);white-space:nowrap;vertical-align:middle;}',
      '.gt-iconpick{display:flex;align-items:center;gap:10px;padding:6px 0 10px;}',
      '.gt-iconpick-pick{display:inline-flex;align-items:center;gap:10px;cursor:pointer;}',
      '.gt-iconpick-pick > img,.gt-iconpick-pick > .gt-tile{transition:opacity .16s ease;}',
      '.gt-iconpick-pick:hover > img,.gt-iconpick-pick:hover > .gt-tile{opacity:.85;}',
      '.gt-iconpick.bare{padding:0;gap:0;}',
      '.gt-iconimg{object-fit:cover;border-radius:8px;}',
      '.gt-tile-img{object-fit:cover;display:block;}',
      '.gt-tile-btn{cursor:pointer;}',      '.gt-imagefield{display:flex;flex-direction:column;gap:8px;padding:6px 0 10px;}',
      '.gt-imagefield-preview{height:84px;border-radius:10px;background-size:cover;background-position:center;border:1px solid rgba(128,128,128,.24);}',
      '.gt-imagefield-empty{height:84px;border-radius:10px;border:1px dashed rgba(128,128,128,.3);display:flex;align-items:center;justify-content:center;font-size:12px;opacity:.5;}',
      '.gt-imagefield-actions{display:flex;align-items:center;gap:12px;}',
      '.gt-crop-backdrop{position:fixed;inset:0;z-index:80;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:24px;}',
      '.gt-crop{width:min(520px,100%);border-radius:14px;border:1px solid rgba(128,128,128,.3);background:var(--dsw-alias-bg-overlay,Canvas);padding:16px;display:flex;flex-direction:column;gap:12px;}',
      '.gt-crop-viewport{position:relative;overflow:hidden;border-radius:10px;background:rgba(0,0,0,.35);touch-action:none;}',
      '.gt-crop-viewport img{user-select:none;pointer-events:none;}',
      '.gt-crop-actions{display:flex;justify-content:space-between;align-items:center;gap:10px;}',
      '.gt-imagefield-box{position:relative;height:84px;border-radius:10px;border:1px dashed rgba(128,128,128,.3);background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;}',
      '.gt-imagefield-box.has{border-style:solid;border-color:rgba(128,128,128,.24);}',
      '.gt-imagefield-hint{font-size:12px;opacity:.55;}',
      '.gt-bg-controls{display:flex;flex-wrap:wrap;gap:10px 18px;padding:2px 0 10px;}',
      '.gt-bg-control{display:flex;align-items:center;gap:6px;font-size:11.5px;opacity:.75;}',
      '.gt-bg-value{font-size:11px;opacity:.7;min-width:32px;text-align:right;font-variant-numeric:tabular-nums;}',
      '.gt-bg-control input[type=\"range\"]{width:80px;}',
      '.gt-banner{height:104px;border-radius:12px;background-size:cover;background-position:center;flex:0 0 auto;-webkit-mask-image:linear-gradient(to bottom,#000 45%,transparent);mask-image:linear-gradient(to bottom,#000 45%,transparent);}',
      '.gt-banner.tile{background-size:auto;background-repeat:repeat;}',
      '.gt-bg{position:absolute;inset:0;z-index:0;pointer-events:none;background-position:center top;}',
      '.gt-top{position:relative;z-index:1;}',
      '.gt-header-bg{position:absolute;top:0;left:0;right:0;height:var(--gt-header-height,300px);z-index:0;opacity:.55;pointer-events:none;background-size:cover;background-position:center top;-webkit-mask-image:linear-gradient(to bottom,#000 0%,#000 var(--gt-header-fade,52%),transparent 100%);mask-image:linear-gradient(to bottom,#000 0%,#000 var(--gt-header-fade,52%),transparent 100%);}',
      '.gt-head{position:relative;z-index:1;}',      '.gt-drag{cursor:grab;opacity:.4;font-size:13px;line-height:1;user-select:none;flex:0 0 auto;padding:2px 1px;}',
      '.gt-platrow-actions{display:flex;align-items:center;gap:14px;padding:4px 0 10px;flex-wrap:wrap;}',
      '.gt-platrow{padding:8px 0;border-top:1px solid rgba(128,128,128,.14);}',
      '.gt-platrow:first-of-type{border-top:0;}',
      '.gt-platrow-head{display:grid;grid-template-columns:12px 7px 22px minmax(0,1fr) 26px;gap:8px;align-items:center;}',
      '.gt-entry{padding:10px 0;border-top:1px solid rgba(128,128,128,.14);}',
      '.gt-entry:first-of-type{border-top:0;}',
      '.gt-entry-head{display:grid;grid-template-columns:92px minmax(0,1fr) 26px;gap:8px;align-items:center;}',
      '.gt-entry-head.drag{grid-template-columns:12px 92px minmax(0,1fr) 26px;}',
      '.gt-gamerow{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid rgba(128,128,128,.14);}',
      '.gt-gamerow:first-of-type{border-top:0;}',
      '.gt-gamerow-main{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:2px;}',
      '.gt-gamerow-name{font-size:13px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.gt-gamerow-meta{font-size:11.5px;opacity:.5;}',      '.gt-settings{display:flex;flex-direction:column;gap:14px;}',
      '.gt-group{border:1px solid rgba(128,128,128,.22);border-radius:12px;background:rgba(var(--gt-surface-color,128,128,128),var(--gt-surface-alpha,.05));padding:4px 14px;}',
      '.gt-group-title{font-size:12.5px;font-weight:600;opacity:.85;padding:10px 0 2px;}',
      '.gt-group-row{display:flex;align-items:center;gap:8px;padding:2px 0 10px;}',
      '.gt-group-label{font-size:12px;opacity:.62;white-space:nowrap;flex:0 0 auto;}',
      '.gt-group-row .gt-input{flex:1 1 auto;width:auto;}',
      '.gt-drop[data-drop="true"]{border-color:rgba(128,128,128,.55);background:rgba(128,128,128,.06);}',
      '.gt-drop-hint{font-size:11px;opacity:.42;padding:2px 0 10px;}',
      '.gt-drop[data-drop="true"] .gt-drop-hint{opacity:.9;}',
      '.gt-drop-note{opacity:.8;padding:0 0 10px;}',
      '.gt-field{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:10px 0;border-top:1px solid rgba(128,128,128,.14);font-size:13px;}',
      '.gt-field:first-of-type{border-top:0;}',
      '.gt-field-text{min-width:0;}',
      '.gt-field-name{font-size:13px;}',
      '.gt-field-hint{font-size:11.5px;opacity:.55;margin-top:3px;line-height:1.5;}',
      '.gt-check{width:16px;height:16px;accent-color:currentColor;cursor:pointer;}',
      '.gt-check:disabled{opacity:.4;cursor:not-allowed;}',
      '.gt-input{font:inherit;font-size:12.5px;color:inherit;background:rgba(128,128,128,.08);border:1px solid rgba(128,128,128,.22);border-radius:8px;padding:7px 9px;outline:none;min-width:0;width:100%;box-sizing:border-box;}',
      '.gt-input:focus{border-color:rgba(128,128,128,.5);}',
      '.gt-run{display:grid;grid-template-columns:18px minmax(0,1fr) 26px;gap:8px;align-items:start;padding:8px 0;border-top:1px solid rgba(128,128,128,.14);}',
      '.gt-run-meta{display:grid;grid-template-columns:minmax(0,1fr) 92px;gap:6px;min-width:0;align-items:center;}',
      '.gt-run-path{grid-column:1 / -1;}',
      '.gt-run:first-of-type{border-top:0;}',
      '.gt-run-args{font-size:11px;opacity:.5;font-family:ui-monospace,Consolas,monospace;}',
      '.gt-pill{display:inline-flex;align-items:center;gap:4px;font-size:10.5px;line-height:1.55;padding:1px 8px;border-radius:999px;border:1px solid transparent;white-space:nowrap;}',
      '.gt-chip{display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:999px;border:1px solid rgba(128,128,128,.25);background:rgba(128,128,128,.07);font-size:12px;cursor:pointer;color:inherit;}',
      '.gt-chip[data-on="true"]{border-color:rgba(128,128,128,.55);background:rgba(128,128,128,.16);}',
      '.gt-chip-dot{width:8px;height:8px;border-radius:50%;}',
      '.gt-chips{display:flex;flex-wrap:wrap;gap:6px;padding:6px 0 10px;}',
      '.gt-note{font-size:11px;opacity:.5;line-height:1.5;letter-spacing:.1px;}',
      '.gt-credit{font-size:11px;opacity:.32;text-align:center;letter-spacing:.3px;padding:2px 0 14px;}',
      '.gt-warn{color:var(--gt-red);opacity:.95;}',
      '.gt-group-head{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;font:inherit;color:inherit;background:transparent;border:0;border-radius:8px;padding:0;cursor:pointer;text-align:left;}',
      '.gt-group-head:hover{background:rgba(128,128,128,.07);}',
      '.gt-group-head:focus-visible{outline:none;box-shadow:0 0 0 2px rgba(128,128,128,.35);}',
      '.gt-group-toggle{display:inline-flex;align-items:center;gap:4px;font-size:11.5px;opacity:.55;padding:10px 6px 2px;white-space:nowrap;transition:opacity .15s ease;}',
      '.gt-group-head:hover .gt-group-toggle{opacity:.95;}',
      '.gt-chevron{transition:transform .15s ease;}',
      '.gt-chevron[data-open="false"]{transform:rotate(-90deg);}',
      '.gt-gamepills{display:flex;flex-wrap:wrap;gap:6px;padding:6px 0 10px;}',
      '.gt-gamepill{display:inline-flex;align-items:center;gap:6px;font:inherit;font-size:12px;line-height:1.5;color:inherit;padding:3px 9px 3px 4px;border-radius:999px;border:1px solid rgba(var(--gt-pill,128,128,128),.30);background:rgba(var(--gt-pill,128,128,128),.10);cursor:pointer;}',
      '.gt-gamepill:hover{background:rgba(var(--gt-pill,128,128,128),.18);}',
      '.gt-gamepill-icon{width:16px;height:16px;border-radius:50%;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;}',
      '.gt-gamepill-name{white-space:nowrap;max-width:160px;overflow:hidden;text-overflow:ellipsis;}',
      '.gt-gamepill-dup{width:6px;height:6px;border-radius:50%;background:#ff6b6b;flex:0 0 auto;}',
      '.gt-link{font:inherit;font-size:12.5px;color:inherit;background:transparent;border:0;padding:6px 0;cursor:pointer;opacity:.75;text-decoration:none;}',
      // Add-platform row: fixed name width, path takes the rest, one-line button
      // with the same 32px height as every input so the row reads as one block.
      '.gt-platform-new{display:flex;align-items:center;gap:8px;padding:8px 0;}',
      '.gt-platform-new .gt-input{height:32px;padding:0 10px;line-height:1.2;}',
      '.gt-platform-new .gt-platform-name{flex:0 0 128px;width:128px;}',
      '.gt-platform-new .gt-platform-path{flex:1 1 auto;min-width:0;}',
      '.gt-platform-new .gt-platform-path .gt-pathfield{min-width:0;}',
      '.gt-platform-new .gt-pathfield-note{margin-top:2px;}',
      '.gt-platform-add{height:32px;padding:0 14px;flex:0 0 auto;white-space:nowrap;font-weight:600;background:rgba(128,128,128,.18);border-color:rgba(128,128,128,.38);}',
      '.gt-platform-add:hover{background:rgba(128,128,128,.28);}',
      '.gt-link:hover{opacity:1;}',
      '.gt-compact .gt-root{padding:8px 14px 12px;gap:8px;}',
      '.gt-compact .gt-title{font-size:15px;}',
      '.gt-compact .gt-tab{padding:5px 10px;font-size:12px;}',
      '.gt-compact .gt-row{padding:4px 7px;}',
      '.gt-compact .gt-name{font-size:calc(var(--gt-fs-3) - 1px);}',
      '.gt-compact .gt-value{font-size:calc(var(--gt-fs-4) * .9);margin-top:3px;}',
      '.gt-compact .gt-card{padding:8px 10px;}',
      '.gt-compact .gt-list-card{padding:7px 6px 6px;}',
      '.gt-compact .gt-panel-card{padding:8px 10px;}',
      '.gt-compact .gt-list-row{padding:4px 7px;font-size:12px;}',
      '.gt-compact .gt-section-title{font-size:12px;}',
      '.gt-compact .gt-hints{font-size:var(--gt-fs-2);gap:8px;}',
      // Responsive by container width, not by window width: the panel is a
      // sidebar and the browser can be 1400 px wide while the panel is 380 px.
      // Page measures .gt-shell with a ResizeObserver and writes data-w, and
      // these rules hide hints in the agreed order — grey labels first, then
      // rank 3 (已玩), then 2 (平均每天), then 1 (对比平均).
      // Responsive by container width, not by window width: the panel is a
      // sidebar and the browser can be 1400 px wide while the panel is 380 px.
      // Page measures .gt-shell with a ResizeObserver and writes data-w.
      // Order: grey labels first, then 已玩, then 平均每天, then 对比平均; the
      // name block shrinks in the same steps and the hint grid drops tracks so
      // every remaining value keeps the same column across rows.
      '.gt-shell[data-w="md"] .gt-hint-k{display:none;}',
      '.gt-shell[data-w="md"] .gt-row-main .gt-name-wrap{flex-basis:150px;}',
      '.gt-shell[data-w="sm"] .gt-hint-k,.gt-shell[data-w="sm"] .gt-hint[data-rank="3"]{display:none;}',
      '.gt-shell[data-w="sm"] .gt-hints{grid-template-columns:repeat(2,minmax(0,1fr));}',
      '.gt-shell[data-w="sm"] .gt-row-main .gt-name-wrap{flex-basis:140px;}',
      '.gt-shell[data-w="xs"] .gt-hint-k,.gt-shell[data-w="xs"] .gt-hint[data-rank="3"],.gt-shell[data-w="xs"] .gt-hint[data-rank="2"]{display:none;}',
      '.gt-shell[data-w="xs"] .gt-hints{grid-template-columns:repeat(1,minmax(0,1fr));}',
      '.gt-shell[data-w="xs"] .gt-row-main .gt-name-wrap{flex-basis:120px;}',
      '.gt-shell[data-w="xxs"] .gt-hints{display:none;}',
      // Once the hints are gone the name gets the whole width back.
      '.gt-shell[data-w="xxs"] .gt-row-main .gt-name-wrap{flex:1 1 auto;}',
      // Same order on the stat cards: the ring goes first, then the small line.
      '.gt-shell[data-w="sm"] .gt-ring,.gt-shell[data-w="xs"] .gt-ring,.gt-shell[data-w="xxs"] .gt-ring{display:none;}',
      // The comparison line keeps only the value at sm, then disappears at xs.
      '.gt-shell[data-w="sm"] .gt-stat-sub-k{display:none;}',
      '.gt-shell[data-w="xs"] .gt-stat-sub,.gt-shell[data-w="xxs"] .gt-stat-sub{display:none;}',
      '.gt-shell[data-w="xs"] .gt-summary-4,.gt-shell[data-w="xxs"] .gt-summary-4{grid-template-columns:repeat(2,minmax(0,1fr));}',
    ].join('')

    /* ------------------------------------------------------------------ *
     * Small components
     * ------------------------------------------------------------------ */

    function Glyph({ size = 18 }) {
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true, style: { display: 'block' } },
        h('path', {
          d: 'M7.6 7.2h8.8a4.3 4.3 0 0 1 4.18 3.28l.78 3.1a2.85 2.85 0 0 1-3.79 3.4l-1.62-.62a3.4 3.4 0 0 0-1.22-.23H9.27c-.42 0-.84.08-1.22.23l-1.62.62a2.85 2.85 0 0 1-3.79-3.4l.78-3.1A4.3 4.3 0 0 1 7.6 7.2Z',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinejoin: 'round',
        }),
        h('path', { d: 'M8.2 10.2v2.4M7 11.4h2.4', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }),
        h('circle', { cx: 15.6, cy: 10.8, r: 1.1, fill: 'currentColor' }),
        h('circle', { cx: 17.5, cy: 12.6, r: 1.1, fill: 'currentColor' })
      )
    }

    /* Icons: Lucide (https://lucide.dev, ISC) — 24px grid, 2px round stroke. */
    const ICON_PROPS = {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': true,
    }

    function iconProps(size) {
      return Object.assign({ width: size, height: size }, ICON_PROPS, { style: { display: 'block', flex: '0 0 auto' } })
    }

    function RefreshIcon({ size = 16 }) {
      return h(
        'svg',
        iconProps(size),
        h('path', { d: 'M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8' }),
        h('path', { d: 'M21 3v5h-5' })
      )
    }

    /** Lucide rotate-ccw — reset the chart to its default window and scale. */
    function ResetIcon({ size = 14 }) {
      return h(
        'svg',
        iconProps(size),
        h('path', { d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' }),
        h('path', { d: 'M3 3v5h5' })
      )
    }

    /** Lucide chevron-down; points right while the section is collapsed. */
    function ChevronIcon({ size = 14, open }) {
      return h(
        'svg',
        Object.assign(iconProps(size), {
          className: 'gt-chevron',
          'data-open': open ? 'true' : 'false',
        }),
        h('path', { d: 'm6 9 6 6 6-6' })
      )
    }

    function GearIcon({ size = 16 }) {      return h(
        'svg',
        iconProps(size),
        h('circle', { cx: 12, cy: 12, r: 3 }),
        h('path', {
          d: 'M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915',
        })
      )
    }

    function ArrowLeftIcon({ size = 16 }) {
      return h(
        'svg',
        iconProps(size),
        h('path', { d: 'M19 12H5' }),
        h('path', { d: 'm12 19-7-7 7-7' })
      )
    }

    const STATUS_COLORS = {
      offline: '#8a8a8a',
      active: '#3ccf7a',
      error: '#e5484d',
      suspended: '#e5b83d',
    }

    function StatusDot({ t, status }) {
      return h('span', {
        className: 'gt-status',
        title: t('status.' + status),
        style: { background: STATUS_COLORS[status] || STATUS_COLORS.offline },
      })
    }

    function gameStatus(game) {
      const installs = game.installs || []
      if (installs.some(function (install) { return install.exists === false })) return 'error'
      if (ACTIVE.some(function (item) { return item.gameId === game.id })) return 'active'
      if (game.running) return 'suspended'
      return 'offline'
    }

    function platformIdList() {
      return Object.keys(PLATFORMS).sort(function (left, right) {
        const leftRank = Number(PLATFORMS[left].rank) || 0
        const rightRank = Number(PLATFORMS[right].rank) || 0
        return leftRank - rightRank
      })
    }

    function platformStatus(id) {
      const platform = PLATFORMS[id]
      if (platform && /\.lnk$/i.test(platform.path || '')) return 'error'
      if (platform && platform.path && platform.exists === false) return 'error'
      if (ACTIVE.some(function (item) { return item.platformId === id })) return 'active'
      if (platform && platform.running) return 'suspended'
      return 'offline'
    }

    function Tile({ game, size }) {
      const px = size || 34
      const radius = Math.round(px * 0.27)
      if (game.icon) {
        return h('img', {
          className: 'gt-tile gt-tile-img',
          src: game.icon,
          alt: '',
          style: { width: px, height: px, borderRadius: radius },
        })
      }
      return h(
        'div',
        {
          className: 'gt-tile',
          style: { width: px, height: px, borderRadius: radius, background: game.color, fontSize: Math.round(px * 0.42) },
        },
        game.glyph
      )
    }

    function PlatformPill({ id, active }) {
      const platform = PLATFORMS[id]
      if (!platform) return null
      const rgb = hexToRgb(platform.color)
      return h(
        'span',
        {
          className: 'gt-pill',
          style: {
            background: 'rgba(' + rgb + ', .16)',
            borderColor: 'rgba(' + rgb + ', .4)',
            opacity: active === false ? 0.42 : 1,
          },
          title: platformLabel(platform),
        },
        platformLabel(platform)
      )
    }

    function Badges({ platformIds, activeId }) {
      return h(
        'div',
        { className: 'gt-badges' },
        platformIds.map(function (id) {
          return h(PlatformPill, { key: id, id: id, active: activeId === undefined ? undefined : id === activeId })
        })
      )
    }

    function StatusPill({ t, status }) {
      const color = STATUS_COLORS[status] || STATUS_COLORS.offline
      return h(
        'span',
        {
          className: 'gt-pill',
          style: {
            background: 'rgba(' + hexToRgb(color) + ', .16)',
            borderColor: 'rgba(' + hexToRgb(color) + ', .45)',
            color: color,
          },
          title: t('status.' + status),
        },
        t('status.' + status)
      )
    }

    let CLIENT_CTX = null

    function pickDirectoryPath() {
      const native = typeof globalThis !== 'undefined' ? globalThis.__DSH_DIRECTORY_PICKER__ : null
      if (native && typeof native.pick === 'function') {
        return Promise.resolve(native.pick())
          .then(function (value) {
            return typeof value === 'string' ? value : null
          })
          .catch(function () {
            return null
          })
      }
      if (!CLIENT_CTX || typeof CLIENT_CTX.get !== 'function') return Promise.resolve(null)
      let workspace = null
      try {
        workspace = CLIENT_CTX.get('uiWorkspace')
      } catch (error) {
        return Promise.resolve(null)
      }
      if (!workspace || typeof workspace.pickDirectory !== 'function') return Promise.resolve(null)
      return Promise.resolve(workspace.pickDirectory())
        .then(function (value) {
          return typeof value === 'string' ? value : null
        })
        .catch(function () {
          return null
        })
    }

    function pickExecutable() {
      return pickDirectoryPath().then(function (dir) {
        if (!dir) return null
        return fetch('/api/game-time/browse?dir=' + encodeURIComponent(dir), {
          headers: { accept: 'application/json' },
        })
          .then(function (response) {
            return response.ok ? response.json() : null
          })
          .then(function (payload) {
            if (!payload || !Array.isArray(payload.files) || payload.files.length === 0) return null
            return payload.files[0].path
          })
          .catch(function () {
            return null
          })
      })
    }

    /** Which game already owns this install path (same exe, any other game). */
    function installOwner(path, exceptGameId) {
      const target = normalizePath(path).toLowerCase()
      if (!target) return null
      for (const game of GAMES) {
        if (game.id === exceptGameId) continue
        for (const install of game.installs || []) {
          if (normalizePath(install.path).toLowerCase() === target) return game
        }
      }
      return null
    }

    /** Resolve one dropped file to a launch path, without needing `file.path`. */
    function resolveDroppedFile(file) {
      if (!file) return Promise.resolve(null)
      const path = droppedFilePath(file)
      if (path) return resolvePathOnHost(path)
      return readDroppedTarget(file)
    }

    function PathField({ t, value, placeholder, onChange, dropMode, onResolved, onCommit }) {
      const [drag, setDrag] = React.useState(false)
      const [note, setNote] = React.useState('')
      const [picking, setPicking] = React.useState(false)
      const current = normalizePath(value)

      const applyResolved = function (resolved) {
        if (!resolved || !resolved.ok || !resolved.path) {
          setNote(t('drop.unreadable'))
          return
        }
        // Platform / launch entries need a real file; a Steam shortcut resolves
        // to the game exe, which would be the wrong answer in those rows.
        if (dropMode !== 'game' && /^steam:/i.test(String(resolved.url || ''))) {
          setNote(t('drop.needExe'))
          return
        }
        setNote('')
        if (typeof onResolved === 'function') onResolved(resolved)
        else onChange(resolved.path)
      }

      /**
       * One dialog per click. Cancel must stay cancelled: the old code fell back
       * to a second picker when the first returned nothing, so pressing Esc or
       * Cancel chained another dialog and the field looked frozen.
       */
      const pickNow = function () {
        if (picking) return
        setPicking(true)
        setNote('')
        pickFileFromHost()
          .then(function (picked) {
            if (!picked) return null
            if (!/\.(lnk|url)$/i.test(picked)) {
              applyResolved({ ok: true, path: picked })
              return null
            }
            return resolvePathOnHost(picked).then(function (resolved) {
              applyResolved(resolved && resolved.ok && resolved.path ? resolved : { ok: true, path: picked })
            })
          })
          .catch(function () {})
          .then(function () {
            setPicking(false)
          })
      }

      const handleDrop = function (event) {
        event.preventDefault()
        event.stopPropagation()
        setDrag(false)
        const file = event.dataTransfer && event.dataTransfer.files ? event.dataTransfer.files[0] : null
        if (!file) return
        resolveDroppedFile(file).then(applyResolved)
      }

      return h(
        'div',
        {
          className: 'gt-pathfield-wrap',
          'data-drop': drag ? 'true' : 'false',
          onDragEnter: function (event) {
            event.preventDefault()
            event.stopPropagation()
            setDrag(true)
          },
          onDragOver: function (event) {
            event.preventDefault()
            event.stopPropagation()
            setDrag(true)
          },
          onDragLeave: function (event) {
            event.stopPropagation()
            setDrag(false)
          },
          onDrop: handleDrop,
        },
        h(
          'div',
          { className: 'gt-pathfield' },
          h('input', {
            className: 'gt-input',
            value: value,
            placeholder: placeholder,
            onChange: function (event) {
              onChange(event.target.value)
            },
            onBlur: function (event) {
              const clean = normalizePath(event.target.value)
              if (clean !== event.target.value) onChange(clean)
              if (typeof onCommit === 'function') onCommit(clean)
              // Dropping a shortcut resolves it; pasting its path must do the same,
              // otherwise the game never matches and the row looks dead.
              if (/\.(lnk|url)$/i.test(clean)) {
                resolvePathOnHost(clean).then(function (resolved) {
                  if (resolved && resolved.ok && resolved.path) applyResolved(resolved)
                })
              }
            },
          }),
          h(
            'button',
            {
              type: 'button',
              className: 'gt-icon-btn small',
              title: t('pick'),
              disabled: picking,
              onClick: pickNow,
            },
            h(FolderIcon, null)
          ),
          current
            ? h(
                'button',
                {
                  type: 'button',
                  className: 'gt-icon-btn small',
                  title: t('reveal'),
                  onClick: function () {
                    revealPath(current)
                  },
                },
                h('span', { className: 'gt-reveal-glyph' }, '↗')
              )
            : null
        ),
        picking || note
          ? h('div', { className: 'gt-pathfield-note' }, picking ? t('pick.busy') : note)
          : null
      )
    }

    function hexToRgb(value) {
      const hex = String(value || '#000000').replace('#', '')
      const full = hex.length === 3
        ? hex
            .split('')
            .map(function (char) {
              return char + char
            })
            .join('')
        : hex
      const number = parseInt(full, 16)
      if (!Number.isFinite(number)) return '0,0,0'
      return [(number >> 16) & 255, (number >> 8) & 255, number & 255].join(',')
    }

    function normalizePath(value) {
      let out = String(value === null || value === undefined ? '' : value).trim()
      while (
        out.length > 1 &&
        ((out.charAt(0) === '"' && out.charAt(out.length - 1) === '"') ||
          (out.charAt(0) === "'" && out.charAt(out.length - 1) === "'"))
      ) {
        out = out.slice(1, -1).trim()
      }
      return out
    }

    function shrinkIcon(dataUrl) {
      return new Promise(function (resolve) {
        if (!dataUrl || typeof document === 'undefined') {
          resolve(dataUrl)
          return
        }
        const image = new Image()
        image.onload = function () {
          const side = 96
          const canvas = document.createElement('canvas')
          canvas.width = side
          canvas.height = side
          const context = canvas.getContext('2d')
          const scale = Math.min(side / image.width, side / image.height)
          const width = Math.round(image.width * scale)
          const height = Math.round(image.height * scale)
          context.drawImage(image, (side - width) / 2, (side - height) / 2, width, height)
          resolve(canvas.toDataURL('image/png'))
        }
        image.onerror = function () {
          resolve(dataUrl)
        }
        image.src = dataUrl
      })
    }

    function extractIcon(path) {
      const target = normalizePath(path)
      if (!target) return Promise.resolve(null)
      return fetch('/api/game-time/icon?path=' + encodeURIComponent(target), { headers: { accept: 'application/json' } })
        .then(function (response) {
          return response.ok ? response.json() : null
        })
        .then(function (payload) {
          if (!payload || !payload.dataUrl) return null
          return shrinkIcon(payload.dataUrl)
        })
        .catch(function () {
          return null
        })
    }

    function pickFileFromHost() {
      return fetch('/api/game-time/pick-file', { headers: { accept: 'application/json' } })
        .then(function (response) {
          return response.ok ? response.json() : null
        })
        .then(function (payload) {
          return payload && payload.path ? normalizePath(payload.path) : null
        })
        .catch(function () {
          return null
        })
    }

    /** Ask the host to turn a .exe / .lnk / .url (or steam:// URL) into a game exe. */
    function resolvePathOnHost(input) {
      if (typeof fetch !== 'function') return Promise.resolve(null)
      const target = String(input || '').trim()
      if (!target) return Promise.resolve(null)
      const key = /^(steam|file):\/\//i.test(target) ? 'url' : 'path'
      return fetch('/api/game-time/resolve?' + key + '=' + encodeURIComponent(target), {
        headers: { accept: 'application/json' },
      })
        .then(function (response) {
          return response.ok ? response.json() : null
        })
        .catch(function () {
          return null
        })
    }

    /**
     * The real path of a dropped file. The desktop shell exposes
     * `__DSH_HOST_PATHS__.pathFor` (Electron webUtils); a plain browser gives
     * only the file name, so shortcuts are parsed from their bytes instead.
     */
    function droppedFilePath(file) {
      if (!file) return ''
      if (typeof file.path === 'string' && file.path) return file.path
      try {
        const bridge = typeof window !== 'undefined' ? window.__DSH_HOST_PATHS__ : null
        if (bridge && typeof bridge.pathFor === 'function') {
          const value = bridge.pathFor(file)
          if (value) return String(value)
        }
      } catch (error) {
        return ''
      }
      return ''
    }

    /** `.url` files are INI: `[InternetShortcut]` + `URL=...`. */
    function shortcutUrlFromText(text) {
      const match = /^\s*URL\s*=\s*(.+)$/im.exec(String(text || ''))
      return match ? match[1].trim() : ''
    }

    /** Windows shortcuts store the target path as UTF-16LE somewhere in the blob. */
    function lnkTargetFromBuffer(buffer) {
      const bytes = new Uint8Array(buffer)
      let text = ''
      for (let index = 0; index + 1 < bytes.length; index += 2) {
        text += String.fromCharCode(bytes[index] | (bytes[index + 1] << 8))
      }
      const match = /[A-Za-z]:\\[^\u0000"<>|?*]{1,400}?\.exe/i.exec(text)
      return match ? match[0] : ''
    }

    /** Resolve a dropped file without a filesystem path (browser fallback). */
    function readDroppedTarget(file) {
      const name = String(file && file.name ? file.name : '').toLowerCase()
      if (name.slice(-4) === '.url' && typeof file.text === 'function') {
        return file
          .text()
          .then(function (text) {
            const url = shortcutUrlFromText(text)
            if (!url) return null
            return resolvePathOnHost(url)
          })
          .catch(function () {
            return null
          })
      }
      if (name.slice(-4) === '.lnk' && typeof file.arrayBuffer === 'function') {
        return file
          .arrayBuffer()
          .then(function (buffer) {
            const target = lnkTargetFromBuffer(buffer)
            return target ? resolvePathOnHost(target) : null
          })
          .catch(function () {
            return null
          })
      }
      return Promise.resolve(null)
    }

    function revealPath(path) {
      const target = normalizePath(path)
      if (!target) return
      fetch('/api/game-time/reveal?path=' + encodeURIComponent(target)).catch(function () {})
    }

    function readFileAsDataUrl(file) {
      return new Promise(function (resolve, reject) {
        const reader = new FileReader()
        reader.onload = function () {
          resolve(String(reader.result))
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    }

    function prepareImage(source, aspect, width) {
      return new Promise(function (resolve) {
        const image = new Image()
        image.onload = function () {
          const height = Math.round(width / aspect)
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const context = canvas.getContext('2d')
          const scale = Math.max(width / image.width, height / image.height)
          const drawWidth = image.width * scale
          const drawHeight = image.height * scale
          context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight)
          resolve(canvas.toDataURL('image/jpeg', 0.86))
        }
        image.onerror = function () {
          resolve(null)
        }
        image.src = source
      })
    }

    function uploadAsset(dataUrl) {
      if (!dataUrl) return Promise.resolve(null)
      return fetch('/api/game-time/asset', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ dataUrl: dataUrl }),
      })
        .then(function (response) {
          return response.ok ? response.json() : null
        })
        .then(function (payload) {
          return payload && payload.url ? payload.url : null
        })
        .catch(function () {
          return null
        })
    }

    /**
     * Cover rule for both background layers: the image is never narrower than
     * the window, so it grows with the window but stops shrinking once it hits
     * its own pixel width — below that the window crops it instead of squashing
     * it. 0 means "size unknown yet", and the caller falls back to CSS cover.
     */
    function backgroundWidth(naturalWidth, containerWidth) {
      const natural = Number(naturalWidth) || 0
      const container = Number(containerWidth) || 0
      if (natural <= 0) return 0
      if (container <= 0) return natural
      return Math.max(natural, Math.round(container))
    }

    /**
     * Background image opacity only. The opaque base colour lives one level up
     * (global settings) because the panel base is shared by every page.
     */
    function BackgroundControls({ t, value, onChange }) {
      const imageOpacity = value.imageOpacity === undefined ? 1 : value.imageOpacity
      return h(
        'div',
        { className: 'gt-bg-controls' },
        h(
          'label',
          { className: 'gt-bg-control' },
          h('span', null, t('bg.imageOpacity')),
          h('input', {
            type: 'range',
            min: 0,
            max: 100,
            value: Math.round(imageOpacity * 100),
            onChange: function (event) {
              onChange({ imageOpacity: Number(event.target.value) / 100 })
            },
          }),
          h('span', { className: 'gt-bg-value' }, Math.round(imageOpacity * 100) + '%')
        )
      )
    }

    // Crop presets. `null` keeps the picture's own ratio; the icon cropper
    // deliberately gets none of these and stays square.
    const PANEL_RATIOS = [
      { key: 'original', labelKey: 'crop.ratio.original', value: null },
      { key: '16x9', label: '16:9', value: 16 / 9 },
      { key: '8x3', label: '8:3', value: 8 / 3 },
      { key: '4x3', label: '4:3', value: 4 / 3 },
    ]
    const HEADER_RATIOS = [
      { key: 'original', labelKey: 'crop.ratio.original', value: null },
      { key: '6x1', label: '6:1', value: 6 },
      { key: '4x1', label: '4:1', value: 4 },
      { key: '3x1', label: '3:1', value: 3 },
    ]

    function Cropper({ t, src: source, aspect, outputWidth, format, ratios, onCancel, onApply }) {
      const [imageSize, setImageSize] = React.useState(null)
      const [imageElement, setImageElement] = React.useState(null)
      const [zoom, setZoom] = React.useState(1)
      const [offset, setOffset] = React.useState({ x: 0, y: 0 })
      const [dragging, setDragging] = React.useState(false)
      // `null` means "keep the picture's own ratio"; a number is a preset.
      const [ratio, setRatio] = React.useState(aspect)
      const activeAspect = ratio === null ? (imageSize ? imageSize.w / imageSize.h : aspect) : ratio

      const viewportWidth = activeAspect >= 2 ? 420 : activeAspect >= 1 ? 320 : 240
      const viewportHeight = Math.max(1, Math.round(viewportWidth / activeAspect))
      const base = imageSize ? Math.max(viewportWidth / imageSize.w, viewportHeight / imageSize.h) : 1
      const scale = base * zoom
      const displayWidth = imageSize ? imageSize.w * scale : 0
      const displayHeight = imageSize ? imageSize.h * scale : 0

      const clampOffset = function (next) {
        const minX = Math.min(0, viewportWidth - displayWidth)
        const minY = Math.min(0, viewportHeight - displayHeight)
        return {
          x: Math.max(minX, Math.min(0, next.x)),
          y: Math.max(minY, Math.min(0, next.y)),
        }
      }

      const onLoad = function (event) {
        const element = event.target
        const size = { w: element.naturalWidth || viewportWidth, h: element.naturalHeight || viewportHeight }
        const fit = Math.max(viewportWidth / size.w, viewportHeight / size.h)
        setImageElement(element)
        setImageSize(size)
        setOffset({
          x: (viewportWidth - size.w * fit) / 2,
          y: (viewportHeight - size.h * fit) / 2,
        })
      }

      const startDrag = function (event) {
        if (!imageSize) return
        event.preventDefault()
        setDragging(true)
        const startX = event.clientX
        const startY = event.clientY
        const origin = offset
        const move = function (moveEvent) {
          setOffset(
            clampOffset({
              x: origin.x + (moveEvent.clientX - startX),
              y: origin.y + (moveEvent.clientY - startY),
            })
          )
        }
        const stop = function () {
          setDragging(false)
          document.removeEventListener('mousemove', move)
          document.removeEventListener('mouseup', stop)
        }
        document.addEventListener('mousemove', move)
        document.addEventListener('mouseup', stop)
      }

      const changeZoom = function (value) {
        setZoom(value)
        const nextBase = Math.max(viewportWidth / (imageSize ? imageSize.w : 1), viewportHeight / (imageSize ? imageSize.h : 1))
        const nextWidth = (imageSize ? imageSize.w : 0) * nextBase * value
        const nextHeight = (imageSize ? imageSize.h : 0) * nextBase * value
        setOffset({
          x: (viewportWidth - nextWidth) / 2,
          y: (viewportHeight - nextHeight) / 2,
        })
      }

      /** Swap the crop ratio and re-fit the picture into the new viewport. */
      const changeRatio = function (next) {
        setRatio(next)
        setZoom(1)
        if (!imageSize) return
        const nextAspect = next === null ? imageSize.w / imageSize.h : next
        const width = nextAspect >= 2 ? 420 : nextAspect >= 1 ? 320 : 240
        const height = Math.max(1, Math.round(width / nextAspect))
        const fit = Math.max(width / imageSize.w, height / imageSize.h)
        setOffset({
          x: (width - imageSize.w * fit) / 2,
          y: (height - imageSize.h * fit) / 2,
        })
      }

      const apply = function () {
        if (!imageElement || !imageSize) return
        const canvas = document.createElement('canvas')
        canvas.width = outputWidth
        canvas.height = Math.max(1, Math.round(outputWidth / activeAspect))
        const context = canvas.getContext('2d')
        const sourceX = (0 - offset.x) / scale
        const sourceY = (0 - offset.y) / scale
        const sourceWidth = viewportWidth / scale
        const sourceHeight = viewportHeight / scale
        context.drawImage(imageElement, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height)
        onApply(canvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', 0.88))
      }

      return h(
        'div',
        { className: 'gt-crop-backdrop' },
        h(
          'div',
          { className: 'gt-crop' },
          ratios && ratios.length
            ? h(
                'div',
                { className: 'gt-seg' },
                ratios.map(function (option) {
                  return h(
                    'button',
                    {
                      key: option.key,
                      type: 'button',
                      className: 'gt-seg-btn',
                      'data-active': option.value === null ? ratio === null : ratio === option.value,
                      onClick: function () {
                        changeRatio(option.value)
                      },
                    },
                    option.labelKey ? t(option.labelKey) : option.label
                  )
                })
              )
            : null,
          h(
            'div',
            {
              className: 'gt-crop-viewport',
              style: { width: viewportWidth, height: viewportHeight, cursor: dragging ? 'grabbing' : 'grab' },
              onMouseDown: startDrag,
            },
            h('img', {
              src: source,
              alt: '',
              onLoad: onLoad,
              style: imageSize
                ? {
                    position: 'absolute',
                    left: offset.x + 'px',
                    top: offset.y + 'px',
                    width: displayWidth + 'px',
                    height: displayHeight + 'px',
                    maxWidth: 'none',
                  }
                : { position: 'absolute', opacity: 0, width: '1px', height: '1px' },
            })
          ),
          h(
            'label',
            { className: 'gt-bg-control' },
            h('span', null, t('crop.zoom')),
            h('input', {
              type: 'range',
              min: 100,
              max: 300,
              value: Math.round(zoom * 100),
              onChange: function (event) {
                changeZoom(Number(event.target.value) / 100)
              },
            })
          ),
          h(
            'div',
            { className: 'gt-crop-actions' },
            h('span', { className: 'gt-note' }, t('crop.hint')),
            h('span', { style: { display: 'flex', gap: 8 } },
              h('button', { type: 'button', className: 'gt-btn', onClick: onCancel }, t('cancel')),
              h('button', { type: 'button', className: 'gt-btn', onClick: apply }, t('crop.apply'))
            )
          )
        )
      )
    }

    function ImageField({ t, value, aspect, width, fit, ratios, onChange, onFit }) {
      const [busy, setBusy] = React.useState(false)
      const [pending, setPending] = React.useState(null)
      const choose = function (event) {
        const file = event.target.files && event.target.files[0]
        if (!file) return
        readFileAsDataUrl(file)
          .then(function (source) {
            setPending(source)
          })
          .catch(function () {})
      }
      const commit = function (dataUrl) {
        setPending(null)
        setBusy(true)
        uploadAsset(dataUrl)
          .then(function (url) {
            setBusy(false)
            if (url) onChange(url)
          })
          .catch(function () {
            setBusy(false)
          })
      }
      return h(
        'div',
        { className: 'gt-imagefield' },
        h(
          'label',
          {
            className: 'gt-imagefield-box' + (value ? ' has' : ''),
            style: value ? { backgroundImage: 'url("' + value + '")' } : null,
          },
          h('span', { className: 'gt-imagefield-hint' }, busy ? t('image.working') : value ? '' : '+ ' + t('image.choose')),
          h('input', {
            type: 'file',
            accept: 'image/*',
            style: { display: 'none' },
            onChange: choose,
          })
        ),
        pending
          ? h(Cropper, {
              t: t,
              src: pending,
              aspect: aspect,
              outputWidth: width,
              ratios: ratios,
              onCancel: function () {
                setPending(null)
              },
              onApply: commit,
            })
          : null,
        h(
          'div',
          { className: 'gt-imagefield-actions' },
          value
            ? h(
                'button',
                {
                  type: 'button',
                  className: 'gt-link',
                  onClick: function () {
                    onChange('')
                  },
                },
                t('image.remove')
              )
            : null,
          onFit
            ? h(
                'div',
                { className: 'gt-seg' },
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'gt-seg-btn',
                    'data-active': fit !== 'tile',
                    onClick: function () {
                      onFit('cover')
                    },
                  },
                  t('fit.cover')
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'gt-seg-btn',
                    'data-active': fit === 'tile',
                    onClick: function () {
                      onFit('tile')
                    },
                  },
                  t('fit.tile')
                )
              )
            : null
        )
      )
    }

    function FolderIcon({ size = 14 }) {
      return h(
        'svg',
        iconProps(size),
        h('path', {
          d: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z',
        })
      )
    }

    function PickButton({ t, onPick }) {
      const [busy, setBusy] = React.useState(false)
      return h(
        'button',
        {
          type: 'button',
          className: 'gt-icon-btn small',
          title: t('pick'),
          disabled: busy,
          onClick: function () {
            setBusy(true)
            pickExecutable().then(function (path) {
              setBusy(false)
              if (path) onPick(path)
            })
          },
        },
        h(FolderIcon, null)
      )
    }

    function readIconFile(file, done) {
      if (!file) return
      const reader = new FileReader()
      reader.onload = function () {
        const image = new Image()
        image.onload = function () {
          const side = 96
          const canvas = document.createElement('canvas')
          canvas.width = side
          canvas.height = side
          const context = canvas.getContext('2d')
          const scale = Math.min(side / image.width, side / image.height)
          const width = Math.round(image.width * scale)
          const height = Math.round(image.height * scale)
          context.drawImage(image, (side - width) / 2, (side - height) / 2, width, height)
          done(canvas.toDataURL('image/png'))
        }
        image.src = String(reader.result)
      }
      reader.readAsDataURL(file)
    }

    function IconPicker({ t, value, fallback, size, sourcePath, onChange, bare }) {
      const [pending, setPending] = React.useState(null)
      const choose = function (event) {
        const file = event.target.files && event.target.files[0]
        if (!file) return
        readFileAsDataUrl(file)
          .then(function (source) {
            setPending(source)
          })
          .catch(function () {})
      }
      return h(
        'div',
        { className: 'gt-iconpick' + (bare ? ' bare' : '') },
        h(
          'label',
          { className: 'gt-iconpick-pick', title: t('icon.pick') },
          h('input', {
            type: 'file',
            accept: 'image/*',
            style: { display: 'none' },
            onChange: choose,
          }),
          value
            ? h('img', { className: 'gt-iconimg', src: value, style: { width: size, height: size } })
            : fallback,
          bare ? null : h('span', { className: 'gt-link' }, t('icon.pick'))
        ),
        bare
          ? null
          : sourcePath
            ? h(
                'button',
                {
                  type: 'button',
                  className: 'gt-link',
                  onClick: function () {
                    extractIcon(sourcePath).then(function (icon) {
                      if (icon) onChange(icon)
                    })
                  },
                },
                t('icon.extract')
              )
            : null,
        bare || !value
          ? null
          : h(
              'button',
              {
                type: 'button',
                className: 'gt-link',
                onClick: function () {
                  onChange('')
                },
              },
              t('icon.reset')
            ),
        pending
          ? h(Cropper, {
              t: t,
              src: pending,
              aspect: 1,
              outputWidth: 96,
              format: 'png',
              onCancel: function () {
                setPending(null)
              },
              onApply: function (dataUrl) {
                setPending(null)
                onChange(dataUrl)
              },
            })
          : null
      )
    }

    /**
     * Ring gauge with the percentage in the middle.
     *
     * - under 100 %: a grey track with a green arc growing from 12 o'clock.
     * - 100–199 %: the track turns green and the overflow is drawn as a red arc.
     * - 200 % and up: the overflow fills the ring, so it is simply all red.
     *
     * The middle prints the percentage ("85 %", "154 %"), turns red past 100 %,
     * and caps the text at 999 %+ so a runaway ratio cannot break the layout.
     *
     * Drawn as a single stroke: no outline, no rounded caps, integer stroke
     * width (40 px box, 6 px stroke) and one pixel of margin, so the edge lands
     * on whole pixels instead of looking jagged.
     */
    function Ring({ ratio, tip, size }) {
      const box = Number(size) || 40
      const stroke = 6
      // One pixel of margin inside the viewBox: a stroke tangent to the edge
      // gets clipped by the SVG bounds and reads as a jagged rim.
      const radius = (box - stroke) / 2 - 1
      const circumference = 2 * Math.PI * radius
      const value = Math.max(0, Number(ratio) || 0)
      const center = box / 2
      const percent = Math.round(value * 100)
      const allRed = value >= 2
      // Track colour = what the ring is "filled with" so far: grey until the
      // average is reached, green once it is, red once the overflow filled it.
      const track = allRed ? 'gt-ring-red' : value >= 1 ? 'gt-ring-green' : 'gt-ring-gray'
      // The arc is the part in flight: green under one lap, red on top of the
      // green lap, and nothing once the ring is entirely red.
      const arcColor = value >= 1 ? 'gt-ring-red' : 'gt-ring-green'
      const arcFraction = allRed ? 0 : value >= 1 ? value - 1 : value
      const label = percent > 999 ? '999%+' : String(percent) + '%'
      const parts = [
        h('circle', {
          key: 'track',
          className: track,
          cx: center,
          cy: center,
          r: radius,
          fill: 'none',
          strokeWidth: stroke,
        }),
      ]
      if (arcFraction > 0) {
        parts.push(
          h('circle', {
            key: 'arc',
            className: arcColor,
            cx: center,
            cy: center,
            r: radius,
            fill: 'none',
            strokeWidth: stroke,
            strokeDasharray: arcFraction * circumference + ' ' + circumference,
            transform: 'rotate(-90 ' + center + ' ' + center + ')',
          })
        )
      }
      parts.push(
        h(
          'text',
          {
            key: 'percent',
            className: 'gt-ring-lap',
            'data-tone': percent > 100 ? 'over' : 'flat',
            x: center,
            y: center,
            textAnchor: 'middle',
            dominantBaseline: 'central',
          },
          label
        )
      )
      return h(
        'span',
        { className: 'gt-ring', 'data-tip': tip || undefined },
        h(
          'svg',
          {
            className: 'gt-ring-svg',
            width: box,
            height: box,
            viewBox: '0 0 ' + box + ' ' + box,
            role: tip ? 'img' : undefined,
            'aria-label': tip || undefined,
          },
          parts
        ),
        tip ? h('span', { className: 'gt-ring-tip' }, tip) : null
      )
    }

    function Stat({ label, value, seconds, unit, t, sub, ring, onClick, hint }) {
      // The comparison line sits next to the time ("3时2分 /1.5时 平均每日"), not
      // under it: it belongs to the number and the card stays two lines tall.
      const line = [
        h(
          'div',
          { className: 'gt-value' },
          seconds === undefined
            ? h('span', null, value, unit ? h('span', { className: 'gt-unit' }, unit) : null)
            : h(Duration, { seconds: seconds, t: t })
        ),
        sub
          ? h(
              'div',
              { className: 'gt-stat-sub' },
              h('span', { className: 'gt-stat-sub-k' }, sub.label + '：'),
              h('span', { className: 'gt-stat-sub-v', 'data-tone': sub.tone || 'flat' }, sub.value)
            )
          : null,
      ]
      const body = [
        h('div', { className: 'gt-label' }, label, hint ? h('span', { className: 'gt-card-caret' }, '▾') : null),
        h('div', { className: 'gt-stat-main' }, h('div', { className: 'gt-stat-line' }, line), ring ? h(Ring, ring) : null),
      ]
      return onClick
        ? h(
            'button',
            {
              type: 'button',
              className: 'gt-card gt-card-btn',
              title: hint || undefined,
              onClick: onClick,
            },
            body
          )
        : h('div', { className: 'gt-card' }, body)
    }


    function Duration({ seconds, t }) {
      return h(
        'span',
        null,
        durationParts(seconds, t).map(function (part, index) {
          return h('span', { key: index }, part.v, h('span', { className: 'gt-unit' }, part.u))
        })
      )
    }

    function Dropdown({ value, options, onChange, minWidth }) {
      const [open, setOpen] = React.useState(false)
      const current = options.find(function (option) {
        return option.value === value
      })
      return h(
        'div',
        {
          className: 'gt-pselect',
          style: minWidth ? { minWidth: minWidth } : undefined,
        },
        h(
          'button',
          {
            type: 'button',
            className: 'gt-pselect-btn',
            onClick: function () {
              setOpen(!open)
            },
          },
          current && current.color
            ? h('span', { className: 'gt-chip-dot', style: { background: current.color } })
            : null,
          h('span', { className: 'gt-pselect-label' }, current ? current.label : String(value)),
          h('span', { className: 'gt-caret' }, '▾')
        ),
        open
          ? h('div', {
              className: 'gt-backdrop',
              onClick: function () {
                setOpen(false)
              },
            })
          : null,
        open
          ? h(
              'div',
              { className: 'gt-pselect-menu' },
              options.map(function (option) {
                return h(
                  'button',
                  {
                    key: option.value,
                    type: 'button',
                    className: 'gt-pselect-item',
                    'data-active': option.value === value,
                    onClick: function () {
                      onChange(option.value)
                      setOpen(false)
                    },
                  },
                  option.color
                    ? h('span', { className: 'gt-chip-dot', style: { background: option.color } })
                    : null,
                  h('span', null, option.label)
                )
              })
            )
          : null
      )
    }

    function PlatformSelect({ value, options, onChange }) {
      return h(Dropdown, {
        value: value,
        options: options.map(function (id) {
          const platform = PLATFORMS[id]
          return {
            value: id,
            label: platformLabel(platform) || id,
            color: platform ? platform.color : '#888',
          }
        }),
        onChange: onChange,
      })
    }

    /* ------------------------------------------------------------------ *
     * Today view
     * ------------------------------------------------------------------ */

    /**
     * A trend card for the today page: the same ChartCard the all-games page
     * uses, so tooltip, bar/line toggle, colours, selection and panning all come
     * along. `switchable` turns the wheel into a 7-day / 30-day switch.
     */
    function TodayTrend({ t, initialRange, switchable, grain, touch, prefField }) {
      // Preferences live in config.json (through SETTINGS + touch), so they
      // survive a DSH restart even when the web view's storage is ephemeral.
      const savedWindow = switchable && SETTINGS.todayWindow === 'last30' ? 'last30' : 'last7'
      const startRange = switchable ? savedWindow : initialRange
      const [range, setRange] = React.useState(startRange)
      const [anchor, setAnchor] = React.useState(null)
      const [selected, setSelected] = React.useState(null)
      const wheelLock = React.useRef(0)
      const currentAnchor = anchor || defaultAnchor(range)
      const points = bucketSeries(seriesFor(null, range, currentAnchor, BY_GAME, grain), t)
      const heading = initialRange === 'day' ? t('today.hours') : t('range.' + range)
      return h(
        'div',
        {
          className: 'gt-trend-cell',
          onWheel: switchable
            ? function (event) {
                const now = Date.now()
                if (now - wheelLock.current < 280) return
                wheelLock.current = now
                const nextRange = range === 'last7' ? 'last30' : 'last7'
                setRange(nextRange)
                SETTINGS.todayWindow = nextRange
                if (typeof touch === 'function') touch()
                setAnchor(null)
                setSelected(null)
                if (event.preventDefault) event.preventDefault()
              }
            : undefined,
        },
        h(ChartCard, {
          t: t,
          title: heading,
          unit: t('unit.' + grain.key),
          note: rangeLabelOf(range, currentAnchor, grain),
          points: points,
          selectedKey: selected,
          chartType: SETTINGS[prefField] === 'bar' ? 'bar' : 'line',
          onChartType: function (key) {
            SETTINGS[prefField] = key
            if (typeof touch === 'function') touch()
          },
          detailOnClick: true,
          onPan: function (delta) {
            setAnchor(panAnchor(range, currentAnchor, delta, grain))
          },
          onReset: switchable
            ? function () {
                setAnchor(null)
              }
            : function () {
                setAnchor(null)
              },
          onSelect: function (key) {
            setSelected(selected === key ? null : key)
          },
        })
      )
    }

    /**
     * Page-level drop target. Dropping an exe/shortcut opens a confirm dialog
     * (name + platform) instead of adding the game silently.
     */
    function DropSurface({ t, className, touch, children }) {
      const [over, setOver] = React.useState(false)
      const [draft, setDraft] = React.useState(null)
      const [note, setNote] = React.useState('')
      const depth = React.useRef(0)

      const hasFiles = function (event) {
        const types = event.dataTransfer && event.dataTransfer.types
        if (!types) return false
        for (let index = 0; index < types.length; index += 1) {
          if (types[index] === 'Files') return true
        }
        return false
      }

      const settleDrop = function (event) {
        event.preventDefault()
        event.stopPropagation()
        depth.current = 0
        setOver(false)
        const files =
          event.dataTransfer && event.dataTransfer.files
            ? Array.prototype.slice.call(event.dataTransfer.files)
            : []
        if (files.length === 0) return
        Promise.all(files.map(resolveDroppedFile)).then(function (list) {
          const resolved = list.find(function (item) {
            return item && item.ok
          })
          if (!resolved) {
            const why = (list.find(Boolean) || {}).warning || ''
            setNote(t('drop.badGame').replace('{why}', why || '?'))
            return
          }
          const next = draftGameFromResolved(t, resolved)
          if (next) {
            setNote('')
            setDraft(next)
          } else {
            setNote(t('drop.badGame').replace('{why}', resolved.warning || resolved.path || '?'))
          }
        })
      }

      return h(
        'div',
        {
          className: className,
          onDragEnter: function (event) {
            if (!hasFiles(event)) return
            event.preventDefault()
            event.stopPropagation()
            depth.current += 1
            setOver(true)
          },
          onDragOver: function (event) {
            if (!hasFiles(event)) return
            event.preventDefault()
            event.stopPropagation()
            if (!over) setOver(true)
          },
          onDragLeave: function (event) {
            if (!hasFiles(event)) return
            event.stopPropagation()
            depth.current = Math.max(0, depth.current - 1)
            if (depth.current === 0) setOver(false)
          },
          onDrop: settleDrop,
        },
        children,
        over ? h('div', { className: 'gt-drop-overlay' }, t('drop.overlay')) : null,
        note
          ? h(
              'div',
              {
                className: 'gt-drop-toast',
                onClick: function () {
                  setNote('')
                },
              },
              note
            )
          : null,
        draft
          ? h(AddGameDialog, {
              t: t,
              draft: draft,
              onCancel: function () {
                setDraft(null)
              },
              onConfirm: function (next) {
                const id = commitGameDraft(next)
                setDraft(null)
                if (id && typeof touch === 'function') touch()
                else if (typeof bumpPage === 'function') bumpPage()
              },
            })
          : null
      )
    }

    /** Confirm dialog for a dropped game: name, platform, cancel / add. */
    function AddGameDialog({ t, draft, onCancel, onConfirm }) {
      const [name, setName] = React.useState(draft.name)
      const [platformId, setPlatformId] = React.useState(draft.platformId)
      const ids = Object.keys(PLATFORMS)
      if (ids.indexOf(platformId) < 0) ids.unshift(platformId)
      const close = function (event) {
        if (event && event.target !== event.currentTarget) return
        onCancel()
      }
      return h(
        'div',
        { className: 'gt-modal-backdrop', onMouseDown: close },
        h(
          'div',
          { className: 'gt-modal' },
          h('div', { className: 'gt-modal-title' }, t('addGame.title')),
          draft.owned
            ? h('div', { className: 'gt-note' }, t('addGame.owned').replace('{name}', draft.owned.name))
            : null,
          h('div', { className: 'gt-modal-path' }, draft.path),
          draft.owned
            ? null
            : h(
                'div',
                { className: 'gt-modal-row' },
                h('label', { className: 'gt-modal-label' }, t('addGame.name')),
                h('input', {
                  className: 'gt-input',
                  value: name,
                  onChange: function (event) {
                    setName(event.target.value)
                  },
                })
              ),
          draft.owned
            ? null
            : h(
                'div',
                { className: 'gt-modal-row' },
                h('label', { className: 'gt-modal-label' }, t('addGame.platform')),
                h(Dropdown, {
                  value: platformId,
                  minWidth: 140,
                  options: ids.map(function (id) {
                    return { value: id, label: PLATFORMS[id] ? platformLabel(PLATFORMS[id]) : id }
                  }),
                  onChange: function (value) {
                    setPlatformId(value)
                  },
                })
              ),
          h(
            'div',
            { className: 'gt-modal-actions' },
            h('button', { type: 'button', className: 'gt-btn', onClick: onCancel }, t('cancel')),
            draft.owned
              ? null
              : h(
                  'button',
                  {
                    type: 'button',
                    className: 'gt-btn gt-btn-primary',
                    onClick: function () {
                      onConfirm({ path: draft.path, name: name, platformId: platformId })
                    },
                  },
                  t('addGame.confirm')
                )
          )
        )
      )
    }


    /**
     * The middle of a list row: how today compares with this game's typical
     * day, what that typical day is, and how many days it has been played.
     *
     * Three ranked hints, not a second table: the panel is often a narrow
     * sidebar, so CSS hides them by rank as it narrows (labels first, then 3,
     * 2, 1). See the `data-w` rules in STYLE — the breakpoints measure the
     * panel, not the browser window.
     */
    function HintStrip({ t, game, today, total, days, lastPlayed }) {
      const limitDays = Number(SETTINGS.statsDays) || 0
      if (limitDays > 0) {
        const seen = Number(lastPlayed) || 0
        if (!seen || NOW.getTime() - seen > limitDays * DAY_MS) return null
      }
      const count = Number(days) || 0
      const average = averagePerDay(total, count)
      const percent = today > 0 ? comparePercent(today, average) : null
      // More than usual reads red, less reads green — the same rule as the ring
      // gauge on the stat cards (green fills to the average, red is the excess).
      const tone = percent === null || Math.abs(percent) < 0.5 ? 'flat' : percent > 0 ? 'over' : 'under'
      const compareText =
        percent === null || Math.abs(percent) < 0.5
          ? t('noData')
          : (percent > 0 ? '▲' : '▼') + String(Math.min(199, Math.round(Math.abs(percent)))) + '%'
      // Display order is avg/day → total days → comparison, but the ranks are
      // by importance: the comparison is the last one to disappear when the
      // panel narrows (rank 3 goes first, then 2, then 1).
      const items = [
        { rank: 2, label: t('list.hint.avgDay'), value: count > 0 ? compactDuration(average, t) : t('noData'), tone: 'flat' },
        { rank: 3, label: t('list.hint.days'), value: count > 0 ? String(count) + t('day') : t('noData'), tone: 'flat' },
        { rank: 1, label: t('list.hint.vsAvg'), value: compareText, tone: tone },
      ]
      return h(
        'div',
        { className: 'gt-hints', 'aria-label': t('list.hint.vsAvg') },
        items.map(function (item) {
          return h(
            'span',
            { key: item.rank, className: 'gt-hint', 'data-rank': String(item.rank) },
            h('span', { className: 'gt-hint-k' }, item.label + '：'),
            h('span', { className: 'gt-hint-v', 'data-tone': item.tone }, item.value)
          )
        })
      )
    }

    // Module scope, like LAST_ROUTE: switching the middle stat card to 本月 must
    // survive leaving the panel and coming back.
    let STATS_PERIOD = 'week'

    /** "+54%" / "-12%" for the ring tooltips; empty when there is no baseline. */
    function percentText(current, base) {
      const percent = comparePercent(current, base)
      if (percent === null) return ''
      const value = Math.min(199, Math.round(Math.abs(percent)))
      return ' · ' + (percent > 0 ? '+' : '-') + String(value) + '%'
    }

    /**
     * The three cards above the list.
     *
     * 本日 compares today with "a typical day" (average per played day, today
     * excluded so a big day cannot raise the bar it is measured against).
     * 本周/本月 compares this period's daily average with the previous one and
     * can be toggled by clicking the card. 总计 shows the total plus how many
     * of the recorded days had any play. Rings are drawn by `Ring`.
     */
    function StatsRow({ t }) {
      const [period, setPeriod] = React.useState(STATS_PERIOD)
      const totalAll = totalsFor(null, 'all', NOW)
      const today = totalsFor(null, 'day', NOW)
      // Only closed sessions are on disk; a running session is not counted in
      // the host's played-day total yet, so it must not be subtracted either.
      const todayOnDisk = SESSIONS.some(function (session) {
        return !session.live && dayKey(session.start) === dayKey(NOW)
      })
      const playedTotal = playedDaysTotal()
      const avgDaily = averagePerDay(totalAll - today, playedTotal - (todayOnDisk ? 1 : 0))
      const todayRatio = avgDaily > 0 ? today / avgDaily : 0
      const todayTone = today > avgDaily ? 'over' : today > 0 ? 'under' : 'flat'

      const bounds = rangeBounds(period, NOW)
      const periodSessions = sessionsInRange(null, bounds.from, bounds.to, null)
      const periodSeconds = secondsInRange(periodSessions, bounds.from, bounds.to)
      const prevBounds = rangeBounds(period, new Date(bounds.from.getTime() - DAY_MS))
      const prevSessions = sessionsInRange(null, prevBounds.from, prevBounds.to, null)
      // Straight totals, not averages: "this week played / last week's total"
      // is what the card claims, so both sides of the ratio must be totals.
      const prevSeconds = secondsInRange(prevSessions, prevBounds.from, prevBounds.to)
      const periodRatio = prevSeconds > 0 ? periodSeconds / prevSeconds : 0
      const periodTone = periodSeconds > prevSeconds ? 'over' : periodSeconds > 0 ? 'under' : 'flat'
      const prevLabel = period === 'month' ? t('stat.lastMonthSum') : t('stat.lastWeekSum')

      const span = recordDays()
      const playedAll = playedDaysTotal()
      const spanRatio = span > 0 ? playedAll / span : 0

      const togglePeriod = function () {
        STATS_PERIOD = STATS_PERIOD === 'week' ? 'month' : 'week'
        setPeriod(STATS_PERIOD)
      }
      const nextPeriodName = t('range.' + (period === 'week' ? 'month' : 'week'))

      const todayTip =
        t('stat.tip.day')
          .replace('{now}', formatDuration(today, t))
          .replace('{avg}', formatDuration(avgDaily, t)) + percentText(today, avgDaily)
      const periodTip =
        t('stat.tip.' + period)
          .replace('{now}', formatDuration(periodSeconds, t))
          .replace('{avg}', formatDuration(prevSeconds, t)) + percentText(periodSeconds, prevSeconds)
      const totalTip = t('stat.tip.total')
        .replace('{days}', String(playedAll))
        .replace('{total}', String(span))

      return h(
        'div',
        { className: 'gt-stats' },
        h(Stat, {
          label: t('stat.today'),
          seconds: today,
          t: t,
          sub: { value: avgDaily > 0 ? compactDuration(avgDaily, t) : t('noData'), label: t('stat.avgDaily'), tone: todayTone },
          ring: { ratio: todayRatio, tip: todayTip },
        }),
        h(Stat, {
          label: t('range.' + period),
          seconds: periodSeconds,
          t: t,
          sub: { value: prevSeconds > 0 ? compactDuration(prevSeconds, t) : t('noData'), label: prevLabel, tone: periodTone },
          ring: { ratio: periodRatio, tip: periodTip },
          onClick: togglePeriod,
          hint: t('stat.switch').replace('{name}', nextPeriodName),
        }),
        h(Stat, {
          label: t('stat.total'),
          seconds: totalAll,
          t: t,
          sub: { value: String(playedAll) + t('day'), label: t('stat.played'), tone: 'under' },
          ring: { ratio: spanRatio, tip: totalTip },
        })
      )
    }

    function TodayView({ t, onOpenGame, touch }) {
      const duplicates = duplicateMap()
      const rows = GAMES.map(function (game) {
        const day = totalsFor(game.id, 'day', NOW)
        if (day <= 0) return null
        return { game: game, day: day, week: totalsFor(game.id, 'week', NOW), total: totalsFor(game.id, 'all', NOW) }
      })
        .filter(Boolean)
        .sort(function (a, b) {
          return b.day - a.day
        })

      return h(
        DropSurface,
        { t: t, className: 'gt-root', touch: touch },
        h(StatsRow, { t: t }),
        rows.length === 0
          ? h(
              'div',
              { className: 'gt-empty' },
              h('div', { className: 'gt-empty-title' }, t('empty.title')),
              h('div', { className: 'gt-empty-body' }, t('empty.body'))
            )
          : h(
              'div',
              { className: 'gt-list-card' },
              h(
                'div',
                { className: 'gt-section' },
                h('div', { className: 'gt-section-title' }, t('today.section')),
                h('div', { className: 'gt-muted' }, t('today.count').replace('{n}', String(rows.length)))
              ),
              h(
                'div',
                { className: 'gt-grid-head' },
                h('div', null, t('today.col.game')),
                h('div', { className: 'gt-num' }, t('today.col.day')),
                h('div', { className: 'gt-num' }, t('today.col.week')),
                h('div', { className: 'gt-num' }, t('today.col.total'))
              ),
              rows.map(function (row) {
                return h(
                  'button',
                  {
                    key: row.game.id,
                    type: 'button',
                    className: 'gt-row',
                    onClick: function () {
                      onOpenGame(row.game.id, 'today')
                    },
                  },
                  h(
                    'div',
                    { className: 'gt-row-main' },
                    h(StatusDot, { t: t, status: gameStatus(row.game) }),
                    h(Tile, { game: row.game }),
                    h(
                      'div',
                      { className: 'gt-name-wrap' },
                      h('div', { className: 'gt-name' }, row.game.name),
                      h(Badges, { platformIds: enabledPlatforms(row.game) })
                    ),
                    h(HintStrip, {
                      t: t,
                      game: row.game,
                      today: row.day,
                      total: row.total,
                      days: playedDaysFor(row.game.id),
                      lastPlayed: lastPlayedAt(row.game.id),
                    })
                  ),
                  h('div', { className: 'gt-num' }, h(Duration, { seconds: row.day, t: t })),
                  h('div', { className: 'gt-num' }, h(Duration, { seconds: row.week, t: t })),
                  h('div', { className: 'gt-num' }, h(Duration, { seconds: row.total, t: t }))
                )
              })
            ),
        h(
          'div',
          { className: 'gt-trend-module' },
          h(
            'div',
            { className: 'gt-section' },
            h('div', { className: 'gt-section-title' }, t('today.trend')),
            h('div', { className: 'gt-muted' }, t('today.trend.hint'))
          ),
          h(
            'div',
            { className: 'gt-trend-row' },
            h(TodayTrend, { t: t, initialRange: 'day', grain: GRAIN.h1, touch: touch, prefField: 'todayChartHours' }),
            h(TodayTrend, { t: t, initialRange: 'last7', switchable: true, grain: GRAIN.d1, touch: touch, prefField: 'todayChartRange' })
          )
        )
      )
    }

    /* ------------------------------------------------------------------ *
     * All games view
     * ------------------------------------------------------------------ */

    function AllView({ t, onOpenGame, touch }) {
      const [query, setQuery] = React.useState('')
      const [sort, setSort] = React.useState('total')
      const [range, setRange] = React.useState('last7')
      // `null` means "follow the current period": the window ends at today's
      // midnight (or this week's / month's end) and therefore rolls over on its
      // own. Panning stores a fixed Date and the reset button goes back to null.
      const [anchor, setAnchor] = React.useState(null)
      const currentAnchor = anchor || defaultAnchor(range)
      const [zoom, setZoom] = React.useState(GRAIN_LEVELS.last7.base)
      const [showArchived, setShowArchived] = React.useState(false)

      const levelConfig = GRAIN_LEVELS[range] || GRAIN_LEVELS.day
      const zoomIndex = Math.min(Math.max(zoom, 0), levelConfig.levels.length - 1)
      const grain = levelConfig.levels[zoomIndex]
      const zoomBy = function (delta) {
        setZoom(Math.min(Math.max(zoomIndex + delta, 0), levelConfig.levels.length - 1))
      }

      // The window may reach before the lazy-load edge; pull that slice once.
      // HISTORY_FROM/FIRST_START are deps so the first `/state` (which may land
      // after this component mounts) still triggers the missing slice. The
      // window start is a number, so a moving "now" does not re-run this every
      // render — only a real rollover or a pan moves it.
      const windowFrom = windowBounds(range, currentAnchor, grain).from.getTime()
      React.useEffect(function () {
        ensureHistory(windowFrom)
      }, [windowFrom, HISTORY_FROM, FIRST_START])

      const pickRange = function (key) {
        setRange(key)
        setAnchor(null)
        setZoom((GRAIN_LEVELS[key] || GRAIN_LEVELS.day).base)
      }

      const duplicates = duplicateMap()

      const toRow = function (game) {
        return {
          game: game,
          today: totalsFor(game.id, 'day', NOW),
          total: totalsFor(game.id, 'all', NOW),
          week: totalsFor(game.id, 'week', NOW),
          recent: lastPlayedAt(game.id),
        }
      }

      const needle = query.trim().toLowerCase()
      const matches = function (row) {
        return !needle || row.game.name.toLowerCase().indexOf(needle) >= 0
      }

      const sortRows = function (list) {
        return list.sort(function (a, b) {
          if (sort === 'week') return b.week - a.week
          if (sort === 'recent') return b.recent - a.recent
          if (sort === 'name') return a.game.name.localeCompare(b.game.name, 'zh-Hans-CN')
          return b.total - a.total
        })
      }

      const rows = sortRows(
        GAMES.filter(function (game) {
          return !isArchived(game)
        })
          .map(toRow)
          .filter(matches)
      )
      const archivedRows = sortRows(
        GAMES.filter(isArchived)
          .map(toRow)
          .filter(matches)
      )
      const archivedTotal = archivedRows.reduce(function (sum, row) {
        return sum + row.total
      }, 0)

      const uninstalled = GAMES.filter(function (game) {
        if (isArchived(game)) return false
        return (game.installs || []).some(function (install) {
          return install.exists === false
        })
      })

      const archiveUninstalled = function () {
        uninstalled.forEach(function (game) {
          game.archived = true
        })
        if (typeof touch === 'function') touch()
        else if (typeof bumpPage === 'function') bumpPage()
      }

      const gameRow = function (row, archived) {
        return h(
          'button',
          {
            key: row.game.id,
            type: 'button',
            className: 'gt-row',
            'data-archived': archived ? 'true' : undefined,
            onClick: function () {
              onOpenGame(row.game.id, 'all')
            },
          },
          h(
            'div',
            { className: 'gt-row-main' },
            h(StatusDot, { t: t, status: gameStatus(row.game) }),
            h(Tile, { game: row.game }),
            h(
              'div',
              { className: 'gt-name-wrap' },
              h('div', { className: 'gt-name' }, row.game.name, h(DuplicateTag, { t: t, duplicate: duplicates.get(row.game.id) })),
              h(Badges, { platformIds: enabledPlatforms(row.game) })
            ),
            h(HintStrip, {
              t: t,
              game: row.game,
              today: row.today,
              total: row.total,
              days: playedDaysFor(row.game.id),
              lastPlayed: row.recent,
            })
          ),
          h('div', { className: 'gt-num' }, h(Duration, { seconds: row.total, t: t })),
          h('div', { className: 'gt-num' }, h(Duration, { seconds: row.week, t: t })),
          h('div', { className: 'gt-num' }, formatRelative(row.recent, t, NOW))
        )
      }

      const grandTotal = rows.reduce(function (sum, row) {
        return sum + row.total
      }, 0) + archivedTotal

      return h(
        DropSurface,
        { t: t, className: 'gt-root', touch: touch },
        h(
          'div',
          { className: 'gt-toolbar' },
          h('input', {
            className: 'gt-search',
            type: 'search',
            placeholder: t('search'),
            value: query,
            onChange: function (event) {
              setQuery(event.target.value)
            },
          }),
          h(Dropdown, {
            value: sort,
            minWidth: 96,
            options: [
              { value: 'total', label: t('sort.total') },
              { value: 'week', label: t('sort.week') },
              { value: 'recent', label: t('sort.recent') },
              { value: 'name', label: t('sort.name') },
            ],
            onChange: function (value) {
              setSort(value)
            },
          })
        ),
        h(
          'div',
          { className: 'gt-summary-line' },
          h(
            'div',
            { className: 'gt-muted' },
            t('all.summary')
              .replace('{n}', String(rows.length + archivedRows.length))
              .replace('{total}', formatDuration(grandTotal, t))
          ),
          uninstalled.length > 0
            ? h(
                'button',
                { type: 'button', className: 'gt-link', onClick: archiveUninstalled },
                t('all.archive.uninstalled').replace('{n}', String(uninstalled.length))
              )
            : null
        ),
        rows.length === 0
          ? archivedRows.length === 0
            ? h('div', { className: 'gt-empty' }, h('div', { className: 'gt-empty-title' }, t('all.empty')))
            : null
          : h(
              'div',
              { className: 'gt-list-card' },
              h(
                'div',
                { className: 'gt-grid-head' },
                h('div', null, t('all.col.game')),
                h('div', { className: 'gt-num' }, t('all.col.total')),
                h('div', { className: 'gt-num' }, t('all.col.week')),
                h('div', { className: 'gt-num' }, t('all.col.recent'))
              ),
              rows.map(function (row) {
                return gameRow(row, false)
              })
            ),
        archivedRows.length > 0
          ? h(
              'div',
              { className: 'gt-archived' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'gt-collapse',
                  'aria-expanded': showArchived ? 'true' : 'false',
                  onClick: function () {
                    setShowArchived(!showArchived)
                  },
                },
                h('span', { className: 'gt-card-title' }, t('archived.title')),
                h(
                  'span',
                  { className: 'gt-muted' },
                  t('all.archived')
                    .replace('{n}', String(archivedRows.length))
                    .replace('{total}', formatDuration(archivedTotal, t))
                ),
                h('span', { className: 'gt-collapse-caret', 'data-open': String(showArchived) }, '▾')
              ),
              showArchived
                ? h(
                    'div',
                    { className: 'gt-list', style: { marginTop: 8 } },
                    archivedRows.map(function (row) {
                      return gameRow(row, true)
                    })
                  )
                : null
            )
          : null,
        h(
          'div',
          { className: 'gt-analysis' },
          h(
            'div',
            { className: 'gt-range' },
            h('div', { className: 'gt-muted' }, t('all.analysis')),
            h(
              'div',
              { className: 'gt-seg' },
              ['day', 'last7', 'last30', 'all'].map(function (key) {
                return h(
                  'button',
                  {
                    key: key,
                    type: 'button',
                    className: 'gt-seg-btn',
                    'data-active': range === key,
                    onClick: function () {
                      pickRange(key)
                    },
                  },
                  t('range.' + key)
                )
              })
            )
          ),
          ALL_SECTIONS.map(function (section) {
            return h(section.Component, {
              key: section.id,
              t: t,
              range: range,
              anchor: currentAnchor,
              grain: grain,
              onPan: function (delta) {
                setAnchor(panAnchor(range, currentAnchor, delta, grain))
              },
              onZoom: zoomBy,
              onReset: function () {
                setAnchor(null)
                setZoom((GRAIN_LEVELS[range] || GRAIN_LEVELS.day).base)
              },
            })
          })
        )
      )
    }

    /* ------------------------------------------------------------------ *
     * Chart
     * ------------------------------------------------------------------ */

    const AXIS_STEPS = [
      300, 600, 900, 1800, 3600, 7200, 10800, 14400, 21600, 28800, 43200, 86400, 172800, 259200, 432000, 604800,
    ]

    /** Short scale label: "30分" / "2时" in zh, "30m" / "2h" in en. */
    function axisLabel(seconds, t) {
      if (seconds <= 0) return '0'
      if (seconds < 3600) return Math.round(seconds / 60) + t('minute')
      return Math.round(seconds / 3600) + t('hour')
    }

    /** The average marker keeps its minutes: "1时12分", still narrower than a tick. */
    function averageLabel(seconds, t) {
      const minutes = Math.max(1, Math.round(seconds / 60))
      if (minutes < 60) return minutes + t('minute')
      const hours = Math.floor(minutes / 60)
      const rest = minutes % 60
      // Past ten hours the minutes would push the label into the plot, so the
      // marker falls back to one decimal hour ("58.2时").
      if (hours >= 10) return (Math.round((minutes / 60) * 10) / 10).toString().replace('.0', '') + t('hour')
      return rest === 0 ? hours + t('hour') : hours + t('hour') + rest + t('minute')
    }

    // Hovering a stacked bar explains the whole bar: total on top, then one row
    // per colour block. Long lists fold into a single "more" row.
    const TIP_ROWS = 8

    function tipSegments(parts) {
      const list = (Array.isArray(parts) ? parts : [])
        .filter(function (part) {
          return part && part.seconds > 0
        })
        .sort(function (left, right) {
          return right.seconds - left.seconds
        })
      const kept = list.slice(0, TIP_ROWS)
      const rest = list.slice(TIP_ROWS)
      const folded = rest.reduce(function (sum, part) {
        return sum + part.seconds
      }, 0)
      return { kept: kept, folded: folded, foldedCount: rest.length }
    }

    // Monotone cubic interpolation (Fritsch–Carlson). The curve is smooth but
    // never overshoots the data, so a dip cannot draw a value below zero.
    function smoothPath(points) {
      const list = Array.isArray(points) ? points : []
      const count = list.length
      if (count < 2) return ''
      const dx = []
      const slope = []
      for (let index = 0; index < count - 1; index += 1) {
        dx[index] = list[index + 1].x - list[index].x
        const dy = list[index + 1].y - list[index].y
        slope[index] = dx[index] === 0 ? 0 : dy / dx[index]
      }
      const tangent = []
      tangent[0] = slope[0] || 0
      tangent[count - 1] = slope[count - 2] || 0
      for (let index = 1; index < count - 1; index += 1) {
        if (slope[index - 1] * slope[index] <= 0) {
          tangent[index] = 0
        } else {
          const w1 = 2 * dx[index] + dx[index - 1]
          const w2 = dx[index] + 2 * dx[index - 1]
          tangent[index] = (w1 + w2) / (w1 / slope[index - 1] + w2 / slope[index])
        }
      }
      let d = 'M ' + list[0].x + ' ' + list[0].y
      for (let index = 0; index < count - 1; index += 1) {
        const h = dx[index] / 3
        const c1x = list[index].x + h
        const c1y = list[index].y + tangent[index] * h
        const c2x = list[index + 1].x - h
        const c2y = list[index + 1].y - tangent[index + 1] * h
        d += ' C ' + c1x + ' ' + c1y + ' ' + c2x + ' ' + c2y + ' ' + list[index + 1].x + ' ' + list[index + 1].y
      }
      return d
    }

    /** A bar with rounded top corners: the only shape bars use now. */
    function barTopPath(x, y, width, height, radius) {
      const w = Math.max(0, Number(width) || 0)
      const boxH = Math.max(0, Number(height) || 0)
      if (w <= 0 || boxH <= 0) return ''
      const r = Math.max(0, Math.min(Number(radius) || 0, w / 2, boxH))
      const bottom = y + boxH
      if (r === 0) return 'M ' + x + ' ' + y + ' H ' + (x + w) + ' V ' + bottom + ' H ' + x + ' Z'
      return (
        'M ' + x + ' ' + bottom +
        ' V ' + (y + r) +
        ' Q ' + x + ' ' + y + ' ' + (x + r) + ' ' + y +
        ' H ' + (x + w - r) +
        ' Q ' + (x + w) + ' ' + y + ' ' + (x + w) + ' ' + (y + r) +
        ' V ' + bottom +
        ' Z'
      )
    }

    /**
     * Charts get a slightly brighter stroke than the stored brand colour, so a
     * 1.7 px line still reads on a dark panel without changing the data itself.
     */
    function chartColor(value) {
      const raw = String(value || '').trim()
      const short = /^#([0-9a-f]{3})$/i.exec(raw)
      const full = short
        ? '#' + short[1].split('').map(function (char) { return char + char }).join('')
        : raw
      const match = /^#([0-9a-f]{6})$/i.exec(full)
      if (!match) return raw || 'currentColor'
      const num = parseInt(match[1], 16)
      const lift = function (channel) {
        return Math.round(channel + (255 - channel) * 0.14)
      }
      const hex = function (channel) {
        return channel.toString(16).padStart(2, '0')
      }
      return '#' + hex(lift((num >> 16) & 255)) + hex(lift((num >> 8) & 255)) + hex(lift(num & 255))
    }

    let chartSeq = 0

    function Chart({ t, points, chartType, selectedKey, onSelect, color, onPan, onZoom, unit, detailOnClick }) {
      const [tip, setTip] = React.useState(null)
      const [detail, setDetail] = React.useState(null)
      const wrapRef = React.useRef(null)

      // A click anywhere outside the chart closes the detail card.
      React.useEffect(function () {
        if (!detail) return undefined
        if (typeof document === 'undefined' || !document.addEventListener) return undefined
        const onDown = function (event) {
          const node = wrapRef.current
          if (node && event.target && node.contains(event.target)) return
          setDetail(null)
        }
        document.addEventListener('mousedown', onDown)
        return function () {
          document.removeEventListener('mousedown', onDown)
        }
      }, [detail])
      const [hoverIndex, setHoverIndex] = React.useState(-1)

      const tipFor = function (point, x, y) {
        const split = tipSegments(point.parts)
        const rows = split.kept.map(function (part) {
          return {
            key: part.id,
            color: part.color || sliceColor(part.id),
            name: part.name || sliceName(part.id),
            seconds: part.seconds,
          }
        })
        if (split.foldedCount > 0) {
          rows.push({
            key: 'folded',
            color: OTHER_COLOR,
            name: t('chart.more').replace('{n}', String(split.foldedCount)),
            seconds: split.folded,
          })
        }
        return { x: x, y: y, label: point.label, total: point.seconds, rows: rows }
      }
      const drag = React.useRef(null)
      const svgRef = React.useRef(null)
      const zoomLock = React.useRef(0)
      const pannable = typeof onPan === 'function'
      const zoomable = typeof onZoom === 'function'

      // Wheel zooms one level per notch. The native listener is bound
      // explicitly so `preventDefault` can stop the page from scrolling.
      React.useEffect(function () {
        const node = svgRef.current
        if (!node || !zoomable) return undefined
        const listener = function (event) {
          event.preventDefault()
          const now = Date.now()
          if (now - zoomLock.current < 180) return
          zoomLock.current = now
          onZoom(event.deltaY < 0 ? -1 : 1)
        }
        node.addEventListener('wheel', listener, { passive: false })
        return function () {
          node.removeEventListener('wheel', listener)
        }
      }, [zoomable, onZoom])
      // Dragging is a paging gesture: every 32 css px shifts the window by one
      // step (a day, a week or a month — the caller decides what a step is).
      const beginDrag = function (event) {
        if (!pannable) return
        drag.current = { x: event.clientX, moved: false, steps: 0, active: true, suppress: false }
        if (event.preventDefault) event.preventDefault()
      }
      const moveDrag = function (event) {
        if (!drag.current || !drag.current.active) return
        const dx = event.clientX - drag.current.x
        if (Math.abs(dx) > 3) drag.current.moved = true
        // One step is one x tick: the drag distance is measured against a bar,
        // so the interval follows whatever the chart shows (hour / day / month).
        const rect = event.currentTarget && event.currentTarget.getBoundingClientRect
          ? event.currentTarget.getBoundingClientRect()
          : null
        const chartWidth = rect && rect.width > 0 ? rect.width : 480
        const slot = chartWidth / Math.max(points.length, 1)
        const steps = Math.trunc(-dx / Math.max(slot, 8))
        if (steps !== drag.current.steps) {
          const delta = steps - drag.current.steps
          drag.current.steps = steps
          onPan(delta)
        }
      }
      const endDrag = function () {
        if (!drag.current) return
        drag.current.active = false
        drag.current.suppress = drag.current.moved || drag.current.steps !== 0
      }
      const clicked = function (key) {
        if (drag.current && drag.current.suppress) {
          drag.current.suppress = false
          return
        }
        onSelect(key)
      }
      const stroke = color || 'currentColor'
      const width = 640
      const height = 176
      const pad = { top: 12, right: 6, bottom: 22, left: 34 }
      const plotW = width - pad.left - pad.right
      const plotH = height - pad.top - pad.bottom

      // Even ticks on a fixed ladder: the labels are always round durations and
      // the spacing between them never varies from one render to the next.
      const peak = points.reduce(function (top, point) {
        return Math.max(top, point.seconds)
      }, 0)
      const step = AXIS_STEPS.find(function (value) {
        return value >= peak / 3
      }) || AXIS_STEPS[AXIS_STEPS.length - 1]
      const tickCount = peak > 0 ? Math.ceil(peak / step) : 0
      const max = tickCount > 0 ? step * tickCount : step
      const ticks = []
      for (let i = 0; i <= tickCount; i++) ticks.push(i * step)
      const yOf = function (seconds) {
        return pad.top + plotH - (seconds / max) * plotH
      }

      const slot = plotW / Math.max(points.length, 1)
      const barW = Math.max(1, Math.min(30, slot * 0.72))

      // Stack order is each slice's total across the range, so a slice keeps
      // the same layer from bar to bar instead of hopping around.
      const totals = new Map()
      const meta = new Map()
      points.forEach(function (point) {
        const parts = point.parts || []
        parts.forEach(function (part) {
          totals.set(part.id, (totals.get(part.id) || 0) + part.seconds)
          meta.set(part.id, part)
        })
      })
      const order = Array.from(totals.keys()).sort(function (a, b) {
        return (totals.get(b) || 0) - (totals.get(a) || 0)
      })
      const sliceName = function (id) {
        const part = meta.get(id)
        return part && part.name ? part.name : id
      }
      const sliceColor = function (id) {
        const part = meta.get(id)
        return (part && part.color) || stroke
      }

      const cx = function (index) {
        return pad.left + slot * index + slot / 2
      }
      const cy = function (point) {
        return yOf(point.seconds)
      }

      const empty = points.every(function (p) {
        return p.seconds <= 0
      })

      // The average is per *active* bucket: a day (or hour) with no play is not
      // a zero-value data point, so it must not drag the line down. Points that
      // exist but are empty are skipped; the denominator is the count of the
      // rest. Same rule as averagePerDay() — see the helpers at the top.
      const mean = activeMean(points)

      const avgY = yOf(mean)
      // The average gets its own tick. It may take over a ladder label when the
      // two would coincide, and stays out of the gutter when it would crowd one;
      // the zero line is never taken over.
      const nearTick =
        mean > 0
          ? ticks.find(function (value) {
              return value !== 0 && Math.abs(yOf(value) - avgY) < 3
            })
          : undefined
      const closestTick = Math.min.apply(
        null,
        ticks.map(function (value) {
          return Math.abs(yOf(value) - avgY)
        })
      )
      const avgLabelFits = mean > 0 && Math.abs(avgY - (pad.top + plotH)) >= 9 && (nearTick !== undefined || closestTick >= 9)
      const averageMarks =
        mean > 0
          ? [
              h('line', {
                key: 'avg-line',
                className: 'gt-chart-avg',
                x1: pad.left,
                y1: avgY,
                x2: width - pad.right,
                y2: avgY,
              }),
              // The solid stub is the average's own tick on the y axis.
              h('line', {
                key: 'avg-tick',
                className: 'gt-chart-avg-tick',
                x1: pad.left - 5,
                y1: avgY,
                x2: pad.left,
                y2: avgY,
              }),
              avgLabelFits
                ? h(
                    'text',
                    {
                      key: 'avg-value',
                      className: 'gt-chart-avg-y',
                      x: pad.left - 6,
                      y: avgY,
                      textAnchor: 'end',
                      dominantBaseline: 'central',
                    },
                    averageLabel(mean, t)
                  )
                : null,
              h(
                'text',
                {
                  key: 'avg-tag',
                  className: 'gt-chart-avg-tag',
                  x: width - pad.right - 2,
                  y: avgY - 4,
                  textAnchor: 'end',
                },
                t('chart.avg')
              ),
            ].filter(Boolean)
          : []

      const gridMarks = ticks.map(function (value) {
        if (value === 0) return null
        const y = yOf(value)
        return h('line', {
          key: 'grid-' + value,
          className: 'gt-chart-grid',
          x1: pad.left,
          y1: y,
          x2: width - pad.right,
          y2: y,
        })
      })

      // A ladder label never moves; the average takes over only the one it
      // would sit exactly on, and the zero line always stays.
      const yLabels = ticks
        .filter(function (value) {
          if (!avgLabelFits) return true
          if (value === 0) return true
          return nearTick === undefined || value !== nearTick
        })
        .map(function (value) {
          return h(
            'text',
            {
              key: 'y-' + value,
              className: 'gt-chart-y',
              x: pad.left - 6,
              y: yOf(value),
              textAnchor: 'end',
              dominantBaseline: 'central',
            },
            axisLabel(value, t)
          )
        })

      const barRadius = 2.5
      const bars = points.map(function (point, index) {
        const x = pad.left + slot * index + (slot - barW) / 2
        const barH = (point.seconds / max) * plotH
        const parts = (point.parts || []).filter(function (part) {
          return part.seconds > 0
        })
        const sum = parts.reduce(function (total, part) {
          return total + part.seconds
        }, 0)
        const stacked = order
          .map(function (id) {
            return parts.find(function (part) {
              return part.id === id
            })
          })
          .filter(Boolean)

        if (stacked.length === 0) {
          const plainH = Math.max(point.seconds > 0 ? 2 : 0, barH)
          if (plainH <= 0) return null
          const plainY = pad.top + plotH - plainH
          return h('path', {
            key: point.key,
            className: 'gt-bar-rect',
            d: barTopPath(x, plainY, barW, plainH, barRadius),
            fill: stroke,
            opacity: selectedKey === point.key ? 0.95 : point.seconds > 0 ? 0.62 : 0.14,
          })
        }

        if (barH <= 0) return null
        let acc = 0
        return stacked.map(function (part, partIndex) {
          const height = barH * (part.seconds / sum)
          const y = pad.top + plotH - acc - height
          const fill = part.color || sliceColor(part.id)
          acc += height
          // Only the cap is rounded: rounding every slice turns a stack of thin
          // segments into a column of pills.
          const radius = partIndex === stacked.length - 1 ? barRadius : 0
          return h('path', {
            key: point.key + '-' + part.id,
            className: 'gt-bar-rect',
            d: barTopPath(x, y, barW, height, radius),
            fill: fill,
            opacity: selectedKey === point.key ? 1 : 0.9,
          })
        })
      })

      const pointXY = points.map(function (point, index) {
        return { x: cx(index), y: cy(point) }
      })
      const baseY = pad.top + plotH
      const lineD = smoothPath(pointXY)
      const areaD =
        pointXY.length > 1
          ? 'M ' + pointXY[0].x + ' ' + baseY +
            ' L ' + pointXY[0].x + ' ' + pointXY[0].y +
            lineD.slice(lineD.indexOf(' C')) +
            ' L ' + pointXY[pointXY.length - 1].x + ' ' + baseY + ' Z'
          : ''
      const gradientId = 'gt-area-' + String((chartSeq += 1))
      const lineColor = chartColor(stroke)
      const showDots = points.length <= 40
      const hoverPoint = hoverIndex >= 0 && hoverIndex < points.length ? points[hoverIndex] : null

      /** Which column the pointer is over, in viewBox units. */
      const indexAt = function (event) {
        const node = event.currentTarget && event.currentTarget.ownerSVGElement
        if (!node || typeof node.getBoundingClientRect !== 'function') return -1
        const rect = node.getBoundingClientRect()
        if (!rect.width) return -1
        const xView = ((event.clientX - rect.left) / rect.width) * width
        return Math.max(0, Math.min(points.length - 1, Math.floor((xView - pad.left) / slot)))
      }

      // Line charts stack the same slices as the bars: one filled band per
      // slice, in the same order and colours, with a thin total line on top.
      let lowerValues = points.map(function () {
        return 0
      })
      const bands = order.map(function (id) {
        const upperValues = lowerValues.map(function (value, index) {
          const part = (points[index].parts || []).find(function (item) {
            return item.id === id
          })
          return value + (part ? part.seconds : 0)
        })
        const band = { id: id, lower: lowerValues.slice(), upper: upperValues.slice() }
        lowerValues = upperValues
        return band
      }).filter(function (band) {
        return band.upper.some(function (value, index) {
          return value > band.lower[index]
        })
      })

      const bandPath = function (lower, upper) {
        const up = points.map(function (point, index) {
          return { x: cx(index), y: yOf(upper[index]) }
        })
        const low = points.map(function (point, index) {
          return { x: cx(index), y: yOf(lower[index]) }
        })
        const upD = smoothPath(up)
        const lowReversed = low.slice().reverse()
        const lowD = smoothPath(lowReversed)
        if (!upD || !lowD) return ''
        return upD + ' L ' + lowReversed[0].x + ' ' + lowReversed[0].y + lowD.slice(lowD.indexOf(' C')) + ' Z'
      }

      const areaMarks = bands.length > 1
        ? bands.map(function (band) {
            const d = bandPath(band.lower, band.upper)
            if (!d) return null
            return h('path', {
              key: 'band-' + band.id,
              className: 'gt-area-band',
              d: d,
              fill: sliceColor(band.id),
              opacity: 0.82,
            })
          }).filter(Boolean)
        : [
            h(
              'defs',
              { key: 'defs' },
              h(
                'linearGradient',
                { id: gradientId, x1: 0, y1: 0, x2: 0, y2: 1 },
                h('stop', { offset: '0%', stopColor: stroke, stopOpacity: 0.24 }),
                h('stop', { offset: '100%', stopColor: stroke, stopOpacity: 0 })
              )
            ),
            areaD ? h('path', { key: 'area', d: areaD, fill: 'url(#' + gradientId + ')' }) : null,
          ].filter(Boolean)

      const lineMarks = [
        h('path', {
          key: 'line-under',
          d: lineD,
          fill: 'none',
          stroke: stroke,
          strokeWidth: 3,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          opacity: bands.length > 1 ? 0.1 : 0.14,
        }),
        h('path', {
          key: 'line',
          className: 'gt-chart-line',
          d: lineD,
          fill: 'none',
          stroke: lineColor,
          strokeWidth: 1.2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      ]

      const dotMarks = showDots
        ? pointXY.map(function (xy, index) {
            const point = points[index]
            const active = index === hoverIndex || selectedKey === point.key
            const dim = point.seconds <= 0
            return h(
              'g',
              { key: 'dot-' + point.key },
              h('circle', {
                cx: xy.x,
                cy: xy.y,
                r: active ? 4.6 : 3,
                fill: stroke,
                opacity: dim ? 0.08 : active ? 0.24 : 0.14,
              }),
              h('circle', {
                cx: xy.x,
                cy: xy.y,
                r: active ? 2.4 : 1.7,
                fill: lineColor,
                opacity: dim ? 0.25 : 1,
              })
            )
          })
        : []

      const marks =
        chartType === 'line' ? [].concat(areaMarks, lineMarks, dotMarks) : bars

      const guide = hoverPoint
        ? h('line', {
            key: 'guide',
            className: 'gt-chart-guide',
            x1: cx(hoverIndex),
            y1: pad.top,
            x2: cx(hoverIndex),
            y2: baseY,
          })
        : null

      const hitArea = h('rect', {
        key: 'hit',
        className: 'gt-chart-hit',
        x: pad.left,
        y: pad.top,
        width: Math.max(1, plotW),
        height: Math.max(1, plotH),
        fill: 'transparent',
        onMouseMove: function (event) {
          const index = indexAt(event)
          if (index < 0) return
          if (index !== hoverIndex) setHoverIndex(index)
          const point = points[index]
          const tipX = cx(index)
          const tipY = Math.min(baseY - 2, Math.max(pad.top + 2, cy(point)))
          if (detailOnClick) {
            setTip({ x: tipX, y: tipY, chip: compactDuration(point.seconds, t) })
          } else {
            setTip(tipFor(point, tipX, tipY))
          }
        },
        onMouseLeave: function () {
          setHoverIndex(-1)
          setTip(null)
        },
        onClick: function (event) {
          const index = indexAt(event)
          if (index < 0) return
          const point = points[index]
          clicked(point.key)
          if (!detailOnClick) return
          const tipX = cx(index)
          const tipY = Math.min(baseY - 2, Math.max(pad.top + 2, cy(point)))
          const next = Object.assign(tipFor(point, tipX, tipY), { key: point.key })
          setDetail(detail && detail.key === point.key ? null : next)
        },
      })

      // Dense grains (10-minute ticks, daily ticks over a year) can't fit every
      // label, so the stride grows until neighbouring labels no longer touch.
      const textWidth = function (text) {
        let total = 0
        for (const ch of text) total += ch === ':' ? 2.4 : /[\u4e00-\u9fff]/.test(ch) ? 8 : 4.6
        return total
      }
      const widest = points.reduce(function (max, point) {
        return Math.max(max, textWidth(point.label))
      }, 0)
      const fits = Math.max(2, Math.floor(plotW / Math.max(widest + 2, 8)))
      const labelStep = Math.max(1, Math.ceil(points.length / fits))
      const labelIndexes = {}
      for (let index = 0; index < points.length; index += labelStep) labelIndexes[index] = true
      const lastIndex = points.length - 1
      if (!labelIndexes[lastIndex] && (lastIndex % labelStep) * slot >= widest + 2) labelIndexes[lastIndex] = true
      // The scale note sits at the far left, so the first tick text steps aside
      // when it would run into it.
      const unitText = unit ? '(' + unit + ')' : ''
      if (unitText && labelIndexes[0] && cx(0) - widest / 2 < textWidth(unitText) + 6) delete labelIndexes[0]
      const labels = points.map(function (point, index) {
        if (!labelIndexes[index]) return null
        return h(
          'text',
          { key: 'label-' + point.key, className: 'gt-chart-label', x: cx(index), y: height - 6, textAnchor: 'middle' },
          point.label
        )
      })

      return h(
        'div',
        { className: 'gt-chart-wrap', ref: wrapRef },
        h(
          'svg',
          {
            className: 'gt-chart',
            viewBox: '0 0 ' + width + ' ' + height,
            role: 'img',
            ref: svgRef,
            'data-pan': pannable ? 'true' : undefined,
            'data-zoom': zoomable ? 'true' : undefined,
            onMouseLeave: function () {
              setTip(null)
            },
            onPointerDown: beginDrag,
            onPointerMove: moveDrag,
            onPointerUp: endDrag,
            onPointerCancel: endDrag,
          },
          h('line', {
            className: 'gt-chart-axis',
            x1: pad.left,
            y1: pad.top + plotH,
            x2: width - pad.right,
            y2: pad.top + plotH,
          }),
          gridMarks,
          averageMarks,
          marks,
          guide,
          yLabels,
          labels,
          unitText
            ? h(
                'text',
                { className: 'gt-chart-unit', x: 2, y: height - 6, textAnchor: 'start' },
                unitText
              )
            : null,
          hitArea
        ),
        detailOnClick && tip
          ? h(
              'div',
              {
                className: 'gt-chart-chip',
                'data-side': tip.y < 46 ? 'below' : 'above',
                style: {
                  left: (Math.min(Math.max(tip.x, 12), width - 12) / width) * 100 + '%',
                  top: (tip.y / height) * 100 + '%',
                },
              },
              tip.chip
            )
          : null,
        (detailOnClick ? detail : tip)
          ? h(
              'div',
              {
                className: 'gt-chart-tip',
                'data-side': (detailOnClick ? detail : tip).y < 46 ? 'below' : 'above',
                style: {
                  left: (Math.min(Math.max((detailOnClick ? detail : tip).x, 34), width - 34) / width) * 100 + '%',
                  top: ((detailOnClick ? detail : tip).y / height) * 100 + '%',
                },
              },
              h(
                'div',
                { className: 'gt-tip-head' },
                h('b', null, formatDuration((detailOnClick ? detail : tip).total, t)),
                h('span', null, (detailOnClick ? detail : tip).label)
              ),
              ((detailOnClick ? detail : tip).rows || []).map(function (row) {
                return h(
                  'div',
                  { key: 'tip-' + row.key, className: 'gt-tip-row' },
                  h('i', { style: { background: row.color } }),
                  h('span', { className: 'gt-tip-name' }, row.name),
                  h('span', { className: 'gt-tip-dur' }, formatDuration(row.seconds, t))
                )
              })
            )
          : null,
        empty
          ? h(
              'div',
              {
                style: {
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  opacity: 0.45,
                  pointerEvents: 'none',
                },
              },
              t('chart.empty')
            )
          : null
      )
    }

    /* ------------------------------------------------------------------ *
     * Shared cards — detail and overview render the same pieces
     * ------------------------------------------------------------------ */

    /** Small localStorage wrapper: preferences survive a reload, failures do not hurt. */
    function storedPref(key, fallback) {
      try {
        if (typeof localStorage === 'undefined') return fallback
        const value = localStorage.getItem(key)
        return value === null || value === '' ? fallback : value
      } catch (error) {
        return fallback
      }
    }

    function setStoredPref(key, value) {
      try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(key, value)
      } catch (error) {
        /* storage blocked: the choice lasts for this session only */
      }
    }

    function ChartCard({ t, title, unit, note, points, color, selectedKey, onSelect, onPan, onZoom, onReset, defaultType, prefKey, detailOnClick, chartType: chartTypeProp, onChartType }) {
      const [chartTypeState, setChartType] = React.useState(prefKey ? storedPref(prefKey, defaultType || 'bar') : defaultType || 'bar')
      const chartType = chartTypeProp || chartTypeState
      const template = t('chart.unit')
      const heading = unit
        ? template.indexOf('{title}') >= 0
          ? template.replace('{title}', title).replace('{unit}', unit)
          : title + ' (' + unit + ')'
        : title
      return h(
        'div',
        { className: 'gt-panel-card' },
        h(
          'div',
          { className: 'gt-card-head' },
          h(
            'div',
            { className: 'gt-card-head-title' },
            h('div', { className: 'gt-card-title' }, heading),
            onReset
              ? h(
                  'button',
                  {
                    type: 'button',
                    className: 'gt-icon-btn',
                    title: t('chart.reset'),
                    'aria-label': t('chart.reset'),
                    onClick: onReset,
                  },
                  h(ResetIcon, { size: 13 })
                )
              : null,
            note ? h('div', { className: 'gt-muted' }, note) : null
          ),
          h(
            'div',
            { className: 'gt-seg' },
            ['bar', 'line'].map(function (key) {
              return h(
                'button',
                {
                  key: key,
                  type: 'button',
                  className: 'gt-seg-btn',
                  'data-active': chartType === key,
                  onClick: function () {
                    setChartType(key)
                    if (onChartType) onChartType(key)
                    if (prefKey) setStoredPref(prefKey, key)
                  },
                },
                t('chart.' + key)
              )
            })
          )
        ),
        h(Chart, {
          t: t,
          points: points,
          chartType: chartType,
          selectedKey: selectedKey,
          onSelect: onSelect,
          color: color,
          onPan: onPan,
          onZoom: onZoom,
          detailOnClick: detailOnClick,
          unit: unit,
        })
      )
    }

    function ShareBar({ t, items, empty }) {
      const total = items.reduce(function (sum, item) {
        return sum + item.seconds
      }, 0)
      return h(
        'div',
        null,
        h(
          'div',
          { className: 'gt-bar' },
          items.map(function (item) {
            return h('div', {
              key: item.id,
              className: 'gt-bar-seg',
              style: { width: (total > 0 ? (item.seconds / total) * 100 : 0) + '%', background: item.color },
              title: item.name,
            })
          })
        ),
        h(
          'div',
          { className: 'gt-legend' },
          items.map(function (item) {
            return h(
              'span',
              { key: 'legend-' + item.id, className: 'gt-legend-item' },
              h('span', { className: 'gt-legend-dot', style: { background: item.color } }),
              item.name,
              h('span', { style: { opacity: 0.55 } }, formatDuration(item.seconds, t))
            )
          }),
          items.length === 0 ? h('span', { className: 'gt-muted' }, empty) : null
        )
      )
    }

    function ShareCard({ t, title, note, items }) {
      return h(
        'div',
        { className: 'gt-panel-card' },
        h(
          'div',
          { className: 'gt-card-head' },
          h('div', { className: 'gt-card-title' }, title),
          note ? h('div', { className: 'gt-muted' }, note) : null
        ),
        h(ShareBar, { t: t, items: items, empty: t('list.empty') })
      )
    }

    function SessionsCard({ t, sessions, open: openByDefault }) {
      const [open, setOpen] = React.useState(openByDefault === true)
      const sorted = sessions.slice().sort(function (a, b) {
        return b.start - a.start
      })
      const shown = sorted.slice(0, 200)
      const total = sorted.reduce(function (sum, session) {
        return sum + (session.end - session.start) / 1000
      }, 0)
      return h(
        'div',
        { className: 'gt-panel-card' },
        h(
          'button',
          {
            type: 'button',
            className: 'gt-collapse',
            'aria-expanded': open ? 'true' : 'false',
            onClick: function () {
              setOpen(!open)
            },
          },
          h('span', { className: 'gt-card-title' }, t('all.sessions')),
          h(
            'span',
            { className: 'gt-muted' },
            t('all.sessions.summary').replace('{n}', String(sorted.length)).replace('{total}', formatDuration(total, t))
          ),
          h('span', { className: 'gt-collapse-caret', 'data-open': String(open) }, '▾')
        ),
        open
          ? shown.length === 0
            ? h('div', { className: 'gt-muted' }, t('list.empty'))
            : h(
                'div',
                { className: 'gt-list' },
                shown.map(function (session) {
                  const game = GAMES.find(function (item) {
                    return item.id === session.gameId
                  })
                  return h(
                    'div',
                    { key: session.id, className: 'gt-list-row' },
                    h(
                      'div',
                      null,
                      h(
                        'span',
                        { className: 'gt-list-time' },
                        shortDate(new Date(session.start)) + ' ' + clockOf(session.start) + ' – ' + clockOf(session.end)
                      ),
                      h('span', { className: 'gt-list-sub' }, (game ? game.name : session.gameId) + ' · ' + sessionSub(session))
                    ),
                    h(
                      'div',
                      { className: 'gt-list-dur' },
                      h(Duration, { seconds: (session.end - session.start) / 1000, t: t })
                    )
                  )
                })
              )
          : null
      )
    }

    /* ------------------------------------------------------------------ *
     * Overview sections — add, remove or reorder an entry in ALL_SECTIONS
     * ------------------------------------------------------------------ */

    function AllShareSection({ t, range, anchor, grain }) {
      const platforms = bucketItems(totalsByRange(range, anchor, BY_PLATFORM, grain), t)
      const games = bucketItems(totalsByRange(range, anchor, BY_GAME, grain), t)
      return h(
        'div',
        { className: 'gt-panel-card' },
        h('div', { className: 'gt-card-head' }, h('div', { className: 'gt-card-title' }, t('detail.platforms'))),
        h(ShareBar, { t: t, items: platforms, empty: t('list.empty') }),
        h('div', { className: 'gt-share-divider' }),
        h('div', { className: 'gt-card-head' }, h('div', { className: 'gt-card-title' }, t('all.share.games'))),
        h(ShareBar, { t: t, items: games, empty: t('list.empty') })
      )
    }

    function AllTrendSection({ t, range, anchor, grain, onPan, onZoom, onReset }) {
      const [selected, setSelected] = React.useState(null)
      const points = bucketSeries(seriesFor(null, range, anchor, BY_GAME, grain), t)
      return h(ChartCard, {
        t: t,
        title: t('detail.trend'),
        unit: t('unit.' + grain.key),
        note: rangeLabelOf(range, anchor, grain),
        points: points,
        selectedKey: selected,
        onPan: onPan,
        onZoom: onZoom,
        onReset: onReset,
        onSelect: function (key) {
          setSelected(selected === key ? null : key)
        },
      })
    }

    function AllSessionsSection({ t, range, anchor, grain }) {
      const bounds = windowBounds(range, anchor, grain)
      const list = sessionsInRange(null, bounds.from, bounds.to, null)
      return h(SessionsCard, { t: t, sessions: list })
    }

    const ALL_SECTIONS = [
      { id: 'share', Component: AllShareSection },
      { id: 'trend', Component: AllTrendSection },
      { id: 'sessions', Component: AllSessionsSection },
    ]

    /* ------------------------------------------------------------------ *
     * Game detail
     * ------------------------------------------------------------------ */

    function DetailView({ t, game, initialRange, onBack, onSettings, touch }) {
      const [range, setRange] = React.useState(initialRange)
      // `null` = follow the current period (rolls over at midnight by itself).
      const [anchor, setAnchor] = React.useState(null)
      const currentAnchor = anchor || defaultAnchor(range)
      const [zoom, setZoom] = React.useState((GRAIN_LEVELS[initialRange] || GRAIN_LEVELS.day).base)
      const [selected, setSelected] = React.useState(null)

      const levelConfig = GRAIN_LEVELS[range] || GRAIN_LEVELS.day
      const zoomIndex = Math.min(Math.max(zoom, 0), levelConfig.levels.length - 1)
      const grain = levelConfig.levels[zoomIndex]
      const zoomBy = function (delta) {
        setZoom(Math.min(Math.max(zoomIndex + delta, 0), levelConfig.levels.length - 1))
      }

      const bounds = windowBounds(range, currentAnchor, grain)

      // Panning a range back past the loaded window fetches just that slice.
      const windowFrom = bounds.from.getTime()
      React.useEffect(function () {
        ensureHistory(windowFrom)
      }, [windowFrom, HISTORY_FROM, FIRST_START])

      const rangeSessions = sessionsInRange(game.id, bounds.from, bounds.to, allowedPlatforms(game))
      const windowTotal = secondsInRange(rangeSessions, bounds.from, bounds.to)
      // "全部" must agree with 总计 and with the row hints, both of which are
      // all-time; the client only holds the lazy-load window of detail.
      const allRange = range === 'all'
      const rangeTotal = allRange ? totalsFor(game.id, 'all', NOW) : windowTotal
      // Days played inside the selected range — the same denominator as 平均每天.
      const rangeDays = allRange
        ? playedDaysFor(game.id)
        : activeDaysOf(rangeSessions, bounds.from, bounds.to)
      const average = averagePerDay(rangeTotal, rangeDays)
      const points = seriesFor(game.id, range, currentAnchor, null, grain)
      const breakdown = platformBreakdown(game.id, range, currentAnchor, grain)
      const groupName = groupNameOf(game)
      const duplicate = duplicateMap().get(game.id)
      const totalAll = totalsFor(game.id, 'all', NOW)
      const status = gameStatus(game)
      const platformIds = enabledPlatforms(game)
      const activeEntry = ACTIVE.find(function (item) {
        return item.gameId === game.id
      })
      const activePlatform = activeEntry ? activeEntry.platformId : null

      const alignedAnchor = clampAnchor(range, currentAnchor, grain)
      const prevDisabled = panAnchor(range, alignedAnchor, -1, grain).getTime() === alignedAnchor.getTime()
      const nextDisabled = panAnchor(range, alignedAnchor, 1, grain).getTime() === alignedAnchor.getTime()

      const rows = range === 'day' ? [] : daysInRange(game.id, range, currentAnchor, grain)
      const segments = range === 'day' ? segmentsBetween(game.id, bounds.from, bounds.to) : []

      const rangeLabel = rangeLabelOf(range, currentAnchor, grain)

      const shift = function (direction) {
        setAnchor(panAnchor(range, currentAnchor, direction, grain))
        setSelected(null)
      }

      const pickRange = function (next) {
        setRange(next)
        setAnchor(null)
        setZoom((GRAIN_LEVELS[next] || GRAIN_LEVELS.day).base)
        setSelected(null)
      }

      const listTitle = range === 'day' ? t('list.segments') : range === 'all' ? t('list.months') : t('list.days')

      const mainList =
        range === 'day'
          ? segments.map(function (s) {
              return h(
                'div',
                { key: s.id, className: 'gt-list-row' },
                h(
                  'div',
                  null,
                  h('span', { className: 'gt-list-time' }, clockOf(s.start) + ' – ' + clockOf(s.end)),
                  h('span', { className: 'gt-list-sub' }, sessionSub(s))
                ),
                h('div', { className: 'gt-list-dur' }, h(Duration, { seconds: (s.end - s.start) / 1000, t: t }))
              )
            })
          : rows.map(function (row) {
              return h(
                'div',
                { key: row.key, className: 'gt-list-row', 'data-selected': selected === row.key },
                h(
                  'div',
                  null,
                  h('span', { className: 'gt-list-time' }, row.label),
                  h('span', { className: 'gt-list-sub' }, t('list.count').replace('{n}', String(row.count)))
                ),
                h('div', { className: 'gt-list-dur' }, h(Duration, { seconds: row.seconds, t: t }))
              )
            })

      let drill = null
      if (selected && range !== 'day') {
        if (selected.length === 7) {
          const monthRows = daysInRange(game.id, 'month', new Date(selected + '-01T00:00:00'))
          drill = h(
            'div',
            { className: 'gt-list', style: { marginTop: 8, borderTop: '1px solid rgba(128,128,128,.16)', paddingTop: 8 } },
            monthRows.map(function (row) {
              return h(
                'div',
                { key: 'drill-' + row.key, className: 'gt-list-row' },
                h(
                  'div',
                  null,
                  h('span', { className: 'gt-list-time' }, row.label),
                  h('span', { className: 'gt-list-sub' }, t('list.count').replace('{n}', String(row.count)))
                ),
                h('div', { className: 'gt-list-dur' }, h(Duration, { seconds: row.seconds, t: t }))
              )
            })
          )
        } else {
          const daySegments = segmentsOf(game.id, new Date(selected + 'T00:00:00'))
          drill = h(
            'div',
            { className: 'gt-list', style: { marginTop: 8, borderTop: '1px solid rgba(128,128,128,.16)', paddingTop: 8 } },
            daySegments.map(function (s) {
              return h(
                'div',
                { key: 'drill-' + s.id, className: 'gt-list-row' },
                h(
                  'div',
                  null,
                  h('span', { className: 'gt-list-time' }, clockOf(s.start) + ' – ' + clockOf(s.end)),
                  h('span', { className: 'gt-list-sub' }, sessionSub(s))
                ),
                h('div', { className: 'gt-list-dur' }, h(Duration, { seconds: (s.end - s.start) / 1000, t: t }))
              )
            })
          )
        }
      }

      return h(
        DropSurface,
        { t: t, className: 'gt-root', touch: touch },
        h(
          'div',
          { className: 'gt-detail-head' },
          h(
            'div',
            { className: 'gt-detail-id' },
            h('button', { type: 'button', className: 'gt-back icon', onClick: onBack, title: t('back'), 'aria-label': t('back') }, h(ArrowLeftIcon, { size: 14 })),
            h(IconPicker, {
              t: t,
              value: game.icon || '',
              size: 38,
              bare: true,
              fallback: h(Tile, { game: game, size: 38 }),
              onChange: function (value) {
                game.icon = value
                if (touch) touch()
              },
            }),
            h(
              'div',
              { className: 'gt-name-wrap' },
              h(
                'div',
                { className: 'gt-name-row' },
                h('div', { className: 'gt-detail-name' }, game.name, h(DuplicateTag, { t: t, duplicate: duplicate })),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'gt-icon-btn gt-gear inline',
                    title: t('settings.game'),
                    'aria-label': t('settings.game'),
                    onClick: function () {
                      onSettings(game.id)
                    },
                  },
                  h(GearIcon, { size: 13 })
                )
              ),
              h(
                'div',
                { className: 'gt-status-row' },
                h(
                  'span',
                  {
                    className: 'gt-status-text',
                    style: { color: STATUS_COLORS[status] || STATUS_COLORS.offline },
                  },
                  t('status.' + status)
                ),
                isArchived(game) ? h('span', { className: 'gt-status-platform' }, t('archived')) : null,
                platformIds.map(function (id) {
                  return h(
                    'span',
                    { key: id, className: 'gt-status-platform', 'data-active': String(id === activePlatform) },
                    PLATFORMS[id] ? platformLabel(PLATFORMS[id]) : id
                  )
                })
              )
            )
          ),
          h(
            'div',
            { className: 'gt-detail-right' },
            h(
              'div',
              { className: 'gt-detail-total' },
              h('div', { className: 'gt-label' }, t('all.col.total')),
              h('div', { className: 'gt-value', style: { fontSize: 19 } }, h(Duration, { seconds: totalAll, t: t }))
            )
          )
        ),
        h(
          'div',
          { className: 'gt-range' },
          h(
            'div',
            { className: 'gt-seg' },
            ['day', 'last7', 'last30', 'all'].map(function (key) {
              return h(
                'button',
                {
                  key: key,
                  type: 'button',
                  className: 'gt-seg-btn',
                  'data-active': range === key,
                  onClick: function () {
                    pickRange(key)
                  },
                },
                t('range.' + key)
              )
            })
          ),
          h('div', { className: 'gt-muted', style: { marginLeft: 4 } }, rangeLabel),
          h(
            'div',
            { className: 'gt-pager' },
            h(
              'button',
              {
                type: 'button',
                className: 'gt-icon-btn small',
                disabled: prevDisabled,
                'aria-label': 'previous',
                onClick: function () {
                  shift(-1)
                },
              },
              '‹'
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'gt-icon-btn small',
                disabled: nextDisabled,
                'aria-label': 'next',
                onClick: function () {
                  shift(1)
                },
              },
              '›'
            )
          )
        ),
        h(
          'div',
          { className: 'gt-summary gt-summary-4' },
          h(Stat, { label: t('range.' + range), seconds: rangeTotal, t: t }),
          h(Stat, { label: t('detail.sessions'), value: String(rangeSessions.length) }),
          h(Stat, { label: t('detail.playedDays'), value: String(rangeDays), unit: t('day') }),
          h(Stat, { label: t('detail.average'), seconds: average, t: t })
        ),
        h(ShareCard, {
          t: t,
          title: t('detail.platforms'),
          note: groupName
            ? t('game.group.active').replace('{name}', groupName)
            : String(breakdown.length) + ' / ' + String(enabledPlatforms(game).length),
          items: breakdown,
        }),
        h(ChartCard, {
          t: t,
          title: t('detail.trend'),
          unit: t('unit.' + grain.key),
          color: game.color,
          points: points,
          selectedKey: selected,
          onPan: shift,
          onZoom: zoomBy,
          onReset: function () {
            setAnchor(defaultAnchor(range))
            setZoom((GRAIN_LEVELS[range] || GRAIN_LEVELS.day).base)
            setSelected(null)
          },
          onSelect: function (key) {
            setSelected(selected === key ? null : key)
          },
        }),
        h(
          'div',
          { className: 'gt-panel-card' },
          h(
            'div',
            { className: 'gt-card-head' },
            h('div', { className: 'gt-card-title' }, listTitle),
            selected
              ? h(
                  'button',
                  {
                    type: 'button',
                    className: 'gt-back',
                    style: { marginLeft: 'auto' },
                    onClick: function () {
                      setSelected(null)
                    },
                  },
                  t('back')
                )
              : null
          ),
          h(
            'div',
            { className: 'gt-list' },
            mainList,
            mainList.length === 0 ? h('div', { className: 'gt-muted', style: { padding: '8px 10px' } }, t('list.empty')) : null
          ),
          drill
        )
      )
    }

    /* ------------------------------------------------------------------ *
     * Settings views
     * ------------------------------------------------------------------ */

    function Field(props) {
      return h(
        'div',
        { className: 'gt-field' },
        h(
          'div',
          { className: 'gt-field-text' },
          h('div', { className: 'gt-field-name' }, props.label),
          props.hint ? h('div', { className: 'gt-field-hint' }, props.hint) : null
        ),
        props.children
      )
    }

    function GroupHeader({ t, title, expanded, onToggle, count }) {
      const label = expanded ? t('settings.collapse') : t('settings.expand')
      return h(
        'button',
        {
          type: 'button',
          className: 'gt-group-head',
          'aria-expanded': expanded ? 'true' : 'false',
          title: label,
          onClick: onToggle,
        },
        h('span', { className: 'gt-group-title' }, title),
        h(
          'span',
          { className: 'gt-group-toggle' },
          h('span', null, count ? label + ' · ' + String(count) : label),
          h(ChevronIcon, { size: 14, open: expanded })
        )
      )
    }

    function Confirm({ t, title, body, confirmLabel, onCancel, onConfirm }) {
      return h(
        'div',
        { className: 'gt-modal-backdrop' },
        h(
          'div',
          { className: 'gt-modal' },
          h('div', { className: 'gt-modal-title' }, title),
          h('div', { className: 'gt-modal-body' }, body),
          h(
            'div',
            { className: 'gt-modal-actions' },
            h('button', { type: 'button', className: 'gt-btn', onClick: onCancel }, t('cancel')),
            h('button', { type: 'button', className: 'gt-btn danger', onClick: onConfirm }, confirmLabel)
          )
        )
      )
    }

    /** Compare the shipped version with the newest GitHub release (read-only). */
    function compareVersion(left, right) {
      const a = String(left).split('.').map(Number)
      const b = String(right).split('.').map(Number)
      for (let index = 0; index < 3; index += 1) {
        const x = a[index] || 0
        const y = b[index] || 0
        if (x !== y) return x > y ? 1 : -1
      }
      return 0
    }

    function UpdateCheck({ t }) {
      const [state, setState] = React.useState('idle')
      const [latest, setLatest] = React.useState('')
      const check = function () {
        if (typeof fetch !== 'function') {
          setState('error')
          return
        }
        setState('checking')
        fetch('https://api.github.com/repos/super0plant/dsh-plugin-game-time/releases/latest', {
          headers: { accept: 'application/vnd.github+json' },
        })
          .then(function (response) {
            return response && response.ok ? response.json() : null
          })
          .then(function (payload) {
            const tag = payload && payload.tag_name ? String(payload.tag_name).replace(/^v/i, '') : ''
            if (!tag) {
              setState('error')
              return
            }
            setLatest(tag)
            setState(compareVersion(tag, VERSION) > 0 ? 'found' : 'latest')
          })
          .catch(function () {
            setState('error')
          })
      }
      return h(
        'div',
        { className: 'gt-update' },
        h('div', { className: 'gt-muted' }, t('settings.version').replace('{v}', VERSION)),
        h(
          'div',
          { className: 'gt-update-row' },
          h(
            'button',
            {
              type: 'button',
              className: 'gt-btn',
              disabled: state === 'checking',
              onClick: check,
            },
            state === 'checking' ? t('settings.update.checking') : t('settings.checkUpdate')
          ),
          state === 'latest' ? h('span', { className: 'gt-muted' }, t('settings.update.latest')) : null,
          state === 'found'
            ? h(
                'a',
                {
                  className: 'gt-link',
                  href: 'https://github.com/super0plant/dsh-plugin-game-time/releases/latest',
                  target: '_blank',
                  rel: 'noreferrer',
                },
                t('settings.update.found').replace('{v}', latest)
              )
            : null,
          state === 'error' ? h('span', { className: 'gt-muted' }, t('settings.update.error')) : null
        )
      )
    }

    function GlobalSettings({ t, onBack, touch, onEditGame }) {
      const [newPlatformName, setNewPlatformName] = React.useState('')
      const [newPlatformPath, setNewPlatformPath] = React.useState('')
      const [pendingGame, setPendingGame] = React.useState(null)
      const [pendingPlatform, setPendingPlatform] = React.useState(null)
      const [dragging, setDragging] = React.useState(null)
      const [showArchivedGames, setShowArchivedGames] = React.useState(false)
      const [gameDrag, setGameDrag] = React.useState(false)
      const [gameDropNote, setGameDropNote] = React.useState('')
      const [gameDropWarn, setGameDropWarn] = React.useState(false)
      const [gamesExpanded, setGamesExpanded] = React.useState(false)
      const [platformsExpanded, setPlatformsExpanded] = React.useState(false)

      const movePlatform = function (fromId, toId) {
        if (!fromId || !toId || fromId === toId) return
        const ids = platformIdList()
        const fromIndex = ids.indexOf(fromId)
        const toIndex = ids.indexOf(toId)
        if (fromIndex < 0 || toIndex < 0) return
        ids.splice(toIndex, 0, ids.splice(fromIndex, 1)[0])
        ids.forEach(function (id, index) {
          if (PLATFORMS[id]) PLATFORMS[id].rank = index
        })
        touch()
      }

      const setSetting = function (key, value) {
        SETTINGS[key] = value
        touch()
      }

      const autostartUsable = Boolean(ENV && ENV.standalone && ENV.autostart && ENV.autostart.supported)
      const autostartNote = autostartUsable
        ? ''
        : ENV && ENV.autostart && ENV.autostart.reason === 'dsh'
          ? t('settings.autostart.dsh')
          : t('settings.autostart.unavailable')

      const toggleAutostart = function (next) {
        SETTINGS.autostart = next
        touch()
        if (!LIVE || typeof fetch !== 'function') return
        try {
          Promise.resolve(
            fetch('/api/game-time/autostart', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ enabled: next }),
            })
          )
            .then(function (response) {
              return response && response.ok ? response.json() : null
            })
            .then(function (payload) {
              if (payload && payload.autostart) ENV = Object.assign({}, ENV, { autostart: payload.autostart })
            })
            .catch(function () {})
        } catch (error) {
          /* ignore a failed toggle; the checkbox keeps the optimistic state */
        }
      }

      const addPlatform = function () {
        const name = newPlatformName.trim()
        if (!name) return
        const id = 'p-' + String(Date.now())
        PLATFORMS[id] = {
          id: id,
          name: name,
          short: name.charAt(0),
          color: COLOR_PRESETS[Object.keys(PLATFORMS).length % COLOR_PRESETS.length],
          path: newPlatformPath.trim(),
          rank: Object.keys(PLATFORMS).length,
        }
        setNewPlatformName('')
        setNewPlatformPath('')
        touch()
      }

      const confirmDeletePlatform = function () {
        if (!pendingPlatform) return
        delete PLATFORMS[pendingPlatform.id]
        for (const game of GAMES) {
          game.platforms = game.platforms.filter(function (id) {
            return id !== pendingPlatform.id
          })
          game.disabled = game.disabled.filter(function (id) {
            return id !== pendingPlatform.id
          })
        }
        setPendingPlatform(null)
        touch()
      }

      const addGame = function () {
        const ids = Object.keys(PLATFORMS)
        const id = 'game-' + String(Date.now())
        GAMES.push({
          id: id,
          name: t('game.new'),
          glyph: '新',
          color: '#7fbf6a',
          icon: '',
          background: '',
          backgroundFit: 'cover',
          imageOpacity: 1,
          headerBackground: '',
          platforms: [ids[0]],
          installs: [],
          entries: [],
        })
        touch()
        if (onEditGame) onEditGame(id)
      }

      const confirmDeleteGame = function () {
        if (!pendingGame) return
        const index = GAMES.findIndex(function (item) {
          return item.id === pendingGame.id
        })
        if (index >= 0) GAMES.splice(index, 1)
        setPendingGame(null)
        touch()
      }

      const platformUsage = function (id) {
        return GAMES.filter(function (game) {
          return game.platforms.indexOf(id) >= 0
        }).length
      }

      const duplicates = duplicateMap()

      const manageRow = function (game) {
        return h(
          'div',
          { key: game.id, className: 'gt-gamerow' },
          h(Tile, { game: game, size: 26 }),
          h(
            'div',
            { className: 'gt-gamerow-main' },
            h(
              'div',
              { className: 'gt-gamerow-name' },
              ACTIVE.some(function (item) {
                return item.gameId === game.id
              })
                ? h('span', { className: 'gt-dot', style: { marginRight: 5 } })
                : null,
              game.name,
              h(DuplicateTag, { t: t, duplicate: duplicates.get(game.id) })
            ),
            h(
              'div',
              { className: 'gt-gamerow-meta' },
              t('game.meta')
                .replace('{platforms}', String(game.platforms.length))
                .replace('{entries}', String((game.entries || []).length))
                .replace('{installs}', String((game.installs || []).length))
            )
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'gt-link',
              onClick: function () {
                if (onEditGame) onEditGame(game.id)
              },
            },
            t('game.edit')
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'gt-icon-btn small',
              title: t('delete'),
              onClick: function () {
                setPendingGame(game)
              },
            },
            '×'
          )
        )
      }

      const activeGames = GAMES.filter(function (game) {
        return !isArchived(game)
      })
      const archivedGames = GAMES.filter(isArchived)

      const handleGameDrop = function (event) {
        event.preventDefault()
        event.stopPropagation()
        setGameDrag(false)
        const files =
          event.dataTransfer && event.dataTransfer.files
            ? Array.prototype.slice.call(event.dataTransfer.files)
            : []
        if (files.length === 0) return
        Promise.all(files.map(resolveDroppedFile)).then(function (list) {
          let added = 0
          let owned = null
          let failed = 0
          list.forEach(function (resolved) {
            if (!resolved || !resolved.ok) {
              failed += 1
              return
            }
            const result = createGameFromResolved(t, resolved)
            if (result.state === 'added') added += 1
            else if (result.state === 'owned') owned = result.owner
            else failed += 1
          })
          const parts = []
          if (added > 0) parts.push(t('settings.dropGame.added').replace('{n}', String(added)))
          if (owned) parts.push(t('settings.dropGame.owned').replace('{name}', owned.name))
          if (failed > 0) parts.push(t('drop.failed').replace('{names}', String(failed)))
          setGameDropNote(parts.join(' · '))
          setGameDropWarn(Boolean(owned) || failed > 0)
          if (added > 0) touch()
        })
      }

      return h(
        'div',
        { className: 'gt-root gt-fixed-head' },
        h(
          'div',
          { className: 'gt-detail-head' },
          h(
            'div',
            { className: 'gt-detail-id' },
            h('button', { type: 'button', className: 'gt-back icon', onClick: onBack, title: t('back'), 'aria-label': t('back') }, h(ArrowLeftIcon, { size: 14 })),
            h('div', { className: 'gt-detail-name' }, t('settings'))
          )
        ),
        h(
          'div',
          { className: 'gt-settings' },
          h(
            'div',
            {
              className: 'gt-group gt-drop',
              'data-drop': gameDrag ? 'true' : 'false',
              onDragEnter: function (event) {
                event.preventDefault()
                event.stopPropagation()
                setGameDrag(true)
              },
              onDragOver: function (event) {
                event.preventDefault()
                event.stopPropagation()
                setGameDrag(true)
              },
              onDragLeave: function (event) {
                event.stopPropagation()
                setGameDrag(false)
              },
              onDrop: handleGameDrop,
            },
            h(GroupHeader, {
              t: t,
              title: t('game.manage'),
              expanded: gamesExpanded,
              count: activeGames.length,
              onToggle: function () {
                setGamesExpanded(!gamesExpanded)
              },
            }),
            h(
              'div',
              { className: 'gt-gamepills' },
              activeGames.map(function (game) {
                const dup = duplicates.get(game.id)
                return h(
                  'button',
                  {
                    key: 'gp-' + game.id,
                    type: 'button',
                    className: 'gt-gamepill',
                    style: { '--gt-pill': hexToRgb(game.color) },
                    title: game.name,
                    onClick: function () {
                      if (onEditGame) onEditGame(game.id)
                    },
                  },
                  h('span', { className: 'gt-gamepill-icon' }, h(Tile, { game: game, size: 16 })),
                  h('span', { className: 'gt-gamepill-name' }, game.name),
                  dup ? h('span', { className: 'gt-gamepill-dup', title: t('game.duplicate.hint').replace('{name}', dup.owner.name) }) : null
                )
              })
            ),
            gamesExpanded
              ? h(
                  'div',
                  null,
                  activeGames.map(manageRow),
                  archivedGames.length > 0
                    ? h(
                        'div',
                        { className: 'gt-archived' },
                        h(
                          'button',
                          {
                            type: 'button',
                            className: 'gt-collapse',
                            'aria-expanded': showArchivedGames ? 'true' : 'false',
                            onClick: function () {
                              setShowArchivedGames(!showArchivedGames)
                            },
                          },
                          h('span', { className: 'gt-card-title' }, t('archived.title')),
                          h('span', { className: 'gt-muted' }, String(archivedGames.length)),
                          h('span', { className: 'gt-collapse-caret', 'data-open': String(showArchivedGames) }, '▾')
                        ),
                        showArchivedGames ? archivedGames.map(manageRow) : null
                      )
                    : null
                )
              : null,
            h('button', { type: 'button', className: 'gt-link', onClick: addGame }, '+ ' + t('game.add')),
            h('div', { className: 'gt-drop-hint' }, gameDrag ? t('settings.dropGame.release') : t('settings.dropGame.hint')),
            gameDropNote
              ? h('div', { className: 'gt-note gt-drop-note' + (gameDropWarn ? ' gt-warn' : '') }, gameDropNote)
              : null,
          ),
          h(
            'div',
            { className: 'gt-group' },
            h(GroupHeader, {
              t: t,
              title: t('settings.platforms'),
              expanded: platformsExpanded,
              count: platformIdList().length,
              onToggle: function () {
                setPlatformsExpanded(!platformsExpanded)
              },
            }),
            h(
              'div',
              { className: 'gt-chips', style: { paddingTop: 8 } },
              platformIdList().map(function (id) {
                const platform = PLATFORMS[id]
                const running = ACTIVE.some(function (item) {
                  return item.platformId === id
                })
                return h(
                  'span',
                  {
                    key: 'over-' + id,
                    className: 'gt-pill',
                    style: {
                      background: 'rgba(' + hexToRgb(platform.color) + ', .14)',
                      borderColor: 'rgba(' + hexToRgb(platform.color) + ', .36)',
                    },
                    title: platform.path || platform.name,
                  },
                  h(StatusDot, { t: t, status: platformStatus(id) }),
                  platform.name
                )
              })
            ),
            platformsExpanded
              ? h(
                  'div',
                  null,
                  platformIdList().map(function (id) {
                    const platform = PLATFORMS[id]
                    return h(
                      'div',
                      {
                        key: id,
                        className: 'gt-platrow',
                  onDragOver: function (event) {
                    event.preventDefault()
                  },
                  onDrop: function () {
                    movePlatform(dragging, id)
                  },
                },
                h(
                  'div',
                  { className: 'gt-platrow-head' },
                  h(
                    'span',
                    {
                      className: 'gt-drag',
                      title: t('platform.drag'),
                      draggable: true,
                      onDragStart: function (event) {
                        event.dataTransfer.effectAllowed = 'move'
                        setDragging(id)
                      },
                      onDragEnd: function () {
                        setDragging(null)
                      },
                    },
                    '⠿'
                  ),
                  h(StatusDot, { t: t, status: platformStatus(id) }),
                  h(
                    'span',
                    {
                      className: 'gt-tile',
                      style: {
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: platform.color,
                        fontSize: 10,
                        overflow: 'hidden',
                      },
                    },
                    platform.icon
                      ? h('img', {
                          src: platform.icon,
                          alt: '',
                          style: { width: '100%', height: '100%', objectFit: 'cover' },
                        })
                      : platform.short || platform.name.charAt(0)
                  ),
                  h('input', {
                    className: 'gt-input',
                    value: platform.name,
                    placeholder: t('platform.name'),
                    onChange: function (event) {
                      platform.name = event.target.value
                      platform.short = event.target.value.charAt(0)
                      touch()
                    },
                  }),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'gt-icon-btn small',
                      title: t('delete'),
                      onClick: function () {
                        setPendingPlatform(platform)
                      },
                    },
                    '×'
                  )
                ),
                h(
                  'div',
                  { style: { marginTop: 5 } },
                  h(PathField, {
                    t: t,
                    value: platform.path,
                    placeholder: t('platform.path'),
                    onChange: function (value) {
                      platform.path = value
                      touch()
                    },
                  })
                ),
                h(
                  'div',
                  { style: { marginTop: 5 } },
                  h('input', {
                    className: 'gt-input',
                    style: { fontSize: 11 },
                    value: (platform.processes || []).join(', '),
                    placeholder: t('platform.processes'),
                    onChange: function (event) {
                      platform.processes = event.target.value
                        .split(',')
                        .map(function (item) {
                          return item.trim()
                        })
                        .filter(Boolean)
                      touch()
                    },
                  })
                ),
                h(
                  'div',
                  { className: 'gt-platrow-actions' },
                  h(
                    'label',
                    { className: 'gt-link' },
                    t('icon.pick'),
                    h('input', {
                      type: 'file',
                      accept: 'image/*',
                      style: { display: 'none' },
                      onChange: function (event) {
                        readIconFile(event.target.files && event.target.files[0], function (value) {
                          platform.icon = value
                          touch()
                        })
                      },
                    })
                  ),
                  platform.icon
                    ? h(
                        'button',
                        {
                          type: 'button',
                          className: 'gt-link',
                          onClick: function () {
                            platform.icon = ''
                            touch()
                          },
                        },
                        t('icon.reset')
                      )
                    : null,
                  h(
                    'label',
                    { className: 'gt-bg-control' },
                    h('span', null, t('platform.color')),
                    h('input', {
                      type: 'color',
                      className: 'gt-color',
                      value: platform.color,
                      onChange: function (event) {
                        platform.color = event.target.value
                        touch()
                      },
                    })
                  )
                )
              )
            })) : null,
            h(
              'div',
              { className: 'gt-platform-new' },
              h('input', {
                className: 'gt-input gt-platform-name',
                placeholder: t('platform.name'),
                value: newPlatformName,
                onChange: function (event) {
                  setNewPlatformName(event.target.value)
                },
              }),
              h(
                'div',
                { className: 'gt-platform-path' },
                h(PathField, {
                  t: t,
                  value: newPlatformPath,
                  placeholder: t('platform.path'),
                  onChange: function (value) {
                    setNewPlatformPath(value)
                  },
                })
              ),
              h('button', { type: 'button', className: 'gt-btn gt-platform-add', onClick: addPlatform }, '+ ' + t('settings.addPlatform'))
            ),
            h('div', { className: 'gt-note', style: { paddingBottom: 10 } }, t('settings.platforms.hint'))
          ),
          h(
            'div',
            { className: 'gt-group' },
            h('div', { className: 'gt-group-title' }, t('settings.monitor')),
            h(
              Field,
              { label: t('settings.interval'), hint: t('settings.interval.hint') },
              h(Dropdown, {
                value: String(SETTINGS.intervalSec),
                minWidth: 74,
                options: [
                  { value: '5', label: '5 s' },
                  { value: '10', label: '10 s' },
                  { value: '30', label: '30 s' },
                ],
                onChange: function (value) {
                  setSetting('intervalSec', Number(value))
                },
              })
            ),
            h(
              Field,
              { label: t('settings.history'), hint: t('settings.history.hint') },
              h(Dropdown, {
                value: String(SETTINGS.historyDays || 365),
                minWidth: 90,
                options: [
                  { value: '30', label: t('settings.history.months').replace('{n}', '1') },
                  { value: '90', label: t('settings.history.months').replace('{n}', '3') },
                  { value: '180', label: t('settings.history.months').replace('{n}', '6') },
                  { value: '365', label: t('settings.history.years').replace('{n}', '1') },
                  { value: '730', label: t('settings.history.years').replace('{n}', '2') },
                  { value: '1825', label: t('settings.history.years').replace('{n}', '5') },
                ],
                onChange: function (value) {
                  setSetting('historyDays', Number(value))
                },
              })
            ),
            // 已移除（0.4.0）：「仅前台计时」从来没实现过逻辑，留着只会让人以为
            // 开着就只算前台。替代方案见 HANDOFF §10 —— 按游戏的后台暂停 + 全局统一管理。
          ),
          // 冻结（0.4.0）：开机自启只对已暂停的独立网页版有意义（DSH 里插件由宿主
          // 自己启动，写系统自启等于「让 DSH 随登录启动」）。恢复时取消下面注释即可，
          // 文案键 settings.autostart* 与宿主接口都还在。
          /*
          h(
            'div',
            { className: 'gt-group' },
            h('div', { className: 'gt-group-title' }, t('settings.startup')),
            h(
              Field,
              {
                label: t('settings.autostart'),
                hint: autostartUsable
                  ? t('settings.autostart.hint')
                  : ENV && ENV.autostart && ENV.autostart.reason === 'dsh'
                    ? t('settings.autostart.dsh.hint')
                    : t('settings.autostart.unavailable'),
              },
              h('input', {
                className: 'gt-check',
                type: 'checkbox',
                checked: autostartUsable && ENV.autostart ? Boolean(ENV.autostart.enabled) : SETTINGS.autostart !== false,
                disabled: !autostartUsable,
                title: autostartNote,
                onChange: function (event) {
                  toggleAutostart(event.target.checked)
                },
              })
            ),
            autostartUsable
              ? null
              : h('div', { className: 'gt-note', style: { paddingBottom: 6 } }, autostartNote),
            h('div', { className: 'gt-note', style: { paddingBottom: 6 } }, t('settings.autostart.why')),
            h('div', { className: 'gt-note', style: { paddingBottom: 10 } }, t('settings.autostart.off'))
          ),
          */
          h(
            'div',
            { className: 'gt-group' },
            h('div', { className: 'gt-group-title' }, t('settings.ui')),
            h(
              Field,
              { label: t('settings.density'), hint: t('settings.density.hint') },
              h(Dropdown, {
                value: SETTINGS.density,
                minWidth: 110,
                options: [
                  { value: 'comfortable', label: t('settings.density.comfortable') },
                  { value: 'compact', label: t('settings.density.compact') },
                ],
                onChange: function (value) {
                  setSetting('density', value)
                },
              })
            ),
            h(
              Field,
              { label: t('settings.language'), hint: t('settings.language.hint') },
              h(Dropdown, {
                value: SETTINGS.language || 'auto',
                minWidth: 120,
                options: [
                  { value: 'auto', label: t('language.auto') },
                  { value: 'zh', label: '中文' },
                  { value: 'en', label: 'English' },
                ],
                onChange: function (value) {
                  setSetting('language', value)
                },
              })
            ),
            h(
              Field,
              { label: t('settings.statsDays'), hint: t('settings.statsDays.hint') },
              h(Dropdown, {
                value: String(SETTINGS.statsDays || 7),
                minWidth: 86,
                options: [1, 3, 7, 14, 30, 90, 365].map(function (days) {
                  return { value: String(days), label: t('settings.statsDays.days').replace('{n}', String(days)) }
                }),
                onChange: function (value) {
                  setSetting('statsDays', Number(value))
                },
              })
            )
          ),
          h(
            'div',
            { className: 'gt-group' },
            h('div', { className: 'gt-group-title' }, t('settings.headerBackground')),
            h(ImageField, {
              t: t,
              value: SETTINGS.headerBackground || '',
              aspect: 4,
              width: 1600,
              ratios: HEADER_RATIOS,
              onChange: function (value) {
                SETTINGS.headerBackground = value
                touch()
              },
            }),
            h(
              'div',
              { className: 'gt-bg-controls' },
              h(
                'label',
                { className: 'gt-bg-control' },
                h('span', null, t('settings.headerHeight')),
                h('input', {
                  className: 'gt-input',
                  type: 'number',
                  min: 80,
                  max: 900,
                  step: 10,
                  style: { width: 74 },
                  value: SETTINGS.headerHeight || 300,
                  onChange: function (event) {
                    SETTINGS.headerHeight = Number(event.target.value)
                    touch()
                  },
                })
              ),
              h(
                'label',
                { className: 'gt-bg-control' },
                h('span', null, t('settings.headerFade')),
                h('input', {
                  className: 'gt-input',
                  type: 'number',
                  min: 0,
                  max: 95,
                  step: 5,
                  style: { width: 64 },
                  value: SETTINGS.headerFade === undefined ? 52 : SETTINGS.headerFade,
                  onChange: function (event) {
                    SETTINGS.headerFade = Number(event.target.value)
                    touch()
                  },
                })
              )
            ),
            h('div', { className: 'gt-note', style: { paddingBottom: 10 } }, t('settings.headerBackground.hint'))
          ),
          h(
            'div',
            { className: 'gt-group' },
            h('div', { className: 'gt-group-title' }, t('settings.surfaceColor')),
            h(
              Field,
              { label: t('settings.surfaceColor'), hint: t('settings.surfaceColor.hint') },
              h('input', {
                type: 'color',
                className: 'gt-color',
                value: SETTINGS.surfaceColor || '#000000',
                onChange: function (event) {
                  SETTINGS.surfaceColor = event.target.value
                  touch()
                },
              })
            )
          ),
          h(
            'div',
            { className: 'gt-group' },
            h('div', { className: 'gt-group-title' }, t('settings.background')),
            h(
              Field,
              { label: t('bg.base'), hint: t('bg.base.hint') },
              h('input', {
                type: 'color',
                className: 'gt-color',
                value: SETTINGS.baseColor || '#0b0b0c',
                onChange: function (event) {
                  SETTINGS.baseColor = event.target.value
                  touch()
                },
              })
            ),
            h(ImageField, {
              t: t,
              value: SETTINGS.background || '',
              aspect: 8 / 3,
              width: 1280,
              ratios: PANEL_RATIOS,
              fit: SETTINGS.backgroundFit || 'cover',
              onChange: function (value) {
                SETTINGS.background = value
                touch()
              },
              onFit: function (fit) {
                SETTINGS.backgroundFit = fit
                touch()
              },
            }),
            h(BackgroundControls, {
              t: t,
              value: { imageOpacity: SETTINGS.imageOpacity },
              onChange: function (patch) {
                if (patch.imageOpacity !== undefined) SETTINGS.imageOpacity = patch.imageOpacity
                touch()
              },
            }),
            h('div', { className: 'gt-note', style: { paddingBottom: 10 } }, t('settings.background.hint'))
          ),
          h(
            'div',
            { className: 'gt-group' },
            h('div', { className: 'gt-group-title' }, t('settings.autoArchive')),
            h(
              Field,
              { label: t('settings.autoArchive.on'), hint: t('settings.autoArchive.hint') },
              h('input', {
                className: 'gt-check',
                type: 'checkbox',
                checked: autoArchiveConfig().enabled,
                onChange: function (event) {
                  SETTINGS.autoArchive = Object.assign(autoArchiveConfig(), { enabled: event.target.checked })
                  touch()
                },
              })
            ),
            h(
              Field,
              { label: t('settings.autoArchive.after') },
              h(
                'div',
                { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                h('input', {
                  className: 'gt-input',
                  style: { width: 64, textAlign: 'right' },
                  type: 'number',
                  min: 1,
                  max: autoArchiveConfig().unit === 'month' ? 24 : 365,
                  value: String(autoArchiveConfig().value),
                  onChange: function (event) {
                    const next = Number(event.target.value)
                    if (!Number.isFinite(next) || next <= 0) return
                    SETTINGS.autoArchive = Object.assign(autoArchiveConfig(), { value: next })
                    touch()
                  },
                }),
                h(Dropdown, {
                  value: autoArchiveConfig().unit,
                  minWidth: 64,
                  options: [
                    { value: 'day', label: t('settings.autoArchive.day') },
                    { value: 'month', label: t('settings.autoArchive.month') },
                  ],
                  onChange: function (value) {
                    SETTINGS.autoArchive = Object.assign(autoArchiveConfig(), { unit: value })
                    touch()
                  },
                })
              )
            )
          ),
          h(
            'div',
            { className: 'gt-group' },
            h('div', { className: 'gt-group-title' }, t('settings.data')),
            h(Field, { label: t('settings.data.retention') }),
            h(Field, { label: t('settings.data.later'), hint: t('settings.data.path') })
          ),
          h(
            'div',
            { className: 'gt-group' },
            h('div', { className: 'gt-group-title' }, t('settings.about')),
            h(UpdateCheck, { t: t })
          ),
          h('div', { className: 'gt-credit' }, t('settings.credit').replace('{v}', VERSION))
        ),
        pendingGame
          ? h(Confirm, {
              t: t,
              title: t('game.delete.title'),
              body: t('game.delete.body').replace('{name}', pendingGame.name),
              confirmLabel: t('delete'),
              onCancel: function () {
                setPendingGame(null)
              },
              onConfirm: confirmDeleteGame,
            })
          : null,
        pendingPlatform
          ? h(Confirm, {
              t: t,
              title: t('platform.delete.title'),
              body: t('platform.delete.body')
                .replace('{name}', pendingPlatform.name)
                .replace('{count}', String(platformUsage(pendingPlatform.id))),
              confirmLabel: t('delete'),
              onCancel: function () {
                setPendingPlatform(null)
              },
              onConfirm: confirmDeletePlatform,
            })
          : null
      )
    }

    function GameSettings({ t, game, onBack, touch, onDeleted }) {
      const groupName = groupNameOf(game)
      const groupPlatform = groupName ? PLATFORMS[platformIdForGroup(groupName)] : null
      const duplicate = duplicateMap().get(game.id)
      const [dragActive, setDragActive] = React.useState(false)
      const [dropNote, setDropNote] = React.useState('')
      const [dropWarn, setDropWarn] = React.useState(false)
      const [pendingOwned, setPendingOwned] = React.useState(null)
      const [confirmDelete, setConfirmDelete] = React.useState(false)
      const [entryDrag, setEntryDrag] = React.useState(null)

      const showNote = function (text, warn) {
        setDropNote(text)
        setDropWarn(!!warn)
      }

      const deleteGame = function () {
        const index = GAMES.findIndex(function (item) {
          return item.id === game.id
        })
        if (index >= 0) GAMES.splice(index, 1)
        setConfirmDelete(false)
        touch()
        if (typeof onDeleted === 'function') onDeleted()
      }

      /** Warn (don't block) when a row's path belongs to another game. */
      const warnIfOwned = function (path) {
        const owner = installOwner(path, game.id)
        showNote(owner ? t('drop.owned').replace('{name}', owner.name) : '', !!owner)
        return !!owner
      }

      const flashDrop = function (text, warn) {
        showNote(text, warn)
        if (typeof setTimeout === 'function') {
          setTimeout(function () {
            showNote('', false)
          }, 6000)
        }
      }

      /** Add one resolved launch file; returns 'added' | 'duplicate' | 'fail'. */
      const applyResolved = function (resolved) {
        const path = normalizePath(resolved && resolved.path)
        if (!path || !/\.exe$/i.test(path)) return 'fail'
        if (!Array.isArray(game.installs)) game.installs = []
        const lower = path.toLowerCase()
        const seen = game.installs.some(function (item) {
          return normalizePath(item.path).toLowerCase() === lower
        })
        if (seen) return 'duplicate'

        let platformId = resolved.platformId && PLATFORMS[resolved.platformId] ? resolved.platformId : ''
        if (!platformId && game.installs.length > 0 && PLATFORMS[game.installs[0].platformId]) {
          platformId = game.installs[0].platformId
        }
        if (!platformId) platformId = Object.keys(PLATFORMS)[0]
        game.installs.push({
          id: game.id + '-i' + String(Date.now()) + '-' + String(game.installs.length),
          platformId: platformId,
          path: path,
        })

        // Only name a game that still carries the placeholder name.
        if (resolved.name && (!game.name || game.name === t('game.new'))) {
          game.name = resolved.name
          game.glyph = resolved.name.charAt(0) || game.glyph
        }
        if (!game.icon) {
          extractIcon(path).then(function (icon) {
            if (icon && !game.icon) {
              game.icon = icon
              touch()
            }
          })
        }
        return 'added'
      }

      const handleDrop = function (event) {
        event.preventDefault()
        event.stopPropagation()
        setDragActive(false)
        const files =
          event.dataTransfer && event.dataTransfer.files
            ? Array.prototype.slice.call(event.dataTransfer.files)
            : []
        if (files.length === 0) return
        Promise.all(files.map(resolveDroppedFile)).then(function (list) {
          const added = []
          const duplicates = []
          const owned = []
          const failed = []
          let ownedBy = null
          let pending = null
          list.forEach(function (resolved, index) {
            const label = files[index] && files[index].name ? files[index].name : String(index)
            if (!resolved || !resolved.ok || !resolved.path) {
              failed.push(label)
              return
            }
            // Another game already times this exe: one tick can only credit one
            // game, so a second row would just sit at zero.
            const owner = installOwner(resolved.path, game.id)
            if (owner) {
              owned.push(label)
              ownedBy = owner
              if (!pending) pending = resolved
              return
            }
            const state = applyResolved(resolved)
            if (state === 'added') added.push(label)
            else if (state === 'duplicate') duplicates.push(label)
            else failed.push(label)
          })
          const parts = []
          if (added.length > 0) parts.push(t('drop.added').replace('{n}', String(added.length)))
          if (duplicates.length > 0) parts.push(t('drop.dup').replace('{n}', String(duplicates.length)))
          if (failed.length > 0) parts.push(t('drop.failed').replace('{names}', failed.join('、')))
          if (owned.length > 0) {
            parts.push(t('drop.owned').replace('{name}', ownedBy ? ownedBy.name : ''))
            if (pending) setPendingOwned({ resolved: pending, name: ownedBy ? ownedBy.name : '' })
          }
          flashDrop(parts.join(' · '), owned.length > 0 || duplicates.length > 0)
          if (added.length > 0) touch()
        })
      }

      const rename = function (value) {
        game.name = value
        game.glyph = value.charAt(0) || game.glyph
        touch()
      }

      const setInstallPath = function (install, value) {
        install.path = value
        touch()
        if (!value || !/\.exe$/i.test(value)) return
        extractIcon(value).then(function (icon) {
          if (!icon || game.icon) return
          game.icon = icon
          touch()
        })
      }

      const setInstallPlatform = function (install, platformId) {
        install.platformId = platformId
        touch()
      }

      const removeInstall = function (install) {
        game.installs = game.installs.filter(function (item) {
          return item.id !== install.id
        })
        touch()
      }

      const addInstall = function () {
        if (!Array.isArray(game.installs)) game.installs = []
        game.installs.push({
          id: game.id + '-i' + String(Date.now()),
          platformId: enabledPlatforms(game)[0] || Object.keys(PLATFORMS)[0],
          path: '',
        })
        touch()
      }

      const setEntry = function (entry, patch) {
        Object.assign(entry, patch)
        touch()
      }

      const changeEntryPlatform = function (entry, platformId) {
        const previous = PLATFORMS[entry.platformId]
        const next = PLATFORMS[platformId]
        entry.platformId = platformId
        if (next) {
          if (!entry.name || (previous && entry.name === previous.name)) entry.name = next.name
          if (!entry.path || (previous && entry.path === previous.path)) entry.path = next.path || ''
        }
        touch()
      }

      const addEntry = function () {
        if (!Array.isArray(game.entries)) game.entries = []
        const platformId = (game.installs || []).length > 0 ? game.installs[0].platformId : Object.keys(PLATFORMS)[0]
        const platform = PLATFORMS[platformId]
        game.entries.push({
          id: game.id + '-e' + String(Date.now()),
          platformId: platformId,
          name: platform ? platform.name : '',
          path: platform ? platform.path || '' : '',
          args: '',
        })
        touch()
      }

      const removeEntry = function (entry) {
        game.entries = game.entries.filter(function (item) {
          return item.id !== entry.id
        })
        touch()
      }

      /** Entry order is the launcher priority the host reads — drag to change it. */
      const moveEntry = function (fromId, toId) {
        if (!fromId || !toId || fromId === toId) return
        const list = game.entries || []
        const fromIndex = list.findIndex(function (item) {
          return item.id === fromId
        })
        const toIndex = list.findIndex(function (item) {
          return item.id === toId
        })
        if (fromIndex < 0 || toIndex < 0) return
        list.splice(toIndex, 0, list.splice(fromIndex, 1)[0])
        touch()
      }

      return h(
        'div',
        { className: 'gt-root gt-fixed-head' },
        h(
          'div',
          { className: 'gt-detail-head' },
          h(
            'div',
            { className: 'gt-detail-id' },
            h('button', { type: 'button', className: 'gt-back icon', onClick: onBack, title: t('back'), 'aria-label': t('back') }, h(ArrowLeftIcon, { size: 14 })),
            h(StatusDot, { t: t, status: gameStatus(game) }),
            h(Tile, { game: game, size: 30 }),
            h('div', { className: 'gt-detail-name' }, game.name, h(DuplicateTag, { t: t, duplicate: duplicate })),
            h('div', { className: 'gt-muted', style: { marginLeft: 4 } }, t('settings.game'))
          )
        ),
        h(
          'div',
          { className: 'gt-settings' },
          h(
            'div',
            { className: 'gt-group' },
            h('div', { className: 'gt-group-title' }, t('game.name')),
            h(
              'div',
              { style: { paddingBottom: 10 } },
              h('input', {
                className: 'gt-input',
                value: game.name,
                onChange: function (event) {
                  rename(event.target.value)
                },
              })
            )
          ),
          h(
            'div',
            { className: 'gt-group' },
            h('div', { className: 'gt-group-title' }, t('game.icon')),
            h(IconPicker, {
              t: t,
              value: game.icon || '',
              size: 40,
              sourcePath: game.installs && game.installs[0] ? game.installs[0].path : '',
              fallback: h(Tile, { game: game, size: 40 }),
              onChange: function (value) {
                game.icon = value
                touch()
              },
            })
          ),
          h(
            'div',
            { className: 'gt-group' },
            h('div', { className: 'gt-group-title' }, t('game.color')),
            h(
              'div',
              { style: { display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 10 } },
              COLOR_PRESETS.map(function (color) {
                return h('span', {
                  key: color,
                  className: 'gt-swatch',
                  style: {
                    background: color,
                    outline: color === game.color ? '2px solid currentColor' : 'none',
                    outlineOffset: 2,
                  },
                  onClick: function () {
                    game.color = color
                    touch()
                  },
                })
              }),
              h('input', {
                type: 'color',
                className: 'gt-color',
                value: game.color,
                title: t('game.color'),
                onChange: function (event) {
                  game.color = event.target.value
                  touch()
                },
              })
            )
          ),
          h(
            'div',
            { className: 'gt-group' },
            h('div', { className: 'gt-group-title' }, t('game.headerBackground')),
            h(ImageField, {
              t: t,
              value: game.headerBackground || '',
              aspect: 4,
              width: 1600,
              ratios: HEADER_RATIOS,
              onChange: function (value) {
                game.headerBackground = value
                touch()
              },
            }),
            h('div', { className: 'gt-note', style: { paddingBottom: 10 } }, t('game.headerBackground.hint'))
          ),
          h(
            'div',
            { className: 'gt-group' },
            h('div', { className: 'gt-group-title' }, t('game.background')),
            h(ImageField, {
              t: t,
              value: game.background || '',
              aspect: 8 / 3,
              width: 1280,
              ratios: PANEL_RATIOS,
              fit: game.backgroundFit || 'cover',
              onChange: function (value) {
                game.background = value
                touch()
              },
              onFit: function (fit) {
                game.backgroundFit = fit
                touch()
              },
            }),
            h(BackgroundControls, {
              t: t,
              value: { imageOpacity: game.imageOpacity },
              onChange: function (patch) {
                if (patch.imageOpacity !== undefined) game.imageOpacity = patch.imageOpacity
                touch()
              },
            }),
            h('div', { className: 'gt-note', style: { paddingBottom: 10 } }, t('game.background.hint'))
          ),          h(
            'div',
            {
              className: 'gt-group gt-drop',
              'data-drop': dragActive ? 'true' : 'false',
              onDragEnter: function (event) {
                event.preventDefault()
                event.stopPropagation()
                setDragActive(true)
              },
              onDragOver: function (event) {
                event.preventDefault()
                event.stopPropagation()
                setDragActive(true)
              },
              onDragLeave: function (event) {
                event.stopPropagation()
                setDragActive(false)
              },
              onDrop: handleDrop,
            },
            h('div', { className: 'gt-group-title' }, t('game.installs')),
            h(
              'div',
              { className: 'gt-group-row' },
              h('span', { className: 'gt-group-label' }, t('game.group')),
              h('input', {
                className: 'gt-input',
                maxLength: 30,
                value: game.group || '',
                placeholder: t('game.group.placeholder'),
                title: t('game.group.hint'),
                onChange: function (event) {
                  game.group = event.target.value
                  touch()
                },
                onBlur: function () {
                  // Freeze the auto colour once the name is final, so later
                  // groups cannot shift it; the colour picker can still override.
                  const name = groupNameOf(game)
                  if (!name) return
                  if (SETTINGS.groupColors && SETTINGS.groupColors[name]) return
                  if (!SETTINGS.groupColors) SETTINGS.groupColors = {}
                  SETTINGS.groupColors[name] = groupColorOf(name)
                  touch()
                },
              }),
              groupPlatform
                ? h('span', { className: 'gt-group-label', style: { opacity: 0.8 } }, t('game.group.into').replace('{name}', groupPlatform.name))
                : groupName
                  ? h('input', {
                      type: 'color',
                      className: 'gt-color',
                      value: groupColorOf(groupName),
                      title: t('game.group.color'),
                      'aria-label': t('game.group.color'),
                      onChange: function (event) {
                        if (!SETTINGS.groupColors) SETTINGS.groupColors = {}
                        SETTINGS.groupColors[groupName] = event.target.value
                        touch()
                      },
                    })
                  : null
            ),
            (game.installs || []).map(function (install) {
              const platform = PLATFORMS[install.platformId]
              const process = baseName(install.path)
              return h(
                'div',
                { key: install.id, className: 'gt-entry' },
                h(
                  'div',
                  { className: 'gt-entry-head' },
                  h(PlatformSelect, {
                    value: install.platformId,
                    options: platformIdList(),
                    onChange: function (id) {
                      setInstallPlatform(install, id)
                    },
                  }),
                  h(PathField, {
                    t: t,
                    value: install.path,
                    placeholder: platform && platform.path ? platform.path : t('game.install.path'),
                    dropMode: 'game',
                    onChange: function (value) {
                      setInstallPath(install, value)
                    },
                    onResolved: function (resolved) {
                      setInstallPath(install, resolved.path)
                      warnIfOwned(resolved.path)
                    },
                    onCommit: function (value) {
                      warnIfOwned(value)
                    },
                  }),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'gt-icon-btn small',
                      title: t('remove'),
                      onClick: function () {
                        removeInstall(install)
                      },
                    },
                    '×'
                  )
                ),
                process
                  ? h(
                      'div',
                      { className: 'gt-run-args', style: { marginTop: 4 } },
                      t('game.install.process').replace('{process}', process)
                    )
                  : null
              )
            }),
            h('button', { type: 'button', className: 'gt-link', onClick: addInstall }, '+ ' + t('game.installs.add')),
            h('div', { className: 'gt-note', style: { padding: '6px 0 2px' } }, t('game.installs.hint')),
            h('div', { className: 'gt-drop-hint' }, dragActive ? t('drop.release') : ENV.standalone ? t('drop.hintBrowser') : t('drop.hint')),
            dropNote ? h('div', { className: 'gt-note gt-drop-note' + (dropWarn ? ' gt-warn' : '') }, dropNote) : null,
            pendingOwned
              ? h(
                  'div',
                  { className: 'gt-note gt-drop-note gt-warn' },
                  t('drop.ownedAddAsk').replace('{name}', pendingOwned.name || ''),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'gt-link',
                      style: { marginLeft: 8, padding: 0, fontSize: 12 },
                      onClick: function () {
                        applyResolved(pendingOwned.resolved)
                        setPendingOwned(null)
                        showNote('', false)
                        touch()
                      },
                    },
                    t('drop.ownedAdd')
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'gt-link',
                      style: { marginLeft: 10, padding: 0, fontSize: 12 },
                      onClick: function () {
                        setPendingOwned(null)
                        showNote('', false)
                      },
                    },
                    t('cancel')
                  )
                )
              : null
          ),
          h(
            'div',
            { className: 'gt-group' },
            h('div', { className: 'gt-group-title' }, t('game.entries')),
            (game.entries || []).map(function (entry) {
              const platform = PLATFORMS[entry.platformId]
              return h(
                'div',
                {
                  key: entry.id,
                  className: 'gt-entry',
                  onDragOver: function (event) {
                    event.preventDefault()
                  },
                  onDrop: function () {
                    moveEntry(entryDrag, entry.id)
                  },
                },
                h(
                  'div',
                  { className: 'gt-entry-head drag' },
                  h(
                    'span',
                    {
                      className: 'gt-drag',
                      title: t('game.entry.drag'),
                      draggable: true,
                      onDragStart: function (event) {
                        event.dataTransfer.effectAllowed = 'move'
                        setEntryDrag(entry.id)
                      },
                      onDragEnd: function () {
                        setEntryDrag(null)
                      },
                    },
                    '⠿'
                  ),
                  h(PlatformSelect, {
                    value: entry.platformId,
                    options: platformIdList(),
                    onChange: function (id) {
                      changeEntryPlatform(entry, id)
                    },
                  }),
                  h('input', {
                    className: 'gt-input',
                    value: entry.name,
                    placeholder: platform ? platformLabel(platform) : t('game.entry.name'),
                    onChange: function (event) {
                      setEntry(entry, { name: event.target.value })
                    },
                  }),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'gt-icon-btn small',
                      title: t('remove'),
                      onClick: function () {
                        removeEntry(entry)
                      },
                    },
                    '×'
                  )
                ),
                h(
                  'div',
                  { style: { marginTop: 6 } },
                  h(PathField, {
                    t: t,
                    value: entry.path,
                    placeholder: platform && platform.path ? platform.path : t('game.entry.path'),
                    onChange: function (value) {
                      setEntry(entry, { path: value })
                    },
                  })
                ),
                h('input', {
                  className: 'gt-input',
                  style: { marginTop: 6, fontSize: 11 },
                  value: entry.args,
                  placeholder: t('game.entry.args'),
                  onChange: function (event) {
                    setEntry(entry, { args: event.target.value })
                  },
                })
              )
            }),
            h('button', { type: 'button', className: 'gt-link', onClick: addEntry }, '+ ' + t('game.entries.add')),
            h('div', { className: 'gt-note', style: { padding: '6px 0 10px' } }, t('game.entries.hint'))
          ),
          h(
            'div',
            { className: 'gt-group' },
            h('div', { className: 'gt-group-title' }, t('game.archive')),
            h(
              'div',
              { className: 'gt-group-row' },
              h('input', {
                type: 'checkbox',
                className: 'gt-check',
                checked: game.archived === true,
                'aria-label': t('game.archive.toggle'),
                onChange: function (event) {
                  game.archived = event.target.checked
                  touch()
                },
              }),
              h('span', { className: 'gt-group-label' }, t('game.archive.toggle'))
            ),
            h(
              'div',
              { className: 'gt-group-row' },
              h('input', {
                type: 'checkbox',
                className: 'gt-check',
                checked: game.noAutoArchive === true,
                'aria-label': t('game.archive.exempt'),
                onChange: function (event) {
                  game.noAutoArchive = event.target.checked
                  touch()
                },
              }),
              h('span', { className: 'gt-group-label' }, t('game.archive.exempt'))
            ),
            autoArchived(game) && game.archived !== true
              ? h('div', { className: 'gt-note gt-drop-note' }, t('game.archive.auto'))
              : null,
            h('div', { className: 'gt-note', style: { paddingBottom: 10 } }, t('game.archive.hint'))
          ),
          h(
            'div',
            { className: 'gt-group' },
            h('div', { className: 'gt-group-title' }, t('game.danger')),
            h(
              'div',
              { className: 'gt-group-row' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'gt-btn danger',
                  onClick: function () {
                    setConfirmDelete(true)
                  },
                },
                t('game.delete.button')
              ),
              h('span', { className: 'gt-group-label', style: { marginLeft: 'auto' } }, t('game.delete.note'))
            )
          )
        ),
        confirmDelete
          ? h(Confirm, {
              t: t,
              title: t('game.delete.title'),
              body: t('game.delete.body').replace('{name}', game.name),
              confirmLabel: t('delete'),
              onCancel: function () {
                setConfirmDelete(false)
              },
              onConfirm: deleteGame,
            })
          : null
      )
    }

    /* ------------------------------------------------------------------ *
     * Root page
     * ------------------------------------------------------------------ */

    function Page(props) {
      const t = props.t
      const [route, setRouteState] = React.useState(LAST_ROUTE)
      const setRoute = function (next) {
        LAST_ROUTE = next
        setRouteState(next)
      }
      const [version, setVersion] = React.useState(0)
      const [refreshing, setRefreshing] = React.useState(false)

      CURRENT_ROUTE = route.name

      bumpPage = function () {
        setVersion(function (value) {
          return value + 1
        })
      }

      const touch = function () {
        markConfigChanged()
        setVersion(version + 1)
        saveConfig()
      }

      const refresh = function () {
        setRefreshing(true)
        loadLiveState(true)
        setTimeout(function () {
          setRefreshing(false)
        }, 900)
      }

      const openGame = function (gameId, from) {
        setRoute({ name: 'game', id: gameId, from: from })
      }

      const openSettings = function () {
        setRoute({ name: 'settings', from: route.name })
      }

      const openGameSettings = function (gameId) {
        setRoute({ name: 'game-settings', id: gameId, from: route.from })
      }

      const back = function () {
        setRoute({ name: route.from === 'all' ? 'all' : 'today' })
      }

      const backFromSettings = function () {
        setRoute({ name: route.from === 'all' || route.from === 'today' ? route.from : 'today' })
      }

      const backFromGameSettings = function () {
        if (route.from === 'settings') {
          setRoute({ name: 'settings', from: 'today' })
          return
        }
        setRoute({ name: 'game', id: route.id, from: route.from })
      }

      const activeGame = route.name === 'game' || route.name === 'game-settings'
        ? GAMES.find(function (item) {
            return item.id === route.id
          })
        : null

      const bgUrl = activeGame ? activeGame.background || '' : SETTINGS.background || ''
      const bgFit = activeGame ? activeGame.backgroundFit || 'cover' : SETTINGS.backgroundFit || 'cover'
      // Image opacity only: the panel base is an opaque colour, so DSH's own
      // styling can never show through and mix with the image.
      const bgOpacity =
        (activeGame ? activeGame.imageOpacity : SETTINGS.imageOpacity) === undefined
          ? 1
          : activeGame
            ? activeGame.imageOpacity
            : SETTINGS.imageOpacity
      const baseColor = SETTINGS.baseColor || '#0b0b0c'
      const headerBg = activeGame
        ? activeGame.headerBackground || SETTINGS.headerBackground || ''
        : SETTINGS.headerBackground || ''

      // Cover sizing needs two numbers: the shell width (the "window") and each
      // image's own pixel width. backgroundWidth() then keeps the image at least
      // as wide as the window and never narrower than itself.
      const shellRef = React.useRef(null)
      const [shellWidth, setShellWidth] = React.useState(0)
      const [bgNatural, setBgNatural] = React.useState(0)
      const [headerNatural, setHeaderNatural] = React.useState(0)

      React.useEffect(function () {
        const node = shellRef.current
        if (!node || typeof ResizeObserver !== 'function') return undefined
        const observer = new ResizeObserver(function (entries) {
          const entry = entries && entries[0]
          if (entry) setShellWidth(Math.round(entry.contentRect.width))
        })
        observer.observe(node)
        return function () {
          observer.disconnect()
        }
      }, [])

      React.useEffect(function () {
        if (!bgUrl || typeof Image !== 'function') {
          setBgNatural(0)
          return undefined
        }
        const image = new Image()
        image.onload = function () {
          setBgNatural(image.naturalWidth || 0)
        }
        image.src = bgUrl
        return function () {
          image.onload = null
        }
      }, [bgUrl])

      React.useEffect(function () {
        if (!headerBg || typeof Image !== 'function') {
          setHeaderNatural(0)
          return undefined
        }
        const image = new Image()
        image.onload = function () {
          setHeaderNatural(image.naturalWidth || 0)
        }
        image.src = headerBg
        return function () {
          image.onload = null
        }
      }, [headerBg])

      const bgWidth = backgroundWidth(bgNatural, shellWidth)
      const headerWidth = backgroundWidth(headerNatural, shellWidth)
      let body
      if (route.name === 'game-settings') {
        const game = GAMES.find(function (item) {
          return item.id === route.id
        })
        body = game
          ? h(GameSettings, {
              t: t,
              game: game,
              onBack: backFromGameSettings,
              touch: touch,
              // Deleting a game inside its own settings returns to the time list,
              // not to the settings page it may have been opened from.
              onDeleted: function () {
                setRoute({ name: route.from === 'all' ? 'all' : 'today' })
              },
            })
          : h(TodayView, { t: t, onOpenGame: openGame, touch: touch })
      } else if (route.name === 'settings') {
        body = h(GlobalSettings, {
          t: t,
          onBack: backFromSettings,
          touch: touch,
          onEditGame: function (id) {
            setRoute({ name: 'game-settings', id: id, from: 'settings' })
          },
        })
      } else if (route.name === 'game') {
        const game = GAMES.find(function (item) {
          return item.id === route.id
        })
        body = game
          ? h(DetailView, {
              key: route.id + ':' + route.from + ':' + String(version),
              t: t,
              game: game,
              initialRange: route.from === 'all' ? 'all' : 'day',
              onBack: back,
              onSettings: openGameSettings,
              touch: touch,
            })
          : h(TodayView, { t: t, onOpenGame: openGame, touch: touch })
      } else if (route.name === 'all') {
        body = h(AllView, { t: t, onOpenGame: openGame, touch: touch })
      } else {
        body = h(TodayView, { t: t, onOpenGame: openGame, touch: touch })
      }

      const showTabs = route.name === 'today' || route.name === 'all'

      return h(
        'div',
        {
          ref: shellRef,
          className: 'gt-shell' + (SETTINGS.density === 'compact' ? ' gt-compact' : ''),
          // Width tier drives every container-width rule (see STYLE): the panel
          // is not the browser window, so `@media` would be wrong here.
          'data-w': widthTier(shellWidth),
          style: {
            backgroundColor: baseColor,
            '--gt-surface-alpha': '0.18',
            '--gt-surface-color': hexToRgb(SETTINGS.surfaceColor),
            '--gt-header-height': (SETTINGS.headerHeight || 300) + 'px',
            '--gt-header-fade': (SETTINGS.headerFade === undefined ? 52 : SETTINGS.headerFade) + '%',
          },
        },
        h('style', null, STYLE),
        bgUrl
          ? h('div', {
              className: 'gt-bg',
              style: {
                backgroundImage: 'url("' + bgUrl + '")',
                backgroundSize: bgFit === 'tile' ? 'auto' : bgWidth ? bgWidth + 'px auto' : 'cover',
                backgroundRepeat: bgFit === 'tile' ? 'repeat' : 'no-repeat',
                opacity: String(bgOpacity),
              },
            })
          : null,
        headerBg
          ? h('div', {
              className: 'gt-header-bg',
              style: {
                backgroundImage: 'url("' + headerBg + '")',
                backgroundSize: headerWidth ? headerWidth + 'px auto' : 'cover',
              },
            })
          : null,
        h(
          'div',
          { className: 'gt-top' },
          h(
            'div',
            { className: 'gt-head' },
            h(
              'div',
              { className: 'gt-head-left' },
              h('h2', { className: 'gt-title' }, t('title')),
              h(
                'button',
                {
                  type: 'button',
                  className: 'gt-icon-btn gt-gear' + (refreshing ? ' spinning' : ''),
                  title: t('refresh'),
                  'aria-label': t('refresh'),
                  onClick: refresh,
                },
                h(RefreshIcon, null)
              ),
              showTabs
                ? h(
                    'button',
                    {
                      type: 'button',
                      className: 'gt-icon-btn gt-gear',
                      style: { marginLeft: 6 },
                      title: t('settings'),
                      'aria-label': t('settings'),
                      onClick: openSettings,
                    },
                    h(GearIcon, null)
                  )
                : null,
              LIVE && ACTIVE.length > 0
                ? h(
                    'span',
                    { className: 'gt-live-on' },
                    h('span', { className: 'gt-dot' }),
                    t('live.on') +
                      ' · ' +
                      formatDuration(
                        ACTIVE.reduce(function (sum, item) {
                          return sum + (item.seconds || 0)
                        }, 0),
                        t
                      )
                  )
                : null,
              h('span', { className: 'gt-demo' }, LIVE ? t('live.badge') : t('demo'))
            ),
            h(
              'div',
              { className: 'gt-head-right' },
              showTabs
                ? h(
                    'div',
                    { className: 'gt-tabs' },
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'gt-tab',
                        'data-active': route.name === 'today',
                        onClick: function () {
                          setRoute({ name: 'today' })
                        },
                      },
                      t('tab.today')
                    ),
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'gt-tab',
                        'data-active': route.name === 'all',
                        onClick: function () {
                          setRoute({ name: 'all' })
                        },
                      },
                      t('tab.all')
                    )
                  )
                : null
            )
          )
        ),
        h(
          'div',
          { style: { position: 'relative', zIndex: 1, flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column' } },
          body
        )
      )
    }

    /* ------------------------------------------------------------------ *
     * Test seam — only the Node render harness defines this global
     * ------------------------------------------------------------------ */

    if (typeof globalThis !== 'undefined' && globalThis.__GT_TEST__) {
      Object.assign(globalThis.__GT_TEST__, {
        GAMES: GAMES,
        PLATFORMS: PLATFORMS,
        SESSIONS: SESSIONS,
        SETTINGS: SETTINGS,
        NOW: NOW,
        setNow: setNow,
        normalizePath: normalizePath,
        backgroundWidth: backgroundWidth,
        smoothPath: smoothPath,
        barTopPath: barTopPath,
        chartColor: chartColor,
        compactDuration: compactDuration,
        draftGameFromResolved: draftGameFromResolved,
        commitGameDraft: commitGameDraft,
        tipSegments: tipSegments,
        tipSegments: tipSegments,
        totalsFor: totalsFor,
        lastPlayedAt: lastPlayedAt,
        activeDaysOf: activeDaysOf,
        averagePerDay: averagePerDay,
        comparePercent: comparePercent,
        activeMean: activeMean,
        widthTier: widthTier,
        playedDaysFor: playedDaysFor,
        playedDaysTotal: playedDaysTotal,
        recordDays: recordDays,
        seriesFor: seriesFor,
        platformBreakdown: platformBreakdown,
        totalsByRange: totalsByRange,
        bucketItems: bucketItems,
        bucketSeries: bucketSeries,
        panAnchor: panAnchor,
        clampAnchor: clampAnchor,
        defaultAnchor: defaultAnchor,
        rangeLabelOf: rangeLabelOf,
        GRAIN_LEVELS: GRAIN_LEVELS,
        BY_PLATFORM: BY_PLATFORM,
        BY_GAME: BY_GAME,
        ALL_SECTIONS: ALL_SECTIONS,
        daysInRange: daysInRange,
        segmentsOf: segmentsOf,
        formatDuration: formatDuration,
        rangeBounds: rangeBounds,
        dayKey: dayKey,
        monthKey: monthKey,
        enabledPlatforms: enabledPlatforms,
        sessionSub: sessionSub,
        applyLiveState: applyLiveState,
        ensureHistory: ensureHistory,
        getHistoryFrom: function () {
          return HISTORY_FROM
        },
        isArchived: isArchived,
        autoArchived: autoArchived,
        autoArchiveConfig: autoArchiveConfig,
        duplicateMap: duplicateMap,
        createGameFromResolved: createGameFromResolved,
        installOwner: installOwner,
        setLastRoute: function (next) {
          LAST_ROUTE = next
        },
        PathField: PathField,
        shortcutUrlFromText: shortcutUrlFromText,
        lnkTargetFromBuffer: lnkTargetFromBuffer,
        Cropper: Cropper,
        ImageField: ImageField,
        TodayView: TodayView,
        StatsRow: StatsRow,
        Ring: Ring,
        setStatsPeriod: function (next) {
          STATS_PERIOD = next
        },
        AllView: AllView,
        HintStrip: HintStrip,
        DetailView: DetailView,
        GlobalSettings: GlobalSettings,
        GameSettings: GameSettings,
        Chart: Chart,
        Page: Page,
        STYLE: STYLE,
      })
    }

    /* ------------------------------------------------------------------ *
     * Plugin entry
     * ------------------------------------------------------------------ */

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        CLIENT_CTX = ctx
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'game-time: dictionaries')
        const boundT = ctx.locale.bind(NS)
        // 'auto' is DSH's own choice (it already follows the system language,
        // with its own fallback). zh / en override it for this panel only.
        const t = function (key) {
          if (SETTINGS.language !== 'zh' && SETTINGS.language !== 'en') return boundT(key)
          const value = (SETTINGS.language === 'zh' ? zh : en)[key]
          return value === undefined ? boundT(key) : value
        }
        TR_FN = t

        ctx.slots.inject('main', () =>
          ctx.slots.register({ name: 'main', key: PANEL_ID, locale: NS, inject: () => ({ t }) }, Page)
        )

        ctx.slots.inject('sidebar.panellist', () =>
          ctx.slots.register(
            { name: 'sidebar.panellist', id: PANEL_ID, order: 12, locale: NS, label: () => t('panel') },
            Glyph
          )
        )

      },
    }
  },
})
