const env = process.env.NODE_ENV; // 'dev' or 'test' at least for now

const dev = {
    app: {
        port: 3001,
        downloadLink: 'https://sisa.msal.gov.ar/datos/descargas/covid-19/files/Covid19Casos.zip',
        unzipedFileName: 'Covid19Casos.csv'
    },
    db: {
        dbURL: 'mongodb://covid:covid@localhost:27017/covid'
    },
    tests: {
        deaths: 108,
        newCases: 32140,
        lastUpdateCases: 0,
        lastUpdateDate: ''
    }
};

const test = {
    app: {
        port: 3001,
        downloadLink: 'https://raw.githubusercontent.com/xaavito/covid/master/db-data/filtered-tail.zip',
        unzipedFileName: 'filtered-tail.csv'
    },
    db: {
        dbURL: 'mongodb://127.0.0.1:27017/covid'
    },
    tests: {
        deaths: 0,
        newCases: 3,
        lastUpdateCases: 2114,
        lastUpdateDate: '2021-10-17'
    }
};

const config = {
    dev,
    test
};

module.exports = config[env];
