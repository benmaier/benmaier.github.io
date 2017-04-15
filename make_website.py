import os
import fnmatch

template_file = './template.html'

directories = [
        './about/',
        './science/',
        './freelancing/',
        './feuilleton',
        ]

content_files = []
output_files = []
for d in directories:
    for root, dirnames, filenames in os.walk(d):
        for filename in fnmatch.filter(filenames, '*.content.html'):
            content_files.append(os.path.join(root, filename))
            output_files.append(os.path.join(root, filename.replace('.content','')))

with open(template_file,'r') as f:
    template_str = f.read() 

for con, out in zip(content_files,output_files):
    new_str = str(template_str)
    with open(con,'r') as f:
        content = f.read()
        new_str = new_str.replace('===CONTENT===',content)
    with open(out,'w') as f:
        f.write(new_str)

