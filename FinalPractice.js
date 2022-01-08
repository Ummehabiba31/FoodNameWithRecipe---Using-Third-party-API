const fs = require("fs");
const http = require("http");    //for hosting our own server
const https = require("https");  //for requesting data from other API
const url = require("url");



let mealOne;


const port = 3000;
const server = http.createServer();
server.on("listening", listen_handler);
server.listen(port);
function listen_handler(){
    console.log(`Now Listening on Port ${port}`);
    
}

server.on("request", request_handler);

function request_handler(req, res){
    console.log(`New Request Received from${req.socket.remoteAddress} for ${req.url}`);
    if(req.url === '/'){//when a user visits the root of our homepage

      let formStream =  fs.createReadStream("./html/index.html"); // collecting user input using HTML form.
      res.writeHead(200, {"Content-Type": "text/html"});
      formStream.pipe(res);
     
    } 
    else if(req.url.startsWith("/search")){//user input caught here
       // console.log("serching:", req.url);

      let {description} = url.parse(req.url, true).query; //this is an object
      console.log({description});
      //sending request to our first API
      spoonacular_query(description, res);


     

    }

    else{
        res.writeHead(404, {"Content-Type": "text/html"});
        res.end(`<h1>404 Not Found</h1>`);
    }

    

   
  
 
}


function spoonacular_query(description, res){

    //sent request 1
   
    console.log(description);
    let newEndpoint = `https://api.spoonacular.com/recipes/findByIngredients?apiKey=2ca7fcf27fb14e26b262fd777eba5286&ingredients=${description}`;
   
   
    const meal_request = https.get(newEndpoint);//setting up spoonacular API request
    meal_request.on("response", stream => process_stream(stream, spoonacular_result, description,res)); 
    meal_request.end();//sends off the request to the server.

   
    }//end of spoonacular_query


    function process_stream (stream, callback , ...args){
        let body = "";
        stream.on("data", chunk => body += chunk);
        stream.on("end", () => callback(body, ...args));
    }


    



    function spoonacular_result(meal_data, description, res){
        const results = JSON.parse(meal_data);
        let randomInt = getRandomInt(results.length);

        //if captured input is not in the results, the program should not crash.

        if(results.length === 0){ //if the users input didn't yield any results from the API
           not_found(res);
          
            
        } else {
        mealOne = results[randomInt].title; // selects a random meal title relative to the user input from the json that the api sent back
        console.log("mealOne", mealOne);
        console.log("results:", results);
        //sent request 2 by USDA_query()
        USDA_query(description,res, mealOne) ;

       

        
      
        
        

         }
        }




        function USDA_query(description, res, mealOne){ 
            //sent req 2
            let USDA_endpoint = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=SgQ0ZGk1tDz9MSdLFAObn3uihXKIrQ1xltWC0MOK&query=${description}`;

            const ingredient_request = https.get(USDA_endpoint); //generates API 2 request.
            


            ingredient_request.on("response", stream => process_stream(stream, USDA_response , mealOne, res));//waiting for req 2



            ingredient_request.end(); //API 2 request is sent here.

          

        
            function process_stream (stream){
                let meal_data = "";
                stream.on("data", chunk => meal_data += chunk);
                stream.on("end", () => USDA_response(meal_data, res)); 
               
            }
           
            }





        function USDA_response(meal_data, res){
            const results = JSON.parse(meal_data);
    
            if(results.length === 0){ //if the users input didn't yield any results from the API
               not_found(res);
             


            } else {
                
               
                let trace03 = results.foods[0];//see here, could not use randomInt
                console.log(trace03);
                ingredient_one = trace03?.ingredients;

            //we got both resoponse back.
            //response sent back to user.
                
             ingredient_one = `<h1> Ingredients contained: </h1><u1>${ingredient_one}</u1>`; //got from USDA API
             let output = `<div style="width:49%; float:left;">${ingredient_one}</div>`; //css is working here
              mealOne=`<h1> Meal Name: </h1><u1>${mealOne}</u1>`;
              output+= `<div style="width:49%; float:right;">${mealOne}</div>`;


            
            res.writeHead(200, {"Content-Type":"text/html"});
         

           
          
            res.end(output); ////Fetched meal name from API 1 and Ingredient name form API 2 are being sent to the server for user to see 
            
            
             }
            }


            




    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
      }

    

    

    function not_found(res){
        res.writeHead(404, {"Content-Type":"text/plain"});
       res.write("Type a real food name!!",()=>res.end());
       
    }  