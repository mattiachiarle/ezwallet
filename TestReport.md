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

| Test case name | Object(s) tested | Test level | Technique used |
|--|--|--|--|
|||||


## Utils.js

| Test case name | Object(s) tested | Test level | Technique used |
|--|--|--|--|
|||||

## Users.js

| Test case name | Object(s) tested | Test level | Technique used |
|--|--|--|--|
|||||

## Controller.js

| Test case name | Object(s) tested | Test level | Technique used |
|--|--|--|--|
|||||

# Coverage



## Coverage of FR

<Report in the following table the coverage of  functional requirements (from official requirements) >

| Functional Requirements covered |   Test(s) | 
| ------------------------------- | ----------- | 
| FR11                            |             |             
| FR12                            |             | 
| FR13                            |             |             
| FR14                            |             | 
| FR15                            |             |             
| FR16                            |             | 
| FR17                            |             |             
| FR21                            |             |
| FR22                            |             |             
| FR23                            |             | 
| FR24                            |             |             
| FR26                            |             | 
| FR28                            |             |             
| FR31                            |             | 
| FR32                            |             |             
| FR33                            |             |
| FR34                            |             |
| FR35                            |             |             
| FR36                            |             | 
| FR37                            |             |             
| FR38                            |             | 
| FR41                            |             |             
| FR42                            |             | 
| FR43                            |             |             
| FR44                            |             | 



## Coverage white box

Report here the screenshot of coverage values obtained with jest-- coverage 






