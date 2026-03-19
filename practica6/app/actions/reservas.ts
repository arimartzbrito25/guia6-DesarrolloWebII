"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Esquema de validación para el formulario de reserva.
// El servicioId llega como string desde el select y se convierte a número con z.coerce.
const EsquemaReserva = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio."),
  correo: z.string().email("El correo no es válido."),
  fecha: z.string().min(1, "La fecha es obligatoria."),
  servicioId: z.coerce.number({ message: "Debe seleccionar un servicio." }),
});

type EstadoReserva = {
  errores: Record<string, string[] | undefined>;
  mensaje: string;
};

// Crea una nueva reserva asociada a un servicio existente.
// La fecha se convierte de string a objeto Date antes de guardarse en la base de datos.
export async function crearReserva(_estadoPrevio: EstadoReserva, formData: FormData) {
  const campos = EsquemaReserva.safeParse({
    nombre: formData.get("nombre"),
    correo: formData.get("correo"),
    fecha: formData.get("fecha"),
    servicioId: formData.get("servicioId"),
  });

  // Si la validación falla, se retorna el objeto de errores al componente.
  if (!campos.success) {
    return {
      errores: campos.error.flatten().fieldErrors,
      mensaje: "Error de validación.",
    };
  }

  // Ejercicio complementario: Validación de disponibilidad
  // Antes de crear la reserva, verificamos si ya existe otra reserva para el mismo
  // servicio en un horario que se cruce, considerando la duración del servicio.
  const servicio = await prisma.servicio.findUnique({
    where: { id: campos.data.servicioId },
  });

  if (!servicio) {
    return {
      errores: {
        servicioId: ["El servicio seleccionado no existe."],
      },
      mensaje: "Error de validación.",
    };
  }

  const nuevaFechaInicio = new Date(campos.data.fecha);
  const nuevaFechaFin = new Date(
    nuevaFechaInicio.getTime() + servicio.duracion * 60_000
  );

  const reservasExistentes = await prisma.reserva.findMany({
    where: {
      servicioId: campos.data.servicioId,
      // Opcional: ignorar reservas canceladas
      NOT: { estado: "cancelada" },
    },
    include: {
      servicio: true,
    },
  });

  const hayConflicto = reservasExistentes.some((reserva) => {
    const inicio = new Date(reserva.fecha);
    const fin = new Date(
      inicio.getTime() + reserva.servicio.duracion * 60_000
    );

    // Hay conflicto si los intervalos [inicio, fin) se solapan
    return nuevaFechaInicio < fin && nuevaFechaFin > inicio;
  });

  if (hayConflicto) {
    return {
      errores: {
        fecha: ["Ya existe una reserva para este servicio en ese horario."],
      },
      mensaje: "Conflicto de horario.",
    };
  }

  await prisma.reserva.create({
    data: {
      nombre: campos.data.nombre,
      correo: campos.data.correo,
      fecha: new Date(campos.data.fecha),
      servicioId: campos.data.servicioId,
    },
  });

  revalidatePath("/reservas");
  redirect("/reservas");
}


// Elimina una reserva por ID.
// Retorna un objeto de resultado para que el componente pueda mostrar un error si falla.
export async function eliminarReserva(id: number) {
  try {
    await prisma.reserva.delete({ where: { id } });
    revalidatePath("/reservas");
    return { exito: true };
  } catch {
    return { exito: false, mensaje: "No se pudo eliminar la reserva." };
  }
}

//Ejercicio 1: Cancelar reserva
export async function cancelarReserva(id: number) {
  try {
    await prisma.reserva.update({
      where: { id },
      data: { estado: "cancelada" },
    });

    revalidatePath("/reservas");

    return { exito: true };
  } catch (error) {
    return {
      exito: false,
      mensaje: "No se pudo cancelar la reserva",
    };
  }
}

//Ejercicio 2: Confirmar reservas
export async function confirmarReserva(id: number) {
  try {
    await prisma.reserva.update({
      where: { id },
      data: { estado: "confirmada" },
    });

    revalidatePath("/reservas");

    return { exito: true };
  } catch (error) {
    return {
      exito: false,
      mensaje: "No se pudo confirmar",
    };
  }
}