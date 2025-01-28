module.exports = {
    apps: [
        {
            name: 'print-management',
            script: 'bin/www.js',
            instances: "max",
            max_instances: 3,
            exec_mode: "cluster"
        }
    ]
}