# Online-Board-Game-Platform-Website-
Express+Node.js+Socket.io+MongoDB+React.js

*************************

## Project Aim
    This project aims to create a website that provides people a platform to play board games online.
    However, this website has some requirements that it must be able to calculate players' rank ability and reputation credits.
    Hence, registered players in this platform can have a general view of opponents' and their own rank abilities and start a match with people who own good reputation credits to improve players' gaming experience.

## Background
    Personally, I start this project as my master degree final project and will write a report as my degree dissertation.
    This web-based platform is created based on a preexisting website of which the source code address is attached below.
    Acknowledgement:https://github.com/guguji5/five-in-line

### Overall Improvements:

    1. Add components: user login, user registration, password recovery
    2. Check personal profile
    3. Check match history (Gained rank points, reputation credits)
    4. Before game: check current rank and reps (If reputation under 0, then cannot start game)
    5. In game: pull back, give up, offer draw, quit
    6. After game: automatic rank calculation, automatic reputation credits calculation              

### Project Log:

    2018-7-10: Connect to the database in app.js
    2018-7-11: Successfully Login with account stored in mongodb
    2018-7-12: Completed registration page and involve session in the app.js file to store username
    2018-7-13: Completed password reset page
    2018-7-14: Working on the index page to display username retrieved from session
    2018-7-16: Utilize ejs template in 'views' folder to render pages. Successfully present username on the webpage which is sent from the backend.
    2018-7-17 ~ 2018-7-27: Successfully completed functionalities of user management area. Now players can check their profile and match history. Also, they are able to see their opponent's rank and reputation points once they started the game. Match Results would be saved to DB and players' rank and reputation would be upated as well after each match.
    2018-7-28 ~ 2018-8-04：Finished player's functionalities in a match. For example, pullback, giveup and offer draw. Reputation System was completed in terms of reputation punishment on those players who want to leave the match after started.
    2018-8-05 ~ 2018-8-12: IMPROVEMENTS on design latyout and reminders or warnings shown in game. In addition, testing and evaluation was implemented as well.

### Difficulties - Solutions:

    1. Form - router post (Cannot Post) -- set app.post(path,routerObject) in app.js
    2. Mongoose - Create/Update -- set Schema -> Model (used to interact with DB)
    3. Authentication - User Login -- utilize session to save user login status in server side
    4. ejs engine - display username -- display session username on the frontend webpages by using ejs template, set view engine    in app.js first and render ejs when needed.
    5. React ComponentDidUpdate -- This component used to update UI would be triggered once the state is altered. Hence it is readily to produce a dead loop if programmers use 'this.setState' in this component area without strict conditions.
    6. How to automatically submit the result to database instead of players' manaully clicking on the button? (not done yet)
    7. How to distinguish the situation whether people quit before match starting or in match gaming? - Create a new state called status to THE BOARD. The value of status includes -1(free),0(in gaming),1(match end).
    8. How to pull back last operation which the player did? - Assign a state called last which is used to record the last point.
    9. Settings of Offer Draw - ONLY IF two players both request offer draw, then the system would make the deal. - Created a state which is an array to store the number of people who request offer draw.
    10. How to prevent people from closing the tab during the match? There is currently no solution to automatically submit the situation when people quit by closing the tab.
    
## Instructions:

    1. Install Mongo Database first.
    2. To start：· npm install
                 · node app
    3. Open webbrowser and enter: IP:3000 (Example:10.217.133.21:3000)
    4. Start Play！
