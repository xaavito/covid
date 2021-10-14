const env = process.env.NODE_ENV; // 'dev' or 'test' at least for now

const dev = {
    app: {
        port: 3001
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
        newCases: 32140
    }
};

const test = {
    app: {
        port: 3001
    },
    db: {
        auth: false,
        host: '127.0.0.1',
        dbport: 27017,
        name: 'covid'
    },
    tests: {
        deaths: 0,
        newCases: 0
    }
};

const config = {
    dev,
    test
};

module.exports = config[env];
