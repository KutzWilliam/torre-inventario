module.exports = {
  apps: [
    {
      name: "torre-inventario",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3008,
      },
      watch: false,
      instances: "max",
      exec_mode: "cluster",
    },
  ],
};
