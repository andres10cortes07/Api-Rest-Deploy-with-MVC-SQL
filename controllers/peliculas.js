// import { modeloPelicula } from "../models/local-file-sistem/pelicula.js";
import { modeloPelicula } from "../models/database/pelicula.js";
import { ACCEPTED_ORIGINS } from "../1.app.js";
import { validarModificacionPelicula, validarPelicula } from "../schemas/schemaMovies.js";


export class controllerPeliculas {

    static getAll = async (req, res) => {
        const origin = req.header("origin");
        if(ACCEPTED_ORIGINS.includes(origin) || !origin){
            res.header("Access-Control-Allow-Origin", origin)
        }
    
        const {genre, year} = req.query;
        if(genre && year) {
            const peliculas = await modeloPelicula.getByGenreYear({genre, year})
            res.json(peliculas)
        }
        else {
            const peliculas = await modeloPelicula.getAll()
            res.json(peliculas)
        }
    }

    static getById = async (req, res) => {
        //! captura el id de la peticion
        const {id} = req.params;
        const pelicula = await modeloPelicula.getById({id})
    
        if (pelicula) res.json(pelicula)
        else res.status(404).json({mensaje: "La pelicula no se encontró", codigo: 404})
    }

    static crearPelicula = async (req, res) => {
        const result = validarPelicula(req.body);
        if(result.error) {
            return res.status(400).json({error : JSON.parse(result.error.message)})
        }
    
        const newMovie = await modeloPelicula.crearPelicula(result.data)
        res.status(201).json(newMovie)
    }

    static modificarPelicula = async (req, res) => {
        const result = validarModificacionPelicula(req.body)
    
        if (result.error) {
            return res.status(400).json({error: "Error en la estructura"})
        }
    
        const {id} = req.params;
        const modificacion = await modeloPelicula.modificarPelicula({id, input: result.data})
        if (!modificacion) {
            return res.status(400).json({error: "No se encontro la pelicula"})
        }
        return res.status(200).json(modificacion)
    }

    static eliminarPelicula = async (req, res) =>{
        const origin = req.header("origin");
        if(ACCEPTED_ORIGINS.includes(origin) || !origin){
            res.header("Access-Control-Allow-Origin", origin)
        }
        
        const {id} = req.params
        const eliminacion = await modeloPelicula.eliminarPelicula({id});
        if(eliminacion){
            return res.status(200).json({message: "Pelicula eliminada correctamente"})
        }
        return res.status(400).json({error: "Pelicula no encontrada"})
    }
}