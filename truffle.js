module.exports = {
  migrations_directory: "./migrations",
  networks: {
    development: {
      host: "10.162.130.120",
      port: 8546,
      network_id: "*" // Match any network id
    }
  }
};
