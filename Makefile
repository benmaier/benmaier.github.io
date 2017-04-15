
website:
	python make_website.py

publish: website
	git add .
	git commit -m "publish"
	git push

test:
	python -m SimpleHTTPServer 9090 &
	open http://127.0.0.1:9090
