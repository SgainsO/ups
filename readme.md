## To Run
python main.py
npm run dev in the respective directories
## Assumption
Files will not reuse the same name even given different schemas
## Unit Testing
* unfortunatly, I did not able to get to the react unit testing part in the required amount of time
## Design Decisions
* My desired way to send was to utalize the pros of type script, and have much of the scraping logic done at the frontend. But this was not allowed due to the requirements.
* I decieded to use seperate calls for seperate types of orders, though this does make more code, it allows for more readable code.
* while having the filename be based on both the "name" of the schema instance and the instance type is less complicated conceptually, It makes for more complexity as the project continues. In a non-timed enviornemnt, I would not have made this decision.
* The backend is one file, this is the worst case for api code, in a non time constrained enviornment, I would have seperated much of the logic in different files, Especially for scraping, like was done in the frontend.
* Using types likely did take more time than it helped saved, but I believe it is better to always use types.