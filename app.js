const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"))

// let items = ["Buy grocery", "Cook", "Eat"];
// let workItems = [];

// using mongoose
mongoose.connect("mongodb://localhost:27017/todolistDB");
// creating schema
const itemSchema = {
    name: String
};
// creating model
const Item = mongoose.model("item", itemSchema);

const item1 = new Item({name: "Buy Food"});
const item2 = new Item({name: "Do laundry"});
const item3 = new Item({name: "Write essay"});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name:String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){ 
    Item.find({}, function(err, foundItems){
        if(foundItems.length === 0){
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                } else {
                    console.log("Success");
                }  
            });
            res.redirect("/") ; 
        } else {
            res.render("list", {listTitle: "Today", newTasks: foundItems})
        }
    });
});

app.post("/", function(req, res){
    const itemName = req.body.newTask;
    const listName = req.body.list;

    const newItem = new Item({name: itemName});

    if(listName === "Today"){
        newItem.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/" + listName)
        });
    }
});

app.post("/delete", function(req, res){
    const checkedItemID = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemID, function(err){
            if(!err){
                console.log("checked off");
                res.redirect("/");
            } 
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, function(err, foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        });
    }
});


app.get("/:customListName", function(req, res){

    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            } else{
                res.render("list", {
                    listTitle: foundList.name, 
                    newTasks: foundList.items 
                });
            }
            
        }
    });    
});

app.get("/about", function(req, res){
    res.render("about");
});

app.listen(3000, function(){
    console.log("Server is running on port 3000");
});



