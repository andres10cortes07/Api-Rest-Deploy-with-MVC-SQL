import mysql from "mysql2/promise";

const config = {
    host: "localhost",
    password: "password;)",
    user: "root",
    port: 3350,
    bd: "peliculasBD"
}

export const queryObtenerPeliculaId = `
SELECT BIN_TO_UUID(p.id) AS movie_id,
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
WHERE BIN_TO_UUID(p.id) = ?
GROUP BY p.id, p.title, p.year, p.director, p.duration, p.poster, p.rate;
`;

export const queryAll = `
SELECT BIN_TO_UUID(p.id) AS movie_id,
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
GROUP BY p.id, p.title, p.year, p.director, p.duration, p.poster, p.rate;
`

export const conexion = await mysql.createConnection(config)
conexion.query(`USE ${config.bd}`)