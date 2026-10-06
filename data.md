
Dalle configurazioni dell'app bing-wallpaper di Microsoft l'api che restituisce il json con 
le ultime 8 immagini di background con le info:

````
https://bingwallpaper.microsoft.com/api/BWC/getHPImages
````

la struttura degli 8 elementi del tipo:

````
{
  "images": [
    {
      "startdate": "20251112",
      "fullstartdate": "202511120800",
      "enddate": "20251113",
      "url": "https://bingwallpaperimages.azureedge.net/Latest/3840x2400/20251112.jpg",
      "url2": "https://bingwallpaperimages.microsoft.com/Latest/3840x2400/20251112.jpg",
      "urlbase": "https://www.bing.com/th?id=OHR.ColosseumRome_EN-US6932882124_UHD.jpg&rf=LaDigue_UHD.jpg&pid=hp&w=3840&h=2400&rs=1&c=4",
      "copyright": "Aerial view of the Colosseum, Rome, Italy (© Nico De Pasquale Photography/Getty Images)",
      "copyrightlink": "https://www.bing.com/search?q=Colosseum+Rome&form=hpcapt&filters=HpDate%3a%2220251112_0800%22",
      "copyrighttext": "© Nico De Pasquale Photography/Getty Images",
      "title": "Aerial view of the Colosseum, Rome, Italy",
      "quiz": "/search?q=Bing+homepage+quiz&filters=WQOskey:%22HPQuiz_20251112_ColosseumRome%22&FORM=HPQUIZ",
      "wp": true,
      "hsh": "e8e51e66d17acd27d3f69a43c4823ac3",
      "drk": 1,
      "top": 1,
      "bot": 1,
      "hs": []
    },
    ...
  ]
}
````
