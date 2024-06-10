CinemaRM

Interactive movie roadmaps. For people who love to dive deep into fictional worlds and fully explore them.

Features:
- Choose a cinematic universe where all titles are collected in one place and visualized as an interactive map. 
- Start watching titles in order and mark each of them as completed as you finish watching it.
- Customize your experience by toggling different filters to hide and show titles related to different branches of the universe.
- Log in with your Google account to store your watching progress and view it on the profile page in the form of a progress bar.

Technologies used:

Frontend:
- React
- React router
- @react-oauth/google + js-cookie - for google login and automatic relogin
- axios - for convinient fetching of data.

Backend:
- Node.js + Express: For the server and API.
- MongoDB: For storing data.

Example map for the Marvel Studios universe.
![Screenshot 2024-06-09 181442](https://github.com/HarperVenom/MovieFranchiseHub/assets/162710380/80f97a0e-dbb8-49e9-bb2a-5dad6429af0d)

An example of the data for building a map:
```{
  "id": "marvel_studios",
  "title": "Marvel Studios",
  "description": "Marvel Studios, LLC is an American film and television production company. Marvel Studios is the creator of the Marvel Cinematic Universe, a media franchise and shared universe of films and television series produced by the studio, based on characters that appear in Marvel Comics publications.",
  "imgUrl": "https://i.postimg.cc/VLcXtz4H/universe-img.jpg",
  "backgroundUrl": "https://i.postimg.cc/Nf7m7ZzG/universe-background.png",
  "logoUrl": "https://i.postimg.cc/gJF8qrTw/logo.png",
  "titles": [
    {
      "id": "iron_man",
      "branch": "Avengers",
      "watchAfter": [],
      "standAlone": false,
      "title": "Iron Man",
      "description": "When Tony Stark, an industrialist, is captured, he constructs a high-tech armoured suit to escape. Once he manages to escape, he decides to use his suit to fight against evil forces to save the world.",
      "releaseDate": "2008-05-02",
      "duration": 126,
      "imgUrl": "https://i.postimg.cc/RhyxJ3Qq/iron-man.jpg",
      "smallImgUrl": "https://i.postimg.cc/q7F7x7LV/iron-man-small.jpg",
      "logoUrl": "https://i.postimg.cc/cCW7Z67q/iron-man.png"
    },
    {
      "id": "wandavision",
      "branch": "Avengers Series",
      "watchAfter": ["avengers_endgame"],
      "standAlone": false,
      "title": "WandaVision",
      "description": "Vision and Wanda live a normal life in Westview and conceal their superpowers. However, as decades pass by, they start doubting that everything is not what it seems.",
      "releaseDate": "2021-01-15",
      "duration": 360,
      "imgUrl": "https://i.postimg.cc/QxhySJVs/wandavision-s1.jpg",
      "smallImgUrl": "https://i.postimg.cc/W3SXHQdv/wandavision-s1-small.jpg",
      "logoUrl": "https://i.postimg.cc/Gh83rz2C/wandavision.png"
    },
    {
      "id": "spider-man",
      "branch": "Spider-Man",
      "watchAfter": [],
      "standAlone": false,
      "title": "Spider-Man",
      "description": "Peter Parker, a shy and awkward high school student, is often bullied by people, including his best friend. His life changes when he is bitten by a genetically altered spider and gains superpowers.",
      "releaseDate": "2002-06-07",
      "duration": 121,
      "imgUrl": "https://i.postimg.cc/XY34f56y/spider-man.jpg",
      "smallImgUrl": "https://i.postimg.cc/qvSfm69L/spider-man-small.jpg",
      "logoUrl": "https://i.postimg.cc/6QRG3tpB/spider-man.png"
    },
```
where 
"branch" - is the name of a filter to which the title belongs, 
"watchAfter" - an array of ids of titles to which current title should be connected, 
"standalone" - specifies if the element should have any trail before it.

You can create your own universes with this map builder by filling the data in a similar manner.
  - For that you have to clone the project. You can create a file with the data in the same project folder and instead of fetching, simply import data from it. Or you can set up your own mongoDB database and create an env file in the root backend folder and put the connection link there (DATABASE_URI). (For that you also have to clone Backend repository) as well as env in the frontend repository with the server adress (API_URL);
  - To store the progress you will also have to set up your google cloud console project and put Cliend ID and Client Secret in the env file in the root folder (CLIENT_ID, CLIENT_SECRET).

Contact: harpervenom@gmail.com
