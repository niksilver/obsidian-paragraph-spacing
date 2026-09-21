# To do

Change dense mode to paragraph spacing.


# Done

Remove pinning:
- command.pin, command.unpin
- notice.pinned, notice.unpinned
- settings.reset.desc - update
- Remove commands set-width-for-note, clear-width-for-note
- Remove functions pinCurrentNote, clearNotePin
- Replace effectivePresent() - inline it in one place, should be removed elsewhere.
- Remove settings.rememberPerNote
- settings.perNote.*
- settings.pinned.*

Remove width functionality:
- notice.width - remove
- preset.w*, preset.custom - remove
- settings.usage - Update description.
- settings.mode.desc - Update description.
- settings.custom.* - remove
- settings.preview.* - remove
- settings.width.* - remove
- Remove function classForPreset
- WIDTH_CLASSES, PRESETS - remove
- dense-w* - remove
- settings.customWidth - remove
- In DEFAULT_SETTINGS remove widthPreset, customWidth
- Remove commands cycle-width
- Remove functions presetLabel, clampWidth, setCustomWidth, setPreset
- applyClasses() - remove redundant code.
- Remove new Setting(...) for settings.width.name, settings.custom.name
- Remove 'Real-time preview' block
- Remove function updatePreview
- Remove --dense-width-value
