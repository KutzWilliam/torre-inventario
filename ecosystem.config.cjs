module.exports = {
  apps: [
    {
      name: "torre-inventario",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3008,
      },
      watch: false,
      instances: 1,
      exec_mode: "fork",
    },
  ],
};
