# Requirements Document - future EZWallet

Date: 

Version: V2 - description of EZWallet in FUTURE form (as proposed by the team)

 
| Version number | Change |
| ----------------- |:-----------|
| | | 


# Contents

- [Informal description](#informal-description)
- [Stakeholders](#stakeholders)
- [Context Diagram and interfaces](#context-diagram-and-interfaces)
	+ [Context Diagram](#context-diagram)
	+ [Interfaces](#interfaces) 
	
- [Stories and personas](#stories-and-personas)
- [Functional and non functional requirements](#functional-and-non-functional-requirements)
	+ [Functional Requirements](#functional-requirements)
	+ [Non functional requirements](#non-functional-requirements)
- [Use case diagram and use cases](#use-case-diagram-and-use-cases)
	+ [Use case diagram](#use-case-diagram)
	+ [Use cases](#use-cases)
    	+ [Relevant scenarios](#relevant-scenarios)
- [Glossary](#glossary)
- [System design](#system-design)
- [Deployment diagram](#deployment-diagram)

# Informal description
EZWallet (read EaSy Wallet) is a software application designed to help individuals and families keep track of their expenses. Users can enter and categorize their expenses, allowing them to quickly see where their money is going. EZWallet is a powerful tool for those looking to take control of their finances and make informed decisions about their spending.



# Stakeholders


| Stakeholder name  | Description | 
| ----------------- |:-----------:|
|   Stakeholder x..     |             | 

# Context Diagram and interfaces

## Context Diagram
\<Define here Context diagram using UML use case diagram>

\<actors are a subset of stakeholders>

## Interfaces
\<describe here each interface in the context diagram>

\<GUIs will be described graphically in a separate document>

| Actor | Logical Interface | Physical Interface  |
| ------------- |:-------------:| -----:|
|   Actor x..     |  |  |

# Stories and personas
\<A Persona is a realistic impersonation of an actor. Define here a few personas and describe in plain text how a persona interacts with the system>

\<Persona is-an-instance-of actor>

\<stories will be formalized later as scenarios in use cases>


# Functional and non functional requirements

## Functional Requirements

\<In the form DO SOMETHING, or VERB NOUN, describe high level capabilities of the system>

\<they match to high level use cases>

| ID        | Description  |
| ------------- |:-------------:| 
|  FR1     |  |
|  FR2     |   |
| FRx..  | | 

## Non Functional Requirements

\<Describe constraints on functional requirements>

| ID        | Type (efficiency, reliability, ..)           | Description  | Refers to |
| ------------- |:-------------:| :-----:| -----:|
|  NFR1     |   |  | |
|  NFR2     | |  | |
|  NFR3     | | | |
| NFRx .. | | | | 


# Use case diagram and use cases


## Use case diagram
\<define here UML Use case diagram UCD summarizing all use cases, and their relationships>

![UseCaseV2](images/UseCaseV2.png)


\<next describe here each use case in the UCD>
### Use case 1, Login (UC1)
| Actors Involved        | User, Mail company |
| ------------- |:-------------:| 
|  Precondition     | User not logged in, user registered |
|  Post condition     | User logged in |
|  Nominal Scenario     | Scenario 1.1 |
|  Variants     | Scenario 1.6 |
|  Exceptions     | Scenario 1.2, 1.3, 1.4, 1.5 |

##### Scenario 1.1 

\<describe here scenarios instances of UC1>

\<a scenario is a sequence of steps that corresponds to a particular execution of one use case>

\<a scenario is a more formal description of a story>

\<only relevant scenarios should be described>

| Scenario 1.1 | Login |
| ------------- |:-------------:| 
|  Precondition     | User not logged in, user registered |
|  Post condition     | User logged in |
| Step#        | Description  |
|  1     | User: Open the login page. |  
|  2     | User: Provide email, password. |
|  3     | System: Get email, password. The cookie check confirms that the user is not logged in. |
|  4	 | System: Given email, find the user. |
|  5	 | System: Given the user, compare the password provided with the one saved. They match. |
|  6	 | System: Authorize the user |

##### Scenario 1.2

| Scenario 1.2 | Wrong password |
| ------------- |:-------------:| 
|  Precondition     | User not logged in, user registered |
|  Post condition     | User not logged in |
| Step#        | Description  |
|  1     | User: Open the login page. |  
|  2     | User: Provide email, password. |
|  3     | System: Get email, password. The cookie check confirms that the user is not logged in. |
|  4	 | System: Given email, find the user. |
|  5	 | System: Given the user, compare the password provided with the one saved. They don't match. Return an error message to explain the problem. |

##### Scenario 1.3

| Scenario 1.3 | User not registered |
| ------------- |:-------------:| 
|  Precondition     | User not logged in, user not registered |
|  Post condition     | User not logged in |
| Step#        | Description  |
|  1     | User: Open the login page. |  
|  2     | User: Provide email, password. |
|  3     | System: Get email, password. The cookie check confirms that the user is not logged in. |
|  4	 | System: Given email, find the user. User not found. |
|  5	 | System: Show an error message to explain the problem. |

##### Scenario 1.4

| Scenario 1.4 | User already logged in |
| ------------- |:-------------:| 
|  Precondition     | User logged in, user registered |
|  Post condition     | User logged in |
| Step#        | Description  |
|  1     | User: Open the login page. |  
|  2     | User: Provide email, password. |
|  3     | System: Get email, password. The cookie check shows that the user is already logged in. |
|  4	 | System: Return an error message to explain the problem. |

##### Scenario 1.5

| Scenario 1.5 | Missing data |
| ------------- |:-------------:| 
|  Precondition     | None |
|  Post condition     | Error |
| Step#        | Description  |
|  1     | User: Open the login page. |  
|  2     | User: Don't provide email or password. |
|  3     | System: Get email, password. Notice that some data is missing. |
|  4	 | System: Return an error message to explain the problem. |

##### Scenario 1.6

| Scenario 1.6 | Password forgotten |
| ------------- |:-------------:| 
|  Precondition     | User not logged in, user registered |
|  Post condition     | Password recovered |
| Step#        | Description  |
|  1     | User: Open the login page. |  
|  2     | User: Click on "forgot password" button. |
|  3     | User: Provide the email of the account. |
|  4	 | System: Given email, find the user. User found. |
|  5	 | System: Create a link to reset the password, create the email body. |
|  6	 | Mail company: Send the email to the provided address. |
|  7     | User: Open the email, click on the link. Create a new password that respects the requirements. |
|  8     | System: Retrieve the new password, check that it satisfies the requirements. Update user information. |
|  9	 | System: Show a confirmation message. |

### Use case 2, Logout (UC2)

| Actors Involved        | User |
| ------------- |:-------------:| 
|  Precondition     | User logged in |
|  Post condition     | User not logged in |
|  Nominal Scenario     | Scenario 2.1 |
|  Variants     | Scenario 2.2 |
|  Exceptions     | Scenario 2.3, 2.4 |

##### Scenario 2.1 

| Scenario 2.1 | Logout through button |
| ------------- |:-------------:| 
|  Precondition     | User logged in |
|  Post condition     | User not logged in |
| Step#        | Description  |
|  1     | User: Open the homepage of EZWallet. |  
|  2     | System: Check that the user isn't already logged out. |
|  3     | User: Click on logout button. |
|  4     | System: Find the user. |
|  5	 | System: Update user information (remove authorization to the user device). |
|  6	 | System: Show a logout confirmation message. |

##### Scenario 2.2 

| Scenario 2.2 | Logout through address |
| ------------- |:-------------:| 
|  Precondition     | User logged in |
|  Post condition     | User not logged in |
| Step#        | Description  |
|  1     | User: Go to /logout address. |
|  2     | System: Check that the user isn't already logged out. |
|  3     | System: Find the user. |
|  4	 | System: Update user information (remove authorization to the user device). |
|  5	 | System: Show a logout confirmation message. |


##### Scenario 2.3 

| Scenario 2.3 | User already logged out |
| ------------- |:-------------:| 
|  Precondition     | User not logged in |
|  Post condition     | User not logged in |
| Step#        | Description  |
|  1     | User: Go to /logout address. |  
|  2     | System: Check that the user isn't already logged out. |
|  3     | System: User hasn't performed login yet. Display an error message. |

##### Scenario 2.4 

| Scenario 2.4 | The user doesn't exist |
| ------------- |:-------------:| 
|  Precondition     | None |
|  Post condition     | Error |
| Step#        | Description  |
|  1     | User: Go to /logout address. |
|  2     | System: Check that the user isn't already logged out. |
|  3     | System: Find the user. |
|  4	 | System: User not found, show an error message. |

### Use case 3, Registration (UC3)

| Actors Involved        | User, Admin |
| ------------- |:-------------:| 
|  Precondition     | The user doesn't have an account |
|  Post condition     | User registered |
|  Nominal Scenario     | Scenario 3.1 |
|  Variants     | Scenario 3.3 |
|  Exceptions     | Scenario 3.2, 3.4, 3.5 |

##### Scenario 3.1 

| Scenario 3.1 | Registration |
| ------------- |:-------------:| 
|  Precondition     | The user doesn't have an account |
|  Post condition     | User registered |
| Step#        | Description  |
|  1     | User: Open the login page of EZWallet. |  
|  2     | User: Click on register button. |
|  3     | User: Provide username, email, password. |
|  4     | System: Retrieve username, email, password. Check if the email provided has a valid format and if the password respects the security requirements. |
|  5     | System: Check that the provided email isn't associated with any account yet. The email hasn't been used yet. |
|  6     | System: Create a new user and store his information (encrypt in some way the password). |
|  7	 | System: Show a registration confirmation message. |

##### Scenario 3.2 

| Scenario 3.2 | User/admin already registered |
| ------------- |:-------------:| 
|  Precondition     | The user/admin has an account |
|  Post condition     | Registration failed |
| Step#        | Description  |
|  1     | User: Open the login page of EZWallet. |  
|  2     | User: Click on register button. |
|  3     | User: Provide username, email, password. |
|  4     | System: Retrieve username, email, password. Check if the email provided has a valid format and if the password respects the security requirements. |
|  5     | System: Check that the provided email isn't associated with any account yet. The email has already been used. |
|  6	 | System: Show an error message. |

##### Scenario 3.3 

| Scenario 3.3 | Admin registration |
| ------------- |:-------------:| 
|  Precondition     | The admin doesn't have an account |
|  Post condition     | Admin registered |
| Step#        | Description  |
|  1     | Admin: Open the invitation link. |  
|  2     | System: Check that the invitation link is valid. It's valid. |
|  3     | Admin: Provide username, email, password. |
|  4     | System: Retrieve username, email, password. Check if the email provided has a valid format and if the password respects the security requirements. |
|  5     | System: Check that the provided email isn't associated with any account yet. The email hasn't been used yet. |
|  6     | System: Create a new user and store his information (encrypt in some way the password). Grant to the user admin privileges. |
|  7	 | System: Show a registration confirmation message. |

##### Scenario 3.4 

| Scenario 3.4 | Wrong data format |
| ------------- |:-------------:| 
|  Precondition     | The user/admin doesn't have an account |
|  Post condition     | Registration failed |
| Step#        | Description  |
|  1     | User: Open the login page of EZWallet. |  
|  2     | User: Click on register button. |
|  3     | User: Provide username, email, password. Password and/or email have a wrong format. |
|  4     | System: Retrieve username, email, password. Email or password have a wrong format. |
|  5	 | System: Show an error message. |

##### Scenario 3.5 

| Scenario 3.5 | Admin link already used or invalid |
| ------------- |:-------------:| 
|  Precondition     | The admin doesn't have an account |
|  Post condition     | Error |
| Step#        | Description  |
|  1     | Admin: Open the invitation link. |  
|  2     | System: The invitation link has already been used or is invalid. |
|  3	 | System: Show an error message. |

### Use case 4, Handle transactions (UC4)

| Actors Involved        | User, Ad company |
| ------------- |:-------------:| 
|  Precondition     | The user is logged in, the user belongs to the group |
|  Post condition     | Transaction inserted/deleted/edited/shown |
|  Nominal Scenario     | Scenario 4.1, 4.2, 4.3, 4.6 |
|  Variants     | Scenario 4.5, 4.8 |
|  Exceptions     | Scenario 4.4, 4.7, 4.9 |

##### Scenario 4.1 

| Scenario 4.1 | Insert transaction |
| ------------- |:-------------:| 
|  Precondition     | The user is logged in, the user belongs to the group |
|  Post condition     | Transaction inserted |
| Step#        | Description  |
|  1     | User: Open the homepage of EZWallet. |  
|  2     | System: Check if the user is logged in. |
|  3     | User: Select the desired group. |  
|  4     | System: Check if the user belongs to the group. |
|  5     | System: Given the group, retrieve all the transactions in the current month and show them. Show advertisements. |
|  6     | System: Compute sum and average for the current month. Show them. |
|  7     | User: Insert in the proper fields name, date, amount, if it's recurrent (if so with which frequency) and type of the transaction. |
|  8     | User: Click on the button to create a transaction. |
|  9     | System: Retrieve name, date, amount, if it's recurrent (if so with which frequency) and type. Check if the category provided exists and if input format is correct. |
|  10    | System: Create a new transaction for the group and store its information. |
|  11	 | System: Show the new transaction among the others. Recompute sum and average.  |

##### Scenario 4.2

| Scenario 4.2 | Get the existing transactions |
| ------------- |:-------------:| 
|  Precondition     | The user is logged in, the user belongs to the group |
|  Post condition     | Transactions shown |
| Step#        | Description  |
|  1     | User: Open the homepage of EZWallet. |  
|  2     | System: Check if the user is logged in. |
|  3     | User: Select the desired group. | 
|  4     | System: Check if the user belongs to the group. | 
|  5     | System: Given the group, retrieve all the transactions in the current month and show them. Show advertisements. |
|  6     | System: Compute sum and average for the current month. Show them. |

##### Scenario 4.3

| Scenario 4.3 | Delete a transaction |
| ------------- |:-------------:| 
|  Precondition     | The user is logged in, the user belongs to the group |
|  Post condition     | Transaction deleted |
| Step#        | Description  |
|  1     | User: Open the homepage of EZWallet. |  
|  2     | System: Check if the user is logged in. |
|  3     | User: Select the desired group. |  
|  4     | System: Check if the user belongs to the group. |
|  5     | System: Given the group, retrieve all the transactions in the current month and show them. Show advertisements. |
|  6     | System: Compute sum and average for the current month. Show them. |
|  7     | User: Find the desired transaction and click on the button to delete it. |
|  8     | System: Retrieve the transaction ID and delete it. |
|  9     | System: Show a confirmation message, remove the transaction from the displayed ones. Recompute sum and average. |

##### Scenario 4.4

| Scenario 4.4 | User not logged in |
| ------------- |:-------------:| 
|  Precondition     | The user is not logged in |
|  Post condition     | Error |
| Step#        | Description  |
|  1     | User: Open the homepage of EZWallet. |
|  2     | System: Check if the user is logged in. The user isn't logged in. |
|  3	 | System: Show an error message. |

##### Scenario 4.5

| Scenario 4.5 | Missing data |
| ------------- |:-------------:| 
|  Precondition     | The user is not logged in, the user belongs to the group |
|  Post condition     | Transaction inserted |
| Step#        | Description  |
|  1     | User: Open the homepage of EZWallet. |  
|  2     | System: Check if the user is logged in. |
|  3     | User: Select the desired group. | 
|  4     | System: Check if the user belongs to the group. | 
|  5     | System: Given the group, retrieve all the transactions in the current month and show them. Show advertisements. |
|  6     | System: Compute sum and average for the current month. Show them. |
|  7     | User: Insert in the proper fields name, date, amount, if it's recurrent (if so with which frequency) and type of the transaction. Leave some/all fields blank. |
|  8     | User: Click on the button to create a transaction. |
|  9     | System: Retrieve name, date, amount, if it's recurrent (if so with which frequency) and type. Check if the category provided exists and if input format is correct. For missing data, insert some default values. |
|  10    | System: Create a new transaction for the group and store its information. |
|  11	 | System: Show the new transaction among the others. Recompute sum and average. |

##### Scenario 4.6 

| Scenario 4.6 | Edit transaction |
| ------------- |:-------------:| 
|  Precondition     | The user is logged in, the user belongs to the group |
|  Post condition     | Transaction edited |
| Step#        | Description  |
|  1     | User: Open the homepage of EZWallet. |  
|  2     | System: Check if the user is logged in. |
|  3     | User: Select the desired group. |  
|  4     | System: Check if the user belongs to the group. |
|  5     | System: Given the group, retrieve all the transactions in the current month and show them. Show advertisements. |
|  6     | System: Compute sum and average for the current month. Show them. |
|  7     | User: Find the desired transaction and click on the button to delete it. |
|  8     | System: Retrieve the transaction details and allow the user to edit them. |
|  9     | User: Update the desired field(s). |
|  10    | User: Click on the button to save the changes. |
|  11    | System: Retrieve name, date, amount, if it's recurrent (if so with which frequency) and type. Check if the category provided exists and if input format is correct. |
|  12    | System: Store the changes of the transaction. |
|  13	 | System: Show the updated transaction. Recompute sum and average. |

##### Scenario 4.7 

| Scenario 4.7 | Wrong data format |
| ------------- |:-------------:| 
|  Precondition     | The user is logged in, the user belongs to the group |
|  Post condition     | Error |
| Step#        | Description  |
|  1     | User: Open the homepage of EZWallet. |  
|  2     | System: Check if the user is logged in. |
|  3     | User: Select the desired group. |
|  4     | System: Check if the user belongs to the group. |  
|  5     | System: Given the group, retrieve all the transactions in the current month and show them. Show advertisements. |
|  6     | System: Compute sum and average for the current month. Show them. |
|  7     | User: Find the desired transaction and click on the button to edit it or click on the button to insert a new transaction. |
|  8     | System: Retrieve the transaction details and allow the user to edit them (only for edit). |
|  9     | User: Update/insert the desired field(s). |
|  10    | User: Click on the button to save the changes/insert the transaction. |
|  11    | System: Retrieve name, date, amount, if it's recurrent (if so with which frequency) and type. Check if the category provided exists and if input format is correct. The format is not correct and/or the category doesn't exist. |
|  12    | System: Show an error message. |

##### Scenario 4.8

| Scenario 4.8 | Filter existing transactions |
| ------------- |:-------------:| 
|  Precondition     | The user is logged in, the user belongs to the group |
|  Post condition     | Transactions shown |
| Step#        | Description  |
|  1     | User: Open the homepage of EZWallet. |  
|  2     | System: Check if the user is logged in. |
|  3     | User: Select the desired group. |  
|  4     | System: Check if the user belongs to the group. |
|  5     | System: Given the group, retrieve all the transactions in the current month and show them. Show advertisements. |
|  6     | System: Compute sum and average for the current month. Show them. |
|  7     | User: Edit visualization filters (categories shown and/or time period considered). |  
|  8     | System: Retrieve all the transactions with the updated filters and show them. Show advertisements. |
|  9     | System: Recompute sum and average for the current filters. |

##### Scenario 4.9

| Scenario 4.9 | User not belonging to the group |
| ------------- |:-------------:| 
|  Precondition     | The user is logged in, the user doesn't belong to the group |
|  Post condition     | Error |
| Step#        | Description  |
|  1     | User: Open the homepage of EZWallet. |  
|  2     | System: Check if the user is logged in. |
|  3     | User: Somehow selects a group to which he doesn't belong (through url,...). |  
|  4     | System: Check if the user belongs to the group. He doesn't belong to the group. |
|  5     | System: Show an error message. |

### Use case 5, Handle categories (UC5)

| Actors Involved        | User, Ad company |
| ------------- |:-------------:| 
|  Precondition     | The user is logged in, the user belongs to the group |
|  Post condition     | Category inserted/shown/edited/deleted |
|  Nominal Scenario     | Scenario 5.1, 5.2, 5.5, 5.6 |
|  Variants     | Scenario 5.4 |
|  Exceptions     | Scenario 5.3, 5.7 |

For categories, it's not necessary to implement checks on input since the name is just a string and the color is chosen through a color picker, so it's impossible to have errors.

##### Scenario 5.1 

| Scenario 5.1 | Insert category |
| ------------- |:-------------:| 
|  Precondition     | The user is logged in, the user belongs to the group |
|  Post condition     | Category inserted |
| Step#        | Description  |
|  1     | User: Open the category page of a given group. |  
|  2     | System: Check if the user is logged in and if he belongs to the group. |
|  3     | System: Retrieve all the categories of the group and show them. Show advertisements. |
|  4	 | User: Click on insert category button. |
|  5     | User: Insert category type and pick the desired color. |
|  6     | User: Click on save button. |
|  7     | System: Retrieve type and color. |
|  8     | System: Create a new category and store its information. |
|  9	 | System: Show the new category among the others. |

##### Scenario 5.2

| Scenario 5.2 | Get categories |
| ------------- |:-------------:| 
|  Precondition     | The user is logged in, the user belongs to the group |
|  Post condition     | Categories shown |
| Step#        | Description  |
|  1     | User: Open the category page of a given group. |  
|  2     | System: Check if the user is logged in and if he belongs to the group. |
|  3     | System: Retrieve all the categories of the group and show them. Show advertisements. |

##### Scenario 5.3

| Scenario 5.3 | User not logged in |
| ------------- |:-------------:| 
|  Precondition     | The user is not logged in |
|  Post condition     | Error |
| Step#        | Description  |
|  1     | User: Open the category page of a given group. |
|  2     | System: Check if the user is logged in. The user isn't logged in. |
|  3	 | System: Show an error message. |

##### Scenario 5.4

| Scenario 5.4 | Missing data |
| ------------- |:-------------:| 
|  Precondition     | The user is logged in, the user belongs to the group |
|  Post condition     | Category inserted |
| Step#        | Description  |
|  1     | User: Open the category page of a given group. |  
|  2     | System: Check if the user is logged in and if he belongs to the group. |
|  3     | System: Retrieve all the categories and show them. |
|  4	 | User: Click on insert category button. |
|  5     | User: Insert category type and pick the desired color. Leave type and/or color blank. |
|  6     | User: Click on save button. |
|  7     | System: Retrieve type and color. |
|  8     | System: Create a new category and store its information. In case of mising data, use default values. |
|  9	 | System: Show the new category among the others. |

##### Scenario 5.5 

| Scenario 5.5 | Edit a category |
| ------------- |:-------------:| 
|  Precondition     | The user is logged in, the user belongs to the group |
|  Post condition     | Category edited |
| Step#        | Description  |
|  1     | User: Open the category page of a given group. |  
|  2     | System: Check if the user is logged in and if he belongs to the group. |
|  3     | System: Retrieve all the categories of the group and show them. Show advertisements. |
|  4	 | User: Click on the desired category. |
|  5     | System: Retrieve category details and show them. |
|  6	 | User: Click on edit button. |
|  7     | System: Allow the editing of the fields. |
|  8     | User: Edit category name and/or color. |
|  9     | User: Click on save button. |
|  10    | System: Retrieve updated type and color. |
|  11    | System: Store the updated category information. |
|  12	 | System: Show the updated category among the others. |

##### Scenario 5.6 

| Scenario 5.6 | Delete a category |
| ------------- |:-------------:| 
|  Precondition     | The user is logged in, the user belongs to the group |
|  Post condition     | Category deleted |
| Step#        | Description  |
|  1     | User: Open the category page of a given group. |  
|  2     | System: Check if the user is logged in and if he belongs to the group. |
|  3     | System: Retrieve all the categories of the group and show them. Show advertisements. |
|  4	 | User: Click on the desired category. |
|  5     | System: Retrieve category details and show them. |
|  6	 | User: Click on delete button. |
|  7     | System: Delete the category. |
|  8	 | System: Show the updated category page. |

##### Scenario 5.7

| Scenario 5.7 | User not belonging to the group |
| ------------- |:-------------:| 
|  Precondition     | The user is logged in, the user doesn't belong to the group |
|  Post condition     | Error |
| Step#        | Description  |
|  1     | User: Somehow opens the category page of a group to which he doesn't belong. |  
|  2     | System: Check if the user is logged in and if he belongs to the group. He doesn't belong to the group. |
|  3     | System: Show an error message. |

### Use case 6, Get labels (UC6)

| Actors Involved        | User, Ad company |
| ------------- |:-------------:| 
|  Precondition     | The user is logged in, the user belongs to the group |
|  Post condition     | Labels shown |
|  Nominal Scenario     | Scenario 6.1 |
|  Variants     | None |
|  Exceptions     | Scenario 6.2, 6.3 |

##### Scenario 6.1 

| Scenario 6.1 | Get labels |
| ------------- |:-------------:| 
|  Precondition     | The user is logged in, the user belongs to the group |
|  Post condition     | Labels shown |
| Step#        | Description  |
|  1     | User: Open the label page of a given group. |  
|  2     | System: Check if the user is logged in and if he belongs to the group. |
|  3     | System: Retrieve all the transactions and the categories. Add to each transaction the details about the category. |
|  4	 | System: Show all the labels. Show advertisements. |

##### Scenario 6.2

| Scenario 6.2 | User not logged in |
| ------------- |:-------------:| 
|  Precondition     | The user is not logged in |
|  Post condition     | Error |
| Step#        | Description  |
|  1     | User: Open the label page of a given group. |
|  2     | System: Check if the user is logged in. The user isn't logged in. |
|  3	 | System: Show an error message. |

##### Scenario 6.3

| Scenario 6.3 | User not belonging to the group |
| ------------- |:-------------:| 
|  Precondition     | The user is logged in, the user doesn't belong to the group |
|  Post condition     | Error |
| Step#        | Description  |
|  1     | User: Somehow opens the label page of a group to which he doesn't belong. |  
|  2     | System: Check if the user is logged in and if he belongs to the group. He doesn't belong to the group. |
|  3     | System: Show an error message. |

### Use case 7, Handle users (UC7)

| Actors Involved        | Admin, Ad company, Mail company |
| ------------- |:-------------:| 
|  Precondition     | Admin logged in |
|  Post condition     | User(s) shown/edited/deleted/inserted, Admin invitation created |
|  Nominal Scenario     | Scenario 7.1, 7.3, 7.4, 7.5, 7.6 |
|  Variants     | None |
|  Exceptions     | Scenario 7.2 |

##### Scenario 7.1 

| Scenario 7.1 | Get users |
| ------------- |:-------------:| 
|  Precondition     | Admin logged in |
|  Post condition     | Users shown |
| Step#        | Description  |
|  1     | Admin: Open the management tab. |  
|  2     | System: Check if the user is logged in and if he has admin privileges. |
|  3     | System: Retrieve the list of all users and show it. Show advertisements. |

##### Scenario 7.2 

| Scenario 7.2 | Standard user tries to get users information |
| ------------- |:-------------:| 
|  Precondition     | User logged in |
|  Post condition     | Error |
| Step#        | Description  |
|  1     | User: Somehow open the management tab (through /user url, ...). |  
|  2     | System: Check if the user is logged in and if he has admin privileges. He hasn't admin privileges. |
|  3     | System: Show an error message. |

##### Scenario 7.3

| Scenario 7.3 | Edit user information |
| ------------- |:-------------:| 
|  Precondition     | Admin logged in |
|  Post condition     | User edited |
| Step#        | Description  |
|  1     | Admin: Open the management tab. |  
|  2     | System: Check if the user is logged in and if he has admin privileges. |
|  3     | System: Retrieve the list of all users and show it. Show advertisements. |
|  4     | Admin: Click on edit button for a given user. |  
|  5     | System: Retrieve user information and show them in editing mode. |
|  6     | Admin: Update some of the fields. Click on save button. |
|  7     | System: Retrieve updated fields. Check if input format satisfies the requirements (as seen in register scenario). |
|  8     | System: Update user information. Show a confirmation message. |

##### Scenario 7.4

| Scenario 7.4 | Delete user |
| ------------- |:-------------:| 
|  Precondition     | Admin logged in |
|  Post condition     | User deleted |
| Step#        | Description  |
|  1     | Admin: Open the management tab. |  
|  2     | System: Check if the user is logged in and if he has admin privileges. |
|  3     | System: Retrieve the list of all users and show it. Show advertisements. |
|  4     | Admin: Click on delete button for a given user. |  
|  5     | System: Retrieve user. Delete him. |
|  8     | System: Show a confirmation message. |

##### Scenario 7.5

| Scenario 7.5 | Insert user |
| ------------- |:-------------:| 
|  Precondition     | Admin logged in |
|  Post condition     | User inserted |
| Step#        | Description  |
|  1     | Admin: Open the management tab. |  
|  2     | System: Check if the user is logged in and if he has admin privileges. |
|  3     | System: Retrieve the list of all users and show it. Show advertisements. |
|  4     | Admin: Click on insert button. |  
|  5     | System: Show insertion mode. |
|  6     | Admin: Provide username, email, password. Click on save button. |
|  7     | System: Retrieve username, email, password. Check if input format satisfies the requirements (as seen in register scenario). |
|  8     | System: Insert user. Show a confirmation message. |

Since the exceptions that can occur during insertion or editing are the same ones seen for registration (email already used, wrong input format, ...) we won't report them again for the sake of brevity.

##### Scenario 7.6

| Scenario 7.6 | Create admin invitation link |
| ------------- |:-------------:| 
|  Precondition     | Admin logged in |
|  Post condition     | Admin invitation link sent |
| Step#        | Description  |
|  1     | Admin: Open the management tab. |  
|  2     | System: Check if the user is logged in and if he has admin privileges. |
|  3     | System: Retrieve the list of all users and show it. Show advertisements. |
|  4     | Admin: Click on "invite admin" button. |  
|  6     | Admin: Provide the email of the new admin. Click on send button. |
|  7     | System: Create email body. Create a valid invitation link and include it in the body. |
|  8     | Mail company: Send the email to the provided address. |
|  8     | System: Show a confirmation message. |

### Use case 8, Manage account (UC8)

| Actors Involved        | User, Ad company |
| ------------- |:-------------:| 
|  Precondition     | User logged in |
|  Post condition     | User information shown/updated/deleted |
|  Nominal Scenario     | Scenario 8.1, 8.5, 8.6 |
|  Variants     | None |
|  Exceptions     | Scenario 8.2, 8.3, 8.4 |

##### Scenario 8.1

| Scenario 8.1 | Get user information |
| ------------- |:-------------:| 
|  Precondition     | The user is logged in |
|  Post condition     | User information shown |
| Step#        | Description  |
|  1     | User: Click on user management tab. |  
|  2     | System: Check if the user is logged in. |
|  3     | System: Retrieve the details about the user that's performing the request. |
|  4     | System: Check if the username provided matches with the user's one. They match. |
|  5     | System: Show user information. Show advertisements. |

##### Scenario 8.2

| Scenario 8.2 | User not logged in |
| ------------- |:-------------:| 
|  Precondition     | The user is not logged in |
|  Post condition     | Error |
| Step#        | Description  |
|  1     | User: Click on user management tab. |  
|  2     | System: Check if the user is logged in. The user isn't logged in. |
|  3     | System: Show an error message. |

##### Scenario 8.3

| Scenario 8.3 | User not found |
| ------------- |:-------------:| 
|  Precondition     | The user is not logged in |
|  Post condition     | Error |
| Step#        | Description  |
|  1     | User: Click on user management tab. Somehow provide as parameter a username that doesn't belong to anyone. |  
|  2     | System: Check if the user is logged in. |
|  3     | System: Retrieve the details about the user that's performing the request. User not found. |
|  4     | System: Show an error message. |

##### Scenario 8.4

| Scenario 8.4 | The username provided is wrong |
| ------------- |:-------------:| 
|  Precondition     | The user is logged in |
|  Post condition     | Error |
| Step#        | Description  |
|  1     | User: Clicks on user management tab. Somehow provides as parameter a username different than his one. |  
|  2     | System: Check if the user is logged in. |
|  3     | System: Retrieve the details about the user that's performing the request. |
|  4     | System: Check if the username provided matches with the user's one. They don't match. |
|  5     | System: Show an error message. |

##### Scenario 8.5

| Scenario 8.5 | Edit user information |
| ------------- |:-------------:| 
|  Precondition     | The user is logged in |
|  Post condition     | User information edited |
| Step#        | Description  |
|  1     | User: Click on user management tab. |  
|  2     | System: Check if the user is logged in. |
|  3     | System: Retrieve the details about the user that's performing the request. |
|  4     | System: Check if the username provided matches with the user's one. They match. |
|  5     | System: Show user information. Show advertisements. |
|  6     | User: Click on edit button. |
|  7     | System: Show user information in editing mode. |
|  8     | User: Update fields. Click on save button. |
|  9     | System: Check if input format is correct. Store the updated information. |
|  10    | System: Show the updated information. |

##### Scenario 8.6

| Scenario 8.6 | Delete user |
| ------------- |:-------------:| 
|  Precondition     | The user is logged in |
|  Post condition     | User information edited |
| Step#        | Description  |
|  1     | User: Click on user management tab. |  
|  2     | System: Check if the user is logged in. |
|  3     | System: Retrieve the details about the user that's performing the request. |
|  4     | System: Check if the username provided matches with the user's one. They match. |
|  5     | System: Show user information. Show advertisements. |
|  6     | User: Click on "delete account" button. |
|  7     | System: Delete the user. |
|  8     | System: Show a confirmation message. |

### Use case 9, Show advertisements (UC9)

| Actors Involved        | User, Ad company |
| ------------- |:-------------:| 
|  Precondition     | Any page shown |
|  Post condition     | Advertisements shown |
|  Nominal Scenario     | Scenario 9.1 |
|  Variants     | None |
|  Exceptions     | Scenario 9.2 |

##### Scenario 9.1

| Scenario 9.1 | Show advertisements |
| ------------- |:-------------:| 
|  Precondition     | Any page shown  |
|  Post condition     | Advertisements shown |
| Step#        | Description  |
|  1     | User: Open any page of EZWallet. |  
|  2     | System: Display the page. Ask to the ad company the advertisements. |
|  3     | Ad company: Provide the advertisements. |
|  4     | System: Display the advertisements on the page. |

##### Scenario 9.2

| Scenario 9.2 | Advertisements retrieval failed |
| ------------- |:-------------:| 
|  Precondition     | Any page shown  |
|  Post condition     | Advertisements retrieval failed |
| Step#        | Description  |
|  1     | User: Open any page of EZWallet. |  
|  2     | System: Display the page. Ask to the ad company the advertisements. |
|  3     | System: Advertisements retrieval failed. |
|  4     | System: Advertisements not shown. |

Since the error can be caused by many factors (problems on EZWallet side, on Ad company side, ...) and since they are too implementation dependent it's not interesting to analyze them, and thus we just reported a generic error scenario.

### Use case 10, Compute sum and average (UC10)

| Actors Involved        | User |
| ------------- |:-------------:| 
|  Precondition     | Transactions shown |
|  Post condition     | Sum and average shown |
|  Nominal Scenario     | Scenario 10.1 |
|  Variants     | Scenario 10.2 |
|  Exceptions     | None |

##### Scenario 10.1

| Scenario 10.1 | Sum and average computation |
| ------------- |:-------------:| 
|  Precondition     | Transactions shown  |
|  Post condition     | Sum and average shown |
| Step#        | Description  |
|  1     | User: Open any page of EZWallet containing transactions. |  
|  2     | System: Given the transactions compute the sum of all the amounts. |
|  3     | System: Given the transactions compute the average cost of a transaction. |
|  4     | System: Show sum and average. |

### Use case 11, Manage groups (UC11)

| Actors Involved        | User, Group owner/creator, Ad company |
| ------------- |:-------------:| 
|  Precondition     | Group not existing |
|  Post condition     | Group created, member added/removed/invited, member privileges changed |
|  Nominal Scenario     | Scenario 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.9 |
|  Variants     | None |
|  Exceptions     | Scenario 11.7, 11.8 |

##### Scenario 11.1

| Scenario 11.1 | Group creation |
| ------------- |:-------------:| 
|  Precondition     | Group not existing  |
|  Post condition     | Group created |
| Step#        | Description  |
|  1     | User: Open the homepage of EZWallet. |  
|  2     | System: Check if the user is logged in. |
|  3     | User: Click on "create group" button. |
|  4     | System: Show group creation page. Show advertisements. |
|  5     | User: Provide group name and currency. Click on create button. |
|  6     | System: Retrieve group information. Create group. Set the user as group owner. |
|  7     | System: Show a confirmation message. |

##### Scenario 11.2

| Scenario 11.2 | Edit group |
| ------------- |:-------------:| 
|  Precondition     | Group existing  |
|  Post condition     | Group updated |
| Step#        | Description  |
|  1     | Group admin/owner: Open the homepage of EZWallet. |  
|  2     | System: Check if the user is logged in. Retrieve all the groups to which the user belongs and display them with the correct visualization (show edit button only if he is the owner or a group admin). Show advertisements. |
|  3     | Group admin/owner: Select the desired group. Click on edit button. |
|  4     | System: Show group management tab. Show advertisements. |
|  3     | Group admin/owner: Update the desired fields. Click on save button. |
|  4     | System: Retrieve the updated fields. Store the modifications. |
|  4     | System: Show a confirmation message. |

##### Scenario 11.3

| Scenario 11.3 | Delete group |
| ------------- |:-------------:| 
|  Precondition     | Group existing  |
|  Post condition     | Group deleted |
| Step#        | Description  |
|  1     | Group owner: Open the homepage of EZWallet. |  
|  2     | System: Check if the user is logged in. Retrieve all the groups to which the user belongs and display them with the correct visualization (show edit button only if he is the owner or a group admin). Show advertisements. |
|  3     | Group owner: Select the desired group. Click on edit button. |
|  4     | System: Show group management tab. If the user is the group owner, show a delete button too. Show advertisements. |
|  5     | Group owner: Click on delete button. |
|  6     | System: Delete the group. |
|  7     | System: Show a confirmation message. |

##### Scenario 11.4

| Scenario 11.4 | Invite user |
| ------------- |:-------------:| 
|  Precondition     | Group existing  |
|  Post condition     | User added |
| Step#        | Description  |
|  1     | Group admin/owner: Open the homepage of EZWallet. |  
|  2     | System: Check if the user is logged in. Retrieve all the groups to which the user belongs and display them with the correct visualization (show edit button only if he is the owner or a group admin). Show advertisements. |
|  3     | Group admin/owner: Open the desired group. |
|  4     | System: Show group homepage. Show group transactions (as seen in handle transactions use case). If the user is the group owner or a group admin, show a button to add users. Show advertisements. |
|  5     | Group admin/owner: Click on "add user" button. |
|  6     | Group admin/owner: Provide the email of the user that will be added. |
|  7     | System: Search for the user. User found. Add the user to the group. |
|  8     | System: Show a confirmation message. |

##### Scenario 11.5

| Scenario 11.5 | Handle group member privileges |
| ------------- |:-------------:| 
|  Precondition     | Group existing  |
|  Post condition     | Member privileges update |
| Step#        | Description  |
|  1     | Group admin/owner: Open the homepage of EZWallet. |  
|  2     | System: Check if the user is logged in. Retrieve all the groups to which the user belongs and display them with the correct visualization (show edit button only if he is the owner or a group admin). Show advertisements. |
|  3     | Group admin/owner: Select the desired group. Click on edit button. |
|  4     | System: Show group management tab. Show advertisements. |
|  5     | Group admin/owner: Select a certain member. Click on the button to increase or decrease his privileges. |
|  6     | System: Update group admin/group owner. |
|  7     | System: Show a confirmation message. |

The group hierarchy is group owner -> group admin -> group member. There can be only one owner, so if the owner promotes a member to owner he automatically becomes admin.

##### Scenario 11.6

| Scenario 11.6 | Remove member |
| ------------- |:-------------:| 
|  Precondition     | Group existing |
|  Post condition     | Member removed |
| Step#        | Description  |
|  1     | Group admin/owner: Open the homepage of EZWallet. |  
|  2     | System: Check if the user is logged in. Retrieve all the groups to which the user belongs and display them with the correct visualization (show edit button only if he is the owner or a group admin). Show advertisements. |
|  3     | Group admin/owner: Select the desired group. Click on edit button. |
|  4     | System: Show group management tab. Show advertisements. |
|  5     | Group admin/owner: Select a certain member. Click on the button to remove it. |
|  6     | System: Check if the user performing the action has higher privileges than the removed user. Remove the user from the group. |
|  7     | System: Show a confirmation message. |

##### Scenario 11.7

| Scenario 11.7 | The user invited is not registered |
| ------------- |:-------------:| 
|  Precondition     | Group existing |
|  Post condition     | User not added |
| Step#        | Description  |
|  1     | Group admin/owner: Open the homepage of EZWallet. |  
|  2     | System: Check if the user is logged in. Retrieve all the groups to which the user belongs and display them with the correct visualization (show edit button only if he is the owner or a group admin). Show advertisements. |
|  3     | Group admin/owner: Open the desired group. |
|  4     | System: Show group homepage. Show group transactions (as seen in handle transactions use case). If the user is the group owner or a group admin, show a button to add users. Show advertisements. |
|  5     | Group admin/owner: Click on "add user" button. |
|  6     | Group admin/owner: Provide the email of the user that will be added. |
|  7     | System: Search for the user. User not found. |
|  8     | System: Show an error message. |

##### Scenario 11.8

| Scenario 11.8 | A member tries to remove another member that has higher privileges |
| ------------- |:-------------:| 
|  Precondition     | Group existing  |
|  Post condition     | Member not removed |
| Step#        | Description  |
|  1     | Group admin/owner: Open the homepage of EZWallet. |  
|  2     | System: Check if the user is logged in. Retrieve all the groups to which the user belongs and display them with the correct visualization (show edit button only if he is the owner or a group admin). Show advertisements. |
|  3     | Group admin/owner: Select the desired group. Click on edit button. |
|  4     | System: Show group management tab. Show advertisements. |
|  5     | Group admin/owner: Select a certain member. Click on the button to remove it. |
|  6     | System: The user performing the action hasn't higher privileges than the removed user. |
|  7     | System: Show an error message. |

##### Scenario 11.9

| Scenario 11.9 | Leave group |
| ------------- |:-------------:| 
|  Precondition     | Group existing |
|  Post condition     | Member removed |
| Step#        | Description  |
|  1     | User: Open the homepage of EZWallet. |  
|  2     | System: Check if the user is logged in. Retrieve all the groups to which the user belongs and display them with the correct visualization (show edit button only if he is the owner or a group admin). Show advertisements. |
|  3     | User: Select the desired group. Click on edit button. |
|  4     | System: Show group management tab. Show advertisements. |
|  5     | User: Click on leave button. |
|  6     | System: If the member leaving is the group owner, delete the group. Remove the user from the group. |
|  7     | System: Show a confirmation message. |

### Use case 12, Manage statistics (UC12)

| Actors Involved        | User, Ad company |
| ------------- |:-------------:| 
|  Precondition     | The user is logged in, the user belongs to the group  |
|  Post condition     | Statistics shown |
|  Nominal Scenario     | Scenario 12.1 |
|  Variants     | Scenario 12.2 |
|  Exceptions     | None |

##### Scenario 12.1

| Scenario 12.1 | Show statistics |
| ------------- |:-------------:| 
|  Precondition     | The user is logged in, the user belongs to the group  |
|  Post condition     | Statistics shown |
| Step#        | Description  |
|  1     | User: Open the homepage of EZWallet. |  
|  2     | System: Check if the user is logged in. |
|  3     | User: Select the desired group. |  
|  4     | System: Check if the user belongs to the group. |
|  5     | User: Open the statistics page. Show advertisements. |
|  6     | System: Compute statistics regarding the group. Show the most expensive categories and months. |

##### Scenario 12.2

| Scenario 12.2 | No transactions |
| ------------- |:-------------:| 
|  Precondition     | The user is logged in, the user belongs to the group  |
|  Post condition     | Statistics shown |
| Step#        | Description  |
|  1     | User: Open the homepage of EZWallet. |  
|  2     | System: Check if the user is logged in. |
|  3     | User: Select the desired group. |  
|  4     | System: Check if the user belongs to the group. |
|  5     | User: Open the statistics page. Show advertisements. |
|  6     | System: Compute statistics regarding the group. There are no transactions. |
|  7     | System: Show a message to tell the user to add transactions. |

# Glossary

\<use UML class diagram to define important terms, or concepts in the domain of the application, and their relationships> 

![GlossaryV2](images/GlossaryV2.png)

\<concepts must be used consistently all over the document, ex in use cases, requirements etc>

# System Design
\<describe here system design>

![SystemDesignV2](images/SystemDesignV2.png)

\<must be consistent with Context diagram>

# Deployment Diagram 

\<describe here deployment diagram >

![DeploymentV2](images/DeploymentV2.png)


