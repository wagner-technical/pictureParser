/*

Pretty straightforward. Encase your keys from 
/config/findInText.js in curly braces. 

If a picture set doesn't have enough info to use the first format,
it will look down the list of  format until it finds one that works.

If a picture set doesn't have enough info for any of the formats
it will default to whatever we choose. In this case: "skipped"

IMPORTANT: Name cannot use curly braces other than to instruct  
           the program which keys we want to use in our name
*/

module.exports = {
    "formats" : [
        "{FLOC}"
    ],
    "default" : "skipped"
}