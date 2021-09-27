# Covid Bot Javier Gonzalez

## Bajar Proyecto
```
git clone https://github.com/xaavito/covid.git
cd covid
```

## Correr Servidor y Cliente Concurrentemente
```
npm run dev
```

## Entrypoint (Deberia lanzarlo automaticamente...)
```
http://localhost:3000/
```

## Precondiciones 

### Correr Docker para lanzar mongo
```
docker-compose up -d
```

### Instalar BD inicial (solo se hace una vez)

```
unzip unzip filtered.zip

sudo cp filtered.csv /mongo-import-volume

docker exec mongo mongoimport --db covid --collection casos_1 --type csv --file /data/import/filtered.csv --authenticationDatabase admin --username covid --password covid --headerline
```

## Help

### Correr Tests
```
npm run test
```

### Conexion a mongo (para hacer consultas)
```
mongo -u covid -p covid --
```

