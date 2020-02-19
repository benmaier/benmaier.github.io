import simplejson as json
import toml

LANG = 0

def T(x):
    if type(x)==list:
        return x[LANG]
    else:
        return x

with open('CV/data/cv_content.json','r') as f:
    data = json.load(f)

with open('basic_config.toml','r') as f:
    tomlrows = f.readlines()

tab = "    "
chap = tab+"[params.publications]"
sec = 2*tab+"[[params.publications.list]]"
subsec = 2*tab+"[[params.publications.list.items]]"
tomlrows.append(chap)
tomlrows.append(tab+"enable = true")
tomlrows.append("")

for pub in data['fieldcontent']['publications']:
    if not pub['important']:
        continue
    
    tomlrows.append(sec)
    auth = ", ".join(pub['authors'])
    title = T(pub['title'])
    add = T(pub['additional'])
    dates = T(pub['year'])
    tomlrows.append(2*tab+'title = "{}"'.format(title))
    tomlrows.append(2*tab+'journal = "{}"'.format(add.replace('"','')))
    tomlrows.append(2*tab+'details = "{}"'.format(auth))
    tomlrows.append(2*tab+'dates = "{}"'.format(T(pub['year'])))
    tomlrows.append("")
    arxiv = pub['arxiv']
    doi = pub['doi']
    href = pub['hyperlink']
    if all([
                href == '',
                arxiv == '',
                doi == '',
        ]):
        continue
    else:
        if href != '':
            tomlrows.append(subsec)
            if not href.startswith("http://") and not href.startswith("https://"):
                href = "http://" + href

            tomlrows.append(2*tab+'details = "[{}]({})"'.format(add,href))
            tomlrows.append("")
        if arxiv != "":
            tomlrows.append(subsec)
            tomlrows.append(2*tab+'details = "arXiv: [{}](https://arxiv.org/abs/{})"'.format(arxiv,arxiv))
            tomlrows.append("")
        if doi != "":
            tomlrows.append(subsec)
            tomlrows.append(2*tab+'details = "doi: [{}](https://doi.org/{})"'.format(doi,doi))
            tomlrows.append("")

chap = tab+"[params.packages]"
sec = 2*tab+"[[params.packages.list]]"
subsec = 2*tab+"[[params.packages.list.items]]"
tomlrows.append(chap)
tomlrows.append(tab+"enable = true")
tomlrows.append("")

for pub in data['fieldcontent']['packages']:
    if not pub['important']:
        continue
    
    href = pub['href'][0]
    if not href.startswith("http://") and not href.startswith("https://"):
        _href = "http://" + href
    else:
        _href = href
    tomlrows.append(sec)
    tomlrows.append(2*tab+'title = "{}"'.format(T(pub['title'])))
    tomlrows.append(2*tab+'details = "[{1}]({2}), {0}"'.format(T(pub['description']),href,_href))
    tomlrows.append("")
    all_hrefs = pub['additional_hrefs']
    for href in all_hrefs:
        if href != '':
            tomlrows.append(subsec)
            if not href.startswith("http://") and not href.startswith("https://"):
                href = "http://" + href

            tomlrows.append(2*tab+'details = "[{}]({})"'.format(href,href))
            tomlrows.append("")


for i in range(len(tomlrows)):
    if not tomlrows[i].endswith("\n"):
        tomlrows[i] += "\n"

with open('config.toml','w') as f:
    f.write("".join(tomlrows))



