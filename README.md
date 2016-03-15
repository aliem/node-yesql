# yesql

A (dumb) reimplementation of the wonderful Clojure library [yesql](https://github.com/krisajenkins/yesql) for node.js

# API

The only exposed function expects a `run` function and a `filename`.

## The 	`run` function

This is the main query runner, it should expect a single parameter for the SQL statements, probably should return a function.

The bare minimum function to be implemented is:
```

function run(sql) {
	return (params) => database.query(sql, params);
}

```

# License

Copyright &copy; 2016 Lorenzo Giuliani
Distributed under the [MIT License](https://opensource.org/licenses/mit-license.html), for more info look at the [LICENSE](./LICENSE) file.
