const env = process.env.NODE_ENV; // 'dev' or 'test' at least for now

const dev = {
    app: {
        port: 3001,
        link: 'https://sisa.msal.gov.ar/datos/descargas/covid-19/files/Covid19Casos.zip'
    },
    db: {
        auth: true,
        user: 'covid',
        pass: 'covid',
        host: 'localhost',
        dbport: 27017,
        name: 'covid'
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
        link: 'https://github.com/xaavito/covid/blob/master/filtered-tail.zip'
    },
    db: {
        auth: false,
        host: '127.0.0.1',
        dbport: 27017,
        name: 'covid'
    },
    tests: {
        deaths: 0,
        newCases: 3,
        lastUpdateCases: 10000,
        lastUpdateDate: '2021-10-17'
    }
};

const config = {
    dev,
    test
};

module.exports = config[env];
