# TODO

1. Mejorar Readme, badges?
2. Ver lo de la BD, mongo?
3. Material para el front? DONE, mejorar la fecha
4. Ver tema de tests en node -- DONE, pero mejorarlos
5. agregar los endpoints del enunciado -- DONE, validaciones??

6. Dockerizar? creo que valdria la pena.
7. Pasar a un Docker compose...


mongoimport --db covid --collection casos_1 --type csv --file Covid19Casos.csv --headerline

https://stackoverflow.com/questions/24985684/mongodb-show-all-contents-from-all-collections


docker exec mongo mongoimport --db covid --collection casos_1 --type csv --file /data/import/filtered.csv --authenticationDatabase admin --username covid --password covid --headerline


https://stackoverflow.com/questions/42912755/how-to-create-a-db-for-mongodb-container-on-start-up

evaluar esto

var exec = require('child_process').exec;
var cmd = 'mongoimport -d db_name -c collection_name --type csv --file file.csv --headerline';

exec(cmd, function(error, stdout, stderr) {
  // do whatever you need during the callback
});



VER TEMA WORKERS sync o con callback, eso no funca.
https://blog.logrocket.com/use-cases-for-node-workers/
https://nodejs.org/api/worker_threads.html
https://nodesource.com/blog/worker-threads-nodejs/
https://livecodestream.dev/post/how-to-work-with-worker-threads-in-nodejs/

Ver de liquidar todo el español

