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

## Correr Tests
```
npm run test
```

## Precondiciones 

### Tener instalado MongoDB 
```
https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-20-04-es
```
### Correr Docker
```
docker-compose up -d
```

### Conexion a mongo
```
mongo -u covid -p covid --
```

### Instalar BD inicial (solo se hace una vez)

```
unzip unzip filtered.zip

sudo cp filtered.csv /mongo-import-volume

docker exec mongo mongoimport --db covid --collection casos_1 --type csv --file /data/import/filtered.csv --authenticationDatabase admin --username covid --password covid --headerline
```


