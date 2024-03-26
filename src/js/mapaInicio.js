(function(){
    const lat = 5.0823135;
    const lng = -73.3635705;
    const mapa = L.map('mapa-inicio').setView([lat, lng ], 15);

    let markers = new L.FeatureGroup().addTo(mapa);

    //* Filtros
    let filtros = {
        categoria: '',
        precio: ''
    }

    const categoriasSelect = document.querySelector('#categorias');
    const preciosSelect = document.querySelector('#precios');

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    let propiedades = [];

    //* Filtros de Categoria y Precios
    categoriasSelect.addEventListener('change', e => {
        filtros.categoria = +e.target.value;
        filtrarPropiedades();
    })

    preciosSelect.addEventListener('change', e => {
        filtros.precio = +e.target.value;
        filtrarPropiedades();
    })

    const obtenerPropiedades = async () => {
        try {
            const url = '/api/propiedades';

            const respuesta = await fetch(url)
            .then(inData => inData.json())
            .then(inJsonData => {
                propiedades = inJsonData;
                mostrarPropiedades(inJsonData);
            });

        } catch (error) {
            console.error('Error: ', error);
        }
    }

    

    const mostrarPropiedades = propiedades => {
        //* Mostrar los marker previos
        markers.clearLayers();
    
        propiedades.forEach(pr => {
            //* Agregar los pines
            const marker = new L.marker([pr?.lat, pr?.lng], {
                autoPan: true
            })
            .addTo(mapa)
            .bindPopup(`
                <p class="text-indigo-600 font-bold">${pr?.categoria.nombre}</p>
                <h1 class="text-xl font-extrabold uppercase my-2">${pr?.titulo}</h1>
                <img src="/uploads/${pr?.imagen}" alt="Imagen de la propiedad ${pr?.titulo}">
                <p class="text-gray-600 font-bold">${pr?.precio.nombre}</p>
                <a href="/propiedad/${pr?.id}" class="bg-indigo-600 block p-2 text-center font-bold uppercase text-white">Ver Propiedad</a>
            `);

            markers.addLayer(marker);
        });
    }

    const filtrarPropiedades = () => {
        const resultado = propiedades.filter(filtrarCategoria).filter(filtrarPrecio);
        mostrarPropiedades(resultado);
    }

    const filtrarCategoria = propiedad => filtros.categoria ? propiedad.categoriaId === filtros.categoria : propiedad;
    const filtrarPrecio = propiedad => filtros.precio ? propiedad.precioId === filtros.precio : propiedad;
    

    //! Llamado de funiones
    obtenerPropiedades();
})()