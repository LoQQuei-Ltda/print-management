module.exports = {
    apps: [
        {
            name: 'print-management',
            script: 'bin/www',
            instances: "max",
            max_instances: 3,
            exec_mode: "cluster"
        }
    ]
}