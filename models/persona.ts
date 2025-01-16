// models/models.ts

export interface Persona {
    PersonaID: number;
    Nombre: string;
    Apellidos: string;
    Contrasenia: string;
    CorreoElectronico: string;
  }

export interface Cliente {
  PersonaID: number;
  edad: number;
  ocupacion: string;
  Domicilio: string;
  ciudad: string;
}

export interface Compra {
  CompraID: number;
  ClienteID: number;
  FechaCompra: Date;
  TotalCompra: number;
  MetodoPago: string;
  EstadoPago: string;
}

export interface Producto {
  ID: number;
  Nombre: string;
  Descripcion: string;
  Precio: number;
  Imagen: string;
}

export interface Cita {
  CitaID: number;
  ClienteID: number;
  Fecha_cita: string;
  Hora_cita: string;
  Motivo: string;
  Estado: string;
  Fecha_modificacion: Date;
  comentarios: string;
  AdminID: number;
}



export interface Admin {
  PersonaID: number;
}
