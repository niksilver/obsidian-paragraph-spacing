SRC=*
DEST=/mnt/c/Users/nik/Obsidian/Games/.obsidian/plugins/obsidian-paragraph-spacing

install:
	# Add --dry-run if you're not sure
	rsync --verbose -r ${SRC} ${DEST}
