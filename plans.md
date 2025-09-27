this si a thought loggings session.
what bothers the mind .
oct 4 to 18 days for October 4 
we can safely exclude oct 20 to 27 .
after that I shall be online .

what happens on October 28 .




what shoud have happened during the days from oct 6 to 19.

here the date ranges represent : 18 days gap: I ll be offline during Dashawn and tihar.
6-19(18 19 are sat sun , weekend , no office) office resumes 6mon-17fri .

now to plan the context we have a dedicated window . 
6 -17 oct.

whats the planning about ? 
what happens on the workdays .


what things I need to prepare beforehand so that things can happen on the workdays .
this is that very document being prepared .


who are the actors on the scene 6 -17 oct.
the business : Narayan dai, ceo 
the team, ishowr , sabin, rojan, Bhuwan, Aayush ,Anik 
the projects , job portal, hostel , hotel, resturant , geofence in kaha app , sos , 


the expectations 
1. job portal : rojan / Aayush 
- current state :
    - In app 
        - whatever test cases are written works well
        - suresh's happy flow test case 
        - read this file to confirm what there in the app as of now since tests are passing . 
    - In web (tester project + real project ), 
        - a separete tester frontend for api integration
        - multilingual contents 
        - ramesh's flow 
            - the test runners 
    - the dart test runner 
        - runs the e2e tests suites for respective framework , creates logs for test /profiles that have been run 

- expected state on 28/29
    - In App [rojans activities]
        - otp page behaves well 
        - job details page shows data well, data completeness form api response , 
            - esp, the converted amount and the job details 
        - search and filter page works well 
            - search by job name, posting agency, employer name .
        - notification page show 
            - status transistions 
    - in web : 
        - api integration 
        - register   
        - login  
        - add agency
        - update agency profile 
        - list jobs 
            - search / filter jobs   
        - applicant's application  status update (as per workflow)




2. hostel : ishwor, bhuwan ,salesTeam? , 
    - student enrollment form 
    - ledger use cases 
    - requiremnt for package restriction 
    - admin panel to manage subscribed entities  
    - api response / shimmer (huge api payload , laod time, complain from CEO, bhuwan knows about this )

-concerns 
- in web manage room/bed layouts ,
- in app show booking status , notifications , 
- login to panel and manage hostel 
- not in scope (attendance ,as this is to be covered with narayan dais field attendance ssytem )
    - only work on attendance if other priorities are discared first to accomodate the attendance (load on ishwor)


3. geofence 
- mantralaya readynmess 
- expected functionality 
- standing in front of kimchi , opens up kimchi, same of +1 entity . 
- admin panel(surya bros project) exists for fence / polygon drawing
    - data should be  stored somewhere 
        - not in app 
        - api ? supabase ? 

4. sos 
- the sos panel has api connections , 
    - apis are already build , we need to integrate this apis, 
    - in app the apis are already connected and works (no test cases available )[attaach branch hash here : todo ]
- requests created from app are visible on hte panel 
- status updates , assginment works 


5. hostel , resturant 
- ceo shall sit with anik on refining ui 
- ceo shall sit with ishwor to document the usecase 
    - database schema : rule of thumb
        - what are the  use case assiciated with it , justify hte schema. 

whats hte percieved rality 
- sabin : 
    - geofence 
        -  launch profile on geofence entry 
        -  getch teh geofence data set from api 
            - where is the api ?
                - create your own server ask ishwor to deploy 
                - browse nestjs, docker ,postgres , typeorm git for boilerplate 
                    - or ask ishwor to create one on your mac, dockercompose
                        - port conflict use 5431:5432 on docker 
                        - use dev watch, syncronize mode, volumen mount server and db 
                - or simply fake the data untill server is available 

        -  should be on a "guide mode" page, desing page with AI,
            - or a simple switch that turns on guide mode, 
                - a dedicated page is not a hard requiredmnt , switch will suffice 
                    - ceo will provide feedback on this 
        - Surya bro's admin panel 
            - create polygons , name, description, linked kahatag, id 
                - use either tag or id, 
                    - find business by id / tag to be used to launch profile 
                    - in app we probably launch with id .
                        - link hte page from where we launch the profile 
                            - soft requiemnt 
                                - no intermmediate swipe up screen
                                - answer / method to achieve this behaviour is availabe on hte launcher code which has this behaviour by launch profile form qr . 
        - hostel 
            - ishwor will make changes to the hostel's api to reduce the data payload, in flutter we need to make fileds nullable / remove fields, use a fetch by id for dfetail page to get full romm / layout details 
        - ui enhancement on chat 
            - in chat when sharing product/ room/ tolet, card, 
                - tap to view, 
                - reference from ceo availabe and shared to sabin 
        - issues reported by bhuwan 
            - handel bugs , that needs be patched and send app live 
    - [AI] document in table :
        - sabins activities 

- rojan 
    - job portal 
        - use hte udaan saarathi logo and name , prepare for apk 
        - search and filter 
        - my application
        - notification 
        - things already identified as "- In App [rojans activities]"
        - build the udaan saarathi app 
            - main -> udaan saarathi app 
                - test 
                - list  problems / observations 

- aayush 
    - sit with ishwor , learn how to connect hte api 
        - ishwor will see the test cases passing in the tester project 
            - will help aaysh integrate teh apis to for , suresh's flow
                - register, otp verify,
                - login,  opt verify, 
                - c_u_ on profile 
                - list jobs
                    - list applicant on jobs 
                        - update status 

- ishwor
    - wont work solo
        - cant work solo 
        - team is depended on ishwor 
    - initiation ritual 
        1. minimize the payload for room (sabin)
        2. create geohas server for sabin on sabins mac 
            - crud on 1 table   
                - list of coordinates 
                    - order of the items in list matters as this defines polylines to draw 
                - name 
                - description
                - entity_identifier (preferable entity id )
                - read_aloud_content
            - find all 
            - get one by entity_identifier 
        2. hostel admin  room layout (bhuwan, )
        3. hostel sales concerns (if sales' feedback  is available )
            - student enrollment form 
        4. api integraiton based on test cases with aayush 
        5. attendance / department / holidays / reports 
            - documents the use cases based on meeting with narayan dai
        6. document use case for hotel/ resturant 
            - based on narayan dais involvement with anik 

narayan dai 
    - expect the enhancement on chat form sabin 
        - must know : whats sabin working on already 
            - mantralaya , geofence ,
            - experiment his skill on server , api , service 
                - ishwor is lending a hand as well for server setup 
            - hostel's room loading issue 
    - expect apk from from rojan , 
        - what to expect on apk 
            - splash to my application listing page 
            - ask rojan for whats  ramesh's flow 
    - expect suresh's flow from web portal  
        - ishwor is actively engaged here 
    - sit with anik , on hotel/ resturant 
        - prepare list of topic to cover 
            - the use cases 
    - sit with ishwor for attendance / department / holidays etc. 
        - attendance module that exists currently will not be talked about 
            - other thigns like department , leave , calender, schedule  will come under entity managenment microservice
                -  this is a bundel  that shall later be integrated with current attendance module (or its enhanced version)

- udaan saarathi client 
    - show them the demo on multilingual 
    - show them the app 
        - screenshots 
        - acknowledge that their previous feedback on 
            - gunaso reporting has not been forgotten 
            - notificaiton page as we stated is withing hte scope and exists in the apk 
    - do not make desperate efforts for early project completion
        - this was never an option to begin with .


- what ill be saying when i come back , mostly well align ,for a reality check , what was expected vs the state on oct 29.
    - job portal web 
        - well now do the job creation and  draft  
        - well do the job details 
        - well do the other pages 
    - job portal app 
        - well document current status 
        - well realign 
    
        
        
            
