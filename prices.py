import requests
from bs4 import BeautifulSoup

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) Gecko/20100101 Firefox/94.0',
    'Accept-Language': 'en-US, en;q=0.5'
}

data = []

url = "https://www.flipkart.com/search?q=handkercheif&sort=price_asc"
r = requests.get(url, headers=headers)
html_content = r.content
# html_content = """
# <img alt="Amul Moti Homogenised Toned Milk 450 ml Pouch " lazyboundary="800px" src="https://www.bigbasket.com/media/uploads/p/m/40005033_1-amul-moti-homogenised-toned-milk.jpg?tr=w-3840,q=80" decoding="async" data-nimg="responsive" class="DeckImage___StyledImage-sc-1mdvxwk-3 cSWRCd" style="position: absolute; inset: 0px; box-sizing: border-box; padding: 0px; border: none; margin: auto; display: block; width: 0px; height: 0px; min-width: 100%; max-width: 100%; min-height: 100%; max-height: 100%;" sizes="100vw" srcset="https://www.bigbasket.com/media/uploads/p/m/40005033_1-amul-moti-homogenised-toned-milk.jpg?tr=w-640,q=80 640w, https://www.bigbasket.com/media/uploads/p/m/40005033_1-amul-moti-homogenised-toned-milk.jpg?tr=w-750,q=80 750w, https://www.bigbasket.com/media/uploads/p/m/40005033_1-amul-moti-homogenised-toned-milk.jpg?tr=w-828,q=80 828w, https://www.bigbasket.com/media/uploads/p/m/40005033_1-amul-moti-homogenised-toned-milk.jpg?tr=w-1080,q=80 1080w, https://www.bigbasket.com/media/uploads/p/m/40005033_1-amul-moti-homogenised-toned-milk.jpg?tr=w-1200,q=80 1200w, https://www.bigbasket.com/media/uploads/p/m/40005033_1-amul-moti-homogenised-toned-milk.jpg?tr=w-1920,q=80 1920w, https://www.bigbasket.com/media/uploads/p/m/40005033_1-amul-moti-homogenised-toned-milk.jpg?tr=w-2048,q=80 2048w, https://www.bigbasket.com/media/uploads/p/m/40005033_1-amul-moti-homogenised-toned-milk.jpg?tr=w-3840,q=80 3840w">
# """
soup = BeautifulSoup(html_content, "html.parser")

img = soup.find_all(class_="_396cs4")
img2 = soup.find_all(class_="_2r_T1I")
for i in img:
    data.append(i.get("src"))
for i in img2:
    data.append(i.get("src"))

print(data)