import requests
from bs4 import BeautifulSoup
import pandas as pd
import numpy as np
from time import sleep
import webbrowser

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) Gecko/20100101 Firefox/94.0',
    'Accept-Language': 'en-US, en;q=0.5'
}

quer = input('enter product : ')
search_query = quer.replace(' ', '+')
base_url = 'https://www.amazon.com/s?k={0}'.format(search_query)

items = []
for i in range(1, 5):
    print('Processing {0}...'.format(base_url + '&page={0}'.format(i)))
    response = requests.get(base_url + '&page={0}'.format(i), headers=headers)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    results = soup.find_all('div', {'class': 's-result-item', 'data-component-type': 's-search-result'})

    for result in results:
        product_name = result.h2.text

        try:
            rating = result.find('i', {'class': 'a-icon'}).text
            rating_count = result.find_all('span', {'aria-label': True})[1].text
        except AttributeError:
            continue

        try:
            price1 = result.find('span', {'class': 'a-price-whole'}).text
            price2 = result.find('span', {'class': 'a-price-fraction'}).text
            price1 = price1.replace(',' , '')
            price2 = price2.replace(',','')
            price = float(price1 + price2)
            product_url = 'https://amazon.com' + result.h2.a['href']
            # print(rating_count, product_url)
            items.append([product_name, rating, rating_count, price, product_url])
        except AttributeError:
            continue
    sleep(1.5)
    
df = pd.DataFrame(items, columns=['product', 'rating', 'rating count', 'price', 'product url'])
df.to_csv('{0}.csv'.format(search_query), index=False)  
# min_idx = (df['price'].idxmin)
# url = (df.iloc[min_idx]['product url'])
# webbrowser.open_new_tab(url)
# min_index = (np.argmin(df['price']))
# print(df['product url'][min_index])
# url = df['product url'][0]
# webbrowser.open_new_tab(url)