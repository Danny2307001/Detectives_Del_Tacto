import React from "react";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVolumeUp,
  FaVolumeMute,
} from "react-icons/fa";
import "./ControlesAudio.css";

export default function ControlesAudio({
  microfonoActivo,
  setMicrofonoActivo,
  audioActivo,
  setAudioActivo,
}) {
  return (
    <div className="controles-audio">
      <button
        className={`control-audio-btn ${microfonoActivo ? "activo" : "inactivo"}`}
        onClick={() => setMicrofonoActivo(!microfonoActivo)}
      >
        {microfonoActivo ? <FaMicrophone /> : <FaMicrophoneSlash />}
        {microfonoActivo ? "Micro ON" : "Micro OFF"}
      </button>

      <button
        className={`control-audio-btn ${audioActivo ? "activo" : "inactivo"}`}
        onClick={() => setAudioActivo(!audioActivo)}
      >
        {audioActivo ? <FaVolumeUp /> : <FaVolumeMute />}
        {audioActivo ? "Audio ON" : "Audio OFF"}
      </button>
    </div>
  );
}