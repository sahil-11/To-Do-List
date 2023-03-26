
const express  =  require("express");
const bodyParser = require("body-parser");
var items = [];
const _ = require("lodash");

const mongoose = require("mongoose");



const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public/"));

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect("mongodb+srv://process.env.username:process.env.password@cluster0.dzzhrod.mongodb.net/todolistDB" , {useNewUrlParser : true});
}

const itemsSchema = ({
    name: String 
});

const listSchema = ({
    name : String ,
    items : [itemsSchema]
})


const Item = mongoose.model("Item" ,itemsSchema);//reating model under the fruitSchema(schema)
const List = mongoose.model("List" ,listSchema);


const item1 = new Item({
    name : "Welcome to your todolist"
   });

const item2 = new Item({
    name : "Hit the + button to add a new item"
   });   

const item3 = new Item({
    name : "<-- Hit this to delete an item"
   });   
const defaultItems = [item1 , item2 , item3];




app.get("/",  function(req , res)
{
    Item.find().then(function(lists){ //finding items in mongoose 7.0
       
        if(lists.length === 0)
        {
            
            Item.insertMany(defaultItems)
            .then(function () {
              console.log("Successfully saved defult items to DB");
            })
            .catch(function (err) {
              console.log(err);
            });
            res.redirect("/");
        }
        else{
            res.render('list', {kindOfDay: "Today" , newItems: lists} );
        }
        
        })
       
    
});

app.post("/" , function(req, res)
{
    var itemName = req.body.newItem ;
    const item = new Item({
        name : itemName
    });
    const listName = req.body.button ;
    // console.log(req.body);
   
    if(listName === "Today"){
       
        item.save();
        res.redirect("/");
        
    }
    else{
        
        List.findOne({name : listName}).then(function(objects){
            objects.items.push(item);
            objects.save();
            res.redirect("/" + listName);
        });
    }
    
    
 
 });

app.get("/:customListName" , function(req,res){
    const customList =  _.capitalize(req.params.customListName)  ;

    if(customList != "favicon.ico"){
        List.findOne({name : customList}).then(function(objects){
            if(!objects){
                const list = new List ({
                    name : customList ,
                    items : defaultItems 
                })
                list.save();
                res.redirect("/" + customList);
            }
            else{
                res.render('list', {kindOfDay: objects.name , newItems: objects.items} );
                
                
            }
            
    
        }) ;
    }
   
    
    
});





 app.post("/delete" , function(req , res)
 {
    //console.log("Deletion triggerred");
    var itemName = req.body.checkbox ;
    var customList = req.body.listName;

    if(customList === "Today"){
        Item.findByIdAndRemove(itemName ).then(function(err)
        {
                console.log("Checked item deleted successfully");
        });
        res.redirect("/");
    }else{
        List.findOneAndUpdate(
            {name : customList},//condition
            {$pull :{items :{_id : itemName}}},//query
        ).then(function(objects){
            if(objects){
                res.redirect("/"+customList);
            }
        });
    }
   
 });


let port = process.env.PORT;
if(port === NULL || port === "")
port = 3000;

app.listen(port , function()
{
    console.log("Server is running on port 3000");
})


