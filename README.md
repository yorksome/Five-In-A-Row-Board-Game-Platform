# Online-Board-Game-Platform-Website-
Express+Node.js+Socket.io+MongoDB+React.js

This project aims to create a website that provides people a platform to play board games online.
However, this website has some requirements that it must be able to calculate players' rank ability and reputation credits.
Hence, registered players in this platform can have a general view of opponents' and their own rank abilities and start a match with people who own good reputation credits to improve players' gaming experience.

Personally, I start this project as my master degree final project and will write a report as my degree dissertation.
This web-based platform is created based on a preexisting website of which the source code address is attached below.
Acknowledgement:https://github.com/guguji5/five-in-line

Overall Improvements:
    1. Add components: user login, user registration, password recovery
    2. Check personal profile
    3. Check match history (Gained rank points, reputation credits)
    4. Before game: set minimum reputation credits of matching people
    5. In game: pull back, give up, offer draw, pause and save match
    6. After game: automatic rank calculation, automatic reputation credits calculation              

Project Log:
    2018-7-10: Connect to the database in app.js
    2018-7-11: Successfully Login with account stored in mongodb
    2018-7-12: Completed registration page and involve session in the app.js file to store username
    2018-7-13: Completed password reset page
    2018-7-14: Working on the index page to display username retrieved from session
    2018-7-16: Utilize ejs template in 'views' folder to render pages. Successfully present username on the webpage which is sent from the backend.
    
    
Instructions:
1. Install Mongo Database first.
2. To start：· npm install
             · node app
3. Open webbrowser and enter: IP:3000 (Example:10.217.133.21:3000)
4. Start Play！
