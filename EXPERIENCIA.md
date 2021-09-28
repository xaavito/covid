# Experiencia personal del proyecto
Antes que nada gracias por dejarme participar, mas alla del resultado.

Primero fue la experiencia de volver a trabajar con Node y React, que si bien trabje hace tiempo no fue durante mucho pero me gusto muchisimo.

Volver fue super interesante, pero como todo, no es algo que domine al 100% por eso tuve ciertos limitantes.

Como BD use Mongodb, que la use bastante pero mediante apis que escondian bastante el funcionamiento interno.
Aca fue instalarla, primero local despues via docker, y aprender a usarla, tirar queries, etc.

La aplicacion es un Server-Client que se lanzan al mismo tiempo, podria mejorarse seguramente. Node - React con algunos elementos de Material.

Ni bien se arranca la aplicacion y la BD que esta en un docker, se importa un set de datos previos, por que?

La respuesta es que si bien el codigo que se usa para el sync que actualiza podria encargarse bien de todo, el script mongoimport anda mucho mas que bien.
Quizas si estaria bueno que se cargue todo con el sync, pero no llegue a probarlo.

***EL set que deje en github es del 22-9, a la vez tiene una limpieza de casos NO COVID, 1 a 4 es la proporcion de registros***

El filtro realiza las busquedas que reciden en la coleccion "casos_1" de mongodb, y siempre se pivotea sobre unos metadatos en otra coleccion que se llama "misc", esa tiene ultima actualizacion, registros agregado y ultimo id_evento agregado, que es una especie de ID del set de datos de
http://datos.salud.gob.ar/dataset/covid-19-casos-registrados-en-la-republica-argentina.

EL sync va a esa direccion anterior, descarga el ultimo file, deszipea y empieza la importacion solo de los registros confirmados con covid y los que tengan 
id_evento mayor al ultimo guardado, se importan y se actualiza el misc.

***Solo se corre el importador cuando la fecha de importacion es menor a HOY - 1 dia.***

La verdad que llegue bien teniendo en cuenta con los tiempos que tengo para dedicarle, pero le intente poner la mejor.

## Que siento me falto

* Mas controles, chequeos, validaciones
* Mas Tests
* Mejorar visualmente todo, si bien no es mi fuerte me quedaron cosas que no me gustaron mucho, y lo visual lleva muchisimo tiempo.
* Dockerizar la app, aca venia avanzando (hay un Dockerfile por ahi si quieren ver) pero me metia en otros temas, y la verdad preferia dejar algo mas cerradito.
* Lanzar la app en modo prod, muchos temas con depedencias que tambien demoran tiempo.


