//Ejercicio 1: Botón para cancelar reserva
"use client";

import { cancelarReserva } from "@/app/actions/reservas";
import { useState } from "react";

export function BotonCancelarReserva({ id }: { id: number }) {
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    const res = await cancelarReserva(id);

    if (!res.exito) {
      setError(res.mensaje ?? "Error");
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        className="text-xs text-gray-500 hover:text-black"
      >
        Cancelar
      </button>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}