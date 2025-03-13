module.exports = {
    apps: [
        {
            name: 'print-management',
            script: 'bin/www.js',
            instances: 1,
            exec_mode: "cluster",
            node_args: '--harmony'
        }
    ]
}