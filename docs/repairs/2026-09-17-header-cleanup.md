# Skills / header cleanup

Removed the live Workspace portfolio note. SkillInventoryLayout now accepts an optional note and renders no paragraph (or extra grid row) when absent. Demo disclosure remains in demo.

Topbar renders DemoControls only when AccountContext mode is demo, preventing nonfunctional simulated-role/dataset controls from appearing in authenticated real workspaces.

Production backup: /tmp/newneo-before-header-cleanup.tgz. Only three UI components changed; no account/session state or records modified.
