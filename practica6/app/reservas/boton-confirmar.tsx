//Ejercicio 2: Botón para confirmar reserva
"use client";

import { confirmarReserva } from "@/app/actions/reservas";
import { useState } from "react";

export function BotonConfirmarReserva({ id }: { id: number }) {
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    const res = await confirmarReserva(id);

    if (!res.exito) {
      setError(res.mensaje ?? "Error");
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        className="text-xs text-green-600 hover:text-green-800"
      >
        Confirmar
      </button>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}