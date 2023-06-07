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
|||||

### Integration

| Test case name | Object(s) tested | Test level | Technique used |
|--|--|--|--|
|||||

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






