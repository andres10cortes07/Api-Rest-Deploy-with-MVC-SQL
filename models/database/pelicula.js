import { queryObtenerPeliculaId, queryAll } from "./conexion.js";
import { conexion } from "./conexion.js";

export class modeloPelicula {

    static getAll = async () => {
        const [peliculas] = await conexion.query(`${queryAll}`);
        return peliculas
    }

    static getById = async ({id}) => {
        const [pelicula] = await conexion.query(`${queryObtenerPeliculaId}`,[id])

        if(pelicula.length == 0) return false
        else return pelicula
    }

    static getByGenreYear = async ({ genre, year }) => {
        const [peliculas] = await conexion.query(`
        SELECT BIN_TO_UUID(p.id) AS id,
        p.title,
        p.year,
        p.director,
        p.duration,
        p.poster,
        p.rate,
        GROUP_CONCAT(g.name) AS genres
        FROM pelicula p
        JOIN movie_genres mg ON p.id = mg.movie_id
        JOIN genre g ON mg.genre_id = g.id
        WHERE p.year = ?
        AND p.id IN (
            SELECT DISTINCT mg.movie_id
            FROM movie_genres mg
            JOIN genre g ON mg.genre_id = g.id
            WHERE g.name = ?
        )
        GROUP BY p.id, p.title, p.year, p.director, p.duration, p.poster, p.rate;
        `,
            [year, genre]
        )
        return peliculas
    }

    static crearPelicula = async (input) => {
        try {
            // Generar un UUID para la nueva película
            const [[{ uuid }]] = await conexion.query(`SELECT UUID() AS uuid;`);
    
            // Insertar la nueva película en la tabla 'pelicula'
            await conexion.query(`
                INSERT INTO pelicula (id, title, year, director, duration, poster, rate)
                VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?)
            `,
            [uuid, input.title, input.year, input.director, input.duration, input.poster, input.rate]);
    
            // Seleccionar el uuid en BIN (porque asi esta en la tabla movie_genres) que ya tiene la pelicula
            const [[resultRow]] = await conexion.query(`SELECT UUID_TO_BIN('${uuid}') AS binId`);
            const { binId } = resultRow;
            const genreIds = [];
    
            // recorremos el arreglo que contiene el o los generos
            for (const genreName of input.genre) {
                // guardamos el id correspondiente a cada genero
                const [genreResult] = await conexion.query(`
                    SELECT id FROM genre WHERE name = ?
                `, [genreName]);
    
                // si encontro el genero agregamos el id a genreIds
                if (genreResult.length > 0) {
                    const [{ id }] = genreResult;
                    genreIds.push(id);
                }
            }

            // Insertar el binId y el id del genero en un arreglo, 
            // que a su vez se guardara en otro arreglo para mandarlo al movie_genres
            // estructura = [[binId, genreId1], [binId, genreId2]]
            const insertValues = genreIds.map(genreId => [binId, genreId]);
    
            // insertamos el arreglo con el id de la pelicula y del genero
            await conexion.query(`
                INSERT INTO movie_genres (movie_id, genre_id)
                VALUES ?
            `, [insertValues]);
    
            // Consultar la información completa de la nueva película con sus géneros
            const [peliculaResult] = await conexion.query(`${queryObtenerPeliculaId}`, [uuid]);
    
            // Devolver el objeto con los datos de la nueva película
            return peliculaResult[0]
    
        } catch (error) {
            console.error("Error al crear la película");
        }
    }

    static modificarPelicula = async ({id, input}) => {

        const [[pelicula]] = await conexion.query(`${queryObtenerPeliculaId}`, [id])

        if (!pelicula) return false 

        else {
            // OBJETO PARA GUARDAR EL DATO QUE YA TENIA LA PELICULA O EL DATO QUE ESTA DANDO EL USUARIO COMO NUEVO
            const datos = {
                id: pelicula.movie_id,
                title: input.title ?? pelicula.title,
                year: input.year ?? pelicula.year,
                genre: input.genre ?? pelicula.genre,
                director: input.director ?? pelicula.director,
                duration: input.duration ?? pelicula.duration,
                poster: input.poster ?? pelicula.poster,
                rate: input.rate ?? pelicula.rate
            }

            //MODIFICACION DE LAS PELICULAS
            await conexion.query(`
                UPDATE pelicula SET title = ?, year = ?, director = ?, duration = ?, poster = ?, rate = ? WHERE BIN_TO_UUID(id) = ?;       
            `,
                [datos.title, datos.year, datos.director, datos.duration, datos.poster, datos.rate, datos.id]
            );

                // Verificar si se proporcionaron nuevos géneros para la película
                if (input.genre) {
                    // Eliminar los géneros actuales de la película
                    await conexion.query(
                        `
                        DELETE FROM movie_genres
                        WHERE movie_id = UUID_TO_BIN(?);
                        `,
                        [datos.id]
                    );

                    // Insertar los nuevos géneros para la película
                    const insertPromises = input.genre.map(async (genreName) => {
                        await conexion.query(
                            `
                            INSERT INTO movie_genres (movie_id, genre_id)
                            VALUES (UUID_TO_BIN(?), (SELECT id FROM genre WHERE name = ?));
                            `,
                            [datos.id, genreName]
                        );
                    });

                    // Esperar a que todas las inserciones se completen
                    await Promise.all(insertPromises);
                }

            const [peliModificada] = await conexion.query(`${queryObtenerPeliculaId}`, [datos.id]);
            return peliModificada
        }

    }

    static eliminarPelicula = async ({id}) => {
        try {
            await conexion.query(`
                SET SQL_SAFE_UPDATES = 0;
            `);
            await conexion.query(`
                DELETE FROM movie_genres WHERE BIN_TO_UUID(movie_id) = ?; 
            `, [id])
            const result = await conexion.query(`
                DELETE FROM pelicula WHERE BIN_TO_UUID(id) = ?
            `, [id])

            return true
        }
        catch {
            return false
        }
        
    }
}