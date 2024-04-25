import express, { json } from "express";
const app = express();
import { routerPeliculas } from "./routes/peliculas.js";


app.disable("x-powered-by")

app.use(json())

export const ACCEPTED_ORIGINS = [
    "http://localhost:8080", 
    "http://localhost:4999",
    "http://localhost:4999/peliculas",
    "http://localhost:8080/peliculas",
    "https://rest-api-deploy-s8m8.onrender.com",
    "http://enlaces-de-produccion/"
]


app.use("/peliculas", routerPeliculas);

const PORT = process.env.PORT ?? 4999
app.listen(PORT, ()=>{
    console.log(`Server listening port http://localhost:${PORT}`)
})