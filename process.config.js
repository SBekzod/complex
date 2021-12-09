module.exports = {
    apps: [
        {
            name: "complex-app",
            cwd: "./",
            script: "./server.js",
            watch: false,
            // env_production: {
            //     NODE_ENV: "PRODUCTION",
            // },
            // env_development: {
            //     NODE_ENV: "DEVELOPMENT",
            // },
            instances: 1,
            exec_mode: "cluster",
        },
    ],
};
