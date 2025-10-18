APP_NAME = just-flying
DEST_DIR = $(HOME)/.local
ICON_DIR = $(HOME)/.local/share/icons/hicolor

.PHONY: all build install

all: build

ci:
	npm ci

build: ci
	npm run tauri build -- --no-bundle

install: build
	mkdir -p $(DEST_DIR)/bin/
	mkdir -p $(DEST_DIR)/share/applications/
	mkdir -p $(ICON_DIR)/32x32/
	mkdir -p $(ICON_DIR)/128x128/
	mkdir -p $(ICON_DIR)/256x256/

	install -Dm755 src-tauri/target/release/$(APP_NAME) $(DEST_DIR)/bin/$(APP_NAME)
	install -Dm644 src-tauri/$(APP_NAME).desktop $(DEST_DIR)/share/applications/$(APP_NAME).desktop
	
	install -Dm644 src-tauri/icons/32x32.png $(ICON_DIR)/32x32/$(APP_NAME).png
	install -Dm644 src-tauri/icons/128x128.png $(ICON_DIR)/128x128/$(APP_NAME).png
	install -Dm644 src-tauri/icons/128x128@2x.png $(ICON_DIR)/256x256/$(APP_NAME).png

