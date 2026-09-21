import { useEffect, useState, useRef } from "react";
import Draggable from "react-draggable";
import "./Floating.css";
import pushpin_up from "../assets/pushpin_up.png";
import pushpin_down from "../assets/pushpin_down.png";

import { listen } from "@tauri-apps/api/event";
import { invoke, isTauri } from "@tauri-apps/api/core";

type TrackMetadata = {
  title: string | null;
  artists: string[];
  album: string | null;
  art_url: string | null;
};

export function MusicPlayer() {
  const dragRef = useRef(null);
  const [alwaysVisible, setAlwaysVisible] = useState(false);
  const [metadata, setMetadata] = useState<TrackMetadata | null>(null);

  useEffect(() => {
    if (!isTauri()) {
      return;
    }

    const unlisten = listen<TrackMetadata>(
      "mpris://metadata-changed",
      (event) => {
        setMetadata(event.payload);
      }
    );

    invoke("start_mpris_listener")
      .catch((e) => {
        console.error("ERROR STARTINT MPRIS EVENT GETTER", e);
      })

    invoke<TrackMetadata | null>("get_current_track")
      .then((track) => {
        if (track) {
          setMetadata(track)
        }
      })
      .catch((e) => {
        console.error("ERROR GETTING CURRENT TRACK", e)
      })

    return () => {
      unlisten
        .then((fn) => fn())
        .catch((e) => { console.error("ERROR CREATING LISTENER", e) })
    };
  }, []);

  return (
    <Draggable handle=".floating" nodeRef={dragRef}>
      <form style={{ top: "5%", left: "5%", display: "inline-table" }} ref={dragRef} className={`floating ${alwaysVisible ? "always-visible" : ""}`}>
        <img
          className="icon"
          src={alwaysVisible ? pushpin_down : pushpin_up}
          onClick={() => setAlwaysVisible((value) => !value)}
        />
        <fieldset>
          <legend>
            <b>Now Playing</b>
          </legend>

          {metadata ? (
            <>
              <div style={{ textAlign: "center" }}>
                <img
                  src={metadata?.art_url || ""}
                  alt="Album Art"
                  style={{ width: "100px", height: "100px", borderRadius: "50%", marginBottom: "10px" }}
                  className="spinning"
                />
                <div>
                  <b>{metadata?.title || "-"}</b>
                </div>
                <div className="muted">
                  <span>{metadata?.artists.join(", ")}</span>
                  {" - "}
                  <span>{metadata?.album}</span>
                </div>
              </div>
            </>
          ) : (
            <h1>¡¡Play Something!!</h1>
          )}
        </fieldset>
      </form>
    </Draggable >
  );
}
