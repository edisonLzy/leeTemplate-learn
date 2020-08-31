module.exports = (api) => {
    // Cache configuration is a required option
    // api.cache(false);
  
    const presets = [
      ["@babel/preset-env",
      {
        "useBuiltIns": "usage",
        "corejs": 3,
        "modules": "umd" 
      }
    ],
    "@babel/preset-typescript"
    ];
     
  const plugins = [];
    if (api.env("production")) {
      plugins.push("babel-plugin-transform-remove-console");
    }

    return { presets,plugins };
};