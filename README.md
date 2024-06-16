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

```
{
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
      "id": "thor",
      "branch": "Avengers",
      "watchAfter": [],
      "standAlone": false,
      "title": "Thor",
      "description": "Thor is exiled by his father, Odin, the King of Asgard, to the Earth to live among mortals. When he lands on Earth, his trusted weapon Mjolnir is discovered and captured by S.H.I.E.L.D.",
      "releaseDate": "2011-05-02",
      "duration": 114,
      "storyDate": "2011",
      "imgUrl": "https://i.postimg.cc/5t6GL9yC/thor.jpg",
      "smallImgUrl": "https://i.postimg.cc/N0qJ963W/thor-small.jpg",
      "logoUrl": "https://i.postimg.cc/yNXYtdN3/thor.png"
    },
    {
      "id": "iron_man_2",
      "branch": "Avengers",
      "watchAfter": ["iron_man"],
      "standAlone": false,
      "title": "Iron Man 2",
      "description": "Tony Stark is under pressure from various sources, including the government, to share his technology with the world. He must find a way to fight them while also tackling his other enemies.",
      "releaseDate": "2010-05-07",
      "duration": 125,
      "storyDate": "2010",
      "imgUrl": "https://i.postimg.cc/NGzczVqY/iron-man-2.jpg",
      "smallImgUrl": "https://i.postimg.cc/W4z3ZZ0w/iron-man-2-small.jpg",
      "logoUrl": "https://i.postimg.cc/PJMWqhKC/iron-man-2.png"
    },
    {
      "id": "a_funny_thing_happened_on_the_way_to_thors_hammer",
      "branch": "One-Shot",
      "watchAfter": ["iron_man_2", "thor"],
      "standAlone": false,
      "title": "A Funny Thing Happened on the Way to Thor's Hammer",
      "description": "Agents Coulson and Sitwell plan to derail General Thaddeus \"Thunderbolt\" Ross from interfering with S.H.I.E.L.D. affairs with a special person.",
      "releaseDate": "2011-10-25",
      "duration": 4,
      "storyDate": "2011",
      "imgUrl": "https://i.postimg.cc/7P7VFGj6/a-funny-thing-happened-on-the-way-to-thors-hammer.jpg",
      "smallImgUrl": "https://i.postimg.cc/k5KQkLhH/a-funny-thing-happened-on-the-way-to-thors-hammer-small.jpg",
      "logoUrl": "https://i.postimg.cc/rpqfGnRX/a-funny-thing-happened-on-the-way-to-thors-hammer.png"
    },
  ]
}
```

where
"branch" - is the name of a filter to which the title belongs,
"watchAfter" - an array of ids of titles to which current title should be connected,
"standalone" - specifies if the element should have any trail before it.

You can create your own universes with this map builder by filling the data in a similar manner.

- For that you have to clone the project. You can create a file with the data in the same project folder and instead of fetching, simply import data from it. Or you can set up your own mongoDB database and create an env file in the root backend folder and put the connection link there (DATABASE_URI). (For that you also have to clone Backend repository) as well as env in the frontend repository with the server adress (API_URL);
- To store the progress you will also have to set up your google cloud console project and put Cliend ID and Client Secret in the env file in the root folder (CLIENT_ID, CLIENT_SECRET).

Contact: harpervenom@gmail.com
