default:
	make updatecv
	make buildfromcv
	make build
	make copybuilt

build:
	cd hugo; hugo

updatecv:
	cd hugo/CV; git fetch; git pull
	git add hugo/CV
	git commit -m "updated cv"

buildfromcv:
	cd hugo; python fill_config.py

copybuilt:
	cp -r hugo/public/* ./

upload:
	git push


