import zod from "zod";
const date = new Date;

    
// creamos el esquema que deberia tener la pelicula con zod
const EsquemaPelicula = zod.object({
    // solo con zod.string() funcionaria, pero si se quiere dar mas contexto de errores
    // al usuario se pueden usar esos casos
    title : zod.string({
        invalid_type_error: "El titulo de la pelicula debe ser un numero",
        required_error: "El titulo es obligatorio"
    }),
    year : zod.number().int().min(1900).max(date.getFullYear()),
    director : zod.string(),
    duration : zod.number().int().positive(),
    rate : zod.number().min(0).max(10),
    poster : zod.string().url({
        message: "Debe ser una url"
    }),
    genre : zod.array(
        zod.enum(["Drama", "Action", "Crime", "Adventure", "Sci-Fi", "Romance", "Animation", "Biography", "Fantasy"]), {
            required_error : "El genero es obligatorio",
            invalid_type_error : "El genero seleccionado no es valido"
        }
    )
})

export const validarPelicula = (object)=>{
    return EsquemaPelicula.safeParse(object)
}

export const validarModificacionPelicula = (object)=>{
    // lo que hace el partial es usar el mismo esquema que se creo pero unicamente validara los elementos que SI le lleguen
    // si le llega titulo, año, genero, validara las tres con las caracteristicas que se le dieron en el esquema principal
    return EsquemaPelicula.partial().safeParse(object)
}

