const fs = require('fs') 
const tesseract = require('node-tesseract')

module.exports = class Picture {
  constructor(rootPath, path) { 
    this.rootPath = rootPath
    this.path = `${rootPath}/${path}` 
  }
  readScreenshot() {
    return new Promise((resolve, reject) => {
      tesseract.process(this.path, (err, text) => {
        if (err) reject(err)  
        else resolve(text)
      })
    })
  }
  getStats() {
    return new Promise((resolve, reject) => {
      fs.stat(this.path, (err, stats) => {
        if (err) reject(err)  
        else resolve(stats)
      })
    })
  }
  getName () {
    const rename = require('./config/renameFormat.js')
    const getKeys = format => format.match(/{([^}]*)}/g).map( key => key.slice(1,-1))
    let currentFormat = 0, isDefault
    // while condition checks to see if all required keys are defined on this instance of picture
    // keeps going until it finds a format it can use or defaults
    while ( getKeys(rename['formats'][currentFormat]).reduce( (a,b) => a + (this[b] ? 0 : 1), 0) ) {
      if (currentFormat === rename['formats'].length-1) { isDefault = true ; break }
      currentFormat += 1 }
    let keys = isDefault ? undefined : getKeys(rename['formats'][currentFormat])
    // replaces key tags in format with properties of this instance
    if (keys) {
      this.name = rename['formats'][currentFormat]
      let keyIdx;
      keys.forEach( key => {
        keyIdx = this.name.indexOf(key)
        this.name = this.name.slice(0, keyIdx-1) + this[key] + this.name.slice(keyIdx+key.length+1)
      })
    } else this.name = rename['default']
    console.log(`Found ${this.path} to be ${this.name}`)
    // this.name = `${this.path}: ${this.name}`
  }
  getPath () {
    const fileScheme = require('./config/fileScheme.js')
    const getKeys = scheme => scheme.match(/{([^}]*)}/g).map( key => key.slice(1,-1))
    let growingDir = this.rootPath, lastDir
    let currentScheme = 0, isDefault
    while ( getKeys(fileScheme['schemes'][currentScheme]).reduce( (a,b) => a + (this[b] ? 0 : 1), 0) ) {
      if (currentScheme === fileScheme['schemes'].length-1) { isDefault = true ; break }
      currentScheme += 1 }
    let keys = isDefault ? undefined : getKeys(fileScheme['schemes'][currentScheme])
    if (keys) {
      this.newPath = fileScheme['schemes'][currentScheme]
      let keyIdx
      keys.forEach( key => {
        lastDir = this.newPath.slice(0,-1).match(/[^\/]+$/)[0]
        keyIdx = this.newPath.indexOf(key)
        growingDir += `/${this[key]}`
        fs.mkdir(growingDir, err=>err)
        this.newPath = this.newPath.slice(0, keyIdx-1) + this[key] + this.newPath.slice(keyIdx+key.length+1)
      })
    } else {
      this.newPath = fileScheme['default']
      lastDir = fileScheme['default'].slice(0,-1).match(/[^\/]+$/)[0]
    }
    fs.mkdir(`${growingDir}/${lastDir}`, err=>err)
  }
  async parse() {
    if (!this.fsStats) this.fsStats = await this.getStats()
    if (!this.path.toLowerCase().includes('.jpg') && !this.path.toLowerCase().includes('.png')) {
      console.log('must be .png or .jpg:', this.path)
      this.isScreenshot = false
      this.ignore = true
      return null
    }
    // return true
    if (this.fsStats.size > 500000) {
      this.isScreenshot = false
      return false
    } else this.isScreenshot = true
    this.rawText = await this.readScreenshot()
    this.text = this.rawText.split('\n')
      .map( el => el.replace(/\*/g,'')
                    .replace(/\,/g,'')
                    .replace(/pay/g,'')
                    .replace(/\//g,'-')
                    .trim()
      ).filter(el => el.trim() !== '')   
    
    const findInText = require('./config/findInText.js')
    const matches = Object.assign({}, findInText)

    const getIdxFromTags = tags => {
      let desiredLine = this.text.filter(line => {
        for (var tag of tags)
          if (!line.toLowerCase().includes(tag)) return false
        return true
      })
      if (this.text.indexOf(desiredLine[0]) === -1) return undefined
      return this.text.indexOf(desiredLine[0])
    }

    const regexNum = text => {
      try { let regexData = text.match(/\d+/)
        return regexData[0] 
      } catch(e) { return '' }
    }

    for (let m in matches) {
      if (matches.hasOwnProperty(m)) {
        let match = matches[m]
        let idx = getIdxFromTags(match.tags)
        let foundInfo = '';

        if (idx) {
          if (match.type.includes('header')) foundInfo = regexNum(this.text[idx])
          else if (match.type.includes('response')) {
            if (match.type.includes('number')) {
              // if we are looking for a number, we want to make
              // sure what we found is actually a number. If not,
              // we can assume the screenshot was read wrong.
              if (!/^\d+$/.test( this.text[idx+1]) && this.text[idx+1] !== match.isNot ) {
                const charToNum = require('./config/charToNum.js')
                const replacements = Object.assign({}, charToNum)
                // replace non-integers with numbers defined in /config/charToNum.js
                foundInfo = this.text[idx+1].split('').map( char => {
                  return replacements[char] !== undefined ?  
                    replacements[char] : char
                }).join('')
                // make sure all non-ints were replaced. if we didn't
                // replace them all, scratch foundInfo
                if (/^\d+$/.test( foundInfo )) {
                  console.log(this.path,`Changed ${match.type} ${this.text[idx+1]} to ${foundInfo}.`)
                }
                else {
                  console.log(this.path,`Found ${match.type} ${foundInfo}, expected a number. If you think this is an issue with tesseract, you can add character conversion definitions to /config/charToNum.js`)
                  foundInfo = ''
                }
              } // the number response was actually a number, no need to manipulate
              else foundInfo = this.text[idx+1]
            } // text response also doesn't require manipulation
            else foundInfo = this.text[idx+1]
          }
          else throw `${match.type} is not a valid match type! see match ${m} in /config/findInText.js`
          
          if (foundInfo.trim() !== match.isNot && foundInfo !== '') 
            this[match.key] = foundInfo.trim()
        } 
      }
    }
    this.getName()
    return true
  }
}
