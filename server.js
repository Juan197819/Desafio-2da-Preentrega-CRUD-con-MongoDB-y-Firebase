import express, { Router } from "express";
import productosLista from "./arrayDeProductosParaTesting.js";
import { daoProducto, daoCarrito } from "./src/index.js";

const app = express()
const routerProductos = Router(); 
const routerCarrito = Router();  

let administrador=true;

app.use('/api/productos', routerProductos)
app.use('/api/carritos', routerCarrito)

routerProductos.use(express.json());
routerProductos.use(express.urlencoded({ extended: true }));
routerCarrito.use(express.json());
routerCarrito.use(express.urlencoded({ extended: true }));

//-----------MIDDLEWARE USUARIO----------

const adminok= (req, res,next)=>{
    if (administrador) {
        console.log('Usuario Habilitado')
        next()
    }else{
        console.log('Usuario No valido');
        res.json({error: -1, descripcion: 'ruta /api/productos metodo no valido'})
    }
}
//--------------PRODUCTOS------------------

let prod = productosLista; 

//-----------------area de pruebas borrar--------------

//-------------------------------------------------
routerProductos.get('/:id?', async (req, res) => {
    try { 
        const id= req.params.id;
        let resultado = await daoProducto.leer(id)
        if (!resultado.length) {
            res.json("Producto no existente")
        }else{
            res.json(resultado);
        }
    } catch (error) {
        console.log(error)
        res.json(error)
    }
})

routerProductos.post('/', adminok, async (req, res) => {
    try {
        let producto = req.body
        producto.timestamp= Date.now()
        prod = await daoProducto.guardar(producto)
        console.log(prod); 
        res.json('Producto Creado Exitosamente')
    } catch (error) {
        console.log(error)
        res.json(error)
    }
})

routerProductos.put('/:id', adminok, async (req, res) => {
    try {
        const id = req.params.id;
        let isExist = await daoProducto.leer(id)
        if (!isExist.length) {
            res.json("Producto no existente (metodo PUT)")
        }else{
            console.log('este se el isEXIST,',...isExist)
            const newProduct= req.body
            newProduct.timestamp= Date.now()
            const productoModificado = await daoProducto.modificar(...isExist,newProduct,'$set')
            console.log(productoModificado)
            res.json('Producto Modificado Exitosamente')
        }
    } catch (error) {
        console.log(error)
        res.json(error)
    }
})

routerProductos.delete('/:id', adminok, async (req, res) => {
   try {  
       const id = req.params.id;
       let isExist = await daoProducto.leer(id)

        if (!isExist.length) {
            res.json("Producto no existente (metodo DELETE)")
        } else {
            const prod = await daoProducto.eliminar(id)
            console.log(prod)
            res.json('Producto Eliminado Exitosamente')
        }
   } catch (error) {
    console.log(error)
    res.json(error)
   }
});

//--------------CARRITO------------------

routerCarrito.post('/', async (req, res) => {
    try {
        const nuevoCarrito = {
            timestamp: Date.now(), 
            productos: [],
        }
        const carritoAgregado = await daoCarrito.guardar(nuevoCarrito)
        console.log(carritoAgregado)
        res.json('Carrito creado con exito')
    } catch (error) {
        console.log(error)
        res.json(error)
    }
}) 

routerCarrito.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id
        // 1ro VACIADO DE CARRITO
        const carritoEnUso= await daoCarrito.leer(id)
        if (!carritoEnUso.length) {
            res.json("Carrito Inexistente, imposible borrarlo")
        } else {
            const VaciadoDeCarrito= await daoCarrito.modificar(...carritoEnUso,{productos:[]},'$set')
            // 2do ELIMINACION DE CARRITO
            const carritoEliminado= await daoCarrito.eliminar(id)
            console.log(carritoEliminado)
            res.json('Carrito Eliminado Correctamente')
        }   
    } catch (error) {
        console.log(error)
        res.json(error)
    }    
})

routerCarrito.get('/:id/productos', async (req, res) => {
    try {
        const id = req.params.id
        let carritoActual= await daoCarrito.leer(id)

        if (!carritoActual.length) {
            res.json("Carrito Inexistente (METODO GET)") 
        } else {
            [carritoActual]=carritoActual
            res.json(carritoActual.productos)
        }
    } catch (error) {
        console.log(error)
        res.json(error)
    }
}) 

routerCarrito.get('/:id?', async(req, res) => {
    try {
        res.json(await daoCarrito.leer(req.params.id))
    } catch (error) {
        console.log(error)
        res.json(error)
    }
}) 

routerCarrito.post('/:id/productos', async(req, res) => {
    try {
        const id = req.params.id
        let carritoActual= await daoCarrito.leer(id)
        let producto = req.body
        if (!carritoActual.length) {
            res.json("Carrito inexistente,no se puede agregar productos")
        }else{   
            const VaciadoDeCarrito= await daoCarrito.modificar(...carritoActual,{productos: producto},'$push')
            console.log(VaciadoDeCarrito)
            res.json("Producto agregado al Carrito")
        }
    } catch (error) {
        console.log(error)
        res.json(error)
    }
})

routerCarrito.delete('/:id/productos/:id_prod', async(req, res) => {
    try {
        let id =req.params.id;
        let id_prod =req.params.id_prod;
        let carritoActual= await daoCarrito.leer(id)
        if (!carritoActual.length) {
            res.json('Carrito Inexistente, imposible borrar productos')
        } else {

            const productoParaBorrar= carritoActual[0].productos.find(producto=>producto._id==id_prod)

            if (productoParaBorrar) {
                const newCarrito= carritoActual[0].productos.filter(producto=>producto._id!=id_prod)
                let carritoActual2= await daoCarrito.modificar(...carritoActual, {productos:newCarrito},'$set')

                console.log(carritoActual2)
                res.json('Producto Eliminado del Carrito Correctamente')
            } else {
                res.json('Producto Inexistente, elija otro producto del carrito para borrar')
            }
        }
    } catch (error) {
        console.log(error)
        res.json(error)
    }
})

//-------------RUTAS POR DEFAULT------------

const errorRuta= {error: -2, descripcion: `ruta no implementada`}

app.route('*')
    .post((req,res)=>{
        res.json(errorRuta)
    })
    .get((req,res)=>{
        res.json(errorRuta)
    })
    .delete((req,res)=>{
        res.json(errorRuta)
    })
    .put((req,res)=>{
        res.json(errorRuta)
    })
const PORT = process.env.PORT

const server = app.listen(PORT, ()=>{
    console.log(`Conectado en el puerto ${server.address().port}`);
})
server.on("error", error => console.log(`El error fue ${error}`))