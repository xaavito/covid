# Covid Bot Javier Gonzalez

[![Build Status](https://app.travis-ci.com/xaavito/covid.svg?branch=master)](https://app.travis-ci.com/xaavito/covid) [![codecov](https://codecov.io/gh/xaavito/covid/branch/master/graph/badge.svg?token=TR4VGHH4S0)](https://codecov.io/gh/xaavito/covid) 

## Bajar Proyecto
```
git clone https://github.com/xaavito/covid.git
```
## Precondiciones 

### Buildear proyecto
```
cd PATH-TO-PROJECT/
docker build . -t javiermartingonzalez/covid
```
### Deszipear BD para preloading

```
unzip db-data/filtered.zip

mkdir mongo-import-volume

sudo cp db-data/filtered.csv mongo-import-volume
```

### Correr Docker para lanzar aplicacion
```
docker-compose up -d
```

### Instalar BD inicial (solo se hace una vez)
```
docker exec mongo mongoimport --db covid --collection casos_1 --type csv --file /data/import/filtered.csv --authenticationDatabase admin --username covid --password covid --headerline
```

## Entrypoint 
```
http://localhost:3000/
```

## Help

### Swagger
```
http://localhost:3001/api-docs
```

### Correr Tests
***Tener previsamente la BD corriento***
```
npm run test
```

### Conexion a mongo (para hacer consultas)
```
mongo -u covid -p covid --
```

## Experiencia General [Ver](docs/EXPERIENCIA.md)





