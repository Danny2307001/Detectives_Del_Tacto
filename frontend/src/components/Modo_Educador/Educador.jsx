import React from "react";
import useModoEducador from "./ModoEducador";
import EducadorMisiones from "./EducadorMisiones";
import EducadorMisionDetalle from "./EducadorMisionDetalle";
import "./Educador.css";

export default function Educador({ objetos, onCreated, audioActivo, microfonoActivo }) {
  const logic = useModoEducador(objetos, onCreated, audioActivo, microfonoActivo);

  if (!logic.temaActual) {
    return (
      <EducadorMisiones
        objetos={objetos}
        {...logic}
      />
    );
  }

  return (
    <EducadorMisionDetalle
      objetos={objetos}
      {...logic}
    />
  );
}