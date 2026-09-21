use mpris::{PlaybackStatus, Player, PlayerFinder};
use serde::Serialize;
use tauri::{AppHandle, Emitter};

#[derive(Debug, Clone, Serialize)]
pub struct TrackMetadata {
    pub title: Option<String>,
    pub artists: Vec<String>,
    pub album: Option<String>,
    pub art_url: Option<String>,
}

fn metadata_to_track(metadata: &mpris::Metadata) -> TrackMetadata {
    TrackMetadata {
        title: metadata.title().map(String::from),
        artists: metadata
            .artists()
            .unwrap_or_default()
            .iter()
            .map(|artist| artist.to_string())
            .collect(),
        album: metadata.album_name().map(String::from),
        art_url: metadata.art_url().map(String::from),
    }
}

fn find_active_player(finder: &PlayerFinder) -> Option<Player> {
    finder
        .iter_players()
        .ok()?
        .filter_map(|player| player.ok())
        // Ignorar Chromium y playerctld
        .filter(|player| {
            let name = player.bus_name_trimmed();

            !name.starts_with("chromium.") && name != "playerctld"
        })
        // Buscar uno que esté reproduciendo
        .find(|player| matches!(player.get_playback_status(), Ok(PlaybackStatus::Playing)))
}

#[tauri::command]
pub fn start_mpris_listener(app: AppHandle) {
    std::thread::spawn(move || {
        let finder = match PlayerFinder::new() {
            Ok(finder) => finder,
            Err(error) => {
                eprintln!("Error creando PlayerFinder: {error}");
                return;
            }
        };

        let player = match find_active_player(&finder) {
            Some(player) => player,
            None => {
                eprintln!("No se encontró un reproductor MPRIS activo");
                return;
            }
        };

        let events = match player.events() {
            Ok(events) => events,
            Err(error) => {
                eprintln!("Error obteniendo eventos MPRIS: {error}");
                return;
            }
        };

        for event in events {
            match event {
                Ok(mpris::Event::TrackChanged(metadata)) => {
                    let metadata = metadata_to_track(&metadata);

                    println!("Metadata: {metadata:?}");

                    app.emit("mpris://metadata-changed", metadata).unwrap();

                    //if let Err(error) = app.emit("mpris://metadata-changed", metadata) {
                    //    eprintln!("Error enviando evento: {error}");
                    //}
                }

                Ok(event) => {
                    println!("MPRIS event: {event:?}");
                }

                Err(error) => {
                    eprintln!("Error recibiendo evento MPRIS: {error}");
                }
            }
        }
    });
}

#[tauri::command]
pub fn get_current_track() -> Option<TrackMetadata> {
    let finder = match PlayerFinder::new() {
        Ok(finder) => finder,
        Err(error) => {
            eprintln!("Error creando PlayerFinder: {error}");
            return None;
        }
    };

    let player = find_active_player(&finder)?;

    match player.get_metadata() {
        Ok(metadata) => Some(metadata_to_track(&metadata)),
        Err(error) => {
            eprintln!("Error obteniendo metadata: {error}");
            None
        }
    }
}
