module.exports = {
  apps: [
    {
      name: "rentify",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "development",
      }
    }
  ]
}