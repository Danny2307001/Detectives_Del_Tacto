import React from "react";
import useModoUsuario from "./ModoUsuario";
import UsuarioVista from "./UsuarioVista";
import JuegoSimon from "./Juegos/JuegoSimon/JuegoSimon";
import JuegoDetective from "./Juegos/JuegoDetective/JuegoDetective";
import JuegoMisionUtil from "./Juegos/JuegoMisionUtil/JuegoMisionUtil";

export default function Usuario({ objetos, audioActivo, microfonoActivo }) {
  const logic = useModoUsuario(objetos, audioActivo, microfonoActivo);

  if (logic.pantalla === "juegoSimon") {
    return (
      <JuegoSimon
        objetos={objetos}
        onBackToMenu={() => logic.setPantalla("menuJuegos")}
        audioActivo={audioActivo}
        microfonoActivo={microfonoActivo}
        speak={logic.speak}
      />
    );
  }

  if (logic.pantalla === "juegoDetective") {
    return (
      <JuegoDetective
        objetos={objetos}
        onBackToMenu={() => logic.setPantalla("menuJuegos")}
        audioActivo={audioActivo}
        microfonoActivo={microfonoActivo}
        speak={logic.speak}
      />
    );
  }

  if (logic.pantalla === "juegoMisionUtil") {
    return (
      <JuegoMisionUtil
        objetos={objetos}
        onBackToMenu={() => logic.setPantalla("menuJuegos")}
        audioActivo={audioActivo}
        microfonoActivo={microfonoActivo}
        speak={logic.speak}
      />
    );
  }

  return (
    <UsuarioVista
      {...logic}
      objetos={objetos}
      setPantalla={logic.setPantalla}
      onBackToInicio={() => logic.setPantalla("bienvenida")}
    />
  );
}