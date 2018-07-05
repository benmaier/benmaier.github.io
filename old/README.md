# benmaier.github.io

Generating the static website that is [http://benmaier.org](http://benmaier.org).

In `make_website.py`, include the subdirectories of root that contains content.
Content files that should be merged with the template and included in the final website must have file extension `*.content.html`.

In order to create the website, run
```
$ make website
```

For testing, run
```
$ make test
```

For publishing, run
```
$ make publish
```
