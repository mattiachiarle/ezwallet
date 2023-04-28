# Graphical User Interface Prototype  - FUTURE

Date: 28/04/2023  
Version: V2  

# USE CASE 1, Login

![LandingPage](images/GUI/V2/V2InfoPage.png)
![LoginPage](images/GUI/V2/V2Login.png)
![LoginPageWrongInfo](images/GUI/V2/V2LoginWrongInfo.png)
![LoginPageEnailReset1](images/GUI/V2/V2LoginResetPasswordEmail.png)
![LoginPageEnailReset2](images/GUI/V2/V2LoginResetPasswordFinal.png)

# USE CASE 3, Registration

![LandingPage](images/GUI/V2/V2Register.png)
![LandingPage](images/GUI/V2/V2Register_EmailNotValid.png)
![LandingPage](images/GUI/V2/V2Register_UserEmailNotValid.png)
These errors are reported in the same view but can be returned independentely.
![LandingPage](images/GUI/V2/V2Register_PasswordNotValid.png)
![LandingPage](images/GUI/V2/V2Register_LinkExpired.png)

# USE CASE 4, Handle Transactions

![LandingPage](images/GUI/V2/V2Transactions.png)
![LandingPage](images/GUI/V2/V2TransactionsAdd.png)
![LandingPage](images/GUI/V2/V2TransactionsEdit.png)
![LandingPage](images/GUI/V2/V2TransactionsFilterCategory.png)
The transactions can be filtered by category, displaying only the ones that are of a category selected by the user.
![LandingPage](images/GUI/V2/V2TransactionsFilterPeriod.png)
The selection by period of the transactions is intended to be for multiple days/weeks, but the software used to design the GUI had only the version 
proposed of a date picker.

# USE CASE 5, Handle Categories

![LandingPage](images/GUI/V2/V2Categories.png)
![LandingPage](images/GUI/V2/V2AddCategory.png)
![LandingPage](images/GUI/V2/V2EditCategory.png)
![LandingPage](images/GUI/V2/V2EditCategory_DeleteClicked.png)
A message is displayed if the user wants to delete a category of which there are transactions, prompting the user to choose if all the 
transactions should be associated to another category, or deleted.

# USE CASE 6, Handle Users

![LandingPage](images/GUI/V2/V2AllUsersInfo.png)
![LandingPage](images/GUI/V2/V2AdminEditUser.png)
Clicking on the edit voice in the menu, an admin can edit the user's info.
![LandingPage](images/GUI/V2/V2AdminAddNewUser.png)
Clicking on the new user button, an admin can add a new user.
![LandingPage](images/GUI/V2/V2Register_InviteAdminLink.png)
Clicking on the invite admin button, an invite link is generated.

# USE CASE 7, Manage Account

![LandingPage](images/GUI/V2/V2UserInfo.png)
![LandingPage](images/GUI/V2/V2UserInfoAdmin.png)
The popup presented clicking on the user image changes sligthly if the user is an admin, giving him access to the admin panel.
![LandingPage](images/GUI/V2/V2UserInfoExtended.png)

# USE CASE 10, Manage Groups

![LandingPage](images/GUI/V2/V2Groups.png)
![LandingPage](images/GUI/V2/V2CreateNewGroup.png)
![LandingPage](images/GUI/V2/V2ManageGroupOwner.png)
View of the management page for a group, as viewed by the group owner.
![LandingPage](images/GUI/V2/V2ManageGroupOwner_UserNotFound.png)
![LandingPage](images/GUI/V2/V2ManageGroupLeaveOwnership.png)
![LandingPage](images/GUI/V2/V2ManageGroupAdmin.png)
View of the management page for a group, as viewed by a group owner.
![LandingPage](images/GUI/V2/V2ManageGroupUser.png)
View of the management page for a group, as viewed by the group simple member.

# USE CASE 11, Statistics

![LandingPage](images/GUI/V2/V2Statistics.png)

# Errors

![LandingPage](images/GUI/V2/V2NotFound.png)
A custom page is returned in case of a not found resource
![LandingPage](images/GUI/V2/V2NotAuthorized.png)
A custom page is returned in case of a request to a resource the asker is not authorized for.
