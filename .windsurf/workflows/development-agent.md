---
description: PM- activity
auto_execution_mode: 1
---

this workspace is a colloborative environment between the frontend and the backend for udaan saarathi. 
my vison of teh workflow is to  reach the following  milestone 

milestone 1 : data readyness , init 
seed data to the database tables such taht we can in frontend 

- skip login 

milestone 2 : api integraiton

- list jobs , 3 jobs listed 
- job applicants,say 5 candidates applied to 2 of teh jobs, 3,2,0 each.
- can sortlist 
- can schedule interview 
- can mark inter view pass fail
- can edit agency profile

milestone 2 : enhancement 
can use the filters and search in the frontend 


milestone 3 : not planned
not defined yet. 


constraints : 
backend schema wont changed ,backend services can be extended to modify / adapt to frontend's requiremnts . 

known considerations : 
1. the data on frontend , shall not be taken as reference for backend building , changes , never! the whole system shall take backend as source of truth,  meaning frontend shall not dictae backend tables / columns. 
2. other modules will continue to use dummy data as they are doing it now.

what ild do : 
setup fake auth auth header takes " devid1 " , as we are developing we dont want complicaiton on auth yet!.
seed database 
controllers : 
fetch jobs of agency 
filter jobs of agency (before planning this see both fronten and backend usages)
fetch  applied candidates on jobs of agency,and search , as  
status updates for applicants up to interview 

keep track of progress 
use of archon, 
- for project management use the archon mcp tools 
- documents de

update relevant status in the use cases yaml with progress,