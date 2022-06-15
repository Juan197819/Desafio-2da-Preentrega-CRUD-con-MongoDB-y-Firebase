import 'dotenv/config'

let daoCarrito,daoProducto
console.log(process.env.PERSISTENCIA)

switch (process.env.PERSISTENCIA) {
    case 'mongodb':
        const {default: DaoProductosMongo}= await import('./daos/productos/productosDaoMongoDB.js')    
        const {default: DaoCarritosMongo} = await import('./daos/carritos/carritosDaoMongoDB.js')    

        daoProducto= new DaoProductosMongo() 
        daoCarrito = new DaoCarritosMongo()
        break;
    case 'firebase':
        const {default: DaoProductosFirebase}= await import('./daos/productos/productosDaoFirebase.js')    
        const {default: DaoCarritosFirebase} = await import('./daos/carritos/carritosDaoFirebase.js')

        daoProducto= new DaoProductosFirebase()
        daoCarrito = new DaoCarritosFirebase()
        break;

    default:
        break;
}

export {daoProducto,daoCarrito}