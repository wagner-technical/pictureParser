/*
    In the case that you need to grab some info that we are 
    not already equipped grab, it is as simple as adding 
    a new 'match' here. Also useful in the case that any of
    our current matches change how they appear in fulcrum.

    // pick a name for your match - can be anything
    "Name of match" : {

        // key is how we will access this information on
        // the picture object ex: youPicture.yourKey
        // no two matches can have the same key!
        "key" : "yourKey",

        // type gives instructions for how to find the desired
        // information. more on response types later
        "type" : "response",

        // Tags are responsible for finding the match.
        // You'll want to include as many as you can to 
        // avoid false matches.
        // be careful! triple check that it matches exactly.
        // note: (MAKE) CASE SENSITIVE!
        "tags" : [
            "tree",
            "trimming",
            "required"
        ],
        
        // ignore matches that come up equal to 'isNot'
        // ideal for handling blank responses in fulcrum 
        // use case: if type is a response then 'isNot' should
        // be equal to the title of the next response field in fulcrum
        // so it knows when a response wasn't answered
        "isNot" : "Field Surveyor"
    },

    types:
      - 'header': looks for a number on the same line as a match
      - 'number response': looks for a number on the line after a match
      - 'response': looks for anything on the line after a match

*/

module.exports = {

    "FLOC" : {
        "key" : "FLOC",
        "type" : "response",
        "tags" : [
            "Funcloc"
        ],
        "isNot" : "Tree Trimming"
    }

    // add your own matches here
}