/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/mapaInicio.js":
/*!******************************!*\
  !*** ./src/js/mapaInicio.js ***!
  \******************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n(function(){\r\n    const lat = 5.0823135;\r\n    const lng = -73.3635705;\r\n    const mapa = L.map('mapa-inicio').setView([lat, lng ], 15);\r\n\r\n    let markers = new L.FeatureGroup().addTo(mapa);\r\n\r\n    //* Filtros\r\n    let filtros = {\r\n        categoria: '',\r\n        precio: ''\r\n    }\r\n\r\n    const categoriasSelect = document.querySelector('#categorias');\r\n    const preciosSelect = document.querySelector('#precios');\r\n\r\n    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {\r\n        attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors'\r\n    }).addTo(mapa);\r\n\r\n    let propiedades = [];\r\n\r\n    //* Filtros de Categoria y Precios\r\n    categoriasSelect.addEventListener('change', e => {\r\n        filtros.categoria = +e.target.value;\r\n        filtrarPropiedades();\r\n    })\r\n\r\n    preciosSelect.addEventListener('change', e => {\r\n        filtros.precio = +e.target.value;\r\n        filtrarPropiedades();\r\n    })\r\n\r\n    const obtenerPropiedades = async () => {\r\n        try {\r\n            const url = '/api/propiedades';\r\n\r\n            const respuesta = await fetch(url)\r\n            .then(inData => inData.json())\r\n            .then(inJsonData => {\r\n                propiedades = inJsonData;\r\n                mostrarPropiedades(inJsonData);\r\n            });\r\n\r\n        } catch (error) {\r\n            console.error('Error: ', error);\r\n        }\r\n    }\r\n\r\n    \r\n\r\n    const mostrarPropiedades = propiedades => {\r\n        //* Mostrar los marker previos\r\n        markers.clearLayers();\r\n    \r\n        propiedades.forEach(pr => {\r\n            //* Agregar los pines\r\n            const marker = new L.marker([pr?.lat, pr?.lng], {\r\n                autoPan: true\r\n            })\r\n            .addTo(mapa)\r\n            .bindPopup(`\r\n                <p class=\"text-indigo-600 font-bold\">${pr?.categoria.nombre}</p>\r\n                <h1 class=\"text-xl font-extrabold uppercase my-2\">${pr?.titulo}</h1>\r\n                <img src=\"/uploads/${pr?.imagen}\" alt=\"Imagen de la propiedad ${pr?.titulo}\">\r\n                <p class=\"text-gray-600 font-bold\">${pr?.precio.nombre}</p>\r\n                <a href=\"/propiedad/${pr?.id}\" class=\"bg-indigo-600 block p-2 text-center font-bold uppercase text-white\">Ver Propiedad</a>\r\n            `);\r\n\r\n            markers.addLayer(marker);\r\n        });\r\n    }\r\n\r\n    const filtrarPropiedades = () => {\r\n        const resultado = propiedades.filter(filtrarCategoria).filter(filtrarPrecio);\r\n        mostrarPropiedades(resultado);\r\n    }\r\n\r\n    const filtrarCategoria = propiedad => filtros.categoria ? propiedad.categoriaId === filtros.categoria : propiedad;\r\n    const filtrarPrecio = propiedad => filtros.precio ? propiedad.precioId === filtros.precio : propiedad;\r\n    \r\n\r\n    //! Llamado de funiones\r\n    obtenerPropiedades();\r\n})()\n\n//# sourceURL=webpack://bienesraicesmvc/./src/js/mapaInicio.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/js/mapaInicio.js"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;