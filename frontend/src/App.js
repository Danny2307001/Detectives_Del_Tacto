import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { getObjetos } from "./api/objetosApi";

import Home from "./components/Home/Home";
import Educador from "./components/Modo_Educador/Educador";
import ModoUsuario from "./components/Modo_Usuario/Usuario";
import ControlesAudio from "./components/ControlesAudio/ControlesAudio";

export default function App() {
  const [objetos, setObjetos] = useState([]);
  const [microfonoActivo, setMicrofonoActivo] = useState(true);
  const [audioActivo, setAudioActivo] = useState(true);

  async function cargar() {
    const data = await getObjetos();
    setObjetos(data);
  }

  useEffect(() => {
    cargar();
  }, []);

  return (
    <>
      <ControlesAudio
        microfonoActivo={microfonoActivo}
        setMicrofonoActivo={setMicrofonoActivo}
        audioActivo={audioActivo}
        setAudioActivo={setAudioActivo}
      />
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/educador"
          element={
            <Educador
              objetos={objetos}
              onCreated={cargar}
              audioActivo={audioActivo}
              microfonoActivo={microfonoActivo}
            />
          }
        />

        <Route
          path="/usuario"
          element={
            <ModoUsuario
              objetos={objetos}
              audioActivo={audioActivo}
              microfonoActivo={microfonoActivo}
            />
          }
        />
      </Routes>
    </>
  );
}