// User to Manage DB
db.createUser(
    {
        user: "covid",
        pwd: "covid",
        roles: [
            {
                role: "readWrite",
                db: "covid"
            }
        ]
    }
)
// Collection that holds actual data
db.createCollection('casos_1')

// Collection that holds miscelanus data, like last updated
db.createCollection('misc')

// Indexes for fast searching
db.casos_1.createIndex( { edad: 1 } , { unique: false })

db.casos_1.createIndex( { clasificacion_resumen: 1 }, { unique: false } )

db.casos_1.createIndex( { sexo: 1 }, { unique: false } )

db.casos_1.createIndex( { residencia_provincia_id: 1 } , { unique: false })

db.casos_1.createIndex( { fecha_diagnostico: 1 } , { unique: false })

db.casos_1.createIndex( { fecha_fallecimiento: 1 } , { unique: false })

db.casos_1.createIndex( { id_evento_caso: 1 } , { unique: true })