// Servicio básico de productos para pruebas iniciales
// Puedes extender este servicio según tus necesidades

export class ProductService {
    // Simulación de obtención de productos (puedes cambiar por llamada a API real)
    async getProducts() {
        // Ejemplo de datos simulados
        return [
            { id: 1, name: 'Producto 1', price: 100 },
            { id: 2, name: 'Producto 2', price: 200 },
            { id: 3, name: 'Producto 3', price: 300 }
        ];
    }

    static async getProductsSmall() {
        // Ejemplo de datos simulados para RecentSalesWidget
        return [
            { id: 1, name: 'Producto 1', price: 100, image: 'bamboo-watch.jpg' },
            { id: 2, name: 'Producto 2', price: 200, image: 'black-watch.jpg' },
            { id: 3, name: 'Producto 3', price: 300, image: 'blue-band.jpg' },
            { id: 4, name: 'Producto 4', price: 400, image: 'blue-t-shirt.jpg' },
            { id: 5, name: 'Producto 5', price: 500, image: 'bracelet.jpg' }
        ];
    }
}
