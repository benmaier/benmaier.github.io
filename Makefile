
website:
	python make_website.py

publish: website
	git add .
	git commit -m "publish"
	git push
