import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BotonEliminarReserva } from "./boton-eliminar";
import { BotonCancelarReserva } from "./boton-cancelar"; //Ej1
import { BotonConfirmarReserva } from "./boton-confirmar"; //Ej2
import { tarjeta } from "@/app/lib/estilos";

const etiquetaEstado: Record<string, string> = {
    pendiente: "bg-yellow-50 text-yellow-700 border-yellow-200",
    confirmada: "bg-green-50 text-green-700 border-green-200",
    cancelada: "bg-gray-100 text-gray-500 border-gray-200",
};

// Ejercicio complementario: Filtrado por estado usando searchParams y Prisma
export default async function PaginaReservas({
    searchParams,
}: {
    searchParams?: { estado?: string };
}) {
    const estado = searchParams?.estado;

    const where =
        estado && ["pendiente", "confirmada", "cancelada"].includes(estado)
            ? { estado }
            : {};

    const reservas = await prisma.reserva.findMany({
        where,
        orderBy: { fecha: "asc" },
        include: { servicio: true },
    });
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold">Reservas</h1>
                    {/* Filtros por estado en la URL: /reservas?estado=pendiente */}
                    <div className="mt-2 flex gap-2 text-xs">
                        <Link
                            href="/reservas"
                            className={`px-2 py-1 rounded border ${!estado ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600"}`}
                        >
                            Todas
                        </Link>
                        <Link
                            href="/reservas?estado=pendiente"
                            className={`px-2 py-1 rounded border ${estado === "pendiente"
                                    ? "bg-yellow-500 text-white border-yellow-500"
                                    : "border-gray-300 text-gray-600"
                                }`}
                        >
                            Pendientes
                        </Link>
                        <Link
                            href="/reservas?estado=confirmada"
                            className={`px-2 py-1 rounded border ${estado === "confirmada"
                                    ? "bg-green-600 text-white border-green-600"
                                    : "border-gray-300 text-gray-600"
                                }`}
                        >
                            Confirmadas
                        </Link>
                        <Link
                            href="/reservas?estado=cancelada"
                            className={`px-2 py-1 rounded border ${estado === "cancelada"
                                    ? "bg-gray-500 text-white border-gray-500"
                                    : "border-gray-300 text-gray-600"
                                }`}
                        >
                            Canceladas
                        </Link>
                    </div>
                </div>
                <Link
                    href="/reservas/nueva"
                    className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800
transition-colors"
                >
                    Nueva reserva
                </Link>
            </div>
            {reservas.length === 0 ? (
                <p className="text-sm text-gray-400">No hay reservas registradas.</p>
            ) : (
                <ul className="space-y-3">
                    {reservas.map((reserva) => (
                        <li
                            key={reserva.id}
                            className={`${tarjeta} flex items-start justify-between`}
                        >
                            <div>
                                <p className="font-medium text-sm">{reserva.nombre}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{reserva.correo}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {reserva.servicio.nombre} —{" "}
                                    {new Date(reserva.fecha).toLocaleString("es-SV")}
                                </p>
                                <span
                                    className={`inline-block mt-2 text-xs px-2 py-0.5 rounded border ${etiquetaEstado[reserva.estado] ?? etiquetaEstado.pendiente
                                        }`}
                                >
                                    {reserva.estado}
                                </span>
                            </div>
                            <BotonEliminarReserva id={reserva.id} />
                            <BotonCancelarReserva id={reserva.id} />
                            <BotonConfirmarReserva id={reserva.id} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}