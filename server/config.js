const env = process.env.NODE_ENV; // 'dev' or 'test'

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
    }
};

const test = {
    app: {
        port: 3001
    },
    db: {
        auth: false,
        host: 'localhost',
        dbport: 27017,
        name: 'test'
    }
};

const config = {
    dev,
    test
};

module.exports = config[env];
