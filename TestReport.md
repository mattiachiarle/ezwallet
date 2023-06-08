# Test Report

<The goal of this document is to explain how the application was tested, detailing how the test cases were defined and what they cover>

# Contents

- [Dependency graph](#dependency-graph)

- [Integration approach](#integration-approach)

- [Tests](#tests)

- [Coverage](#Coverage)





# Dependency graph 

![Dependency_Graph](./images/dependency_graph.png)
     
# Integration approach

We decided to use the bottom-up approach for our tests. Due to this, firstly we tested the functions stored in auth.js and utils.js independently (by using unit tests), and when we were sure that they successfully fulfilled all the requirements we started testing the functions in users.js and controller.js.

For the sake of brevity, we won't include in the steps all the library functions (since we didn't test them and we assume that they are correct).

## Auth.js

- register

    Step 1: unit register

- registerAdmin

    Step 1: unit registerAdmin

- login

    Step 1: unit login

- logout

    Step 1: unit logout

## Utils.js



## Users.js



## Controller.js
    
- createCategory

    Step 1: unit verifyAuth

    Step 2: unit verifyAuth+unit createCategory

- updateCategory

    Step 1: unit verifyAuth

    Step 2: unit verifyAuth+unit updateCategory

- deleteCategory

    Step 1: unit verifyAuth

    Step 2: unit verifyAuth+unit deleteCategory

- getCategories

    Step 1: unit verifyAuth

    Step 2: unit verifyAuth+unit getCategories

- createTransaction

    Step 1: unit verifyAuth

    Step 2: unit verifyAuth+unit createTransaction

- getAllTransactions

    Step 1: unit verifyAuth

    Step 2: unit verifyAuth+unit getAllTransactions

- getTransactionsByUser

    Step 1: unit verifyAuth

    Step 2: unit handleDateFilterParams

    Step 3: unit handleAmountFilterParams

    Step 4: unit verifyAuth+unit handleDateFilterParams+unit handleAmountFilterParams+unit getTransactionsByUser

# Tests

   <in the table below list the test cases defined For each test report the object tested, the test level (API, integration, unit) and the technique used to define the test case  (BB/ eq partitioning, BB/ boundary, WB/ statement coverage, etc)>   <split the table if needed>


## Auth.js

### Unit

| Test case name | Object(s) tested | Test level | Technique used |
|--|--|--|--|
|Register|------|------|------|
|Correct registration|register|Unit|WB|
|Missing username|register|Unit|WB|
|Missing email|register|Unit|WB|
|Missing password|register|Unit|WB|
|Empty username|register|Unit|WB|
|Empty email|register|Unit|WB|
|Empty password|register|Unit|WB|
|Email not valid|register|Unit|WB|
|Username already used|register|Unit|WB|
|Email already used|register|Unit|WB|
|DB error|register|Unit|WB|
|Register admin|------|------|------|
|||||
|Login|------|------|------|
|Correct login|login|Unit|WB|
|Email missing|login|Unit|WB|
|Password missing|login|Unit|WB|
|Empty email|login|Unit|WB|
|Empty password|login|Unit|WB|
|Email not valid|login|Unit|WB|
|User not found|login|Unit|WB|
|Wrong password|login|Unit|WB|
|DB error|register|Unit|WB|


### Integration

| Test case name | Object(s) tested | Test level | Technique used |
|--|--|--|--|
|Register|------|------|------|
|Correct registration|register|Integration|BB equivalence+boundary|
|Missing username|register|Integration|BB equivalence|
|Missing email|register|Integration|BB equivalence|
|Missing password|register|Integration|BB equivalence|
|Empty username|register|Integration|BB boundary|
|Empty email|register|Integration|BB boundary|
|Empty password|register|Integration|BB boundary|
|Email not valid|register|Integration|BB equivalence+boundary|
|Username already used|register|Integration|BB equivalence|
|Email already used|register|Integration|BB equivalence|
|Register admin|------|------|------|
|||||
|Login|------|------|------|
|Correct login|login|Integration|BB equivalence+boundary|
|Email missing|login|Integration|BB equivalence|
|Password missing|login|Integration|BB equivalence|
|Empty email|login|Integration|BB boundary|
|Empty password|login|Integration|BB boundary|
|Email not valid|login|Integration|BB equivalence+boundary|
|User not found|login|Integration|BB equivalence|
|Wrong password|login|Integration|BB equivalence|

## Utils.js

### Unit

| Test case name | Object(s) tested | Test level | Technique used |
|--|--|--|--|
|||||

### Integration

| Test case name | Object(s) tested | Test level | Technique used |
|--|--|--|--|
|||||

## Users.js

### Unit

| Test case name | Object(s) tested | Test level | Technique used |
|--|--|--|--|
|||||

### Integration

| Test case name | Object(s) tested | Test level | Technique used |
|--|--|--|--|
|||||

## Controller.js

### Unit

| Test case name | Object(s) tested | Test level | Technique used |
|--|--|--|--|
|Create category|------|------|------|
|Correct category insertion|createCategory|Unit|WB|
|Missing type|createCategory|Unit|WB|
|Missing color|createCategory|Unit|WB|
|Missing type and color|createCategory|Unit|WB|
|Empty type|createCategory|Unit|WB|
|Empty color|createCategory|Unit|WB|
|Empty type, missing color|createCategory|Unit|WB|
|Insert twice a category with the same name|createCategory|Unit|WB|
|Not an admin|createCategory|Unit|WB|
|DB insertion goes wrong|createCategory|Unit|WB|
|Update category|------|------|------|
|Correct update|updateCategory|Unit|WB|
|Missing type|updateCategory|Unit|WB|
|Missing color|updateCategory|Unit|WB|
|Missing type and color|updateCategory|Unit|WB|
|Empty type|updateCategory|Unit|WB|
|Empty color|updateCategory|Unit|WB|
|Empty type, missing color|updateCategory|Unit|WB|
|Category not existing|updateCategory|Unit|WB|
|New type already in use|updateCategory|Unit|WB|
|Not an admin|updateCategory|Unit|WB|
|DB update goes wrong|updateCategory|Unit|WB|
|Delete category|------|------|------|
|Correct, N>T|deleteCategory|Unit|WB|
|Correct, N=T|deleteCategory|Unit|WB|
|Types not passed|deleteCategory|Unit|WB|
|Try to delete the last category|deleteCategory|Unit|WB|
|One of the types is an empty string|deleteCategory|Unit|WB|
|Empty array|deleteCategory|Unit|WB|
|One of the types isn't a category|deleteCategory|Unit|WB|
|Not an admin|deleteCategory|Unit|WB|
|DB delete goes wrong|deleteCategory|Unit|WB|
|Get categories|------|------|------|
|Correct category retrieval|getCategories|Unit|WB|
|Not logged in|getCategories|Unit|WB|
|DB retrieval goes wrong|getCategories|Unit|WB|
|Create transaction|------|------|------|
|Correct transaction creation|createTransaction|Unit|WB|
|Username missing|createTransaction|Unit|WB|
|Amount missing|createTransaction|Unit|WB|
|Type missing|createTransaction|Unit|WB|
|Username empty|createTransaction|Unit|WB|
|Type empty|createTransaction|Unit|WB|
|Category not existing|createTransaction|Unit|WB|
|The username of the transaction is different by the one in the route|createTransaction|Unit|WB|
|The username of the transaction doesn't exist|createTransaction|Unit|WB|
|The username in the route doesn't exist|createTransaction|Unit|WB|
|The amount is not a float|createTransaction|Unit|WB|
|Not the same user/not logged in|createTransaction|Unit|WB|
|DB insertion goes wrong|createTransaction|Unit|WB|

### Integration

| Test case name | Object(s) tested | Test level | Technique used |
|--|--|--|--|
|Create category|------|------|------|
|Correct category insertion|createCategory|Integration|BB equivalence+boundary|
|Missing type|createCategory|Integration|BB equivalence|
|Missing color|createCategory|Integration|BB equivalence|
|Missing type and color|createCategory|Integration|BB equivalence|
|Empty type|createCategory|Integration|BB boundary|
|Empty color|createCategory|Integration|BB boundary|
|Empty type, missing color|createCategory|Integration|BB equivalence+boundary|
|Insert twice a category with the same name|createCategory|Integration|BB equivalence|
|Not an admin|createCategory|Integration|BB equivalence|
|Not logged in|createCategory|Integration|BB equivalence|
|Update category|------|------|------|
|Correct update|updateCategory|Integration|BB equivalence+boundary|
|Missing type|updateCategory|Integration|BB equivalence|
|Missing color|updateCategory|Integration|BB equivalence|
|Missing type and color|updateCategory|Integration|BB equivalence|
|Empty type|updateCategory|Integration|BB boundary|
|Empty color|updateCategory|Integration|BB boundary|
|Empty type, missing color|updateCategory|Integration|BB equivalence+boundary|
|Category not existing|updateCategory|Integration|BB equivalence|
|New type already in use|updateCategory|Integration|BB equivalence|
|Not an admin|updateCategory|Integration|BB equivalence|
|Not logged in|updateCategory|Integration|BB equivalence|
|Delete category|------|------|------|
|Correct, N>T|deleteCategory|Integration|BB equivalence|
|Correct, N=T|deleteCategory|Integration|BB equivalence+boundary|
|Types not passed|deleteCategory|Integration|BB equivalence|
|Try to delete the last category|deleteCategory|Integration|BB equivalence+boundary|
|One of the types is an empty string|deleteCategory|Integration|BB boundary|
|Empty array|deleteCategory|Integration|BB boundary|
|One of the types isn't a category|deleteCategory|Integration|BB equivalence+boundary|
|Not an admin|deleteCategory|Integration|BB equivalence|
|Not logged in|deleteCategory|Integration|BB equivalence|
|Get categories|------|------|------|
|Correct category retrieval (admin)|getCategories|Integration|BB equivalence+boundary|
|Correct category retrieval (user)|getCategories|Integration|BB equivalence+boundary|
|Not logged in|getCategories|Integration|BB equivalence|
|Create transaction|------|------|------|
|Correct transaction creation (user, positive amount)|createTransaction|Integration|BB equivalence+boundary|
|Correct transaction creation (admin, negative amount)|createTransaction|Integration|BB equivalence+boundary|
|Correct transaction creation (user, MIN_FLOAT)|createTransaction|Integration|BB equivalence+boundary|
|Correct transaction creation (admin, MAX_FLOAT)|createTransaction|Integration|BB equivalence+boundary|
|Username missing|createTransaction|Integration|BB equivalence|
|Amount missing|createTransaction|Integration|BB equivalence|
|Type missing|createTransaction|Integration|BB equivalence|
|Username empty|createTransaction|Integration|BB boundary|
|Type empty|createTransaction|Integration|BB boundary|
|Category not existing|createTransaction|Integration|BB equivalence|
|The username of the transaction is different by the one in the route|createTransaction|Integration|BB equivalence|
|The username of the transaction doesn't exist|createTransaction|Integration|BB equivalence|
|The username in the route doesn't exist|createTransaction|Integration|BB equivalence|
|The amount is not a float|createTransaction|Integration|BB boundary|
|Not the same user|createTransaction|Integration|BB equivalence|
|Not logged in|createTransaction|Integration|BB equivalence|

# Coverage



## Coverage of FR

<Report in the following table the coverage of  functional requirements (from official requirements) >

In the table, for tests we reported the test suites and not the individual tests. In fact, all the tests belonging to a certain suite cover the same functional requirements, and it would have been useless and too messy to report all the test cases. Furthermore, the test suites are both for unit and integration testing (since we gave to them the same name).

| Functional Requirements covered |   Test suite(s) | 
| ------------------------------- | ----------- | 
| FR11                            | register    |             
| FR12                            | login            | 
| FR13                            | logout            |             
| FR14                            | registerAdmin           | 
| FR15                            |             |             
| FR16                            |             | 
| FR17                            |             |             
| FR21                            |             |
| FR22                            |             |             
| FR23                            |             | 
| FR24                            |             |             
| FR26                            |             | 
| FR28                            |             |             
| FR31                            | createTransaction            | 
| FR32                            | getAllTransactions    |             
| FR33                            |             |
| FR34                            |             |
| FR35                            |             |             
| FR36                            |             | 
| FR37                            |             |             
| FR38                            |             | 
| FR41                            | createCategory            |             
| FR42                            | updateCategory            | 
| FR43                            | deleteCategory            |             
| FR44                            | getCategories            | 



## Coverage white box

Report here the screenshot of coverage values obtained with jest-- coverage 






