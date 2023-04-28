# Graphical User Interface Prototype  - CURRENT

Date: 16/04/2023  
Version: V1  

# Landing Page

<img src="images/GUI/V1/InfoPage.png"  width="70%" height="70%"/></br>  
When searching the app, the landing page is what is presented to the user, that can choose to login, if they have an account, or register to the service.  

# Login Page

<img src="images/GUI/V1/Login.png"  width="70%" height="70%"/></br>  
Page for the user login, where username and password can be inserted. if the login process goes wrong, an error is returned. 

<img src="images/GUI/V1/LoginInfoWrong.png"  width="70%" height="70%"/></br>  

# Register Page

<img src="images/GUI/V1/Register.png"  width="70%" height="70%"/></br>  
Here a new user can register itself, providing a valid email, username and a password.

# Transactions page

<img src="images/GUI/V1/MainPageV1.png"  width="70%" height="70%"/></br>  
The main page of the application display the user's transactions, in chronological order. The info for each transaction are: date, category, name and amount. 
From this page, the user can add a new transaction from the empty form, writing the type, name and amount.  
Clicking on the button at the end of each transaction form, the user can delete it.  

# Labels page

<img src="images/GUI/V1/V1Labels.png"  width="70%" height="70%"/></br>  
In this page, the transactions are grouped by category, so that the user can view all the expenses from each category separately.  

# Categories page

<img src="images/GUI/V1/Categories.png"  width="70%" height="70%"/></br>  
In this page, the user can see all the categories available. A new category can also be added.  

<img src="images/GUI/V1/AddCategory.png"  width="70%" height="70%"/></br>  

# User info

<img src="images/GUI/V1/V1UserInfo.png"  width="70%" height="70%"/></br>  
Clicking on the placeholder in the top right of the screen, the user can see its info, and also do a logout operation.  

<img src="images/GUI/V1/UserInfoUrl.png"  width="70%" height="70%"/></br>  
The user's info can also be reached directly whith the /users/:username route.  

<img src="images/GUI/V1/AllUsersInfo.png"  width="70%" height="70%"/></br>  
This page, in this version reachable only via the route /users, displays all the users and their info.  
