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

db.createCollection('casos_1')

db.casos_1.createIndex( { edad: 1 } , { unique: false })

db.casos_1.createIndex( { clasificacion_resumen: 1 }, { unique: false } )

db.casos_1.createIndex( { sexo: 1 }, { unique: false } )

db.casos_1.createIndex( { residencia_provincia_id: 1 } , { unique: false })

db.casos_1.createIndex( { fecha_diagnostico: 1 } , { unique: false })

db.casos_1.createIndex( { fecha_fallecimiento: 1 } , { unique: false })