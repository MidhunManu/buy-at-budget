import requests
from bs4 import BeautifulSoup
import pandas as pd
import numpy as np

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) Gecko/20100101 Firefox/94.0',
    'Accept-Language': 'en-US, en;q=0.5'
}

quer = input('enter product : ')
search_query = quer.replace(' ', '+')
base_url = 'https://www.amazon.com/s?k={0}'.format(search_query)

