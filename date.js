module.exports.getDate = getDate;

function getDate(){
    let today = new Date();
    
    let options = {
        weekday: "long",
        day: "numeric", 
        month: "long"
    };
    return today.toLocaleDateString("en-US", options);;
}

module.exports.getDay = getDay;

function getDay() {
    
}