import { ACCEPTED_ORIGINS } from "../1.app.js";
import { controllerPeliculas } from "../controllers/peliculas.js";

// import para el enrutador para manejar las rutas
import { Router } from "express";
export const routerPeliculas = Router()

//* en este caso no se coloca la ruta "/movies" porque este archivo solo respondera a las rutas que contengan /movies
//? para la peticion de buscar peliculas por genero y año se debe modificar el endpoint principal
routerPeliculas.get("/", controllerPeliculas.getAll)

routerPeliculas.get("/:id", controllerPeliculas.getById)

routerPeliculas.post("/", controllerPeliculas.crearPelicula)

routerPeliculas.delete("/:id", controllerPeliculas.eliminarPelicula)

routerPeliculas.patch("/:id", controllerPeliculas.modificarPelicula)

routerPeliculas.options("/:id", (req, res) => {
    const origin = req.header("origin");
    if(ACCEPTED_ORIGINS.includes(origin)){
        res.header("Access-Control-Allow-Origin", origin)
        res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE")
    }
    res.sendStatus(200)
})