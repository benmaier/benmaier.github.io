
website:
	python make_website.py

publish: website
	git add .
	git commit -m "publish"
	git push

test: website
	python -m SimpleHTTPServer 9090 & echo $$! > server.PID;
	open http://127.0.0.1:9090
	echo "\x1B[0;32mPress any key to kill server\x1b[m"
	read -n1 -s
	kill $$(cat server.PID)
	rm server.PID
